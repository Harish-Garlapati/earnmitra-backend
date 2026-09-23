const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const walletService = require('../src/services/walletService');
const walletRepo = require('../src/repositories/walletRepository');
const cibilReportService = require('../src/services/cibilReportService');
const cibilRepo = require('../src/repositories/cibilReportRepository');
const { query, pool } = require('../src/config/db');

test('Unified Wallet, Earnings, and Credit Bureau Upgrade', async (t) => {
  t.after(async () => {
    await pool.end();
  });

  // Helper to create isolated test partner
  async function createTestPartner(label = 'UNIFIED') {
    const suffix = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const [res] = await query(
      `INSERT INTO partners (partner_code, full_name, mobile, partner_type, state, kyc_status, approval_status)
       VALUES (?, ?, ?, 'Dsa', 'Karnataka', 'approved', 'approved')`,
      [`P_${label}_${suffix}`, `Test Partner ${suffix}`, suffix.slice(-10).padStart(10, '8')]
    );
    return res.insertId;
  }

  // Helper to cleanup test partner
  async function cleanupPartner(partnerId) {
    if (!partnerId) return;
    try {
      await query('DELETE FROM partner_cibil_reports WHERE partner_id = ?', [partnerId]);
      await query('DELETE FROM partner_wallet_transactions WHERE partner_id = ?', [partnerId]);
      await query('DELETE FROM partner_wallets WHERE partner_id = ?', [partnerId]);
      await query('DELETE FROM partners WHERE id = ?', [partnerId]);
    } catch (e) {
      // ignore
    }
  }

  await t.test('1. Bureau temporary pricing calculations match exact specification', async () => {
    const pricing = await walletService.getPricing();
    const map = new Map(pricing.map(p => [p.bureau, p]));

    const cibil = map.get('CIBIL');
    assert.ok(cibil, 'CIBIL pricing must exist');
    assert.equal(cibil.basePrice, 99.00);
    assert.equal(cibil.gstPercentage, 18.00);
    assert.equal(cibil.totalPrice, 116.82);
    assert.equal(cibil.isActive, true);

    const crif = map.get('CRIF');
    assert.ok(crif, 'CRIF pricing must exist');
    assert.equal(crif.basePrice, 69.00);
    assert.equal(crif.gstPercentage, 18.00);
    assert.equal(crif.totalPrice, 81.42);
    assert.equal(crif.isActive, true);

    const exp = map.get('EXPERIAN');
    assert.ok(exp, 'EXPERIAN pricing must exist');
    assert.equal(exp.basePrice, 79.00);
    assert.equal(exp.gstPercentage, 18.00);
    assert.equal(exp.totalPrice, 93.22);
    assert.equal(exp.isActive, true);

    const eqf = map.get('EQUIFAX');
    assert.ok(eqf, 'EQUIFAX pricing must exist');
    assert.equal(eqf.basePrice, 79.00);
    assert.equal(eqf.gstPercentage, 18.00);
    assert.equal(eqf.totalPrice, 93.22);
    assert.equal(eqf.isActive, true);
  });

  await t.test('2. Wallet initial state, recharge, and balance breakdown isolation', async () => {
    const partnerId = await createTestPartner('RECHARGE');
    try {
      // New partner starts with 0
      const w0 = await walletService.getWallet(partnerId);
      assert.equal(w0.balance, 0);
      assert.equal(w0.earnedBalance, 0);
      assert.equal(w0.rechargeBalance, 0);
      assert.equal(w0.availableBalance, 0);
      assert.equal(w0.withdrawableBalance, 0);

      // Recharge ₹500
      const rec = await walletRepo.creditWallet({
        partnerId,
        amount: 500.00,
        description: 'Online Wallet Recharge',
        referenceId: 'REC_ORD_101'
      });
      assert.equal(rec.balanceAfter, 500.00);

      // Verify wallet balances: recharge_balance increases, earned_balance remains 0
      const w1 = await walletService.getWallet(partnerId);
      assert.equal(w1.balance, 500.00);
      assert.equal(w1.rechargeBalance, 500.00);
      assert.equal(w1.earnedBalance, 0.00);
      assert.equal(w1.availableBalance, 500.00);
      // Withdrawable MUST be 0 since recharge funds cannot be withdrawn!
      assert.equal(w1.withdrawableBalance, 0.00);

      // Check transaction record
      const txs = await walletService.getTransactions(partnerId);
      assert.equal(txs.length, 1);
      assert.equal(txs[0].transactionType, 'CREDIT');
      assert.equal(txs[0].category, 'WALLET_RECHARGE');
      assert.equal(txs[0].rechargeComponent, 500.00);
      assert.equal(txs[0].earnedComponent, 0.00);
    } finally {
      await cleanupPartner(partnerId);
    }
  });

  await t.test('3. Commission credit increases earned_balance and enforces idempotency', async () => {
    const partnerId = await createTestPartner('COMMISSION');
    try {
      // Credit commission of ₹1500.00 for lead #42
      const comm1 = await walletRepo.creditCommission({
        partnerId,
        amount: 1500.00,
        referenceId: 'LEAD_COMM_42',
        leadId: 42,
        notes: 'Disbursement commission for Home Loan'
      });
      assert.equal(comm1.alreadyCredited, false);
      assert.equal(comm1.balanceAfter, 1500.00);

      const w1 = await walletService.getWallet(partnerId);
      assert.equal(w1.balance, 1500.00);
      assert.equal(w1.earnedBalance, 1500.00);
      assert.equal(w1.rechargeBalance, 0.00);
      assert.equal(w1.availableBalance, 1500.00);
      assert.equal(w1.withdrawableBalance, 1500.00);

      // Verify idempotency: duplicate credit with same referenceId must be rejected
      const commDuplicate = await walletRepo.creditCommission({
        partnerId,
        amount: 1500.00,
        referenceId: 'LEAD_COMM_42',
        leadId: 42,
        notes: 'Duplicate attempt'
      });
      assert.equal(commDuplicate.alreadyCredited, true);

      // Balances must remain unchanged
      const w2 = await walletService.getWallet(partnerId);
      assert.equal(w2.balance, 1500.00);
      assert.equal(w2.earnedBalance, 1500.00);

      // Check transaction ledger has exactly one commission entry
      const txs = await walletService.getTransactions(partnerId);
      assert.equal(txs.length, 1);
      assert.equal(txs[0].category, 'COMMISSION');
      assert.equal(txs[0].earnedComponent, 1500.00);
      assert.equal(txs[0].rechargeComponent, 0.00);
    } finally {
      await cleanupPartner(partnerId);
    }
  });

  await t.test('4. Mixed balance: Priority deduction (recharge first, then earned)', async () => {
    const partnerId = await createTestPartner('PRIORITY_DEDUCT');
    try {
      // Partner has ₹50 recharge money and ₹200 earned commission
      await walletRepo.creditWallet({
        partnerId,
        amount: 50.00,
        description: 'Recharge',
        referenceId: 'REC_50'
      });
      await walletRepo.creditCommission({
        partnerId,
        amount: 200.00,
        referenceId: 'COMM_200',
        leadId: 99
      });

      const wBefore = await walletService.getWallet(partnerId);
      assert.equal(wBefore.balance, 250.00);
      assert.equal(wBefore.rechargeBalance, 50.00);
      assert.equal(wBefore.earnedBalance, 200.00);
      assert.equal(wBefore.availableBalance, 250.00);

      // CIBIL costs ₹116.82.
      // Priority deduction rule:
      // ₹50.00 from recharge_balance -> leaves ₹0 recharge_balance
      // ₹66.82 from earned_balance   -> leaves ₹133.18 earned_balance
      const res = await walletService.reserveBureauReport(partnerId, 'CIBIL', 'BUREAU_INQ_1');
      assert.equal(res.amount, 116.82);

      const wDuring = await walletService.getWallet(partnerId);
      assert.equal(wDuring.rechargeBalance, 0.00);
      assert.equal(wDuring.earnedBalance, 133.18);
      assert.equal(wDuring.balance, 133.18);

      // Verify transaction ledger recorded exact components
      const [rows] = await query(
        'SELECT * FROM partner_wallet_transactions WHERE id = ?',
        [res.reservationId]
      );
      const tx = rows[0];
      assert.equal(parseFloat(tx.recharge_component), 50.00);
      assert.equal(parseFloat(tx.earned_component), 66.82);

      // Release reservation (e.g. no record found at bureau)
      // Must restore exact components: ₹50 back to recharge, ₹66.82 back to earned!
      await walletService.releaseBureauReservation(
        partnerId,
        res.reservationId,
        'CIBIL',
        'BUREAU_INQ_1',
        'No record'
      );

      const wRestored = await walletService.getWallet(partnerId);
      assert.equal(wRestored.rechargeBalance, 50.00);
      assert.equal(wRestored.earnedBalance, 200.00);
      assert.equal(wRestored.balance, 250.00);
      assert.equal(wRestored.totalSpent, 0.00);
    } finally {
      await cleanupPartner(partnerId);
    }
  });

  await t.test('5. Finalize debit updates total_spent and preserves component accounting', async () => {
    const partnerId = await createTestPartner('FINALIZE_DEBIT');
    try {
      await walletRepo.creditWallet({
        partnerId,
        amount: 150.00,
        description: 'Recharge',
        referenceId: 'REC_150'
      });

      // CRIF costs ₹81.42 -> completely paid from recharge_balance (150 - 81.42 = 68.58)
      const res = await walletService.reserveBureauReport(partnerId, 'CRIF', 'CRIF_INQ_1');
      assert.equal(res.amount, 81.42);

      const finalRes = await walletService.finalizeBureauDebit(
        partnerId,
        res.reservationId,
        'CRIF',
        'CRIF_INQ_1',
        'CRIF_REPORT'
      );
      assert.equal(finalRes.status, 'SUCCESS');

      const wAfter = await walletService.getWallet(partnerId);
      assert.equal(wAfter.balance, 68.58);
      assert.equal(wAfter.rechargeBalance, 68.58);
      assert.equal(wAfter.earnedBalance, 0.00);
      assert.equal(wAfter.totalSpent, 81.42);
    } finally {
      await cleanupPartner(partnerId);
    }
  });

  await t.test('6. Payout withdrawal isolation: Withdrawable limited to earned_balance only', async () => {
    const partnerId = await createTestPartner('PAYOUT_ISOLATION');
    try {
      // Partner has ₹500 recharge money and ₹300 earned money
      await walletRepo.creditWallet({
        partnerId,
        amount: 500.00,
        description: 'Recharge',
        referenceId: 'REC_500'
      });
      await walletRepo.creditCommission({
        partnerId,
        amount: 300.00,
        referenceId: 'COMM_300',
        leadId: 77
      });

      const w = await walletService.getWallet(partnerId);
      assert.equal(w.balance, 800.00);
      assert.equal(w.availableBalance, 800.00);
      assert.equal(w.rechargeBalance, 500.00);
      assert.equal(w.earnedBalance, 300.00);
      assert.equal(w.withdrawableBalance, 300.00);

      // Attempting to withdraw ₹400 must fail because earned_balance is only ₹300!
      await assert.rejects(
        async () => {
          await walletRepo.debitPayout({
            partnerId,
            amount: 400.00,
            referenceId: 'PAYOUT_REQ_FAIL'
          });
        },
        (err) => err.code === 'INSUFFICIENT_EARNED_BALANCE' || /earned balance/.test(err.message)
      );

      // Withdrawing ₹250 succeeds (less than or equal to ₹300)
      const debitRes = await walletRepo.debitPayout({
        partnerId,
        amount: 250.00,
        referenceId: 'PAYOUT_REQ_PASS',
        notes: 'Withdrawal to Bank'
      });
      assert.equal(debitRes.balanceAfter, 550.00);

      const wAfterDebit = await walletService.getWallet(partnerId);
      assert.equal(wAfterDebit.balance, 550.00);
      assert.equal(wAfterDebit.earnedBalance, 50.00); // 300 - 250 = 50
      assert.equal(wAfterDebit.rechargeBalance, 500.00); // completely untouched!

      // If admin rejects payout, refundPayout restores ₹250 to earned_balance
      const refundRes = await walletRepo.refundPayout({
        partnerId,
        amount: 250.00,
        referenceId: 'PAYOUT_REFUND_1',
        reason: 'Bank account details invalid'
      });
      assert.equal(refundRes.balanceAfter, 800.00);

      const wRestored = await walletService.getWallet(partnerId);
      assert.equal(wRestored.balance, 800.00);
      assert.equal(wRestored.earnedBalance, 300.00);
      assert.equal(wRestored.rechargeBalance, 500.00);
    } finally {
      await cleanupPartner(partnerId);
    }
  });

  await t.test('7. Development Mock Mode: Safe mock report creation and 404 on PDF download', async () => {
    const partnerId = await createTestPartner('DEV_MOCK');
    try {
      // Give partner enough recharge funds for CIBIL inquiry
      await walletRepo.creditWallet({
        partnerId,
        amount: 200.00,
        description: 'Fund for test inquiry',
        referenceId: 'REC_INQ'
      });

      // Ensure DEV_BUREAU_MOCK is active and NODE_ENV is development/test
      const origMock = process.env.DEV_BUREAU_MOCK;
      const origEnv = process.env.NODE_ENV;
      process.env.DEV_BUREAU_MOCK = 'true';
      process.env.NODE_ENV = 'development';

      try {
        const inquiryResult = await cibilReportService.fetchNewReport(
          partnerId,
          {
            bureau: 'CIBIL',
            name: 'Jane Doe',
            mobile: '9876543210',
            pan: 'ABCDE1234F',
            gender: 'female',
            consent: true
          },
          { ip: '127.0.0.1' }
        );

        assert.ok(inquiryResult.id, 'Report ID must be generated');
        assert.equal(inquiryResult.isMock, true);
        assert.equal(inquiryResult.hasOriginalReport, false);

        // Verify PDF download attempt for mock report is blocked with PDF_UNAVAILABLE
        const pdfRoute = require('../src/routes/cibilReports');
        let errorStatus = null;
        let errorCode = null;

        const fakeReq = {
          params: { id: inquiryResult.id },
          query: { mode: 'download' },
          user: { partnerId, role: 'partner' },
          ip: '127.0.0.1'
        };
        const fakeRes = {
          status(code) {
            errorStatus = code;
            return this;
          },
          json(obj) {
            errorCode = obj.code;
            return this;
          }
        };

        await pdfRoute.serveReportPdf(fakeReq, fakeRes, () => {}, 'attachment');
        assert.equal(errorStatus, 404);
        assert.equal(errorCode, 'PDF_UNAVAILABLE');
      } finally {
        process.env.DEV_BUREAU_MOCK = origMock;
        process.env.NODE_ENV = origEnv;
      }
    } finally {
      await cleanupPartner(partnerId);
    }
  });

  await t.test('8. Real PDF serving: Strict partner ownership check and sanitized filename', async () => {
    const partnerOwner = await createTestPartner('OWNER');
    const partnerAttacker = await createTestPartner('ATTACKER');

    // Create a temporary dummy PDF file in REPORT_ROOT
    const reportRoot = cibilReportService.REPORT_ROOT;
    if (!fs.existsSync(reportRoot)) {
      fs.mkdirSync(reportRoot, { recursive: true });
    }
    const dummyPdfPath = path.join(reportRoot, `test_report_${Date.now()}.pdf`);
    fs.writeFileSync(dummyPdfPath, '%PDF-1.4 test genuine report content');

    try {
      // Create genuine report row in DB with storage path
      const [ins] = await query(
        `INSERT INTO partner_cibil_reports
         (partner_id, customer_name, mobile, pan, gender, bureau, provider, status, billing_status, credit_score, report_storage_path, consent_given, requested_at, created_at, updated_at)
         VALUES (?, 'John Confidential Doe', '9988776655', 'ABCDE1234F', 'male', 'CIBIL', 'surepass', 'SUCCESS', 'BILLED_REPORT_READY', 760, ?, 1, NOW(), NOW(), NOW())`,
        [partnerOwner, dummyPdfPath]
      );
      const reportId = ins.insertId;

      const pdfRoute = require('../src/routes/cibilReports');

      // Attacker trying to access Owner's PDF report (returns 404 REPORT_NOT_FOUND)
      let attackerStatus = null;
      let attackerCode = null;
      const attackerReq = {
        params: { id: reportId },
        query: { mode: 'download' },
        user: { partnerId: partnerAttacker, role: 'partner' },
        ip: '127.0.0.1'
      };
      const attackerRes = {
        status(code) {
          attackerStatus = code;
          return this;
        },
        json(obj) {
          attackerCode = obj.code;
          return this;
        }
      };
      await pdfRoute.serveReportPdf(attackerReq, attackerRes, () => {}, 'attachment');
      assert.equal(attackerStatus, 404);
      assert.equal(attackerCode, 'REPORT_NOT_FOUND');

      // Genuine Owner accessing PDF report
      let headers = {};
      const { PassThrough } = require('stream');
      const ownerRes = new PassThrough();
      ownerRes.status = function(code) { this.statusCode = code; return this; };
      ownerRes.set = function(obj) { Object.assign(headers, obj); return this; };
      ownerRes.setHeader = function(k, v) { headers[k] = v; return this; };

      const ownerReq = {
        params: { id: reportId },
        query: { mode: 'download' },
        user: { partnerId: partnerOwner, role: 'partner' },
        ip: '127.0.0.1'
      };

      await pdfRoute.serveReportPdf(ownerReq, ownerRes, () => {}, 'attachment');

      assert.equal(headers['Content-Type'], 'application/pdf');
      assert.ok(headers['Content-Disposition'], 'Must have Content-Disposition header');
      assert.ok(headers['Content-Disposition'].includes('attachment; filename="CIBIL_JOHN_CONFIDENTIAL_DOE_'), 'Must sanitize customer name');
      // Must NOT leak customer PAN or mobile in filename
      assert.equal(headers['Content-Disposition'].includes('ABCDE'), false);
      assert.equal(headers['Content-Disposition'].includes('9988776655'), false);

      await new Promise(r => setTimeout(r, 100));
      // Verify audit log entry was created for genuine download
      const [auditRows] = await query(
        'SELECT * FROM partner_audit_logs WHERE action = "cibil.pdf_downloaded" AND entity_id = ?',
        [reportId]
      );
      assert.ok(auditRows.length >= 1, 'Download audit log must be recorded');
    } finally {
      if (fs.existsSync(dummyPdfPath)) {
        try { fs.unlinkSync(dummyPdfPath); } catch {}
      }
      await cleanupPartner(partnerOwner);
      await cleanupPartner(partnerAttacker);
    }
  });

  await t.test('9. Hard production guard: refuses mock mode when NODE_ENV === production', async () => {
    const origEnv = process.env.NODE_ENV;
    const origMock = process.env.DEV_BUREAU_MOCK;
    try {
      process.env.DEV_BUREAU_MOCK = 'true';
      process.env.NODE_ENV = 'production';
      assert.equal(cibilReportService.isDevBureauMockEnabled(), false);

      process.env.NODE_ENV = 'development';
      assert.equal(cibilReportService.isDevBureauMockEnabled(), true);

      process.env.NODE_ENV = 'test';
      assert.equal(cibilReportService.isDevBureauMockEnabled(), true);
    } finally {
      process.env.NODE_ENV = origEnv;
      process.env.DEV_BUREAU_MOCK = origMock;
    }
  });
});
