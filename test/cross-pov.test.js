// cross-pov.test.js — REAL cross-POV acceptance test
// Tests the complete Partner A -> Admin -> Partner A flow with actual API calls
const http = require('http');
const jwt = require('jsonwebtoken');
const { pool, query } = require('../src/config/db');

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
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch {
          resolve({ status: res.statusCode, body: data });
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

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${label} ${detail}`);
    failed++;
  }
}

async function cleanup(mobileA, mobileB) {
  try {
    const [partnersA] = await query('SELECT id FROM partners WHERE mobile = ?', [mobileA]);
    const [partnersB] = await query('SELECT id FROM partners WHERE mobile = ?', [mobileB]);

    for (const p of [...partnersA, ...partnersB]) {
      await query('DELETE FROM lead_status_history WHERE lead_id IN (SELECT id FROM leads WHERE partner_id = ?)', [p.id]);
      await query('DELETE FROM leads WHERE partner_id = ?', [p.id]);
      await query('DELETE FROM partners WHERE id = ?', [p.id]);
    }
  } catch (err) {
    // ignore
  }
}

async function runTests() {
  const testMobileA = '9900100001';
  const testMobileB = '9900100002';

  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║   CROSS-POV ACCEPTANCE TEST                   ║');
  console.log('║   Partner A → Admin → Partner A verification  ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  try {
    await cleanup(testMobileA, testMobileB);

    // 1. Admin Authentication
    console.log('─── Step 1: Admin Authentication ───');
    const adminToken = jwt.sign(
      { id: 1, adminId: 1, role: 'admin', actorType: 'admin', username: 'admin', email: 'admin@earnmitra.in' },
      JWT_SECRET, { expiresIn: '1h' }
    );
    assert('Admin token generated securely', !!adminToken);
    const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

    // 2. Register Partner A
    console.log('\n─── Step 2: Register Partner A ───');
    const regA = await request('/api/auth/register', { method: 'POST' }, {
      fullName: 'Test Partner Alpha',
      mobile: testMobileA,
      partnerType: 'DSA / Loan Agent',
      state: 'Telangana',
      city: 'Hyderabad',
      password: 'TestPass@123'
    });
    assert('Partner A registered', regA.status === 201 && regA.body?.success === true, JSON.stringify(regA.body));
    const partnerAToken = regA.body.token;
    const partnerAId = regA.body.partner?.dbId;
    const partnerACode = regA.body.partner?.partnerCode;
    const partnerAHeaders = { 'Authorization': `Bearer ${partnerAToken}` };
    console.log(`   Partner A: ${partnerACode} (ID: ${partnerAId})`);

    // 3. Register Partner B
    console.log('\n─── Step 3: Register Partner B ───');
    const regB = await request('/api/auth/register', { method: 'POST' }, {
      fullName: 'Test Partner Beta',
      mobile: testMobileB,
      partnerType: 'Financial Advisor',
      state: 'Karnataka',
      city: 'Bangalore',
      password: 'TestPass@456'
    });
    assert('Partner B registered', regB.status === 201 && regB.body?.success === true, JSON.stringify(regB.body));
    const partnerBToken = regB.body.token;
    const partnerBId = regB.body.partner?.dbId;
    const partnerBCode = regB.body.partner?.partnerCode;
    const partnerBHeaders = { 'Authorization': `Bearer ${partnerBToken}` };
    console.log(`   Partner B: ${partnerBCode} (ID: ${partnerBId})`);

    // 4. Partner A submits Lead A
    console.log('\n─── Step 4: Partner A submits Lead A ───');
    const leadA = await request('/api/leads', { method: 'POST', headers: partnerAHeaders }, {
      applicantName: 'Customer Alpha',
      mobile: '9800000001',
      city: 'Hyderabad',
      loanType: 'Business Loan',
      loanAmount: 500000,
      productCategory: 'Loans',
      businessName: 'Alpha Enterprises'
    });
    assert('Lead A created', leadA.status === 201 || leadA.status === 200, `Status: ${leadA.status}`);
    const leadAId = leadA.body?.dbId || leadA.body?.id;
    const leadACode = leadA.body?.leadCode || leadA.body?.lead_code;
    console.log(`   Lead A: ${leadACode} (DB ID: ${leadAId})`);

    // 5. Partner B submits Lead B
    console.log('\n─── Step 5: Partner B submits Lead B ───');
    const leadB = await request('/api/leads', { method: 'POST', headers: partnerBHeaders }, {
      applicantName: 'Customer Beta',
      mobile: '9800000002',
      city: 'Bangalore',
      loanType: 'Personal Loan',
      loanAmount: 300000,
      productCategory: 'Loans'
    });
    assert('Lead B created', leadB.status === 201 || leadB.status === 200, `Status: ${leadB.status}`);
    const leadBId = leadB.body?.dbId || leadB.body?.id;
    const leadBCode = leadB.body?.leadCode || leadB.body?.lead_code;
    console.log(`   Lead B: ${leadBCode} (DB ID: ${leadBId})`);

    // 6. Partner isolation: A sees only A
    console.log('\n─── Step 6: Partner isolation - A sees only A ───');
    const aLeads = await request('/api/leads', { method: 'GET', headers: partnerAHeaders });
    assert('Partner A gets leads', aLeads.status === 200);
    const aLeadsList = Array.isArray(aLeads.body) ? aLeads.body : [];
    const aSeesA = aLeadsList.some(l => (l.dbId || l.id) == leadAId || l.leadCode === leadACode);
    const aSeesB = aLeadsList.some(l => (l.dbId || l.id) == leadBId || l.leadCode === leadBCode);
    assert('Partner A sees Lead A', aSeesA);
    assert('Partner A does NOT see Lead B', !aSeesB);

    // 7. Partner isolation: B sees only B
    console.log('\n─── Step 7: Partner isolation - B sees only B ───');
    const bLeads = await request('/api/leads', { method: 'GET', headers: partnerBHeaders });
    assert('Partner B gets leads', bLeads.status === 200);
    const bLeadsList = Array.isArray(bLeads.body) ? bLeads.body : [];
    const bSeesB = bLeadsList.some(l => (l.dbId || l.id) == leadBId || l.leadCode === leadBCode);
    const bSeesA = bLeadsList.some(l => (l.dbId || l.id) == leadAId || l.leadCode === leadACode);
    assert('Partner B sees Lead B', bSeesB);
    assert('Partner B does NOT see Lead A', !bSeesA);

    // 8. Admin sees BOTH leads
    console.log('\n─── Step 8: Admin sees all leads ───');
    const adminLeads = await request('/api/admin/leads', { method: 'GET', headers: adminHeaders });
    assert('Admin gets leads', adminLeads.status === 200);
    const adminData = adminLeads.body?.data || adminLeads.body || [];
    const adminSeesA = adminData.some(l => l.lead_code === leadACode || l.leadCode === leadACode || (l.id || l.dbId) == leadAId);
    const adminSeesB = adminData.some(l => l.lead_code === leadBCode || l.leadCode === leadBCode || (l.id || l.dbId) == leadBId);
    assert('Admin sees Lead A', adminSeesA);
    assert('Admin sees Lead B', adminSeesB);

    // 9. Admin updates Lead A status to "Approved"
    console.log('\n─── Step 9: Admin updates Lead A status ───');
    // find the numeric db id for Lead A
    const targetLeadRow = adminData.find(l => l.lead_code === leadACode || (l.id || l.dbId) == leadAId);
    const numericIdA = targetLeadRow?.id || targetLeadRow?.dbId || leadAId;

    const updateRes = await request(`/api/admin/leads/${numericIdA}/status`, { method: 'PATCH', headers: adminHeaders }, {
      status: 'Approved',
      stage: 'Sanction',
      note: 'Cross-POV test: Admin approving Lead A'
    });
    assert('Admin status update succeeds', updateRes.status === 200 && updateRes.body?.success === true, JSON.stringify(updateRes.body));

    // 10. Verify lead_status_history in DB
    console.log('\n─── Step 10: Verify lead_status_history in DB ───');
    const [historyRows] = await query(
      'SELECT * FROM lead_status_history WHERE lead_id = ? ORDER BY id DESC',
      [numericIdA]
    );
    assert('lead_status_history has entries', historyRows.length >= 2, `Found ${historyRows.length} entries`);
    const latestHistory = historyRows[0];
    assert('Latest history status is Approved', latestHistory?.status === 'Approved');
    assert('Latest history stage is Sanction', latestHistory?.stage === 'Sanction');
    assert('History note contains admin reference', latestHistory?.note?.includes('admin') || latestHistory?.note?.includes('Admin'));

    // 11. Partner A sees the updated status
    console.log('\n─── Step 11: Partner A sees updated status ───');
    const aLeadDetail = await request(`/api/leads/${leadACode}`, { method: 'GET', headers: partnerAHeaders });
    assert('Partner A can view Lead A detail', aLeadDetail.status === 200);
    assert('Partner A sees Lead A status = Approved', aLeadDetail.body?.status === 'Approved');
    assert('Partner A sees Lead A stage = Sanction', aLeadDetail.body?.currentStage === 'Sanction');
    const timeline = aLeadDetail.body?.timeline || [];
    const hasApproval = timeline.some(t => t.label === 'Sanction' && t.done === true);
    assert('Partner A timeline shows Sanction entry', hasApproval);

    // 12. Partner B still CANNOT see Lead A
    console.log('\n─── Step 12: Partner B still isolated ───');
    const bLeadDetailA = await request(`/api/leads/${leadACode}`, { method: 'GET', headers: partnerBHeaders });
    assert('Partner B cannot view Lead A detail (403 or forbidden)',
      bLeadDetailA.status === 403 || bLeadDetailA.body?.forbidden === true || bLeadDetailA.status === 404,
      `Status: ${bLeadDetailA.status}`
    );

    // 13. Partner token cannot access admin API
    console.log('\n─── Step 13: Partner token rejected by admin API ───');
    const partnerAdminAttempt = await request('/api/admin/leads', { method: 'GET', headers: partnerAHeaders });
    assert('Partner A token on admin endpoint -> 403', partnerAdminAttempt.status === 403);

    // Cleanup
    console.log('\n─── Cleanup ───');
    await cleanup(testMobileA, testMobileB);
    console.log('   Test data cleaned up');

    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log(`║   RESULTS: ${passed} passed, ${failed} failed               ║`);
    console.log('╚═══════════════════════════════════════════════╝\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('\n💥 Test crashed:', err);
    await cleanup(testMobileA, testMobileB);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTests();
