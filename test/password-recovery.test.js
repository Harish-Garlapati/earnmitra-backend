const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
process.env.DEV_OTP_EXPOSE = 'true';
const smsService = require('../src/services/smsService');
smsService.sendOtp = async () => ({ success: true, requestId: 'TEST-REQ' });
const authService = require('../src/services/authService');
const { query, pool } = require('../src/config/db');

test('password recovery requires a valid scoped OTP, changes the password, and revokes trusted devices', async t => {
  const suffix = String(Date.now()).slice(-8);
  const mobile = `7${suffix}1`.slice(0, 10);
  const oldPassword = 'OldPass123';
  const newPassword = 'NewPass456';
  const hash = await bcrypt.hash(oldPassword, 10);
  const [result] = await query(
    `INSERT INTO partners (partner_code,full_name,mobile,partner_type,state,password_hash,role,is_active,kyc_status,approval_status)
     VALUES (?,?,?,?,?,?,'partner',1,'pending','active')`,
    [`PW-${Date.now()}`, 'Password Recovery Test', mobile, 'Test', 'Telangana', hash]
  );
  const partnerId = result.insertId;
  await authService.createDeviceSession(partnerId, `password-test-${Date.now()}`, 'Password Test', 'test');
  t.after(async () => {
    await query('DELETE FROM otp_sessions WHERE mobile = ?', [mobile]);
    await query('DELETE FROM partner_devices WHERE partner_id = ?', [partnerId]);
    await query('DELETE FROM partners WHERE id = ?', [partnerId]);
    await pool.end();
  });

  const otpResult = await authService.sendOtp(mobile, 'password_reset');
  assert.match(otpResult.devOtp || '', /^\d{6}$/);
  await assert.rejects(
    authService.resetPassword({ mobile, otp: '000000', newPassword, confirmPassword: newPassword }),
    /Invalid OTP/
  );
  const reset = await authService.resetPassword({ mobile, otp: otpResult.devOtp, newPassword, confirmPassword: newPassword });
  assert.equal(reset.success, true);
  await assert.rejects(authService.loginWithPassword(mobile, oldPassword), /Invalid mobile or password/);
  assert.equal((await authService.loginWithPassword(mobile, newPassword)).success, true);
  const [devices] = await query('SELECT COUNT(*) AS active FROM partner_devices WHERE partner_id = ? AND is_trusted = 1', [partnerId]);
  assert.equal(Number(devices[0].active), 0);
});
