const test = require('node:test');
const assert = require('node:assert/strict');
const surepassProvider = require('../src/services/providers/surepassBureauProvider');
const verifyalProvider = require('../src/services/providers/verifyalBureauProvider');
const { validateInput } = require('../src/services/cibilReportService');

test('Bureau Providers & Multi-Bureau Validation', async (t) => {
  await t.test('Multi-bureau input validation rejects missing Equifax fields', () => {
    // Equifax requires dob, address, state, pincode
    assert.throws(() => {
      validateInput({
        bureau: 'EQUIFAX',
        name: 'Rahul Sharma',
        mobile: '9876543210',
        pan: 'ABCDE1234F',
        gender: 'male',
        consent: true
      });
    }, (err) => err.status === 422 && /Date of birth/.test(err.details?.dob || ''));
  });

  await t.test('Multi-bureau input validation accepts valid Equifax payload', () => {
    const validated = validateInput({
      bureau: 'EQUIFAX',
      name: 'Rahul Sharma',
      mobile: '9876543210',
      pan: 'ABCDE1234F',
      gender: 'male',
      consent: true,
      dob: '1990-05-15',
      address: 'Plot 42, Hitech City',
      state: 'TS',
      pincode: '500081'
    });

    assert.equal(validated.bureau, 'EQUIFAX');
    assert.equal(validated.pan, 'ABCDE1234F');
    assert.equal(validated.dob, '1990-05-15');
    assert.equal(validated.pincode, '500081');
  });

  await t.test('Surepass provider parses authentic response without synthetic score mutation', () => {
    const mockSurepassSuccess = {
      data: {
        credit_score: 752,
        client_id: 'SP_CR_99812',
        summary: {
          total_accounts: 5,
          active_accounts: 2,
          overdue_accounts: 0,
          total_enquiries: 3
        }
      }
    };

    const parsed = surepassProvider.parseResponse(mockSurepassSuccess, 'CIBIL');
    assert.equal(parsed.success, true);
    // Critical: EXACT raw score preserved, NO +4 / -6 mutation
    assert.equal(parsed.creditScore, 752);
    assert.equal(parsed.providerReportId, 'SP_CR_99812');
    assert.equal(parsed.normalizedData.totalAccounts, 5);
  });

  await t.test('Surepass provider handles consumer not found correctly', () => {
    const mockSurepassNotFound = {
      data: null,
      message: 'No record found for given PAN'
    };

    const parsed = surepassProvider.parseResponse(mockSurepassNotFound, 'CIBIL');
    assert.equal(parsed.success, false);
    assert.equal(parsed.code, 'REPORT_NOT_FOUND');
  });

  await t.test('Verifyal provider parses authentic Experian response without synthetic score mutation', () => {
    const mockVerifyalSuccess = {
      score: '785',
      report_id: 'VER_EXP_12345',
      data: {
        total_accounts: 8,
        active_accounts: 4,
        overdue_accounts: 0,
        enquiries: 1
      }
    };

    const parsed = verifyalProvider.parseResponse(mockVerifyalSuccess, 'EXPERIAN');
    assert.equal(parsed.success, true);
    // Critical: Raw score 785 must not be mutated
    assert.equal(parsed.creditScore, 785);
    assert.equal(parsed.providerReportId, 'VER_EXP_12345');
    assert.equal(parsed.normalizedData.totalAccounts, 8);
  });

  await t.test('Verifyal provider isDebited detects debited=true in raw candidates', () => {
    // 1. Direct candidate with debited: true
    assert.equal(verifyalProvider.isDebited({ debited: true }), true);
    // 2. Nested raw candidate with is_debited: true
    assert.equal(verifyalProvider.isDebited({ raw: { is_debited: true } }), true);
    // 3. String representation
    assert.equal(verifyalProvider.isDebited({ data: { debited: 'true' } }), true);
    // 4. Candidate without debit flag
    assert.equal(verifyalProvider.isDebited({ status: 422, message: 'Record not found' }), false);
    // 5. Explicit debited: false
    assert.equal(verifyalProvider.isDebited({ debited: false, message: 'No hit' }), false);
    // 6. Null / undefined safety
    assert.equal(verifyalProvider.isDebited(null), false);
    assert.equal(verifyalProvider.isDebited(undefined), false);
  });

  await t.test('Surepass provider isDebited detects debited flags accurately', () => {
    assert.equal(surepassProvider.isDebited({ debited: true }), true);
    assert.equal(surepassProvider.isDebited({ data: { is_debited: true } }), true);
    assert.equal(surepassProvider.isDebited({ status: 422, data: null }), false);
    assert.equal(surepassProvider.isDebited(null), false);
  });
});

