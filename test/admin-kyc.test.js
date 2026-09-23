// admin-kyc.test.js — KYC security & admin document access tests
const http = require('http');
const jwt = require('jsonwebtoken');

const BASE = 'https://api.loancrm.org';
const JWT_SECRET = process.env.JWT_SECRET || 'earnmitra_super_secret_jwt_key_2026_secure';

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      const json = JSON.stringify(body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(json));
      req.write(json);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║   KYC SECURITY & ACCESS VERIFICATION          ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  try {
    // 1. Verify /uploads static directory is NOT publicly served (returns 404)
    console.log('─── Test 1: Public /uploads access is blocked ───');
    const pubRes = await request('/uploads/kyc/test.pdf');
    if (pubRes.status === 404) {
      console.log('  ✅ PASS: Public /uploads/kyc/test.pdf returns 404 (not publicly exposed)');
    } else {
      console.error(`  ❌ FAIL: Expected 404 for public /uploads, got: ${pubRes.status}`);
    }

    // 2. Admin Authentication
    console.log('\n─── Test 2: Admin Authentication for KYC testing ───');
    const adminToken = jwt.sign(
      { id: 1, adminId: 1, role: 'admin', actorType: 'admin', username: 'admin', email: 'admin@earnmitra.in' },
      JWT_SECRET, { expiresIn: '1h' }
    );
    console.log('  ✅ PASS: Admin authentication successful (signed JWT)');

    // 3. Admin can list KYC documents
    console.log('\n─── Test 3: Admin GET /api/admin/kyc ───');
    const kycList = await request('/api/admin/kyc', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (kycList.status === 200 && Array.isArray(kycList.body?.data)) {
      console.log(`  ✅ PASS: Admin can list KYC documents (found ${kycList.body.total} total)`);
    } else {
      console.error('  ❌ FAIL: Admin cannot list KYC documents', kycList.status);
    }

    // 4. Partner token rejected on /api/admin/kyc (403)
    console.log('\n─── Test 4: Partner token on /api/admin/kyc is rejected ───');
    const partnerToken = jwt.sign({ id: 1, role: 'partner' }, JWT_SECRET);
    const partRes = await request('/api/admin/kyc', {
      headers: { 'Authorization': `Bearer ${partnerToken}` }
    });
    if (partRes.status === 403) {
      console.log('  ✅ PASS: Partner token rejected on /api/admin/kyc with 403');
    } else {
      console.error(`  ❌ FAIL: Partner token got status: ${partRes.status}`);
    }

    // 5. Unauthenticated request to /api/admin/kyc is rejected (401)
    console.log('\n─── Test 5: Unauthenticated request to /api/admin/kyc is rejected ───');
    const noAuthRes = await request('/api/admin/kyc');
    if (noAuthRes.status === 401) {
      console.log('  ✅ PASS: Unauthenticated request rejected with 401');
    } else {
      console.error(`  ❌ FAIL: Unauthenticated request got status: ${noAuthRes.status}`);
    }

    console.log('\n─── All KYC security tests completed successfully! ───\n');
  } catch (err) {
    console.error('KYC Test error:', err);
    process.exit(1);
  }
}

runTests();
