const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const cashfreeProvider = require('../src/services/providers/cashfreePaymentProvider');
const walletService = require('../src/services/walletService');
const walletRepo = require('../src/repositories/walletRepository');
const { query, pool } = require('../src/config/db');

test('Wallet Service & Cashfree Integration', async (t) => {
  t.after(async () => {
    await pool.end();
  });

  const secretKey = 'test_cashfree_secret_key_12345';
  process.env.CASHFREE_CLIENT_SECRET = secretKey;

  await t.test('Cashfree webhook signature verification validates genuine signatures', () => {
    const timestamp = Date.now().toString();
    const payload = JSON.stringify({
      data: {
        order: { order_id: 'ORDER_123', order_amount: 500 },
        payment: { payment_status: 'SUCCESS', cf_payment_id: 'CF_999' }
      }
    });

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(timestamp + payload)
      .digest('base64');

    const isValid = cashfreeProvider.verifyWebhookSignature(payload, signature, timestamp);
    assert.equal(isValid, true, 'Genuine HMAC signature should verify to true');
  });

  await t.test('Cashfree webhook signature verification rejects tampered payload or signature', () => {
    const timestamp = Date.now().toString();
    const payload = JSON.stringify({
      data: {
        order: { order_id: 'ORDER_123', order_amount: 500 }
      }
    });

    const tamperedPayload = JSON.stringify({
      data: {
        order: { order_id: 'ORDER_123', order_amount: 50000 }
      }
    });

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(timestamp + payload)
      .digest('base64');

    const isValid = cashfreeProvider.verifyWebhookSignature(tamperedPayload, signature, timestamp);
    assert.equal(isValid, false, 'Tampered payload must be rejected');

    const isInvalidSig = cashfreeProvider.verifyWebhookSignature(payload, 'bad_signature', timestamp);
    assert.equal(isInvalidSig, false, 'Bad signature must be rejected');
  });

  await t.test('Bureau pricing is configured and enforces active checks', async () => {
    const pricing = await walletService.getPricing();
    assert.ok(Array.isArray(pricing), 'Pricing should return array');
    assert.ok(pricing.length >= 4, 'Should have at least 4 bureaus in catalog');

    // All 4 configured bureaus should be active with valid temporary pricing
    for (const p of pricing) {
      assert.equal(p.isActive, true, `${p.bureau} should be active`);
      assert.equal(p.isConfigured, true, `${p.bureau} should be configured`);
      assert.ok(p.basePrice > 0, `${p.bureau} base price should be > 0`);
      assert.ok(p.totalPrice > 0, `${p.bureau} total price should be > 0`);
    }

    // Attempting to reserve or charge unconfigured/unknown bureau throws PRICING_NOT_CONFIGURED
    await assert.rejects(
      async () => {
        await walletService.reserveBureauReport(1, 'INVALID_BUREAU', 'TEST_REF_1');
      },
      (err) => err.code === 'PRICING_NOT_CONFIGURED' && /Bureau pricing is not configured/.test(err.message)
    );
  });

  await t.test('Wallet reservation, release, and finalization ledger consistency', async () => {
    // Save original CIBIL pricing to restore later
    const [origRows] = await query('SELECT price, is_active FROM bureau_pricing WHERE bureau = "CIBIL"');
    const origPrice = origRows && origRows[0] ? origRows[0].price : '99.00';
    const origActive = origRows && origRows[0] ? origRows[0].is_active : 1;

    // Create temporary test partner
    const suffix = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const [p] = await query(
      `INSERT INTO partners (partner_code, full_name, mobile, partner_type, state, kyc_status, approval_status)
       VALUES (?, 'Wallet Test Partner', ?, 'Test', 'Delhi', 'approved', 'approved')`,
      [`WAL_${suffix}`, suffix.slice(-10).padStart(10, '9')]
    );
    const partnerId = p.insertId;

    try {
      // 1. Initial wallet balance is 0
      const initialWallet = await walletService.getWallet(partnerId);
      assert.equal(initialWallet.balance, 0);

      // Temporarily configure CIBIL pricing for ledger integration test (100 + 18% = 118)
      await query('UPDATE bureau_pricing SET price = 100.00, is_active = 1 WHERE bureau = "CIBIL"');

      // 2. Reservation with 0 balance throws INSUFFICIENT_WALLET_BALANCE
      await assert.rejects(
        async () => {
          await walletService.reserveBureauReport(partnerId, 'CIBIL', 'RES_FAIL_1');
        },
        (err) => err.code === 'INSUFFICIENT_WALLET_BALANCE' || err.status === 402
      );

      // 3. Credit wallet ₹500
      const creditRes = await walletRepo.creditWallet({
        partnerId,
        amount: 500,
        description: 'Test Credit',
        referenceId: 'TEST_CRED_1'
      });
      assert.equal(creditRes.balanceAfter, 500);

      // 4. Reserve ₹118 for CIBIL report (locks funds, does not finalize spent)
      const resResult = await walletService.reserveBureauReport(partnerId, 'CIBIL', 'RES_ORDER_1');
      assert.equal(resResult.amount, 118);
      assert.equal(resResult.balanceAfter, 382);

      // Verify wallet total_spent is still 0
      const walletDuringRes = await walletService.getWallet(partnerId);
      assert.equal(walletDuringRes.balance, 382);
      assert.equal(walletDuringRes.totalSpent, 0);

      // 5. Release reservation (e.g. provider returned NOT_BILLED / no record found)
      const releaseResult = await walletService.releaseBureauReservation(
        partnerId,
        resResult.reservationId,
        'CIBIL',
        'RES_ORDER_1',
        'Provider not billed: record not found'
      );
      assert.equal(releaseResult.balanceAfter, 500);

      // Verify wallet restored to 500
      const walletAfterRelease = await walletService.getWallet(partnerId);
      assert.equal(walletAfterRelease.balance, 500);
      assert.equal(walletAfterRelease.totalSpent, 0);

      // 6. Test Finalization path (BILLED_REPORT_READY)
      const res2 = await walletService.reserveBureauReport(partnerId, 'CIBIL', 'RES_ORDER_2');
      assert.equal(res2.balanceAfter, 382);

      const finalDebit = await walletService.finalizeBureauDebit(
        partnerId,
        res2.reservationId,
        'CIBIL',
        'RES_ORDER_2',
        'BUREAU_REPORT'
      );
      assert.equal(finalDebit.status, 'SUCCESS');

      const walletAfterFinal = await walletService.getWallet(partnerId);
      assert.equal(walletAfterFinal.balance, 382);
      assert.equal(walletAfterFinal.totalSpent, 118);

      // 7. Check transactions ledger entries
      const txs = await walletService.getTransactions(partnerId, { limit: 10 });
      assert.equal(txs.length, 4); // 1 credit, 1 reservation-release, 1 release-audit, 1 finalized debit
    } finally {
      // Revert CIBIL pricing to original state
      await query('UPDATE bureau_pricing SET price = ?, is_active = ? WHERE bureau = "CIBIL"', [origPrice, origActive]);

      // Cleanup test data
      await query('DELETE FROM partner_wallet_transactions WHERE partner_id = ?', [partnerId]);
      await query('DELETE FROM partner_wallets WHERE partner_id = ?', [partnerId]);
      await query('DELETE FROM partners WHERE id = ?', [partnerId]);
    }
  });
});
