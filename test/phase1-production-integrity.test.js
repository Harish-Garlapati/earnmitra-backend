const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { query, pool } = require('../src/config/db');
const authService = require('../src/services/authService');
const smsService = require('../src/services/smsService');
const notificationRepo = require('../src/repositories/notificationRepository');
const notificationService = require('../src/services/notificationService');

test('Phase 1 Integrity - OTP 10-Minute Expiry & Security Policy', async t => {
  const originalSendOtp = smsService.sendOtp;
  smsService.sendOtp = async () => ({ success: true, requestId: 'TEST-MOCK-REQ' });

  const testMobile = '9811111111';

  t.after(async () => {
    smsService.sendOtp = originalSendOtp;
    await query('DELETE FROM otp_sessions WHERE mobile = ?', [testMobile]);
  });

  // Test sendOtp response properties
  const res = await authService.sendOtp(testMobile, 'login');
  assert.equal(res.success, true);
  assert.equal(res.expiresInSeconds, 600, 'OTP expiration must be 600 seconds (10 mins)');
  assert.equal(res.resendCooldownSeconds, 30, 'Resend cooldown must be 30 seconds');

  // Verify DB record TTL is ~10 mins (between 9 and 11 mins from now)
  const [rows] = await query(
    'SELECT expires_at, created_at, is_consumed FROM otp_sessions WHERE mobile = ? ORDER BY id DESC LIMIT 1',
    [testMobile]
  );
  assert.equal(rows.length, 1);
  const diffMs = new Date(rows[0].expires_at).getTime() - new Date(rows[0].created_at).getTime();
  const diffMins = Math.round(diffMs / 60000);
  assert.equal(diffMins, 10, 'DB expires_at must be exactly 10 minutes after creation');
  assert.equal(rows[0].is_consumed, 0, 'New OTP must not be consumed');
});

test('Phase 1 Integrity - SMS Provider Delivery Failure Sanitization & Invalidation', async t => {
  const originalSendOtp = smsService.sendOtp;
  // Simulate SMS provider failure
  smsService.sendOtp = async () => {
    const err = new Error('Gateway Timeout');
    err.status = 502;
    err.code = 'SMS_DELIVERY_FAILED';
    throw err;
  };

  const failMobile = '9822222222';

  t.after(async () => {
    smsService.sendOtp = originalSendOtp;
    await query('DELETE FROM otp_sessions WHERE mobile = ?', [failMobile]);
  });

  await assert.rejects(
    async () => {
      await authService.sendOtp(failMobile, 'login');
    },
    err => {
      assert.equal(err.status, 502, 'Must return HTTP 502');
      assert.equal(err.message, 'Unable to send OTP right now. Please try again.', 'Must sanitize error message');
      return true;
    }
  );

  // Verify that the failed session was immediately marked is_consumed = 1 so it cannot be used
  const [rows] = await query(
    'SELECT is_consumed FROM otp_sessions WHERE mobile = ? ORDER BY id DESC LIMIT 1',
    [failMobile]
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].is_consumed, 1, 'Failed OTP session must be immediately invalidated (is_consumed = 1)');
});

test('Phase 1 Integrity - Notifications Subsystem Isolation and Multi-Tenancy', async t => {
  // Create two distinct test partners
  const mobileA = '9833333331';
  const mobileB = '9833333332';
  const hash = await bcrypt.hash('TestPass123', 8);

  const [resA] = await query(
    `INSERT INTO partners (partner_code, full_name, mobile, partner_type, state, password_hash, role, is_active, kyc_status, approval_status)
     VALUES (?, 'Partner Alpha', ?, 'Individual', 'Telangana', ?, 'partner', 1, 'approved', 'active')`,
    [`TEST-P1-A-${Date.now()}`, mobileA, hash]
  );
  const partnerAId = resA.insertId;

  const [resB] = await query(
    `INSERT INTO partners (partner_code, full_name, mobile, partner_type, state, password_hash, role, is_active, kyc_status, approval_status)
     VALUES (?, 'Partner Beta', ?, 'Individual', 'Telangana', ?, 'partner', 1, 'approved', 'active')`,
    [`TEST-P1-B-${Date.now()}`, mobileB, hash]
  );
  const partnerBId = resB.insertId;

  t.after(async () => {
    await query('DELETE FROM notifications WHERE partner_id IN (?, ?)', [partnerAId, partnerBId]);
    await query('DELETE FROM partners WHERE id IN (?, ?)', [partnerAId, partnerBId]);
  });

  // Dispatch notification to Partner A
  const notifAId = await notificationService.notifyKycStatus(partnerAId, 'approved', 'Your KYC documents have been verified.');
  assert.ok(notifAId, 'Notification ID should be returned');

  // Dispatch notification to Partner B
  await notificationService.notifyCommission(partnerBId, 'LEAD-999', 2500, 'Personal Loan');

  // Verify Partner A can only see their own notification
  const notifsA = await notificationRepo.listByPartner(partnerAId);
  assert.equal(notifsA.length, 1);
  assert.equal(notifsA[0].partnerId, partnerAId);
  assert.equal(notifsA[0].title, 'KYC Verification Approved');
  assert.equal(notifsA[0].type, 'kyc');

  // Verify Partner B unread count
  const unreadCountB = await notificationRepo.getUnreadCount(partnerBId);
  assert.equal(unreadCountB, 1);

  // Cross-tenant attempt: Partner A cannot mark Partner B's notification as read
  const notifsB = await notificationRepo.listByPartner(partnerBId);
  assert.equal(notifsB.length, 1);
  const partnerBNotifId = notifsB[0].id;

  const crossMarkResult = await notificationRepo.markAsRead(partnerBNotifId, partnerAId);
  assert.equal(crossMarkResult, false, 'Partner A must not be able to mark Partner B notification as read');

  // Partner B marks their own notification as read
  const ownMarkResult = await notificationRepo.markAsRead(partnerBNotifId, partnerBId);
  assert.equal(ownMarkResult, true, 'Partner B can mark their own notification as read');

  const afterReadCountB = await notificationRepo.getUnreadCount(partnerBId);
  assert.equal(afterReadCountB, 0, 'Unread count should become 0');
});

test('Phase 1 Integrity - Event-Driven Notification Generation for Real Business Events', async t => {
  const testMobile = '9844444441';
  const hash = await bcrypt.hash('TestPass123', 8);
  const [res] = await query(
    `INSERT INTO partners (partner_code, full_name, mobile, partner_type, state, password_hash, role, is_active, kyc_status, approval_status)
     VALUES (?, 'Event Test Partner', ?, 'Individual', 'Telangana', ?, 'partner', 1, 'approved', 'active')`,
    [`TEST-P1-E-${Date.now()}`, testMobile, hash]
  );
  const partnerId = res.insertId;

  t.after(async () => {
    await query('DELETE FROM notifications WHERE partner_id = ?', [partnerId]);
    await query('DELETE FROM partners WHERE id = ?', [partnerId]);
    await pool.end();
  });

  // 1. Lead status change
  await notificationService.notifyLeadStatus(partnerId, 'LEAD-101', 'approved');
  // 2. Commission credited
  await notificationService.notifyCommission(partnerId, 'LEAD-101', 1500, 'Home Loan');
  // 3. Payout approved
  await notificationService.notifyPayoutStatus(partnerId, 201, 'approved', 5000);
  // 4. Support reply
  await notificationService.notifySupportReply(partnerId, 301, 'TICK-301');
  // 5. CIBIL ready
  await notificationService.notifyCibilReady(partnerId, 401, 'Rahul Sharma', 760);

  const items = await notificationRepo.listByPartner(partnerId);
  assert.equal(items.length, 5, 'Must generate exactly 5 notifications for 5 events');
  const types = items.map(i => i.type);
  assert.ok(types.includes('lead'));
  assert.ok(types.includes('commission'));
  assert.ok(types.includes('payout'));
  assert.ok(types.includes('support'));
  assert.ok(types.includes('cibil'));

  // Mark all as read
  const markedCount = await notificationRepo.markAllAsRead(partnerId);
  assert.equal(markedCount, 5);
  const remainingUnread = await notificationRepo.getUnreadCount(partnerId);
  assert.equal(remainingUnread, 0);
});
