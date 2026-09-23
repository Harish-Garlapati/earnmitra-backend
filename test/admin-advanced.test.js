const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'earnmitra_super_secret_jwt_key_2026_secure';

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(`https://api.loancrm.org${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.setHeader('Content-Type', 'application/json');
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('--- RUNNING ADVANCED ADMIN ROUTE TESTS ---');
  // Admin token (Super Admin)
  const adminToken = jwt.sign(
    { id: 1, adminId: 1, role: 'admin', username: 'superadmin', email: 'admin@earnmitra.in' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const headers = { 'Authorization': `Bearer ${adminToken}` };

  // 1. Test Commissions Ledger
  console.log('1. Testing GET /api/admin/commissions...');
  const commRes = await request('/api/admin/commissions', { method: 'GET', headers });
  if (commRes.status === 200 && commRes.body.data && commRes.body.summary) {
    console.log('✅ Commissions ledger returned 200 with summary KPIs');
  } else {
    console.error('❌ Commissions ledger failed:', commRes);
  }

  // 2. Test Settings GET & PATCH
  console.log('2. Testing GET & PATCH /api/admin/settings...');
  const setGet = await request('/api/admin/settings', { method: 'GET', headers });
  if (setGet.status === 200 && Array.isArray(setGet.body)) {
    console.log('✅ Settings GET returned 200');
  } else {
    console.error('❌ Settings GET failed:', setGet);
  }

  const setPatch = await request('/api/admin/settings', { method: 'PATCH', headers }, {
    min_payout_amount: '500',
    support_phone: '1800-123-EARN'
  });
  if (setPatch.status === 200 && setPatch.body.success) {
    console.log('✅ Settings PATCH updated successfully');
  } else {
    console.error('❌ Settings PATCH failed:', setPatch);
  }

  // 3. Test Roles & Users
  console.log('3. Testing GET /api/admin/roles & /api/admin/users...');
  const rolesRes = await request('/api/admin/roles', { method: 'GET', headers });
  const usersRes = await request('/api/admin/users', { method: 'GET', headers });
  if (rolesRes.status === 200 && usersRes.status === 200) {
    console.log(`✅ Roles (${rolesRes.body.length}) and Admin Users (${usersRes.body.length}) retrieved successfully`);
  } else {
    console.error('❌ Roles/Users retrieval failed:', { rolesRes, usersRes });
  }

  // 4. Test Partner Status Toggle
  console.log('4. Testing PATCH /api/admin/partners/1/toggle-status...');
  const toggleRes = await request('/api/admin/partners/1/toggle-status', { method: 'PATCH', headers });
  if (toggleRes.status === 200 && toggleRes.body.success) {
    console.log(`✅ Partner status toggled to: ${toggleRes.body.partner?.approval_status}`);
    // Toggle back to keep state clean if needed
    if (toggleRes.body.partner?.approval_status !== 'approved') {
      await request('/api/admin/partners/1/toggle-status', { method: 'PATCH', headers });
      console.log('✅ Partner status toggled back to approved');
    }
  } else {
    console.error('❌ Partner toggle failed:', toggleRes);
  }

  // 5. Test Payouts Listing
  console.log('5. Testing GET /api/admin/payouts...');
  const payoutsRes = await request('/api/admin/payouts', { method: 'GET', headers });
  if (payoutsRes.status === 200 && Array.isArray(payoutsRes.body.data)) {
    console.log(`✅ Payouts listing returned 200 with ${payoutsRes.body.data.length} requests`);
  } else {
    console.error('❌ Payouts listing failed:', payoutsRes);
  }

  console.log('--- ALL ADVANCED ADMIN BACKEND TESTS COMPLETED ---');
  process.exit(0);
}

run().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
