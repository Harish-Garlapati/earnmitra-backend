const { query, pool } = require('../config/db');

class WalletRepository {
  async getOrCreateWallet(partnerId, conn = null) {
    const runner = conn ? (sql, params) => conn.query(sql, params) : query;
    const [rows] = await runner(
      'SELECT * FROM partner_wallets WHERE partner_id = ? LIMIT 1',
      [partnerId]
    );

    if (rows && rows.length > 0) {
      return rows[0];
    }

    await runner(
      'INSERT INTO partner_wallets (partner_id, balance, earned_balance, recharge_balance, total_recharged, total_spent) VALUES (?, 0.00, 0.00, 0.00, 0.00, 0.00) ON DUPLICATE KEY UPDATE balance = balance',
      [partnerId]
    );

    const [created] = await runner(
      'SELECT * FROM partner_wallets WHERE partner_id = ? LIMIT 1',
      [partnerId]
    );
    return created[0];
  }

  async getBureauPricing() {
    const [rows] = await query(
      'SELECT bureau, provider, price, gst_percentage, is_active FROM bureau_pricing ORDER BY id ASC'
    );
    return rows.map(r => {
      const basePrice = Number(r.price);
      const gstPercentage = Number(r.gst_percentage);
      const gstAmount = Number(((basePrice * gstPercentage) / 100).toFixed(2));
      const totalPrice = Number((basePrice + gstAmount).toFixed(2));
      const isConfigured = Boolean(r.is_active && basePrice > 0);
      return {
        bureau: r.bureau,
        provider: r.provider,
        basePrice,
        gstPercentage,
        gstAmount,
        totalPrice,
        isActive: Boolean(r.is_active),
        isConfigured
      };
    });
  }

  async getBureauPrice(bureau) {
    const [rows] = await query(
      'SELECT bureau, provider, price, gst_percentage, is_active FROM bureau_pricing WHERE bureau = ? LIMIT 1',
      [bureau.toUpperCase()]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    const basePrice = Number(r.price);
    const gstPercentage = Number(r.gst_percentage);
    const gstAmount = Number(((basePrice * gstPercentage) / 100).toFixed(2));
    const totalPrice = Number((basePrice + gstAmount).toFixed(2));
    const isConfigured = Boolean(r.is_active && basePrice > 0);
    return {
      bureau: r.bureau,
      provider: r.provider,
      basePrice,
      gstPercentage,
      gstAmount,
      totalPrice,
      isActive: Boolean(r.is_active),
      isConfigured
    };
  }

  async createPaymentOrder({ orderId, partnerId, amount, gateway, paymentSessionId, gatewayOrderId }) {
    await query(
      `INSERT INTO payment_orders
       (order_id, partner_id, amount, currency, payment_gateway, gateway_order_id, payment_session_id, status)
       VALUES (?, ?, ?, 'INR', ?, ?, ?, 'CREATED')`,
      [orderId, partnerId, amount, gateway, gatewayOrderId || null, paymentSessionId || null]
    );
    return this.findPaymentOrder(orderId);
  }

  async findPaymentOrder(orderId) {
    const [rows] = await query(
      'SELECT * FROM payment_orders WHERE order_id = ? LIMIT 1',
      [orderId]
    );
    return rows[0] || null;
  }

  async markPaymentOrderPaid({ orderId, paymentId, rawWebhook, conn = null }) {
    const runner = conn ? (sql, params) => conn.query(sql, params) : query;
    await runner(
      `UPDATE payment_orders
       SET status = 'PAID', payment_id = ?, raw_webhook_json = ?, paid_at = CURRENT_TIMESTAMP
       WHERE order_id = ? AND status != 'PAID'`,
      [paymentId || null, rawWebhook ? JSON.stringify(rawWebhook) : null, orderId]
    );
  }

  async creditWallet({ partnerId, amount, description, referenceId, gateway = 'CASHFREE', conn = null }) {
    const numAmount = Number(amount);
    if (numAmount <= 0) throw new Error('Credit amount must be positive');

    let connection = conn;
    let shouldRelease = false;

    if (!connection) {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      shouldRelease = true;
    }

    try {
      // 1. Lock wallet row FOR UPDATE
      const [walletRows] = await connection.query(
        'SELECT * FROM partner_wallets WHERE partner_id = ? FOR UPDATE',
        [partnerId]
      );

      let wallet = walletRows[0];
      if (!wallet) {
        await connection.query(
          'INSERT INTO partner_wallets (partner_id, balance, earned_balance, recharge_balance, total_recharged, total_spent) VALUES (?, 0.00, 0.00, 0.00, 0.00, 0.00)',
          [partnerId]
        );
        const [reloaded] = await connection.query(
          'SELECT * FROM partner_wallets WHERE partner_id = ? FOR UPDATE',
          [partnerId]
        );
        wallet = reloaded[0];
      }

      const balanceBefore = Number(wallet.balance);
      const currentRecharge = Number(wallet.recharge_balance || 0);
      const newRecharge = Number((currentRecharge + numAmount).toFixed(2));
      const currentEarned = Number(wallet.earned_balance || 0);
      const balanceAfter = Number((newRecharge + currentEarned).toFixed(2));
      const totalRecharged = Number((Number(wallet.total_recharged) + numAmount).toFixed(2));

      // 2. Update wallet row
      await connection.query(
        'UPDATE partner_wallets SET balance = ?, recharge_balance = ?, total_recharged = ? WHERE partner_id = ?',
        [balanceAfter, newRecharge, totalRecharged, partnerId]
      );

      // 3. Write immutable ledger entry
      const [txResult] = await connection.query(
        `INSERT INTO partner_wallet_transactions
         (partner_id, transaction_type, category, amount, net_amount, recharge_component, earned_component, balance_before, balance_after, description, reference_id, payment_gateway, status)
         VALUES (?, 'CREDIT', 'WALLET_RECHARGE', ?, ?, ?, 0.00, ?, ?, ?, ?, ?, 'SUCCESS')`,
        [partnerId, numAmount, numAmount, numAmount, balanceBefore, balanceAfter, description || 'Wallet Recharge', referenceId, gateway]
      );

      if (shouldRelease) {
        await connection.commit();
        connection.release();
      }

      return {
        transactionId: txResult.insertId,
        balanceBefore,
        balanceAfter,
        rechargeBalanceAfter: newRecharge,
        amount: numAmount
      };
    } catch (err) {
      if (shouldRelease) {
        await connection.rollback();
        connection.release();
      }
      throw err;
    }
  }

  async creditCommission({ partnerId, amount, earningId, description, leadId = null, conn = null }) {
    const numAmount = Number(amount);
    if (numAmount <= 0) throw new Error('Commission amount must be positive');

    let connection = conn;
    let shouldRelease = false;

    if (!connection) {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      shouldRelease = true;
    }

    try {
      const refId = String(earningId);
      // 1. Idempotency Check: Don't credit if already credited
      const [existing] = await connection.query(
        `SELECT id FROM partner_wallet_transactions
         WHERE partner_id = ? AND category = 'COMMISSION' AND reference_id = ? LIMIT 1`,
        [partnerId, refId]
      );

      if (existing.length > 0) {
        if (shouldRelease) {
          await connection.commit();
          connection.release();
        }
        return {
          alreadyCredited: true,
          transactionId: existing[0].id
        };
      }

      // 2. Lock wallet row FOR UPDATE
      const [walletRows] = await connection.query(
        'SELECT * FROM partner_wallets WHERE partner_id = ? FOR UPDATE',
        [partnerId]
      );

      let wallet = walletRows[0];
      if (!wallet) {
        await connection.query(
          'INSERT INTO partner_wallets (partner_id, balance, earned_balance, recharge_balance, total_recharged, total_spent) VALUES (?, 0.00, 0.00, 0.00, 0.00, 0.00)',
          [partnerId]
        );
        const [reloaded] = await connection.query(
          'SELECT * FROM partner_wallets WHERE partner_id = ? FOR UPDATE',
          [partnerId]
        );
        wallet = reloaded[0];
      }

      const balanceBefore = Number(wallet.balance);
      const earnedBefore = Number(wallet.earned_balance || 0);
      const earnedAfter = Number((earnedBefore + numAmount).toFixed(2));
      const rechargeBalance = Number(wallet.recharge_balance || 0);
      const balanceAfter = Number((earnedAfter + rechargeBalance).toFixed(2));

      // 3. Update wallet row
      await connection.query(
        'UPDATE partner_wallets SET balance = ?, earned_balance = ? WHERE partner_id = ?',
        [balanceAfter, earnedAfter, partnerId]
      );

      // 4. Write immutable ledger entry
      const [txResult] = await connection.query(
        `INSERT INTO partner_wallet_transactions
         (partner_id, transaction_type, category, amount, net_amount, recharge_component, earned_component, balance_before, balance_after, description, reference_id, status)
         VALUES (?, 'CREDIT', 'COMMISSION', ?, ?, 0.00, ?, ?, ?, ?, ?, 'SUCCESS')`,
        [partnerId, numAmount, numAmount, numAmount, balanceBefore, balanceAfter, description || 'Commission Earning Credited', refId]
      );

      if (shouldRelease) {
        await connection.commit();
        connection.release();
      }

      return {
        transactionId: txResult.insertId,
        alreadyCredited: false,
        balanceBefore,
        balanceAfter,
        earnedBalanceAfter: earnedAfter,
        amount: numAmount
      };
    } catch (err) {
      if (shouldRelease) {
        await connection.rollback();
        connection.release();
      }
      throw err;
    }
  }

  async debitPayout({ partnerId, amount, referenceId, description = null, conn = null }) {
    const numAmount = Number(amount);
    if (numAmount <= 0) throw new Error('Payout debit amount must be positive');

    let connection = conn;
    let shouldRelease = false;

    if (!connection) {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      shouldRelease = true;
    }

    try {
      const [walletRows] = await connection.query(
        'SELECT * FROM partner_wallets WHERE partner_id = ? FOR UPDATE',
        [partnerId]
      );

      const wallet = walletRows[0];
      if (!wallet) throw new Error('Partner wallet not found');

      const earnedBefore = Number(wallet.earned_balance || 0);
      if (earnedBefore < numAmount) {
        const err = new Error('Requested payout exceeds withdrawable earned balance');
        err.code = 'INSUFFICIENT_EARNED_BALANCE';
        err.status = 400;
        throw err;
      }

      const balanceBefore = Number(wallet.balance);
      const earnedAfter = Number((earnedBefore - numAmount).toFixed(2));
      const rechargeBalance = Number(wallet.recharge_balance || 0);
      const balanceAfter = Number((earnedAfter + rechargeBalance).toFixed(2));

      await connection.query(
        'UPDATE partner_wallets SET balance = ?, earned_balance = ? WHERE partner_id = ?',
        [balanceAfter, earnedAfter, partnerId]
      );

      const [txResult] = await connection.query(
        `INSERT INTO partner_wallet_transactions
         (partner_id, transaction_type, category, amount, net_amount, recharge_component, earned_component, balance_before, balance_after, description, reference_id, status)
         VALUES (?, 'DEBIT', 'PAYOUT', ?, ?, 0.00, ?, ?, ?, ?, ?, 'SUCCESS')`,
        [partnerId, numAmount, numAmount, numAmount, balanceBefore, balanceAfter, description || `Payout Request ${referenceId}`, referenceId]
      );

      if (shouldRelease) {
        await connection.commit();
        connection.release();
      }

      return {
        transactionId: txResult.insertId,
        balanceBefore,
        balanceAfter,
        earnedBalanceAfter: earnedAfter,
        amount: numAmount
      };
    } catch (err) {
      if (shouldRelease) {
        await connection.rollback();
        connection.release();
      }
      throw err;
    }
  }

  async refundPayout({ partnerId, amount, referenceId, reason = null, conn = null }) {
    const numAmount = Number(amount);
    if (numAmount <= 0) throw new Error('Payout refund amount must be positive');

    let connection = conn;
    let shouldRelease = false;

    if (!connection) {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      shouldRelease = true;
    }

    try {
      const [walletRows] = await connection.query(
        'SELECT * FROM partner_wallets WHERE partner_id = ? FOR UPDATE',
        [partnerId]
      );

      const wallet = walletRows[0];
      if (!wallet) throw new Error('Partner wallet not found');

      const balanceBefore = Number(wallet.balance);
      const earnedBefore = Number(wallet.earned_balance || 0);
      const earnedAfter = Number((earnedBefore + numAmount).toFixed(2));
      const rechargeBalance = Number(wallet.recharge_balance || 0);
      const balanceAfter = Number((earnedAfter + rechargeBalance).toFixed(2));

      await connection.query(
        'UPDATE partner_wallets SET balance = ?, earned_balance = ? WHERE partner_id = ?',
        [balanceAfter, earnedAfter, partnerId]
      );

      const [txResult] = await connection.query(
        `INSERT INTO partner_wallet_transactions
         (partner_id, transaction_type, category, amount, net_amount, recharge_component, earned_component, balance_before, balance_after, description, reference_id, status)
         VALUES (?, 'REFUND', 'PAYOUT_REVERTED', ?, ?, 0.00, ?, ?, ?, ?, ?, 'SUCCESS')`,
        [partnerId, numAmount, numAmount, numAmount, balanceBefore, balanceAfter, reason || `Refund for rejected payout ${referenceId}`, referenceId]
      );

      if (shouldRelease) {
        await connection.commit();
        connection.release();
      }

      return {
        transactionId: txResult.insertId,
        balanceBefore,
        balanceAfter,
        earnedBalanceAfter: earnedAfter,
        amount: numAmount
      };
    } catch (err) {
      if (shouldRelease) {
        await connection.rollback();
        connection.release();
      }
      throw err;
    }
  }

  async debitWallet({ partnerId, amount, category, description, referenceId, conn = null }) {
    const numAmount = Number(amount);
    if (numAmount <= 0) throw new Error('Debit amount must be positive');

    let connection = conn;
    let shouldRelease = false;

    if (!connection) {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      shouldRelease = true;
    }

    try {
      // 1. Lock wallet row FOR UPDATE
      const [walletRows] = await connection.query(
        'SELECT * FROM partner_wallets WHERE partner_id = ? FOR UPDATE',
        [partnerId]
      );

      let wallet = walletRows[0];
      if (!wallet) {
        await connection.query(
          'INSERT INTO partner_wallets (partner_id, balance, earned_balance, recharge_balance, total_recharged, total_spent) VALUES (?, 0.00, 0.00, 0.00, 0.00, 0.00)',
          [partnerId]
        );
        const [reloaded] = await connection.query(
          'SELECT * FROM partner_wallets WHERE partner_id = ? FOR UPDATE',
          [partnerId]
        );
        wallet = reloaded[0];
      }

      const balanceBefore = Number(wallet.balance);
      if (balanceBefore < numAmount) {
        const err = new Error('Insufficient wallet balance');
        err.code = 'INSUFFICIENT_WALLET_BALANCE';
        err.status = 402;
        throw err;
      }

      // Spending priority: 1. recharge_balance, 2. earned_balance
      const currentRecharge = Number(wallet.recharge_balance || 0);
      const currentEarned = Number(wallet.earned_balance || 0);

      const rechargeAlloc = Math.min(currentRecharge, numAmount);
      const earnedAlloc = Number((numAmount - rechargeAlloc).toFixed(2));

      const newRecharge = Number((currentRecharge - rechargeAlloc).toFixed(2));
      const newEarned = Number((currentEarned - earnedAlloc).toFixed(2));
      const balanceAfter = Number((newRecharge + newEarned).toFixed(2));
      const totalSpent = Number((Number(wallet.total_spent) + numAmount).toFixed(2));

      // 2. Update wallet row
      await connection.query(
        'UPDATE partner_wallets SET balance = ?, recharge_balance = ?, earned_balance = ?, total_spent = ? WHERE partner_id = ?',
        [balanceAfter, newRecharge, newEarned, totalSpent, partnerId]
      );

      // 3. Write immutable ledger entry
      const [txResult] = await connection.query(
        `INSERT INTO partner_wallet_transactions
         (partner_id, transaction_type, category, amount, net_amount, recharge_component, earned_component, balance_before, balance_after, description, reference_id, status)
         VALUES (?, 'DEBIT', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS')`,
        [partnerId, category || 'BUREAU_REPORT', numAmount, numAmount, rechargeAlloc, earnedAlloc, balanceBefore, balanceAfter, description || 'Bureau Report Fetch', referenceId]
      );

      if (shouldRelease) {
        await connection.commit();
        connection.release();
      }

      return {
        transactionId: txResult.insertId,
        balanceBefore,
        balanceAfter,
        rechargeComponent: rechargeAlloc,
        earnedComponent: earnedAlloc,
        amount: numAmount
      };
    } catch (err) {
      if (shouldRelease) {
        await connection.rollback();
        connection.release();
      }
      throw err;
    }
  }

  async refundWallet({ partnerId, amount, category, description, referenceId, originalTransactionId = null, conn = null }) {
    const numAmount = Number(amount);
    if (numAmount <= 0) throw new Error('Refund amount must be positive');

    let connection = conn;
    let shouldRelease = false;

    if (!connection) {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      shouldRelease = true;
    }

    try {
      let rechargeRefund = 0;
      let earnedRefund = 0;

      if (originalTransactionId || referenceId) {
        const [origRows] = await connection.query(
          'SELECT * FROM partner_wallet_transactions WHERE (id = ? OR reference_id = ?) AND partner_id = ? LIMIT 1',
          [originalTransactionId || 0, referenceId || '', partnerId]
        );
        if (origRows.length > 0) {
          const orig = origRows[0];
          const origTotal = Number(orig.amount) || numAmount;
          const ratio = Math.min(1, numAmount / origTotal);
          rechargeRefund = Number((Number(orig.recharge_component || 0) * ratio).toFixed(2));
          earnedRefund = Number((numAmount - rechargeRefund).toFixed(2));
        }
      }

      if (rechargeRefund === 0 && earnedRefund === 0) {
        rechargeRefund = numAmount;
      }

      // 1. Lock wallet row FOR UPDATE
      const [walletRows] = await connection.query(
        'SELECT * FROM partner_wallets WHERE partner_id = ? FOR UPDATE',
        [partnerId]
      );

      const wallet = walletRows[0];
      if (!wallet) throw new Error('Partner wallet not found');

      const balanceBefore = Number(wallet.balance);
      const currentRecharge = Number(wallet.recharge_balance || 0);
      const currentEarned = Number(wallet.earned_balance || 0);

      const newRecharge = Number((currentRecharge + rechargeRefund).toFixed(2));
      const newEarned = Number((currentEarned + earnedRefund).toFixed(2));
      const balanceAfter = Number((newRecharge + newEarned).toFixed(2));
      const totalSpent = Math.max(0, Number((Number(wallet.total_spent) - numAmount).toFixed(2)));

      // 2. Update wallet row
      await connection.query(
        'UPDATE partner_wallets SET balance = ?, recharge_balance = ?, earned_balance = ?, total_spent = ? WHERE partner_id = ?',
        [balanceAfter, newRecharge, newEarned, totalSpent, partnerId]
      );

      // 3. Write immutable refund entry
      const [txResult] = await connection.query(
        `INSERT INTO partner_wallet_transactions
         (partner_id, transaction_type, category, amount, net_amount, recharge_component, earned_component, balance_before, balance_after, description, reference_id, status)
         VALUES (?, 'REFUND', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS')`,
        [partnerId, category || 'REPORT_FAILURE_REFUND', numAmount, numAmount, rechargeRefund, earnedRefund, balanceBefore, balanceAfter, description || 'Bureau Report Refund', referenceId]
      );

      if (shouldRelease) {
        await connection.commit();
        connection.release();
      }

      return {
        transactionId: txResult.insertId,
        balanceBefore,
        balanceAfter,
        rechargeRefund,
        earnedRefund,
        amount: numAmount
      };
    } catch (err) {
      if (shouldRelease) {
        await connection.rollback();
        connection.release();
      }
      throw err;
    }
  }

  async reserveWallet({ partnerId, amount, bureau, referenceId, basePrice = null, gstPercentage = 18.00, gstAmount = null, conn = null }) {
    const numAmount = Number(amount);
    if (numAmount <= 0) throw new Error('Reservation amount must be positive');

    let connection = conn;
    let shouldRelease = false;

    if (!connection) {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      shouldRelease = true;
    }

    try {
      const [walletRows] = await connection.query(
        'SELECT * FROM partner_wallets WHERE partner_id = ? FOR UPDATE',
        [partnerId]
      );

      let wallet = walletRows[0];
      if (!wallet) {
        await connection.query(
          'INSERT INTO partner_wallets (partner_id, balance, earned_balance, recharge_balance, total_recharged, total_spent) VALUES (?, 0.00, 0.00, 0.00, 0.00, 0.00)',
          [partnerId]
        );
        const [reloaded] = await connection.query(
          'SELECT * FROM partner_wallets WHERE partner_id = ? FOR UPDATE',
          [partnerId]
        );
        wallet = reloaded[0];
      }

      const balanceBefore = Number(wallet.balance);
      if (balanceBefore < numAmount) {
        const err = new Error('Insufficient wallet balance');
        err.code = 'INSUFFICIENT_WALLET_BALANCE';
        err.status = 402;
        throw err;
      }

      // Spending priority: 1. recharge_balance, 2. earned_balance
      const currentRecharge = Number(wallet.recharge_balance || 0);
      const currentEarned = Number(wallet.earned_balance || 0);

      const rechargeAlloc = Math.min(currentRecharge, numAmount);
      const earnedAlloc = Number((numAmount - rechargeAlloc).toFixed(2));

      const newRecharge = Number((currentRecharge - rechargeAlloc).toFixed(2));
      const newEarned = Number((currentEarned - earnedAlloc).toFixed(2));
      const balanceAfter = Number((newRecharge + newEarned).toFixed(2));

      // Deduct balance & split balances to hold funds during provider call
      await connection.query(
        'UPDATE partner_wallets SET balance = ?, recharge_balance = ?, earned_balance = ? WHERE partner_id = ?',
        [balanceAfter, newRecharge, newEarned, partnerId]
      );

      const computedGstAmt = gstAmount != null ? Number(gstAmount) : Number(((numAmount * 18) / 118).toFixed(2));
      const computedNetAmt = basePrice != null ? Number(basePrice) : Number((numAmount - computedGstAmt).toFixed(2));

      const [txResult] = await connection.query(
        `INSERT INTO partner_wallet_transactions
         (partner_id, transaction_type, category, amount, gst_percentage, gst_amount, net_amount, recharge_component, earned_component, balance_before, balance_after, description, reference_id, status)
         VALUES (?, 'RESERVATION', 'BUREAU_RESERVATION', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
        [
          partnerId,
          numAmount,
          Number(gstPercentage) || 18.00,
          computedGstAmt,
          computedNetAmt,
          rechargeAlloc,
          earnedAlloc,
          balanceBefore,
          balanceAfter,
          `${(bureau || 'Bureau').toUpperCase()} Report Reservation`,
          referenceId
        ]
      );

      if (shouldRelease) {
        await connection.commit();
        connection.release();
      }

      return {
        reservationId: txResult.insertId,
        balanceBefore,
        balanceAfter,
        amount: numAmount,
        rechargeComponent: rechargeAlloc,
        earnedComponent: earnedAlloc
      };
    } catch (err) {
      if (shouldRelease) {
        await connection.rollback();
        connection.release();
      }
      throw err;
    }
  }

  async finalizeDebit({ reservationId, partnerId, amount, bureau, referenceId, category = 'BUREAU_REPORT', basePrice = null, gstPercentage = 18.00, gstAmount = null, conn = null }) {
    const numAmount = Number(amount);
    let connection = conn;
    let shouldRelease = false;

    if (!connection) {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      shouldRelease = true;
    }

    try {
      // 1. Fetch reservation transaction to verify and retain exact components
      const [resRows] = await connection.query(
        'SELECT * FROM partner_wallet_transactions WHERE id = ? AND partner_id = ? FOR UPDATE',
        [reservationId, partnerId]
      );
      const resTx = resRows[0];

      const rechargeComponent = resTx ? Number(resTx.recharge_component || 0) : 0;
      const earnedComponent = resTx ? Number(resTx.earned_component || 0) : numAmount;

      const computedGstAmt = gstAmount != null ? Number(gstAmount) : (resTx ? Number(resTx.gst_amount) : Number(((numAmount * 18) / 118).toFixed(2)));
      const computedNetAmt = basePrice != null ? Number(basePrice) : (resTx ? Number(resTx.net_amount) : Number((numAmount - computedGstAmt).toFixed(2)));
      const desc = `${(bureau || 'Bureau').toUpperCase()} Credit Report Pull (Base: ₹${computedNetAmt.toFixed(2)} + ${gstPercentage}% GST)`;

      // 2. Mark transaction as SUCCESS DEBIT
      await connection.query(
        `UPDATE partner_wallet_transactions
         SET transaction_type = 'DEBIT', category = ?, status = 'SUCCESS',
             description = ?, gst_percentage = ?, gst_amount = ?, net_amount = ?,
             recharge_component = ?, earned_component = ?
         WHERE id = ? AND partner_id = ?`,
        [category, desc, Number(gstPercentage) || 18.00, computedGstAmt, computedNetAmt, rechargeComponent, earnedComponent, reservationId, partnerId]
      );

      // 3. Increment total_spent on wallet
      await connection.query(
        'UPDATE partner_wallets SET total_spent = total_spent + ? WHERE partner_id = ?',
        [numAmount, partnerId]
      );

      if (shouldRelease) {
        await connection.commit();
        connection.release();
      }

      return {
        transactionId: reservationId,
        status: 'SUCCESS',
        rechargeComponent,
        earnedComponent
      };
    } catch (err) {
      if (shouldRelease) {
        await connection.rollback();
        connection.release();
      }
      throw err;
    }
  }

  async releaseReservation({ reservationId, partnerId, amount, bureau, referenceId, reason, conn = null }) {
    const numAmount = Number(amount);
    let connection = conn;
    let shouldRelease = false;

    if (!connection) {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      shouldRelease = true;
    }

    try {
      // 1. Fetch reservation to restore exact source components
      const [resRows] = await connection.query(
        'SELECT * FROM partner_wallet_transactions WHERE id = ? AND partner_id = ? FOR UPDATE',
        [reservationId, partnerId]
      );
      const resTx = resRows[0];

      const rechargeRestore = resTx ? Number(resTx.recharge_component || 0) : numAmount;
      const earnedRestore = resTx ? Number(resTx.earned_component || 0) : 0;

      // 2. Lock wallet and restore balance according to exact components
      const [walletRows] = await connection.query(
        'SELECT * FROM partner_wallets WHERE partner_id = ? FOR UPDATE',
        [partnerId]
      );
      const wallet = walletRows[0];
      const balanceBefore = Number(wallet ? wallet.balance : 0);
      const currentRecharge = Number(wallet ? wallet.recharge_balance || 0 : 0);
      const currentEarned = Number(wallet ? wallet.earned_balance || 0 : 0);

      const newRecharge = Number((currentRecharge + rechargeRestore).toFixed(2));
      const newEarned = Number((currentEarned + earnedRestore).toFixed(2));
      const balanceAfter = Number((newRecharge + newEarned).toFixed(2));

      await connection.query(
        'UPDATE partner_wallets SET balance = ?, recharge_balance = ?, earned_balance = ? WHERE partner_id = ?',
        [balanceAfter, newRecharge, newEarned, partnerId]
      );

      // 3. Mark reservation as REVERTED
      await connection.query(
        `UPDATE partner_wallet_transactions
         SET status = 'REVERTED'
         WHERE id = ? AND partner_id = ?`,
        [reservationId, partnerId]
      );

      // 4. Insert audit release transaction
      const [releaseResult] = await connection.query(
        `INSERT INTO partner_wallet_transactions
         (partner_id, transaction_type, category, amount, net_amount, recharge_component, earned_component, balance_before, balance_after, description, reference_id, status)
         VALUES (?, 'RESERVATION_RELEASE', 'BUREAU_RESERVATION_RELEASE', ?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS')`,
        [partnerId, numAmount, numAmount, rechargeRestore, earnedRestore, balanceBefore, balanceAfter, reason || `${(bureau || 'Bureau').toUpperCase()} Reservation Released (Not Billed)`, referenceId]
      );

      if (shouldRelease) {
        await connection.commit();
        connection.release();
      }

      return {
        releaseId: releaseResult.insertId,
        balanceBefore,
        balanceAfter,
        rechargeRestored: rechargeRestore,
        earnedRestored: earnedRestore,
        amount: numAmount
      };
    } catch (err) {
      if (shouldRelease) {
        await connection.rollback();
        connection.release();
      }
      throw err;
    }
  }

  async markReservationReviewRequired({ reservationId, partnerId, bureau, referenceId, reason, conn = null }) {
    const runner = conn ? (sql, params) => conn.query(sql, params) : query;
    await runner(
      `UPDATE partner_wallet_transactions
       SET category = 'REVIEW_REQUIRED', description = ?
       WHERE id = ? AND partner_id = ?`,
      [reason || `${(bureau || 'Bureau').toUpperCase()} Provider Status Unknown: Review Required`, reservationId, partnerId]
    );
    return {
      reservationId,
      status: 'PENDING',
      category: 'REVIEW_REQUIRED'
    };
  }

  async getTransactions(partnerId, { limit = 50, offset = 0 } = {}) {
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

    const [rows] = await query(
      `SELECT id, partner_id, transaction_type, category, amount, gst_amount, net_amount,
              recharge_component, earned_component,
              balance_before, balance_after, description, reference_id, payment_gateway,
              status, created_at
       FROM partner_wallet_transactions
       WHERE partner_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [partnerId, safeLimit, safeOffset]
    );

    return rows.map(r => ({
      id: r.id,
      partnerId: r.partner_id,
      transactionType: r.transaction_type,
      category: r.category,
      amount: Number(r.amount),
      gstAmount: Number(r.gst_amount),
      netAmount: Number(r.net_amount),
      rechargeComponent: Number(r.recharge_component || 0),
      earnedComponent: Number(r.earned_component || 0),
      balanceBefore: Number(r.balance_before),
      balanceAfter: Number(r.balance_after),
      description: r.description,
      referenceId: r.reference_id,
      paymentGateway: r.payment_gateway,
      status: r.status,
      createdAt: r.created_at
    }));
  }

  async listAllWalletsForAdmin({ limit = 50, offset = 0 } = {}) {
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

    const [rows] = await query(
      `SELECT w.*, p.partner_code, p.full_name AS partner_name, p.mobile
       FROM partner_wallets w
       JOIN partners p ON p.id = w.partner_id
       ORDER BY w.updated_at DESC, w.id DESC
       LIMIT ? OFFSET ?`,
      [safeLimit, safeOffset]
    );

    return rows.map(r => ({
      id: r.id,
      partnerId: r.partner_id,
      partnerCode: r.partner_code,
      partnerName: r.partner_name,
      mobile: r.mobile,
      balance: Number(r.balance),
      earnedBalance: Number(r.earned_balance || 0),
      rechargeBalance: Number(r.recharge_balance || 0),
      totalRecharged: Number(r.total_recharged),
      totalSpent: Number(r.total_spent),
      updatedAt: r.updated_at
    }));
  }

  async listAllTransactionsForAdmin({ partnerId, limit = 50, offset = 0 } = {}) {
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

    let sql = `SELECT t.*, p.partner_code, p.full_name AS partner_name
               FROM partner_wallet_transactions t
               JOIN partners p ON p.id = t.partner_id
               WHERE 1=1`;
    const params = [];

    if (partnerId) {
      sql += ' AND t.partner_id = ?';
      params.push(Number(partnerId));
    }

    sql += ' ORDER BY t.created_at DESC, t.id DESC LIMIT ? OFFSET ?';
    params.push(safeLimit, safeOffset);

    const [rows] = await query(sql, params);
    return rows.map(r => ({
      id: r.id,
      partnerId: r.partner_id,
      partnerCode: r.partner_code,
      partnerName: r.partner_name,
      transactionType: r.transaction_type,
      category: r.category,
      amount: Number(r.amount),
      netAmount: Number(r.net_amount),
      rechargeComponent: Number(r.recharge_component || 0),
      earnedComponent: Number(r.earned_component || 0),
      balanceBefore: Number(r.balance_before),
      balanceAfter: Number(r.balance_after),
      description: r.description,
      referenceId: r.reference_id,
      paymentGateway: r.payment_gateway,
      status: r.status,
      createdAt: r.created_at
    }));
  }
}

module.exports = new WalletRepository();
