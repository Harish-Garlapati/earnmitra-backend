const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const partnerService = require('../services/partnerService');
const rateLimit = require('express-rate-limit');

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (process.env.NODE_ENV === 'test' || process.env.DEV_OTP_EXPOSE === 'true') ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false
});

// POST /api/auth/otp/send
router.post('/otp/send', async (req, res, next) => {
  try {
    const { mobile, purpose } = req.body;
    const result = await authService.sendOtp(mobile, purpose);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// POST /api/auth/otp/verify
router.post('/otp/verify', async (req, res, next) => {
  try {
    const { mobile, otp, purpose, deviceId, deviceName, platform } = req.body;
    const result = await authService.verifyOtp(mobile, otp, purpose, deviceId, deviceName, platform);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

router.post('/password/otp/send', passwordResetLimiter, async (req, res, next) => {
  try { res.json(await authService.requestPasswordResetOtp(req.body.mobile)); }
  catch (err) { if (err.status) return res.status(err.status).json({ error: err.message }); next(err); }
});

router.post('/password/reset', passwordResetLimiter, async (req, res, next) => {
  try { res.json(await authService.resetPassword(req.body)); }
  catch (err) { if (err.status) return res.status(err.status).json({ error: err.message }); next(err); }
});

// POST /api/auth/mpin/set
router.post('/mpin/set', optionalAuth, async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      partnerId: req.user?.id || req.body.partnerId
    };
    const result = await authService.setMpin(payload);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// POST /api/auth/mpin/verify (Daily app unlock)
router.post('/mpin/verify', async (req, res, next) => {
  try {
    const result = await authService.verifyMpin(req.body);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// POST /api/auth/mpin/reset (Forgot MPIN recovery)
router.post('/mpin/reset', async (req, res, next) => {
  try {
    const result = await authService.resetMpin(req.body);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// POST /api/auth/session/status (Check trusted device session & MPIN state)
router.post('/session/status', async (req, res, next) => {
  try {
    const { deviceId, deviceToken } = req.body;
    const result = await authService.getSessionStatus(deviceId, deviceToken);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// POST /api/auth/logout (Revoke trusted device session)
router.post('/logout', optionalAuth, async (req, res, next) => {
  try {
    const partnerId = req.user?.id || req.body.partnerId;
    const deviceId = req.body.deviceId;
    const result = await authService.logoutDevice(partnerId, deviceId);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// POST /api/auth/login (password-based login)
router.post('/login', async (req, res, next) => {
  try {
    const { mobile, password } = req.body;
    const result = await authService.loginWithPassword(mobile, password);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const identifier = username || email;
    const result = await authService.adminLogin(identifier, password);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// GET /api/auth/me (authenticated user profile)
router.get('/me', authenticate, async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return res.json({
        role: 'admin',
        id: req.user.id,
        email: req.user.email,
        username: req.user.username
      });
    }

    const partner = await partnerService.getCurrentPartner(req.user.partnerCode || req.user.id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner profile not found' });
    }
    res.json({
      role: 'partner',
      partner
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
