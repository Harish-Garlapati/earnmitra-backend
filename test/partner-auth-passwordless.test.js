const assert = require('assert');
const http = require('http');
const { query, pool } = require('../src/config/db');
const bcrypt = require('bcryptjs');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, res => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(buf) });
        } catch {
          resolve({ status: res.statusCode, raw: buf });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET',
      headers
    }, res => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(buf) });
        } catch {
          resolve({ status: res.statusCode, raw: buf });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('1. Testing Location API (Pincode lookup)...');
  const pinRes = await get('/api/location/pincode/500001');
  assert.strictEqual(pinRes.status, 200, 'Pincode status must be 200');
  assert.strictEqual(pinRes.data.success, true, 'Pincode success must be true');
  assert.strictEqual(pinRes.data.pincode, '500001');
  assert.ok(pinRes.data.state, 'State must be present');
  console.log('✓ Pincode 500001 resolved:', pinRes.data.place, ',', pinRes.data.state);

  console.log('\n2. Testing Partner Passwordless Signup Initiation (4-digit OTP)...');
  const testPhone = '99' + Math.floor(10000000 + Math.random() * 90000000);
  const signupRes = await post('/api/auth/partner/signup', {
    name: 'Hareesh Partner',
    phone: testPhone,
    email: 'hareesh.test@earnmitra.in',
    pincode: '500001',
    city: 'Hyderabad',
    state: 'Telangana'
  });

  assert.strictEqual(signupRes.status, 200, 'Signup status must be 200');
  assert.strictEqual(signupRes.data.success, true, 'Signup success must be true');
  assert.ok(signupRes.data.expiresInSeconds, 'Must return expiresInSeconds');
  console.log('✓ Partner signup initiated for phone:', testPhone);

  // Directly set a known 4-digit test OTP in otp_sessions for deterministic verification
  const testOtp = '7429';
  const hashedOtp = await bcrypt.hash(testOtp, 8);
  await query(
    'UPDATE otp_sessions SET otp_hash = ? WHERE mobile = ? AND purpose = "signup" AND is_consumed = 0',
    [hashedOtp, testPhone]
  );

  console.log('\n3. Testing 4-digit OTP Verification...');
  const testDeviceId = 'dev_test_' + Date.now();
  const otpRes = await post('/api/auth/otp/verify', {
    mobile: testPhone,
    otp: testOtp,
    purpose: 'signup',
    deviceId: testDeviceId,
    deviceName: 'Test Phone',
    platform: 'android'
  });

  assert.strictEqual(otpRes.status, 200, 'OTP verify should return 200');
  assert.strictEqual(otpRes.data.hasMpin, false, 'New partner should not have MPIN yet');
  assert.ok(otpRes.data.token, 'Should return JWT token');
  assert.ok(otpRes.data.deviceToken, 'Should return device token');
  const jwtToken = otpRes.data.token;
  const deviceToken = otpRes.data.deviceToken;
  console.log('✓ Partner verified via 4-digit OTP. Token and DeviceToken issued.');

  console.log('\n4. Testing Create 4-Digit MPIN (/api/auth/mpin/set)...');
  const setMpinRes = await post('/api/auth/mpin/set', {
    deviceId: testDeviceId,
    deviceToken: deviceToken,
    mpin: '4826',
    confirmMpin: '4826'
  }, {
    'Authorization': `Bearer ${jwtToken}`
  });

  assert.strictEqual(setMpinRes.status, 200, 'Create MPIN must return 200');
  assert.strictEqual(setMpinRes.data.hasMpin, true, 'hasMpin must be true');
  console.log('✓ 4-digit MPIN created successfully!');

  console.log('\n5. Testing Daily Unlock with Enter MPIN (/api/auth/mpin/verify)...');
  const verifyMpinRes = await post('/api/auth/mpin/verify', {
    deviceId: testDeviceId,
    deviceToken: deviceToken,
    mpin: '4826'
  });

  assert.strictEqual(verifyMpinRes.status, 200, 'Verify MPIN must return 200');
  assert.ok(verifyMpinRes.data.token, 'Should return authenticated session token');
  const sessionToken = verifyMpinRes.data.token;
  console.log('✓ MPIN unlock succeeded! Partner authenticated.');

  console.log('\n6. Testing Dashboard API with 4 KPI File Counters and Search...');
  const dashRes = await get('/api/partners/me/dashboard', {
    'Authorization': `Bearer ${sessionToken}`
  });

  assert.strictEqual(dashRes.status, 200, 'Dashboard status must be 200');
  assert.ok(dashRes.data.partner, 'Partner object must exist');
  assert.ok(dashRes.data.counts, 'Counts object must exist');
  assert.strictEqual(typeof dashRes.data.counts.leads, 'number', 'Leads must be a numeric file count');
  assert.strictEqual(typeof dashRes.data.counts.sanctions, 'number', 'Sanctions must be a numeric file count');
  assert.strictEqual(typeof dashRes.data.counts.disbursed, 'number', 'Disbursed must be a numeric file count (not currency)');
  assert.strictEqual(typeof dashRes.data.counts.rejected, 'number', 'Rejected must be a numeric file count');
  console.log('✓ Dashboard counts verified (file counts only):', dashRes.data.counts);

  console.log('\n7. Testing Partner-Scoped Lead Search on Dashboard...');
  const searchRes = await get('/api/partners/me/dashboard?search=NonExistentPersonXYZ', {
    'Authorization': `Bearer ${sessionToken}`
  });
  assert.strictEqual(searchRes.status, 200);
  assert.strictEqual(searchRes.data.recentLeads.length, 0, 'Scoped search should filter correctly');
  console.log('✓ Partner-scoped lead search verified!');

  console.log('\n======================================================');
  console.log('ALL PARTNER AUTH & DASHBOARD VERIFICATION TESTS PASSED');
  console.log('======================================================');

  await pool.end();
}

run().catch(err => {
  console.error('Test failed:', err);
  pool.end().finally(() => process.exit(1));
});
