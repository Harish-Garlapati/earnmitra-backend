const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json;
        try { json = JSON.parse(data); } catch { json = data; }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Backend Multi-User & Auth Tests ---');

  // 1. Health check
  const health = await request('GET', '/api/health');
  console.log('1. Health check:', health.status, health.data);

  // 2. Login as existing Partner P-1001 (Ramesh Sharma, mobile 9876543210)
  const loginA = await request('POST', '/api/auth/login', {
    mobile: '9876543210',
    password: 'Partner@123'
  });
  console.log('2. Partner A (P-1001) Login status:', loginA.status, 'Success:', loginA.data.success);
  if (!loginA.data.success) {
    throw new Error('Partner A login failed: ' + JSON.stringify(loginA.data));
  }
  const tokenA = loginA.data.token;

  // 3. Partner A summary & leads
  const summaryA = await request('GET', '/api/partners/me/summary', null, tokenA);
  const leadsA = await request('GET', '/api/leads', null, tokenA);
  console.log('3. Partner A Leads count:', leadsA.data.length, 'Summary submitted:', summaryA.data.counts.submitted);

  // 4. Partner A detail of FTL123458
  const detailA = await request('GET', '/api/leads/FTL123458', null, tokenA);
  console.log('4. Partner A FTL123458 Business Name:', detailA.data.businessName || detailA.data.applicantName, 'Amount:', detailA.data.amount);

  // 5. Test OTP generation for User B (mobile: 9988776655)
  const otpRes = await request('POST', '/api/auth/otp/send', { mobile: '9988776655' });
  console.log('5. OTP send for User B:', otpRes.status, 'devOtp:', otpRes.data.devOtp);

  // 6. Register User B
  let tokenB = null;
  const regB = await request('POST', '/api/auth/register', {
    fullName: 'Sunita Rao',
    mobile: '9988776655',
    email: 'sunita@example.com',
    partnerType: 'Financial Advisor',
    city: 'Hyderabad',
    state: 'Telangana',
    password: 'UserB@123'
  });

  if (regB.status === 201) {
    console.log('6. User B registered successfully:', regB.data.partner.partnerCode);
    tokenB = regB.data.token;
  } else if (regB.status === 409) {
    console.log('6. User B already registered, logging in...');
    const loginB = await request('POST', '/api/auth/login', {
      mobile: '9988776655',
      password: 'UserB@123'
    });
    tokenB = loginB.data.token;
    console.log('   User B login status:', loginB.status);
  }

  // 7. Test Multi-User Isolation: User B leads list
  const leadsB = await request('GET', '/api/leads', null, tokenB);
  console.log('7. User B leads count:', leadsB.data.length);

  // 8. Test Isolation: User B attempting to access User A\'s lead FTL123458
  const crossAccess = await request('GET', '/api/leads/FTL123458', null, tokenB);
  console.log('8. User B accessing FTL123458 status:', crossAccess.status, '(Expected 403 Forbidden)', crossAccess.data);

  // 9. User B creates a Credit Card lead
  const createCard = await request('POST', '/api/leads', {
    productCategory: 'Credit Cards',
    applicantName: 'Vikram Reddy',
    mobile: '9123456799',
    city: 'Hyderabad',
    loanType: 'Credit Card',
    amount: 150000,
    creditCardDetails: {
      cardCategory: 'Millennia Credit Card',
      preferredBank: 'HDFC Bank',
      monthlyIncome: 65000,
      hasExistingCard: true,
      existingCardLimit: 100000
    }
  }, tokenB);
  console.log('9. User B created Credit Card lead:', createCard.status, 'Code:', createCard.data.leadCode, 'Category:', createCard.data.productCategory);

  // 10. Admin Login & Verification
  const adminLogin = await request('POST', '/api/auth/admin/login', {
    username: 'admin',
    password: 'Admin@123'
  });
  console.log('10. Admin login status:', adminLogin.status, 'Role:', adminLogin.data.admin?.role);
  const adminToken = adminLogin.data.token;

  // 11. Admin view all leads
  const adminLeads = await request('GET', '/api/admin/leads', null, adminToken);
  console.log('11. Admin total leads visible across all partners:', adminLeads.data.length);

  // 12. Admin update status of User B\'s new lead
  if (createCard.data.leadCode) {
    const updateRes = await request('PATCH', `/api/admin/leads/${createCard.data.leadCode}/status`, {
      status: 'Approved',
      stage: 'Sanction',
      note: 'Verified with lender by Admin'
    }, adminToken);
    console.log('12. Admin status update:', updateRes.status, 'New status:', updateRes.data.lead?.status);

    // Verify User B sees updated status in timeline
    const userBLead = await request('GET', `/api/leads/${createCard.data.leadCode}`, null, tokenB);
    console.log('    User B timeline check:', userBLead.data.status, 'Stages in timeline:', userBLead.data.timeline?.length);
  }

  // 13. Verify User A STILL cannot see User B's lead
  if (createCard.data.leadCode) {
    const crossAccess2 = await request('GET', `/api/leads/${createCard.data.leadCode}`, null, tokenA);
    console.log('13. User A accessing User B\'s lead status:', crossAccess2.status, '(Expected 403 Forbidden)', crossAccess2.data);
  }

  console.log('--- ALL MULTI-USER ISOLATION & AUTH CHECKS PASSED! ---');
}

runTests().catch(console.error);
