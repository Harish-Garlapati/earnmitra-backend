const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { query, pool } = require('../config/db');
const partnerRepo = require('../repositories/partnerRepository');
const partnerService = require('./partnerService');
const smsService = require('./smsService');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const OTP_PURPOSES = new Set(['signup', 'login', 'password_reset', 'device_verification', 'pin_reset']);

function normalizeIndianMobile(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (!/^[6-9]\d{9}$/.test(digits)) {
    const err = new Error('Valid Indian mobile number required');
    err.status = 400;
    err.code = 'INVALID_MOBILE';
    throw err;
  }
  return digits;
}

function normalizePurpose(value) {
  const aliases = { register: 'signup', registration: 'signup', mpin_reset: 'pin_reset', forgot_mpin: 'pin_reset' };
  const purpose = aliases[String(value || '').trim().toLowerCase()] || String(value || '').trim().toLowerCase();
  if (!OTP_PURPOSES.has(purpose)) {
    const err = new Error('Unsupported OTP purpose');
    err.status = 400;
    err.code = 'INVALID_OTP_PURPOSE';
    throw err;
  }
  return purpose;
}

class AuthService {
  generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  async sendOtp(mobile, purpose = 'login') {
    const cleanMobile = normalizeIndianMobile(mobile);
    const cleanPurpose = normalizePurpose(purpose);

    const [recent] = await query(
      `SELECT created_at FROM otp_sessions WHERE mobile = ? AND purpose = ?
       ORDER BY created_at DESC LIMIT 1`,
      [cleanMobile, cleanPurpose]
    );
    if (recent[0] && Date.now() - new Date(recent[0].created_at).getTime() < 30000) {
      const err = new Error('Please wait before requesting another OTP.');
      err.status = 429;
      err.code = 'OTP_RESEND_THROTTLED';
      throw err;
    }

    const otp = String(crypto.randomInt(1000, 10000));
    const otpHash = await bcrypt.hash(otp, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes (600 seconds) matching DLT template

    // Invalidate any unconsumed previous OTPs for this mobile & purpose
    await query(
      'UPDATE otp_sessions SET is_consumed = 1 WHERE mobile = ? AND purpose = ? AND is_consumed = 0',
      [cleanMobile, cleanPurpose]
    );

    const [inserted] = await query(
      `INSERT INTO otp_sessions (mobile, otp_hash, purpose, expires_at, attempt_count, is_consumed)
       VALUES (?, ?, ?, ?, 0, 0)`,
      [cleanMobile, otpHash, cleanPurpose, expiresAt]
    );

    let delivery = null;
    if (smsService.isConfigured()) {
      try {
        delivery = await smsService.sendOtp(cleanMobile, otp);
      } catch (error) {
        await query('UPDATE otp_sessions SET is_consumed = 1 WHERE id = ?', [inserted.insertId]);
        const safeErr = new Error('Unable to send OTP right now. Please try again.');
        safeErr.status = error.status || 502;
        safeErr.code = error.code || 'SMS_DELIVERY_FAILED';
        throw safeErr;
      }
    }

    const devExpose = (process.env.DEV_OTP_EXPOSE === 'true' || process.env.NODE_ENV === 'test') && process.env.NODE_ENV !== 'production';

    const response = {
      success: true,
      mobile: cleanMobile,
      expiresInSeconds: 600,
      resendCooldownSeconds: 30,
      deliveryStatus: delivery ? delivery.status : 'unconfigured',
      provider: delivery ? delivery.provider : null,
      message: 'OTP sent successfully'
    };

    if (devExpose) {
      response.devOtp = otp;
    }

    return response;
  }

  async initiatePartnerSignup(data) {
    const { fullName, name, mobile, phone, email, pincode, place, city, district, state } = data;
    const resolvedName = (fullName || name || '').trim();
    const cleanMobile = normalizeIndianMobile(mobile || phone);
    const cleanPincode = String(pincode || '').trim();
    const cleanCity = (place || city || district || '').trim();
    const cleanDistrict = (district || cleanCity || '').trim();
    const cleanState = (state || 'Telangana').trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : null;

    if (!resolvedName || resolvedName.length < 2) {
      const err = new Error('Please enter your full name (minimum 2 characters)');
      err.status = 400;
      throw err;
    }

    if (!cleanPincode || !/^\d{6}$/.test(cleanPincode)) {
      const err = new Error('Please enter a valid 6-digit PIN code');
      err.status = 400;
      throw err;
    }

    if (!cleanCity || !cleanState) {
      const err = new Error('Place and state are required. Please verify your PIN code.');
      err.status = 400;
      throw err;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const err = new Error('Please enter a valid email address');
      err.status = 400;
      throw err;
    }

    // Check if partner already exists
    const existing = await partnerRepo.findByMobile(cleanMobile);
    if (existing) {
      const err = new Error('An account with this mobile number already exists. Please log in.');
      err.status = 409;
      err.code = 'ACCOUNT_EXISTS';
      throw err;
    }

    // Upsert to pending_registrations with 10-minute expiry
    await query('DELETE FROM pending_registrations WHERE mobile = ?', [cleanMobile]);
    await query(
      `INSERT INTO pending_registrations (mobile, full_name, email, pincode, city, state, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [cleanMobile, resolvedName, cleanEmail, cleanPincode, cleanCity, cleanState]
    );

    // Send OTP with purpose 'signup'
    const otpResult = await this.sendOtp(cleanMobile, 'signup');
    return {
      success: true,
      mobile: cleanMobile,
      message: 'OTP sent successfully for registration',
      ...otpResult
    };
  }

  async verifyOtp(mobile, otp, purpose = 'login', deviceId = null, deviceName = null, platform = null) {
    const cleanMobile = normalizeIndianMobile(mobile);
    const cleanPurpose = normalizePurpose(purpose);
    const cleanOtp = String(otp || '').trim();

    if (!cleanMobile || !cleanOtp) {
      const err = new Error('Mobile and OTP are required');
      err.status = 400;
      throw err;
    }

    if (!/^\d{4}$/.test(cleanOtp)) {
      const err = new Error('OTP must be exactly 4 numeric digits');
      err.status = 400;
      err.code = 'INVALID_OTP_FORMAT';
      throw err;
    }

    // Purpose is an exact security boundary: one flow's OTP cannot authorize another.
    const [sessions] = await query(
      `SELECT * FROM otp_sessions 
       WHERE mobile = ? AND is_consumed = 0 AND expires_at > NOW()
         AND purpose = ?
       ORDER BY created_at DESC LIMIT 1`,
      [cleanMobile, cleanPurpose]
    );

    if (sessions.length === 0) {
      const err = new Error('OTP expired or not found. Please request a new OTP.');
      err.status = 400;
      throw err;
    }

    const session = sessions[0];
    if (session.attempt_count >= 5) {
      const err = new Error('Too many invalid attempts. Please request a new OTP.');
      err.status = 429;
      throw err;
    }

    const isMatch = await bcrypt.compare(cleanOtp, session.otp_hash);
    if (!isMatch) {
      await query(
        'UPDATE otp_sessions SET attempt_count = attempt_count + 1 WHERE id = ?',
        [session.id]
      );
      const err = new Error('Invalid OTP. Please check and try again.');
      err.status = 401;
      throw err;
    }

    // Mark consumed
    await query('UPDATE otp_sessions SET is_consumed = 1 WHERE id = ?', [session.id]);

    // Check if partner exists
    let partner = await partnerRepo.findByMobile(cleanMobile);

    if (!partner) {
      // Check if we have a pending registration
      const [pendings] = await query(
        `SELECT * FROM pending_registrations WHERE mobile = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
        [cleanMobile]
      );

      if (pendings && pendings.length > 0) {
        const pending = pendings[0];
        const partnerCode = await this.getNextPartnerCode();
        partner = await partnerRepo.create({
          partner_code: partnerCode,
          full_name: pending.full_name,
          mobile: cleanMobile,
          email: pending.email || null,
          partner_type: 'Individual',
          city: pending.city || null,
          district: pending.district || null,
          state: pending.state || 'Telangana',
          pincode: pending.pincode || null,
          kyc_status: 'pending',
          approval_status: 'active'
        });

        // Clean up pending registration
        await query('DELETE FROM pending_registrations WHERE mobile = ?', [cleanMobile]);

        const token = this.generateToken({
          id: partner.id,
          partnerCode: partner.partner_code,
          role: 'partner',
          mobile: partner.mobile
        });

        const devSession = await this.createDeviceSession(
          partner.id,
          deviceId,
          deviceName || 'Mobile Device',
          platform || 'android'
        );

        return {
          success: true,
          isNew: true,
          token,
          deviceId: devSession.deviceId,
          deviceToken: devSession.deviceToken,
          hasMpin: false,
          partner: partnerService.formatPartner(partner),
          message: 'Account created successfully! Please set up your 4-digit MPIN.'
        };
      }
    }

    if (partner) {
      const token = this.generateToken({
        id: partner.id,
        partnerCode: partner.partner_code,
        role: partner.role || 'partner',
        mobile: partner.mobile
      });

      // Register / refresh trusted device session
      const devSession = await this.createDeviceSession(
        partner.id,
        deviceId,
        deviceName || 'Mobile Device',
        platform || 'android'
      );

      return {
        success: true,
        isNew: false,
        token,
        deviceId: devSession.deviceId,
        deviceToken: devSession.deviceToken,
        hasMpin: !!partner.mpin_hash,
        partner: partnerService.formatPartner(partner)
      };
    } else {
      // New user registering
      const tempToken = jwt.sign({ mobile: cleanMobile, purpose: 'signup' }, JWT_SECRET, { expiresIn: '1h' });
      return {
        success: true,
        isNew: true,
        mobile: cleanMobile,
        tempToken,
        message: 'OTP verified. Please complete your registration.'
      };
    }
  }

  async loginWithPassword(mobile, password, device = {}) {
    const cleanMobile = normalizeIndianMobile(mobile);
    if (!cleanMobile || !password) {
      const err = new Error('Mobile and password are required');
      err.status = 400;
      throw err;
    }

    const partner = await partnerRepo.findByMobile(cleanMobile);
    if (!partner) {
      const err = new Error('Invalid mobile or password');
      err.status = 401;
      throw err;
    }

    if (!partner.password_hash) {
      const err = new Error('Password not set for this account. Please log in using OTP.');
      err.status = 400;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, partner.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid mobile or password');
      err.status = 401;
      throw err;
    }

    const token = this.generateToken({
      id: partner.id,
      partnerCode: partner.partner_code,
      role: partner.role || 'partner',
      mobile: partner.mobile
    });

    let devSession = null;
    if (device && device.deviceId) {
      devSession = await this.createDeviceSession(
        partner.id,
        device.deviceId,
        device.deviceName || 'Mobile Device',
        device.platform || 'android'
      );
    }

    return {
      success: true,
      token,
      deviceId: devSession?.deviceId,
      deviceToken: devSession?.deviceToken,
      hasMpin: !!partner.mpin_hash,
      partner: partnerService.formatPartner(partner)
    };
  }

  async requestPasswordResetOtp(mobile) {
    const cleanMobile = normalizeIndianMobile(mobile);
    const partner = await partnerRepo.findByMobile(cleanMobile);
    let devOtp;
    if (partner) {
      const sent = await this.sendOtp(cleanMobile, 'password_reset');
      devOtp = sent?.devOtp;
    }
    const devExpose = (process.env.DEV_OTP_EXPOSE === 'true' || process.env.NODE_ENV === 'test') && process.env.NODE_ENV !== 'production';
    const response = {
      success: true,
      mobile: cleanMobile,
      expiresInSeconds: 300,
      message: 'If this mobile is registered, a password reset OTP has been sent.'
    };
    if (devExpose && devOtp) {
      response.devOtp = devOtp;
    }
    return response;
  }

  async resetPassword(payload) {
    const cleanMobile = normalizeIndianMobile(payload.mobile);
    const cleanOtp = String(payload.otp || '').trim();
    const password = String(payload.newPassword || '');
    const confirmPassword = String(payload.confirmPassword || '');
    if (!cleanMobile || !/^\d{4,6}$/.test(cleanOtp)) {
      const err = new Error('Valid mobile number and OTP are required'); err.status = 400; throw err;
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      const err = new Error('Password must be at least 8 characters and include uppercase, lowercase and a number'); err.status = 400; throw err;
    }
    if (password !== confirmPassword) {
      const err = new Error('New password and confirmation do not match'); err.status = 400; throw err;
    }
    const [sessions] = await query(
      `SELECT * FROM otp_sessions WHERE mobile = ? AND purpose = 'password_reset'
       AND is_consumed = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`, [cleanMobile]
    );
    if (!sessions.length) { const err = new Error('Invalid or expired OTP. Please request a new OTP.'); err.status = 400; throw err; }
    const session = sessions[0];
    if (session.attempt_count >= 5) { const err = new Error('Too many invalid attempts. Please request a new OTP.'); err.status = 429; throw err; }
    if (!(await bcrypt.compare(cleanOtp, session.otp_hash))) {
      await query('UPDATE otp_sessions SET attempt_count = attempt_count + 1 WHERE id = ?', [session.id]);
      const err = new Error('Invalid OTP. Please check and try again.'); err.status = 401; throw err;
    }
    const partner = await partnerRepo.findByMobile(cleanMobile);
    if (!partner) { const err = new Error('Invalid or expired password reset request'); err.status = 400; throw err; }
    const passwordHash = await bcrypt.hash(password, 10);
    await query('UPDATE otp_sessions SET is_consumed = 1 WHERE id = ?', [session.id]);
    await query('UPDATE partners SET password_hash = ? WHERE id = ?', [passwordHash, partner.id]);
    await query('UPDATE partner_devices SET is_trusted = 0 WHERE partner_id = ?', [partner.id]);
    return { success: true, message: 'Password reset successfully. Please log in with your new password.' };
  }

  async getNextPartnerCode() {
    const [rows] = await query(
      `SELECT partner_code FROM partners 
       WHERE partner_code REGEXP '^P-[0-9]+$' 
       ORDER BY CAST(SUBSTRING(partner_code, 3) AS UNSIGNED) DESC 
       LIMIT 1`
    );

    if (rows && rows.length > 0) {
      const match = rows[0].partner_code.match(/^P-(\d+)$/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `P-${nextNum}`;
      }
    }
    return 'P-1003';
  }

  async register(payload) {
    const {
      fullName,
      name,
      mobile,
      email,
      partnerType,
      type,
      password,
      businessName,
      city,
      district,
      state = 'Telangana',
      pan,
      verificationToken
    } = payload;

    const resolvedName = fullName || name;
    const resolvedType = partnerType || type || 'Individual';
    const cleanMobile = normalizeIndianMobile(mobile);

    if (verificationToken) {
      let verifiedMobile = '';
      try {
        const decoded = jwt.verify(String(verificationToken), JWT_SECRET);
        if (decoded.purpose === 'signup' || decoded.purpose === 'register') {
          verifiedMobile = normalizeIndianMobile(decoded.mobile);
        }
      } catch { /* invalid token */ }
      if (!verifiedMobile || verifiedMobile !== cleanMobile) {
        const err = new Error('Verified signup session required. Please verify the mobile OTP again.');
        err.status = 401;
        err.code = 'SIGNUP_VERIFICATION_REQUIRED';
        throw err;
      }
    }

    if (!resolvedName || !cleanMobile || !resolvedType) {
      const err = new Error('Full name, mobile and partner type are required');
      err.status = 400;
      throw err;
    }

    let passwordHash = null;
    if (password) {
      if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
        const err = new Error('Password must be at least 8 characters and include uppercase, lowercase and a number');
        err.status = 400;
        throw err;
      }
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Check existing
    const existing = await partnerRepo.findByMobile(cleanMobile);
    if (existing) {
      const err = new Error('A partner account with this mobile number already exists');
      err.status = 409;
      throw err;
    }

    const partnerCode = await this.getNextPartnerCode();

    const insertSql = `
      INSERT INTO partners (
        partner_code, full_name, mobile, email, partner_type,
        business_name, city, district, state, pincode, pan, password_hash,
        role, is_active, kyc_status, approval_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'partner', 1, 'pending', 'active')
    `;

    const [result] = await query(insertSql, [
      partnerCode,
      resolvedName,
      cleanMobile,
      email || null,
      resolvedType,
      businessName || null,
      city || null,
      district || null,
      state || 'Telangana',
      payload.pincode || null,
      pan || null,
      passwordHash
    ]);

    const created = await partnerRepo.findById(result.insertId);

    const token = this.generateToken({
      id: created.id,
      partnerCode: created.partner_code,
      role: 'partner',
      mobile: created.mobile
    });

    // Create trusted device session for newly registered partner
    const devSession = await this.createDeviceSession(
      created.id,
      payload.deviceId,
      payload.deviceName || 'Mobile Device',
      payload.platform || 'android'
    );

    return {
      success: true,
      token,
      deviceId: devSession.deviceId,
      deviceToken: devSession.deviceToken,
      hasMpin: false,
      partner: partnerService.formatPartner(created)
    };
  }

  async adminLogin(usernameOrEmail, password) {
    if (!usernameOrEmail || !password) {
      const err = new Error('Username/email and password are required');
      err.status = 400;
      throw err;
    }

    const [rows] = await query(
      'SELECT * FROM admin_users WHERE username = ? OR email = ? LIMIT 1',
      [usernameOrEmail, usernameOrEmail]
    );

    if (rows.length === 0) {
      const err = new Error('Invalid admin credentials');
      err.status = 401;
      throw err;
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid admin credentials');
      err.status = 401;
      throw err;
    }

    const adminRepo = require('../repositories/adminRepository');
    const auditService = require('./auditService');
    
    await adminRepo.updateLastLogin(admin.id);
    await auditService.log(admin.id, 'admin.login', 'admin_user', admin.id, null, null);

    const token = this.generateToken({
      id: admin.id,
      adminId: admin.id,
      role: 'admin',
      actorType: 'admin',
      username: admin.username,
      email: admin.email
    });

    return {
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    };
  }

  hashDeviceToken(token) {
    return crypto.createHash('sha256').update(String(token)).digest('hex');
  }

  async createDeviceSession(partnerId, deviceId, deviceName = 'Mobile Device', platform = 'android') {
    const cleanDeviceId = String(deviceId || crypto.randomUUID());
    const rawDeviceToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashDeviceToken(rawDeviceToken);

    await query(
      `INSERT INTO partner_devices (partner_id, device_id, device_token_hash, device_name, platform, is_trusted, last_unlocked_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE 
         device_token_hash = VALUES(device_token_hash),
         device_name = VALUES(device_name),
         platform = VALUES(platform),
         is_trusted = 1,
         last_unlocked_at = NOW()`,
      [partnerId, cleanDeviceId, tokenHash, deviceName || 'Mobile Device', platform || 'android']
    );

    return { deviceId: cleanDeviceId, deviceToken: rawDeviceToken };
  }

  async validateDeviceSession(deviceId, deviceToken) {
    if (!deviceId || !deviceToken) return null;
    const tokenHash = this.hashDeviceToken(deviceToken);
    const [rows] = await query(
      `SELECT d.*, p.partner_code, p.full_name, p.mobile, p.email, p.role, p.is_active, p.mpin_hash, p.mpin_attempts, p.mpin_locked_until
       FROM partner_devices d
       JOIN partners p ON d.partner_id = p.id
       WHERE d.device_id = ? AND d.device_token_hash = ? AND d.is_trusted = 1 AND p.is_active = 1`,
      [deviceId, tokenHash]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async setMpin(payload) {
    const partnerId = payload.authenticatedPartnerId;
    const deviceId = payload.deviceId || payload.deviceUuid;
    const deviceToken = payload.deviceToken || payload.trustedDeviceToken;
    const cleanMpin = String(payload.mpin || payload.pin || '').trim();
    const cleanConfirm = String(payload.confirmMpin || payload.confirmPin || '').trim();
    const tempToken = payload.tempToken;

    if (!cleanMpin || !/^\d{4}$/.test(cleanMpin)) {
      const err = new Error('PIN must be exactly 4 numeric digits');
      err.status = 400;
      throw err;
    }

    if (cleanMpin !== cleanConfirm) {
      const err = new Error('PIN and confirmation do not match');
      err.status = 400;
      throw err;
    }

    let resolvedPartner = null;

    if (partnerId) {
      resolvedPartner = await partnerRepo.findById(partnerId);
    } else if (deviceId && deviceToken) {
      const dev = await this.validateDeviceSession(deviceId, deviceToken);
      if (dev) resolvedPartner = await partnerRepo.findById(dev.partner_id);
    } else if (tempToken) {
      try {
        const decoded = jwt.verify(tempToken, JWT_SECRET);
        if (decoded.mobile) {
          resolvedPartner = await partnerRepo.findByMobile(decoded.mobile);
        }
      } catch {}
    }

    if (!resolvedPartner) {
      const err = new Error('Invalid or unverified partner session. Please verify mobile OTP first.');
      err.status = 401;
      throw err;
    }

    // Securely hash the 4-digit MPIN using bcrypt
    const mpinHash = await bcrypt.hash(cleanMpin, 10);

    await query(
      `UPDATE partners 
       SET mpin_hash = ?, mpin_configured_at = NOW(), mpin_attempts = 0, mpin_locked_until = NULL 
       WHERE id = ?`,
      [mpinHash, resolvedPartner.id]
    );

    // Register / update device session
    let devSession;
    if (deviceId && deviceToken) {
      const existing = await this.validateDeviceSession(deviceId, deviceToken);
      if (existing) {
        devSession = { deviceId, deviceToken };
        await query('UPDATE partner_devices SET last_unlocked_at = NOW() WHERE id = ?', [existing.id]);
      }
    }

    if (!devSession) {
      devSession = await this.createDeviceSession(
        resolvedPartner.id,
        deviceId,
        payload.deviceName || 'Mobile Device',
        payload.platform || 'android'
      );
    }

    const token = this.generateToken({
      id: resolvedPartner.id,
      partnerCode: resolvedPartner.partner_code,
      role: resolvedPartner.role || 'partner',
      mobile: resolvedPartner.mobile
    });

    const updatedPartner = await partnerRepo.findById(resolvedPartner.id);

    return {
      success: true,
      message: 'PIN configured successfully',
      token,
      deviceId: devSession.deviceId,
      deviceToken: devSession.deviceToken,
      hasMpin: true,
      partner: partnerService.formatPartner(updatedPartner)
    };
  }

  async verifyMpin(payload) {
    const cleanMpin = String(payload.mpin || payload.pin || '').trim();
    const deviceId = payload.deviceId || payload.deviceUuid;
    const deviceToken = payload.deviceToken || payload.trustedDeviceToken;

    if (!cleanMpin || !/^\d{4}$/.test(cleanMpin)) {
      const err = new Error('Incorrect PIN');
      err.status = 400;
      throw err;
    }

    if (!deviceId || !deviceToken) {
      const err = new Error('Trusted device authentication required. Please verify with mobile OTP.');
      err.status = 401;
      throw err;
    }

    // 1. Device binding check (MPIN alone cannot authenticate arbitrary devices)
    const deviceSession = await this.validateDeviceSession(deviceId, deviceToken);
    if (!deviceSession) {
      const err = new Error('Device session not recognized or expired. Please verify with mobile OTP.');
      err.status = 401;
      throw err;
    }

    // 2. Brute force lockout check
    if (deviceSession.mpin_locked_until && new Date(deviceSession.mpin_locked_until) > new Date()) {
      const err = new Error('Account temporarily locked due to too many incorrect PIN attempts. Please use Forgot PIN.');
      err.status = 423;
      throw err;
    }

    // 3. Ensure MPIN is configured
    if (!deviceSession.mpin_hash) {
      const err = new Error('PIN not configured for this account. Please create a PIN.');
      err.status = 400;
      throw err;
    }

    // 4. Verify MPIN against bcrypt hash
    const isMatch = await bcrypt.compare(cleanMpin, deviceSession.mpin_hash);
    if (!isMatch) {
      const attempts = (deviceSession.mpin_attempts || 0) + 1;
      if (attempts >= 5) {
        await query(
          'UPDATE partners SET mpin_attempts = ?, mpin_locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?',
          [attempts, deviceSession.partner_id]
        );
        const err = new Error('Incorrect PIN. Maximum 5 attempts reached. Account locked for 15 minutes.');
        err.status = 423;
        throw err;
      } else {
        await query(
          'UPDATE partners SET mpin_attempts = ? WHERE id = ?',
          [attempts, deviceSession.partner_id]
        );
        const err = new Error('Incorrect PIN');
        err.status = 401;
        throw err;
      }
    }

    // 5. Success: reset attempt counter & lockout, update last_unlocked_at
    await query(
      'UPDATE partners SET mpin_attempts = 0, mpin_locked_until = NULL WHERE id = ?',
      [deviceSession.partner_id]
    );
    await query(
      'UPDATE partner_devices SET last_unlocked_at = NOW() WHERE id = ?',
      [deviceSession.id]
    );

    const fullPartner = await partnerRepo.findById(deviceSession.partner_id);
    const token = this.generateToken({
      id: fullPartner.id,
      partnerCode: fullPartner.partner_code,
      role: fullPartner.role || 'partner',
      mobile: fullPartner.mobile
    });

    return {
      success: true,
      token,
      deviceId,
      hasMpin: true,
      partner: partnerService.formatPartner(fullPartner)
    };
  }

  async resetMpin(payload) {
    const { mobile, otp, newMpin, confirmMpin, deviceId, deviceName, platform } = payload;
    const cleanMobile = normalizeIndianMobile(mobile);
    const cleanOtp = String(otp || '').trim();
    const cleanNewMpin = String(newMpin || '').trim();
    const cleanConfirm = String(confirmMpin || '').trim();

    if (!cleanOtp || !/^\d{4}$/.test(cleanOtp)) {
      const err = new Error('OTP must be exactly 4 numeric digits');
      err.status = 400;
      err.code = 'INVALID_OTP_FORMAT';
      throw err;
    }

    if (!cleanNewMpin || !/^\d{4}$/.test(cleanNewMpin)) {
      const err = new Error('PIN must be exactly 4 numeric digits');
      err.status = 400;
      throw err;
    }

    if (cleanNewMpin !== cleanConfirm) {
      const err = new Error('New PIN and confirmation do not match');
      err.status = 400;
      throw err;
    }

    // Verify OTP with purpose mpin_reset
    const [sessions] = await query(
      `SELECT * FROM otp_sessions 
       WHERE mobile = ? AND is_consumed = 0 AND expires_at > NOW()
         AND purpose = 'pin_reset'
       ORDER BY created_at DESC LIMIT 1`,
      [cleanMobile]
    );

    if (sessions.length === 0) {
      const err = new Error('Invalid or expired OTP. Please request a new OTP.');
      err.status = 400;
      throw err;
    }

    const session = sessions[0];
    if (session.attempt_count >= 5) {
      const err = new Error('Too many invalid attempts. Please request a new OTP.');
      err.status = 429;
      throw err;
    }
    const isMatch = await bcrypt.compare(cleanOtp, session.otp_hash);
    if (!isMatch) {
      await query('UPDATE otp_sessions SET attempt_count = attempt_count + 1 WHERE id = ?', [session.id]);
      const err = new Error('Invalid OTP. Please check and try again.');
      err.status = 401;
      throw err;
    }

    await query('UPDATE otp_sessions SET is_consumed = 1 WHERE id = ?', [session.id]);

    const partner = await partnerRepo.findByMobile(cleanMobile);
    if (!partner) {
      const err = new Error('No account found with this mobile number');
      err.status = 404;
      throw err;
    }

    // Hash new MPIN with bcrypt
    const mpinHash = await bcrypt.hash(cleanNewMpin, 10);
    await query(
      `UPDATE partners 
       SET mpin_hash = ?, mpin_configured_at = NOW(), mpin_attempts = 0, mpin_locked_until = NULL 
       WHERE id = ?`,
      [mpinHash, partner.id]
    );

    // Re-create trusted device session
    const devSession = await this.createDeviceSession(
      partner.id,
      deviceId,
      deviceName || 'Mobile Device',
      platform || 'android'
    );

    const token = this.generateToken({
      id: partner.id,
      partnerCode: partner.partner_code,
      role: partner.role || 'partner',
      mobile: partner.mobile
    });

    const updatedPartner = await partnerRepo.findById(partner.id);

    return {
      success: true,
      message: 'PIN reset successfully',
      token,
      deviceId: devSession.deviceId,
      deviceToken: devSession.deviceToken,
      hasMpin: true,
      partner: partnerService.formatPartner(updatedPartner)
    };
  }

  async getSessionStatus(deviceId, deviceToken) {
    if (!deviceId || !deviceToken) {
      return { valid: false };
    }
    const session = await this.validateDeviceSession(deviceId, deviceToken);
    if (!session) {
      return { valid: false };
    }
    const partner = await partnerRepo.findById(session.partner_id);
    return {
      valid: true,
      hasMpin: !!partner.mpin_hash,
      isLocked: !!(partner.mpin_locked_until && new Date(partner.mpin_locked_until) > new Date()),
      partner: partnerService.formatPartner(partner)
    };
  }

  async logoutDevice(partnerId, deviceId) {
    if (partnerId && deviceId) {
      await query(
        'UPDATE partner_devices SET is_trusted = 0 WHERE partner_id = ? AND device_id = ?',
        [partnerId, deviceId]
      );
    }
    return { success: true };
  }
}

module.exports = new AuthService();
module.exports.normalizeIndianMobile = normalizeIndianMobile;
module.exports.normalizePurpose = normalizePurpose;
