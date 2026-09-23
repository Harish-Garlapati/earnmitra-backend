const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'earnmitra_super_secret_jwt_key_2026_secure';

const adminToken = jwt.sign(
  { id: 1, adminId: 1, role: 'admin', actorType: 'admin', username: 'ravi_admin', email: 'ravi.kumar@earnmitra.in' },
  JWT_SECRET,
  { expiresIn: '1h' }
);
const headers = {
  'Authorization': `Bearer ${adminToken}`,
  'Content-Type': 'application/json'
};

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } }, (res) => {
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
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('===========================================================');
  console.log('  TESTING MULTI-ENDPOINT BACKEND API INTEGRATIONS');
  console.log('===========================================================');

  const tests = [
    { name: '1. Dashboard Stats API', path: '/api/admin/dashboard/stats', method: 'GET' },
    { name: '2. Leads List API', path: '/api/admin/leads?limit=5', method: 'GET' },
    { 
      name: '3. Create Lead API', 
      path: '/api/admin/leads', 
      method: 'POST', 
      body: {
        applicantName: 'Automated Multi-API Test User',
        mobile: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
        loanType: 'Personal Loan',
        amount: 250000,
        city: 'Hyderabad',
        productCategory: 'Loans',
        status: 'In Progress'
      }
    },
    { name: '4. Partners List API', path: '/api/admin/partners?limit=5', method: 'GET' },
    { 
      name: '5. Create Partner API', 
      path: '/api/admin/partners', 
      method: 'POST', 
      body: {
        full_name: 'Fast Track DSA Associates',
        mobile: `97${Math.floor(10000000 + Math.random() * 89999999)}`,
        email: `fasttrack_${Date.now()}@dsa.in`,
        partner_type: 'DSA',
        district: 'Hyderabad',
        state: 'Telangana'
      }
    },
    { name: '6. Lenders List API', path: '/api/admin/lenders', method: 'GET' },
    { 
      name: '7. Create Lender API', 
      path: '/api/admin/lenders', 
      method: 'POST', 
      body: {
        name: `Test Bank ${Date.now()}`,
        category: 'bank',
        code: `BANK_${Date.now()}`
      }
    },
    { name: '8. Support Tickets List API', path: '/api/admin/support/tickets', method: 'GET' },
    { 
      name: '9. Create Support Ticket API', 
      path: '/api/admin/support/tickets', 
      method: 'POST', 
      body: {
        ticketNumber: `TKT-${Math.floor(2000 + Math.random() * 500)}`,
        partnerName: 'Fast Track DSA Associates',
        subject: 'API verification inquiry',
        department: 'General',
        priority: 'High',
        description: 'Verifying end-to-end multi-endpoint backend API integration.'
      }
    },
    { name: '10. KYC Documents List API', path: '/api/admin/kyc?limit=5', method: 'GET' },
    { name: '11. Commissions Ledger API', path: '/api/admin/commissions?limit=5', method: 'GET' },
    { name: '12. Reports Analytics API', path: '/api/admin/reports/analytics', method: 'GET' }
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const res = await request(t.path, { method: t.method }, t.body);
      const isOk = res.status === 200 || res.status === 201;
      if (isOk) {
        console.log(`✅ [PASS] ${t.name} -> HTTP ${res.status}`);
        passed++;
      } else {
        console.log(`❌ [FAIL] ${t.name} -> HTTP ${res.status}:`, res.body || res.raw);
      }
    } catch (err) {
      console.log(`❌ [ERR] ${t.name} -> ${err.message}`);
    }
  }

  console.log('===========================================================');
  console.log(`RESULTS: ${passed}/${tests.length} tests passed successfully!`);
  console.log('===========================================================');
  if (passed === tests.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
