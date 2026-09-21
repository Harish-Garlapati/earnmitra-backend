const assert = require('assert');
const { pool, checkHealth, dbConfig } = require('../src/config/db');
const partnerService = require('../src/services/partnerService');
const leadService = require('../src/services/leadService');
const payoutService = require('../src/services/payoutService');

async function runTests() {
  console.log('--- Starting Earnmitra DB & Service Layer Verification ---');

  // Test 1: Verify connected database name is earnmitra
  console.log('Test 1: Verifying DB name...');
  assert.strictEqual(dbConfig.database, 'earnmitra', 'Database name must be earnmitra');
  const [dbNameRow] = await pool.query('SELECT DATABASE() AS current_db');
  assert.strictEqual(dbNameRow[0].current_db, 'earnmitra', 'Current DB in MySQL must be earnmitra');
  console.log('✓ Connected to database:', dbNameRow[0].current_db);

  // Test 2: Verify loancrm is separate and untouched
  console.log('Test 2: Verifying database isolation...');
  assert.notStrictEqual(dbNameRow[0].current_db, 'loancrm', 'Must NOT be connected to loancrm');
  console.log('✓ Database isolation confirmed.');

  // Test 3: DB Health Check
  console.log('Test 3: Testing checkHealth()...');
  const health = await checkHealth();
  assert.strictEqual(health.ok, true, 'Health check must be ok');
  assert.strictEqual(health.database, 'connected', 'Database must be connected');
  console.log('✓ Health check passed:', health);

  // Test 4: Partner Service - Read Partner
  console.log('Test 4: Testing partnerService.getCurrentPartner()...');
  const partner = await partnerService.getCurrentPartner('P-1001');
  assert(partner, 'Partner P-1001 must exist');
  assert.strictEqual(partner.id, 'P-1001');
  assert.strictEqual(partner.name, 'Ramesh Sharma');
  console.log('✓ Partner retrieved:', partner.id, partner.name, partner.bank);

  // Test 5: Partner Service - Summary (Earnings & Counts)
  console.log('Test 5: Testing partnerService.getSummary()...');
  const summary = await partnerService.getSummary('P-1001');
  assert(summary.counts, 'Counts must exist');
  assert(summary.earnings, 'Earnings must exist');
  console.log('✓ Counts:', summary.counts);
  console.log('✓ Earnings:', summary.earnings);

  // Test 6: Lead Service - List Leads
  console.log('Test 6: Testing leadService.listLeads()...');
  const leads = await leadService.listLeads({ partnerCode: 'P-1001' });
  assert(Array.isArray(leads), 'Leads must be an array');
  assert(leads.length >= 4, 'Should have at least 4 seeded leads');
  console.log(`✓ Retrieved ${leads.length} leads.`);

  // Test 7: Lead Service - Get Lead By ID with Timeline
  console.log('Test 7: Testing leadService.getLeadById()...');
  const lead1 = await leadService.getLeadById('FTL123456');
  assert(lead1, 'Lead FTL123456 must exist');
  assert.strictEqual(lead1.applicantName, 'Suresh Kumar');
  assert(Array.isArray(lead1.timeline), 'Lead must have a timeline array');
  assert(lead1.timeline.length > 0, 'Timeline must not be empty');
  console.log('✓ Lead detail retrieved with timeline entries:', lead1.timeline.length);

  // Test 8: Lead Service - Create new lead in MySQL
  console.log('Test 8: Testing leadService.createLead()...');
  const testLeadData = {
    productCategory: 'Loans',
    applicantName: 'Integration Test User',
    mobile: '9988776655',
    city: 'Hyderabad',
    loanType: 'Personal Loan',
    amount: 350000
  };
  const createdLead = await leadService.createLead(testLeadData, 'P-1001');
  assert(createdLead, 'Created lead must be returned');
  assert(createdLead.id.startsWith('FTL'), 'Lead ID must start with FTL');
  assert.strictEqual(createdLead.applicantName, 'Integration Test User');
  assert.strictEqual(createdLead.amount, 350000);
  assert(createdLead.timeline.length > 0, 'Created lead must have timeline');
  console.log('✓ Lead created successfully:', createdLead.id, createdLead.applicantName);

  // Clean up the created test lead to keep DB clean
  await pool.query('DELETE FROM leads WHERE id = ?', [createdLead.dbId]);
  console.log('✓ Test lead cleaned up.');

  // Test 9: Payout Service - Get Payout Data
  console.log('Test 9: Testing payoutService.getPayoutData()...');
  const payoutData = await payoutService.getPayoutData('P-1001');
  assert(payoutData.earnings, 'Payout data must contain earnings');
  assert(Array.isArray(payoutData.transactions), 'Transactions must be an array');
  console.log(`✓ Retrieved ${payoutData.transactions.length} transactions.`);

  console.log('\n--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
  await pool.end();
  process.exit(0);
}

runTests().catch(err => {
  console.error('VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
