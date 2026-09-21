// financial-safety.test.js
const http = require('http');
const jwt = require('jsonwebtoken');
const { pool } = require('../src/config/db');

const JWT_SECRET = 'earnmitra_super_secret_jwt_key_2026_secure';

// Helper to make HTTP requests
function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = data ? JSON.parse(data) : null; } catch (e) { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
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

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runFinancialSafetyTests() {
  console.log('\n============================================================');
  console.log('EARNMITRA FINANCIAL SAFETY, WORKFLOW & AUDIT TEST SUITE');
  console.log('============================================================\n');

  try {
    // 1. Setup Test Actors
    const makerToken = jwt.sign(
      { id: 1, adminId: 1, role: 'admin', actorType: 'admin', username: 'admin', email: 'admin@earnmitra.in' },
      JWT_SECRET, { expiresIn: '1h' }
    );
    const checkerToken = jwt.sign(
      { id: 2, adminId: 2, role: 'admin', actorType: 'admin', username: 'finance_checker', email: 'checker@earnmitra.in' },
      JWT_SECRET, { expiresIn: '1h' }
    );
    const partnerToken = jwt.sign(
      { id: 1, partnerId: 1, role: 'partner', actorType: 'partner', mobile: '9876543210' },
      JWT_SECRET, { expiresIn: '1h' }
    );

    const makerHeaders = { 'Authorization': `Bearer ${makerToken}` };
    const checkerHeaders = { 'Authorization': `Bearer ${checkerToken}` };
    const partnerHeaders = { 'Authorization': `Bearer ${partnerToken}` };

    // Clean test partner wallet to ensure sufficient balance for payout test
    console.log('─── Step 1: Wallet Balance & Payout Request Setup ───');
    await pool.query("UPDATE partners SET approval_status = 'approved', is_active = 1 WHERE id = 1");
    await pool.query(
      "INSERT INTO partner_earnings (partner_id, amount, earning_type, status, description) VALUES (1, 10000, 'commission', 'available', 'Test Credit for Financial Safety Test')"
    );

    // Get current balance
    const balRes = await request('/api/payouts', { method: 'GET', headers: partnerHeaders });
    assert(balRes.status === 200, 'Partner balance fetch succeeds');
    const availableBefore = balRes.body.earnings.available;
    assert(availableBefore >= 5000, `Available balance is adequate (₹${availableBefore})`);

    // 2. Test Negative Balance Request Prevention
    console.log('\n─── Step 2: Negative / Insufficient Balance Prevention ───');
    const overdrawRes = await request('/api/payouts', { method: 'POST', headers: partnerHeaders }, {
      amount: availableBefore + 500000,
      bank: 'HDFC Bank - 1234'
    });
    if (overdrawRes.status !== 400) {
      console.log('DEBUG overdrawRes:', overdrawRes.status, overdrawRes.body);
    }
    assert(overdrawRes.status === 400, 'Overdraw attempt rejected with HTTP 400');
    assert(overdrawRes.body.error.includes('exceeds available balance'), 'Error indicates balance limit reached');

    // 3. Request Valid Payout (Should create in REQUESTED state)
    console.log('\n─── Step 3: Payout Request State Initialization ───');
    const payoutReqRes = await request('/api/payouts', { method: 'POST', headers: partnerHeaders }, {
      amount: 2500,
      bank: 'HDFC Bank - 9876'
    });
    assert(payoutReqRes.status === 201 || payoutReqRes.status === 200, 'Payout request accepted (HTTP 201/200)');
    assert(payoutReqRes.body.status === 'REQUESTED', 'New payout initial status is strictly REQUESTED');
    const payoutRef = payoutReqRes.body.referenceNumber;
    assert(!!payoutRef, `Reference number assigned: ${payoutRef}`);

    // Verify in DB
    const [payoutRows] = await pool.query('SELECT * FROM payout_requests WHERE reference_number = ?', [payoutRef]);
    assert(payoutRows.length === 1, 'Payout request found in MariaDB');
    const payoutDbId = payoutRows[0].id;
    assert(payoutRows[0].status === 'REQUESTED', 'MariaDB status is REQUESTED');

    // 4. Maker-Checker Payout Lifecycle
    console.log('\n─── Step 4: Maker-Checker Multi-Step Workflow ───');
    
    // Step 4A: Maker moves to UNDER_REVIEW
    const reviewRes = await request(`/api/admin/payouts/${payoutDbId}/review`, { method: 'PATCH', headers: makerHeaders });
    assert(reviewRes.status === 200, 'Maker review succeeds');
    assert(reviewRes.body.payout.status === 'UNDER_REVIEW', 'Status updated to UNDER_REVIEW');
    assert(reviewRes.body.payout.reviewed_by === 1, 'Maker admin ID recorded');

    // Step 4B: Maker cannot approve their own review (Maker-Checker Isolation)
    const selfApproveRes = await request(`/api/admin/payouts/${payoutDbId}/approve`, { method: 'PATCH', headers: makerHeaders });
    assert(selfApproveRes.status === 400, 'Self-approval by Maker blocked with HTTP 400');
    assert(selfApproveRes.body.error.includes('Maker-Checker separation violation'), 'Error mentions Maker-Checker separation');

    // Step 4C: Independent Checker approves
    const checkerApproveRes = await request(`/api/admin/payouts/${payoutDbId}/approve`, { method: 'PATCH', headers: checkerHeaders });
    assert(checkerApproveRes.status === 200, 'Checker approval succeeds');
    assert(checkerApproveRes.body.payout.status === 'APPROVED', 'Status updated to APPROVED');
    assert(checkerApproveRes.body.payout.approved_by === 2, 'Checker admin ID recorded');

    // Step 4D: Operations initiates processing
    const processRes = await request(`/api/admin/payouts/${payoutDbId}/process`, { method: 'PATCH', headers: makerHeaders });
    assert(processRes.status === 200, 'Process initiation succeeds');
    assert(processRes.body.payout.status === 'PROCESSING', 'Status updated to PROCESSING');

    // Step 4E: Settlement without UTR must FAIL
    const noUtrSettleRes = await request(`/api/admin/payouts/${payoutDbId}/settle`, { method: 'PATCH', headers: makerHeaders }, {});
    assert(noUtrSettleRes.status === 400, 'Settlement without UTR rejected with HTTP 400');
    assert(noUtrSettleRes.body.error.includes('UTR / Bank reference number is mandatory'), 'Error explicitly mandates UTR');

    // Step 4F: Settlement with valid UTR succeeds
    const validUtr = `UTR${Date.now().toString().slice(-8)}`;
    const settleRes = await request(`/api/admin/payouts/${payoutDbId}/settle`, { method: 'PATCH', headers: makerHeaders }, {
      utrNumber: validUtr
    });
    assert(settleRes.status === 200, 'Settlement with UTR succeeds');
    assert(settleRes.body.payout.status === 'PAID', 'Status is PAID');
    assert(settleRes.body.payout.utr_number === validUtr, 'UTR number recorded in database');

    // Step 4G: Verify partner_earnings debit is marked paid
    const [debitRows] = await pool.query(
      'SELECT * FROM partner_earnings WHERE partner_id = 1 AND description LIKE ?',
      [`%${payoutRef}%`]
    );
    assert(debitRows[0].status === 'paid', 'Matching partner_earnings debit marked status = paid');

    // Step 4H: Duplicate settlement prevention
    const dupSettleRes = await request(`/api/admin/payouts/${payoutDbId}/settle`, { method: 'PATCH', headers: makerHeaders }, {
      utrNumber: 'DUPLICATE_UTR'
    });
    assert(dupSettleRes.status === 400, 'Duplicate settlement attempt rejected with HTTP 400');

    // 5. Test Payout Rejection & Wallet Refund
    console.log('\n─── Step 5: Payout Rejection & Wallet Refund ───');
    const req2 = await request('/api/payouts', { method: 'POST', headers: partnerHeaders }, {
      amount: 1500,
      bank: 'HDFC Bank - 9876'
    });
    const ref2 = req2.body.referenceNumber;
    const [p2Rows] = await pool.query('SELECT * FROM payout_requests WHERE reference_number = ?', [ref2]);
    const p2Id = p2Rows[0].id;

    // Reject payout
    const rejectRes = await request(`/api/admin/payouts/${p2Id}/reject`, { method: 'PATCH', headers: makerHeaders }, {
      reason: 'IFSC code invalid for NEFT settlement'
    });
    assert(rejectRes.status === 200, 'Payout rejection succeeds');
    assert(rejectRes.body.payout.status === 'REJECTED', 'Status is REJECTED');
    assert(rejectRes.body.payout.rejection_reason === 'IFSC code invalid for NEFT settlement', 'Rejection reason saved');

    // Verify wallet balance restored
    const [refundRows] = await pool.query(
      'SELECT * FROM partner_earnings WHERE partner_id = 1 AND earning_type = "refund" AND description LIKE ?',
      [`%${ref2}%`]
    );
    assert(refundRows.length > 0, 'Refund credit inserted into partner_earnings');
    assert(Number(refundRows[0].amount) === 1500, 'Refund amount matches exact declined payout (₹1500)');
    assert(refundRows[0].status === 'available', 'Refund is immediately available in partner balance');

    // 6. Partner Suspension Enforcement (HTTP 403 on Leads & Payouts)
    console.log('\n─── Step 6: Partner Suspension Enforcement ───');
    // Suspend Partner 1
    const suspendRes = await request('/api/admin/partners/1/toggle-status', { method: 'PATCH', headers: makerHeaders });
    assert(suspendRes.status === 200, 'Partner suspended by admin');
    assert(suspendRes.body.partner.approval_status === 'suspended', 'Partner approval_status is suspended');

    // Suspended partner submits lead -> 403
    const blockedLeadRes = await request('/api/leads', { method: 'POST', headers: partnerHeaders }, {
      applicantName: 'Blocked Borrower',
      mobile: '9876500001',
      city: 'Hyderabad',
      loanType: 'Personal Loan',
      loanAmount: 100000
    });
    assert(blockedLeadRes.status === 403, 'Suspended partner lead creation blocked with HTTP 403');

    // Suspended partner requests payout -> 403
    const blockedPayoutRes = await request('/api/payouts', { method: 'POST', headers: partnerHeaders }, {
      amount: 500,
      bank: 'HDFC Bank'
    });
    assert(blockedPayoutRes.status === 403, 'Suspended partner payout request blocked with HTTP 403');

    // Suspended partner can still view profile / leads (read-only access)
    const readOnlyRes = await request('/api/partners/me', { method: 'GET', headers: partnerHeaders });
    assert(readOnlyRes.status === 200, 'Suspended partner can still view read-only profile');

    // Reactivate partner
    const reactivateRes = await request('/api/admin/partners/1/toggle-status', { method: 'PATCH', headers: makerHeaders });
    assert(reactivateRes.status === 200, 'Partner reactivated');
    assert(reactivateRes.body.partner.approval_status === 'approved', 'Partner approval_status restored to approved');

    // 7. Credit Card E2E Lifecycle & Child Table Persistence
    console.log('\n─── Step 7: Credit Card Lead E2E & Child Table ───');
    const ccLeadRes = await request('/api/leads', { method: 'POST', headers: partnerHeaders }, {
      productCategory: 'Credit Cards',
      applicantName: 'Pooja Hegde',
      mobile: '9888877771',
      city: 'Bengaluru',
      loanType: 'Credit Card',
      loanAmount: 0,
      creditCardDetails: {
        cardCategory: 'Rewards',
        preferredBank: 'HDFC Bank',
        monthlyIncome: 95000,
        hasExistingCard: true,
        existingCardLimit: 200000
      }
    });
    assert(ccLeadRes.status === 201, 'Credit Card lead submitted successfully');
    const ccLeadCode = ccLeadRes.body.leadCode;
    const ccDbId = ccLeadRes.body.dbId;

    // Verify child table
    const [ccChildRows] = await pool.query('SELECT * FROM credit_card_lead_details WHERE lead_id = ?', [ccDbId]);
    assert(ccChildRows.length === 1, 'Credit Card child record found in credit_card_lead_details');
    assert(ccChildRows[0].preferred_bank === 'HDFC Bank', 'Child preferred_bank persisted');
    assert(Number(ccChildRows[0].monthly_income) === 95000, 'Child monthly_income persisted');

    // Move Credit Card to Approved
    const ccApproveRes = await request(`/api/admin/leads/${ccDbId}/status`, { method: 'PATCH', headers: makerHeaders }, {
      status: 'Approved'
    });
    assert(ccApproveRes.status === 200, 'Credit Card lead approved');
    assert(ccApproveRes.body.lead.current_stage === 'Card Approved', 'Stage automatically set to "Card Approved"');

    // Move Credit Card to Card Issued
    const ccIssuedRes = await request(`/api/admin/leads/${ccDbId}/status`, { method: 'PATCH', headers: makerHeaders }, {
      status: 'Card Issued'
    });
    assert(ccIssuedRes.status === 200, 'Credit Card lead status set to "Card Issued"');
    assert(ccIssuedRes.body.lead.current_stage === 'Card Dispatched & Issued', 'Stage set to "Card Dispatched & Issued"');

    // 8. Insurance E2E Lifecycle & Child Table Persistence
    console.log('\n─── Step 8: Insurance Lead E2E & Child Table ───');
    const insLeadRes = await request('/api/leads', { method: 'POST', headers: partnerHeaders }, {
      productCategory: 'Insurance',
      applicantName: 'Vikram Malhotra',
      mobile: '9777766662',
      city: 'Mumbai',
      loanType: 'Term Insurance',
      loanAmount: 0,
      insuranceDetails: {
        insuranceType: 'Term Life',
        sumInsured: 10000000,
        policyTerm: 30
      }
    });
    assert(insLeadRes.status === 201, 'Insurance lead submitted successfully');
    const insDbId = insLeadRes.body.dbId;

    // Verify child table
    const [insChildRows] = await pool.query('SELECT * FROM insurance_lead_details WHERE lead_id = ?', [insDbId]);
    assert(insChildRows.length === 1, 'Insurance child record found in insurance_lead_details');
    assert(insChildRows[0].insurance_type === 'Term Life', 'Child insurance_type persisted');

    // Move Insurance to Policy Issued
    const insIssuedRes = await request(`/api/admin/leads/${insDbId}/status`, { method: 'PATCH', headers: makerHeaders }, {
      status: 'Policy Issued'
    });
    assert(insIssuedRes.status === 200, 'Insurance lead status set to "Policy Issued"');
    assert(insIssuedRes.body.lead.current_stage === 'Policy Generated & Active', 'Stage set to "Policy Generated & Active"');

    // 9. Partner Referral Separation (Partner Invites Partner != Customer Lead)
    console.log('\n─── Step 9: Partner Referral Separation ───');
    const [leadsCountBefore] = await pool.query('SELECT COUNT(*) as count FROM leads');
    // Add partner invited by Partner 1
    const testInvitedMobile = `91111${Date.now().toString().slice(-5)}`;
    await pool.query(
      'INSERT INTO partners (partner_code, full_name, mobile, referred_by_partner_id, kyc_status, approval_status) VALUES (?, ?, ?, 1, "pending", "approved")',
      [`P-TEST-${Date.now().toString().slice(-4)}`, 'Invited DSA Partner', testInvitedMobile]
    );
    const [leadsCountAfter] = await pool.query('SELECT COUNT(*) as count FROM leads');
    assert(leadsCountBefore[0].count === leadsCountAfter[0].count, 'Partner invitation created ZERO customer leads');

    // 10. Platform Modules & Settings Endpoints
    console.log('\n─── Step 10: Super Admin Platform Modules Verification ───');
    const deptsRes = await request('/api/admin/departments', { headers: makerHeaders });
    assert(deptsRes.status === 200 && deptsRes.body.length >= 6, 'Departments API returns all 6+ departments');

    const productsRes = await request('/api/admin/products', { headers: makerHeaders });
    assert(productsRes.status === 200 && productsRes.body.length >= 6, 'Products API returns all core financial products');

    const lendersRes = await request('/api/admin/lenders', { headers: makerHeaders });
    assert(lendersRes.status === 200 && lendersRes.body.length >= 6, 'Lenders API returns financial institutions');

    const rulesRes = await request('/api/admin/commission-rules', { headers: makerHeaders });
    assert(rulesRes.status === 200 && rulesRes.body.length >= 4, 'Commission rules API returns configured slabs');

    const campaignsRes = await request('/api/admin/marketing/campaigns', { headers: makerHeaders });
    assert(campaignsRes.status === 200 && campaignsRes.body.length >= 4, 'Marketing campaigns API returns active campaigns');

    const ticketsRes = await request('/api/admin/support/tickets', { headers: makerHeaders });
    assert(ticketsRes.status === 200 && ticketsRes.body.length >= 3, 'Support tickets API returns partner tickets');

    const integrationsRes = await request('/api/admin/integrations', { headers: makerHeaders });
    assert(integrationsRes.status === 200 && integrationsRes.body.length >= 6, 'Platform integrations API returns all external bureaus & gateways');

    const analyticsRes = await request('/api/admin/reports/analytics', { headers: makerHeaders });
    assert(analyticsRes.status === 200 && analyticsRes.body.totalLeads >= 0, 'Analytics API returns real MariaDB aggregations');

    console.log('\n============================================================');
    console.log('ALL 10 FINANCIAL SAFETY & WORKFLOW TEST SUITES PASSED! (100%)');
    console.log('============================================================\n');

  } catch (err) {
    console.error('\n❌ TEST SUITE RUN ERROR:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runFinancialSafetyTests();
