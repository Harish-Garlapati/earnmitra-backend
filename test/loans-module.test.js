const assert = require('assert');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const leadService = require('../src/services/leadService');
const { query } = require('../src/config/db');

async function runTests() {
  console.log('--- Starting Loans Module Backend Tests ---');

  // 1. Get an active partner
  const [partners] = await query('SELECT id, full_name, mobile FROM partners WHERE is_active = 1 LIMIT 1');
  assert(partners.length > 0, 'Must have at least one active partner in DB');
  const partnerId = partners[0].id;
  console.log(`Using test partner: ID ${partnerId} (${partners[0].full_name})`);

  // Test 1: Personal Loan Creation (Referral Model)
  console.log('\n[Test 1] Personal Loan Creation (Referral Model)...');
  const plLead = await leadService.createLead({
    productCategory: 'Loans',
    loanType: 'Personal Loan',
    applicantName: 'Ramesh Sharma',
    mobile: '9876543210',
    loanAmount: 500000,
    pincode: '500081',
    city: 'Hyderabad',
    state: 'Telangana',
    mode: 'referral',
    customerConsent: true
  }, partnerId);

  assert.strictEqual(plLead.loanType, 'Personal Loan');
  assert.strictEqual(plLead.applicantName, 'Ramesh Sharma');
  assert.strictEqual(plLead.pincode, '500081');
  assert.strictEqual(plLead.city, 'Hyderabad');
  assert.strictEqual(plLead.state, 'Telangana');
  assert.strictEqual(plLead.mode, 'referral');
  assert.strictEqual(plLead.loanDetails.customer_consent, 1);
  console.log('✓ Test 1 Passed: Personal Loan created successfully with lead_code:', plLead.leadCode);

  // Test 2: Business Loan Validation & Creation
  console.log('\n[Test 2] Business Loan Validation (Entity Type & Others)...');
  // Attempt with missing business name
  try {
    await leadService.createLead({
      productCategory: 'Loans',
      loanType: 'Business Loan',
      applicantName: 'Ramesh',
      mobile: '9876543210',
      loanAmount: 1000000,
      pincode: '500081',
      city: 'Hyderabad',
      state: 'Telangana',
      entityType: 'Proprietorship'
    }, partnerId);
    assert.fail('Should have failed without businessName');
  } catch (e) {
    assert.strictEqual(e.message, 'Business name is required for Business Loan');
    console.log('✓ Verified: Business name is strictly required');
  }

  // Attempt with entityType 'Others' without customEntityType
  try {
    await leadService.createLead({
      productCategory: 'Loans',
      loanType: 'Business Loan',
      businessName: 'Sharma Traders',
      mobile: '9876543210',
      loanAmount: 1000000,
      pincode: '500081',
      city: 'Hyderabad',
      state: 'Telangana',
      entityType: 'Others'
    }, partnerId);
    assert.fail('Should have failed without customEntityType for Others');
  } catch (e) {
    assert.strictEqual(e.message, 'Please enter your specific entity type');
    console.log('✓ Verified: customEntityType required when entityType is Others');
  }

  // Valid Business Loan
  const blLead = await leadService.createLead({
    productCategory: 'Loans',
    loanType: 'Business Loan',
    businessName: 'Sharma Traders',
    mobile: '9876543210',
    loanAmount: 1500000,
    pincode: '400001',
    city: 'Mumbai',
    state: 'Maharashtra',
    entityType: 'Proprietorship',
    mode: 'referral',
    customerConsent: true
  }, partnerId);

  assert.strictEqual(blLead.businessName, 'Sharma Traders');
  assert.strictEqual(blLead.entityType, 'Proprietorship');
  console.log('✓ Test 2 Passed: Business Loan created with entity_type:', blLead.entityType);

  // Test 3: Professional Loan Validation & Creation
  console.log('\n[Test 3] Professional Loan Validation...');
  // Attempt with Profession 'Others' without customProfession
  try {
    await leadService.createLead({
      productCategory: 'Loans',
      loanType: 'Professional Loan',
      applicantName: 'Dr. A. Verma',
      mobile: '9876543210',
      loanAmount: 2000000,
      pincode: '500081',
      city: 'Hyderabad',
      state: 'Telangana',
      profession: 'Others'
    }, partnerId);
    assert.fail('Should have failed without customProfession');
  } catch (e) {
    assert.strictEqual(e.message, 'Please enter your specific profession');
    console.log('✓ Verified: customProfession required when profession is Others');
  }

  const profLead = await leadService.createLead({
    productCategory: 'Loans',
    loanType: 'Professional Loan',
    applicantName: 'Dr. A. Verma',
    mobile: '9876543210',
    loanAmount: 2000000,
    pincode: '500081',
    city: 'Hyderabad',
    state: 'Telangana',
    profession: 'Doctor',
    mode: 'referral',
    customerConsent: true
  }, partnerId);

  assert.strictEqual(profLead.profession, 'Doctor');
  console.log('✓ Test 3 Passed: Professional Loan created with profession:', profLead.profession);

  // Test 4: Home Loan Individual vs Non-Individual
  console.log('\n[Test 4] Home Loan Individual vs Non-Individual...');
  const hlInd = await leadService.createLead({
    productCategory: 'Loans',
    loanType: 'Home Loan',
    applicantType: 'Individual',
    applicantName: 'Priya Rao',
    monthlySalary: 85000,
    mobile: '9876543210',
    loanAmount: 4500000,
    pincode: '500081',
    city: 'Hyderabad',
    state: 'Telangana',
    mode: 'referral',
    customerConsent: true
  }, partnerId);
  assert.strictEqual(hlInd.applicantName, 'Priya Rao');
  assert.strictEqual(hlInd.monthlySalary, 85000);

  const hlNonInd = await leadService.createLead({
    productCategory: 'Loans',
    loanType: 'Home Loan',
    applicantType: 'Non-Individual',
    businessName: 'Priya Enterprises',
    income: 2500000,
    mobile: '9876543210',
    loanAmount: 6000000,
    pincode: '500081',
    city: 'Hyderabad',
    state: 'Telangana',
    mode: 'referral',
    customerConsent: true
  }, partnerId);
  assert.strictEqual(hlNonInd.businessName, 'Priya Enterprises');
  console.log('✓ Test 4 Passed: Home Loan Individual & Non-Individual work properly');

  // Test 5: Direct Booking Mode & Code Generation
  console.log('\n[Test 5] Direct Booking Mode & Collision-Safe Code...');
  const dbLead = await leadService.createLead({
    productCategory: 'Loans',
    loanType: 'Personal Loan',
    applicantName: 'Sanjay Gupta',
    mobile: '9876543210',
    loanAmount: 750000,
    pincode: '523155',
    city: 'Chirala',
    state: 'Andhra Pradesh',
    mode: 'direct_booking',
    customerConsent: true
  }, partnerId);

  assert(dbLead.bookingCode, 'Direct booking lead must have a bookingCode');
  assert(/^EM-PL-\d+$/.test(dbLead.bookingCode), `Booking code should match EM-PL-XXXXX format, got ${dbLead.bookingCode}`);
  console.log('✓ Test 5 Passed: Booking code generated:', dbLead.bookingCode);

  // Test 6: Validate Booking Code in Database
  console.log('\n[Test 6] Validate Booking Code...');
  const [codeRows] = await query('SELECT * FROM direct_booking_codes WHERE code = ?', [dbLead.bookingCode]);
  assert.strictEqual(codeRows.length, 1);
  assert.strictEqual(codeRows[0].is_validated, 0);

  // Simulate validation
  await query('UPDATE direct_booking_codes SET is_validated = 1, validated_at = NOW() WHERE id = ?', [codeRows[0].id]);
  const fetchedLead = await leadService.getLeadById(dbLead.dbId, partnerId, 'partner');
  assert.strictEqual(fetchedLead.bookingCodeValidated, true);
  console.log('✓ Test 6 Passed: Code validated and state reflected in lead details');

  // Test 7: Lender Selection & Contact Exposure
  console.log('\n[Test 7] Lender Selection & Contact Retrieval...');
  const [lenders] = await query('SELECT id, name FROM lenders WHERE is_active = 1 LIMIT 3');
  const lenderIds = lenders.map(l => l.id);

  for (const lid of lenderIds) {
    await query(
      `INSERT INTO direct_booking_lender_selections (lead_id, partner_id, lender_id, status)
       VALUES (?, ?, ?, 'Shared')
       ON DUPLICATE KEY UPDATE status = 'Shared'`,
      [dbLead.dbId, partnerId, lid]
    );
  }

  const [contactRows] = await query(
    `SELECT lc.*, l.name as lender_name 
     FROM lenders l
     LEFT JOIN lender_contacts lc ON lc.lender_id = l.id AND lc.is_active = 1
     WHERE l.id IN (?)`,
    [lenderIds]
  );
  assert(contactRows.length >= lenderIds.length, 'Must return contacts for chosen lenders');
  assert(contactRows.some(c => c.phone && c.email), 'At least one lender must have verified phone and email');
  console.log(`✓ Test 7 Passed: Successfully retrieved contacts for ${lenderIds.length} lenders:`);
  contactRows.forEach(c => {
    console.log(`  - ${c.lender_name}: ${c.department} | ${c.phone || 'N/A'} | ${c.email || 'N/A'}`);
  });

  console.log('\nAll Loans Module backend tests completed successfully!');
}

runTests()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
