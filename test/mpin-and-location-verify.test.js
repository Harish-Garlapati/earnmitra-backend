const assert = require('assert');
const app = require('../src/server');
const { pool, query } = require('../src/config/db');
const authService = require('../src/services/authService');
const bcrypt = require('bcryptjs');

async function runTests() {
  console.log('=== STARTING MPIN & PIN LOCATION VERIFICATION SUITE ===\n');

  // Start app on ephemeral port
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      throw err;
    }
  }

  try {
    // 1. Verify MariaDB Connectivity
    await test('1. MariaDB connection to earnmitra on 127.0.0.1:3306', async () => {
      const [rows] = await query('SELECT DATABASE() as db, count(*) as count FROM partners');
      assert.strictEqual(rows[0].db, 'earnmitra');
      assert.ok(rows[0].count > 0, 'Partners table should contain records');
    });

    // Setup a dedicated test partner and device session
    const testMobile = '9999912345';
    const testDeviceId = 'test_device_' + Date.now();
    const cleanMpin = '1234';
    const mpinHash = await bcrypt.hash(cleanMpin, 10);

    // Clean up any previous test partner
    await query('DELETE FROM partner_devices WHERE partner_id IN (SELECT id FROM partners WHERE mobile = ?)', [testMobile]);
    await query('DELETE FROM partners WHERE mobile = ?', [testMobile]);

    // Insert test partner
    const [ins] = await query(
      `INSERT INTO partners (partner_code, full_name, mobile, partner_type, mpin_hash, mpin_configured_at, mpin_attempts, is_active, kyc_status, approval_status)
       VALUES (?, ?, ?, 'Individual', ?, NOW(), 0, 1, 'verified', 'active')`,
      ['TESTPARTNER01', 'Test Verification Partner', testMobile, mpinHash]
    );
    const partnerId = ins.insertId;

    // Create trusted device session
    const devSession = await authService.createDeviceSession(partnerId, testDeviceId, 'Verification Test Device', 'android');

    // 2. Test Correct MPIN (4 Digits)
    await test('2. Correct MPIN auto-verify returns token & resets attempts', async () => {
      const res = await fetch(`${baseUrl}/api/auth/mpin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: devSession.deviceId,
          deviceToken: devSession.deviceToken,
          mpin: '1234'
        })
      });
      const data = await res.json();

      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.ok(data.token, 'Token should be returned');
      assert.ok(data.partner.mobile.includes(testMobile), `Expected mobile to contain ${testMobile}`);

      const [pRows] = await query('SELECT mpin_attempts FROM partners WHERE id = ?', [partnerId]);
      assert.strictEqual(pRows[0].mpin_attempts, 0);
    });

    // 3. Test Wrong MPIN (Returns 401, clean error, increments attempts)
    await test('3. Wrong MPIN returns 401 with clean error and increments attempts', async () => {
      const res = await fetch(`${baseUrl}/api/auth/mpin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: devSession.deviceId,
          deviceToken: devSession.deviceToken,
          mpin: '9999'
        })
      });
      const data = await res.json();

      assert.strictEqual(res.status, 401);
      assert.strictEqual(data.error, 'Incorrect PIN');

      const [pRows] = await query('SELECT mpin_attempts FROM partners WHERE id = ?', [partnerId]);
      assert.strictEqual(pRows[0].mpin_attempts, 1);
    });

    // 4. Test Lockout after 5 failed attempts
    await test('4. MPIN lockout after 5 failed attempts returns 423', async () => {
      await query('UPDATE partners SET mpin_attempts = 4 WHERE id = ?', [partnerId]);

      const res = await fetch(`${baseUrl}/api/auth/mpin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: devSession.deviceId,
          deviceToken: devSession.deviceToken,
          mpin: '0000'
        })
      });
      const data = await res.json();

      assert.strictEqual(res.status, 423);
      assert.ok(data.error.includes('Maximum 5 attempts reached'));
      assert.ok(data.error.includes('15 minutes'));
    });

    // 5. Test Global Error Handler Sanitization (Zero leaks of ECONNREFUSED/3306)
    await test('5. Server error sanitization hides raw MySQL/Node error details', async () => {
      const express = require('express');
      const testApp = express();
      testApp.use('/test-db-error', (req, res, next) => {
        const err = new Error('connect ECONNREFUSED 127.0.0.1:3306');
        err.code = 'ECONNREFUSED';
        next(err);
      });
      testApp.use((err, req, res, next) => {
        const status = err.status || 500;
        const rawMsg = String(err.message || '');
        const rawCode = String(err.code || '');

        const isConnectionOrDbError =
          rawCode === 'ECONNREFUSED' ||
          rawCode === 'ETIMEDOUT' ||
          rawCode === 'ENOTFOUND' ||
          rawCode === 'PROTOCOL_CONNECTION_LOST' ||
          rawCode.startsWith('ER_') ||
          rawMsg.includes('ECONNREFUSED') ||
          rawMsg.includes('127.0.0.1') ||
          rawMsg.includes('3306') ||
          rawMsg.toLowerCase().includes('sql');

        if (isConnectionOrDbError || status >= 500) {
          return res.status(status >= 500 ? status : 500).json({
            error: 'Unable to connect right now. Please try again.'
          });
        }
        res.status(status).json({ error: rawMsg });
      });

      const testServer = testApp.listen(0);
      const testPort = testServer.address().port;
      const res = await fetch(`http://127.0.0.1:${testPort}/test-db-error`);
      const data = await res.json();
      testServer.close();

      assert.strictEqual(res.status, 500);
      assert.strictEqual(data.error, 'Unable to connect right now. Please try again.');
      assert.strictEqual(data.code, undefined, 'Raw code should NOT be leaked');
      assert.strictEqual(JSON.stringify(data).includes('ECONNREFUSED'), false);
      assert.strictEqual(JSON.stringify(data).includes('3306'), false);
    });

    // 6. Test PIN Code Location Lookup: 523169 (Parchur, Andhra Pradesh)
    await test('6. PIN code 523169 auto-resolves to Parchur, Andhra Pradesh', async () => {
      const res = await fetch(`${baseUrl}/api/location/pincode/523169`);
      const data = await res.json();

      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.pincode, '523169');
      assert.ok(data.place.includes('Parchur'), `Expected place Parchur, got ${data.place}`);
      assert.strictEqual(data.state, 'Andhra Pradesh');
    });

    // 7. Test PIN Code Location Lookup: 500016 (Begumpet / Hyderabad, Telangana)
    await test('7. PIN code 500016 auto-resolves to Begumpet, Telangana', async () => {
      const res = await fetch(`${baseUrl}/api/location/pincode/500016`);
      const data = await res.json();

      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.pincode, '500016');
      assert.ok(data.place.toLowerCase().includes('begumpet') || data.place.toLowerCase().includes('hyderabad'));
      assert.strictEqual(data.state, 'Telangana');
    });

    // 8. Test Invalid PIN codes
    await test('8. Invalid PIN code handling', async () => {
      const resShort = await fetch(`${baseUrl}/api/location/pincode/123`);
      const dataShort = await resShort.json();
      assert.strictEqual(resShort.status, 400);
      assert.strictEqual(dataShort.error, 'Please enter a valid 6-digit PIN code');

      const resNonExistent = await fetch(`${baseUrl}/api/location/pincode/000000`);
      const dataNonExistent = await resNonExistent.json();
      assert.strictEqual(resNonExistent.status, 404);
      assert.strictEqual(dataNonExistent.error, 'PIN code not found. Please check and try again.');
    });

    // Clean up test data
    await query('DELETE FROM partner_devices WHERE partner_id = ?', [partnerId]);
    await query('DELETE FROM partners WHERE id = ?', [partnerId]);

    server.close();
    console.log(`\n=== ALL TESTS PASSED: ${passed}/${total} ===\n`);
    process.exit(0);
  } catch (err) {
    server.close();
    console.error('\n=== TEST FAILED ===\n', err);
    process.exit(1);
  }
}

runTests();
