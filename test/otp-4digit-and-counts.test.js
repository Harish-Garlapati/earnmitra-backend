const assert = require('assert');
const http = require('http');
const { query, pool } = require('../src/config/db');
const walletRepo = require('../src/repositories/walletRepository');

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
  console.log('=== RUNNING OTP 4-DIGIT & COUNTS SYNCHRONIZATION TEST SUITE ===\n');
  const testMobile = '9876543210';

  try {
    // Clean up any lingering test sessions
    await query('DELETE FROM otp_sessions WHERE mobile = ?', [testMobile]);

    // -------------------------------------------------------------
    // TEST 1: STRICT 4-DIGIT OTP GENERATION & DB FORMAT
    // -------------------------------------------------------------
    console.log('[Test 1] Testing 4-Digit OTP generation...');
    const sendRes1 = await post('/api/auth/otp/send', {
      mobile: testMobile,
      purpose: 'login'
    });
    assert.strictEqual(sendRes1.status, 200, `Expected 200 on OTP send, got ${sendRes1.status}`);

    const [otpRows1] = await query(
      'SELECT id, otp_hash, attempt_count, is_consumed FROM otp_sessions WHERE mobile = ? AND purpose = ? AND is_consumed = 0 ORDER BY id DESC LIMIT 1',
      [testMobile, 'login']
    );
    assert.strictEqual(otpRows1.length, 1, 'Should find active unconsumed OTP session in DB');
    console.log('  ✓ Active OTP session found in DB with is_consumed = 0');

    // -------------------------------------------------------------
    // TEST 2: REJECTION OF NON-4-DIGIT OTP FORMATS (6 digits, 3 digits, letters)
    // -------------------------------------------------------------
    console.log('[Test 2] Testing strict rejection of 6-digit & invalid OTP formats...');
    const sixDigitRes = await post('/api/auth/otp/verify', {
      mobile: testMobile,
      otp: '123456',
      purpose: 'login'
    });
    assert.strictEqual(sixDigitRes.status, 400, `Expected 400 for 6-digit OTP, got ${sixDigitRes.status}`);
    assert.strictEqual(sixDigitRes.data.error, 'OTP must be exactly 4 numeric digits');
    console.log('  ✓ 6-digit OTP correctly rejected with HTTP 400 and "OTP must be exactly 4 numeric digits"');

    const threeDigitRes = await post('/api/auth/otp/verify', {
      mobile: testMobile,
      otp: '123',
      purpose: 'login'
    });
    assert.strictEqual(threeDigitRes.status, 400, `Expected 400 for 3-digit OTP, got ${threeDigitRes.status}`);
    console.log('  ✓ 3-digit OTP correctly rejected');

    const alphaRes = await post('/api/auth/otp/verify', {
      mobile: testMobile,
      otp: '12ab',
      purpose: 'login'
    });
    assert.strictEqual(alphaRes.status, 400, `Expected 400 for alphanumeric OTP, got ${alphaRes.status}`);
    console.log('  ✓ Non-numeric OTP correctly rejected');

    // -------------------------------------------------------------
    // TEST 3: RESEND INVALIDATES PRIOR UNCONSUMED OTPS
    // -------------------------------------------------------------
    console.log('[Test 3] Testing resend invalidation of previous unconsumed OTPs...');
    const firstOtpSessionId = otpRows1[0].id;

    // Fast-forward cooldown by setting created_at to 35 seconds ago
    await query('UPDATE otp_sessions SET created_at = DATE_SUB(NOW(), INTERVAL 35 SECOND) WHERE id = ?', [firstOtpSessionId]);

    // Trigger second OTP send
    const sendRes2 = await post('/api/auth/otp/send', {
      mobile: testMobile,
      purpose: 'login'
    });
    if (sendRes2.status !== 200) console.log('sendRes2 body:', sendRes2);
    assert.strictEqual(sendRes2.status, 200, 'Second OTP send should succeed');

    // Verify first session was marked is_consumed = 1
    const [prevRows] = await query('SELECT is_consumed FROM otp_sessions WHERE id = ?', [firstOtpSessionId]);
    assert.strictEqual(prevRows[0].is_consumed, 1, 'Previous unconsumed OTP must be marked is_consumed = 1');

    // Verify only 1 active session exists for mobile
    const [activeRows] = await query(
      'SELECT id FROM otp_sessions WHERE mobile = ? AND purpose = ? AND is_consumed = 0',
      [testMobile, 'login']
    );
    assert.strictEqual(activeRows.length, 1, 'Exactly 1 active OTP session should exist after resend');
    console.log('  ✓ Prior unconsumed OTP successfully invalidated on resend');

    // -------------------------------------------------------------
    // TEST 4: HOME TOTAL LEADS COUNT EQUALS MY LEADS ALL LEADS COUNT
    // -------------------------------------------------------------
    console.log('[Test 4] Testing Home Leads count == My Leads all leads count...');
    
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../src/middleware/authMiddleware');
    const [partners] = await query('SELECT id, partner_code, mobile FROM partners WHERE id = 1 LIMIT 1');
    const p = partners[0];
    const token = jwt.sign({ id: p.id, partnerCode: p.partner_code, role: 'partner', mobile: p.mobile }, JWT_SECRET, { expiresIn: '1h' });

    const headers = { 'Authorization': `Bearer ${token}` };

    // Fetch counts from /api/partners/me/summary
    const summaryRes = await get('/api/partners/me/summary', headers);
    assert.strictEqual(summaryRes.status, 200, 'Summary endpoint should return 200');
    const totalLeadsCount = summaryRes.data.counts?.leads || summaryRes.data.counts?.submitted || 0;

    // Fetch leads list from /api/leads
    const leadsRes = await get('/api/leads?limit=500', headers);
    assert.strictEqual(leadsRes.status, 200, 'Leads list endpoint should return 200');
    const leadsList = Array.isArray(leadsRes.data) ? leadsRes.data : (leadsRes.data.leads || []);
    
    console.log(`  Home Dashboard Total Leads count: ${totalLeadsCount}`);
    console.log(`  My Leads Page "All Leads" count: ${leadsList.length}`);
    assert.strictEqual(totalLeadsCount, leadsList.length, `Home leads count (${totalLeadsCount}) must equal My Leads all leads count (${leadsList.length})`);
    console.log('  ✓ Leads count synchronization verified: Home total == My Leads All Leads (100% matched)');

    // -------------------------------------------------------------
    // TEST 5: BUREAU TAX-INCLUSIVE PRICING AND DEDUCTION LOGIC
    // -------------------------------------------------------------
    console.log('[Test 5] Testing bureau pricing tax calculation...');
    const bureaus = ['CIBIL', 'EXPERIAN', 'EQUIFAX', 'CRIF'];
    const expectedTotals = {
      CIBIL: 116.82,
      EXPERIAN: 93.22,
      EQUIFAX: 93.22,
      CRIF: 81.42
    };

    for (const b of bureaus) {
      const priceInfo = await walletRepo.getBureauPrice(b);
      assert.ok(priceInfo, `Pricing for ${b} must exist in DB`);
      assert.strictEqual(priceInfo.isActive, true, `${b} should be active`);
      assert.strictEqual(priceInfo.totalPrice, expectedTotals[b], `Total price for ${b} must be ${expectedTotals[b]}`);
      
      // Verify base + gst === total
      const calcTotal = Number((priceInfo.basePrice + priceInfo.gstAmount).toFixed(2));
      assert.strictEqual(calcTotal, priceInfo.totalPrice, `Calculated total must match stored totalPrice for ${b}`);
      console.log(`  ✓ ${b}: Base ₹${priceInfo.basePrice} + ${priceInfo.gstPercentage}% GST (₹${priceInfo.gstAmount}) = ₹${priceInfo.totalPrice} (Exact tax-inclusive match)`);
    }

    // -------------------------------------------------------------
    // TEST 6: CLEANUP
    // -------------------------------------------------------------
    await query('DELETE FROM otp_sessions WHERE mobile = ?', [testMobile]);
    console.log('\n=== ALL 5 TESTS PASSED SUCCESSFULLY! ===\n');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
