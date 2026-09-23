const crypto = require('crypto');
const walletRepo = require('../repositories/walletRepository');
const partnerRepo = require('../repositories/partnerRepository');
const cashfreeProvider = require('./providers/cashfreePaymentProvider');
const notificationService = require('./notificationService');
const audit = require('./partnerAuditService');
const { pool } = require('../config/db');

class WalletService {
  async getWallet(partnerId) {
    const wallet = await walletRepo.getOrCreateWallet(partnerId);
    const balance = Number(wallet.balance);
    const earnedBalance = Number(wallet.earned_balance || 0);
    const rechargeBalance = Number(wallet.recharge_balance || 0);
    return {
      partnerId: wallet.partner_id,
      balance,
      availableBalance: balance,
      earnedBalance,
      rechargeBalance,
      withdrawableBalance: earnedBalance,
      totalRecharged: Number(wallet.total_recharged),
      totalSpent: Number(wallet.total_spent),
      updatedAt: wallet.updated_at
    };
  }

  async creditCommission({ partnerId, amount, earningId, description, leadId = null, conn = null }) {
    return walletRepo.creditCommission({ partnerId, amount, earningId, description, leadId, conn });
  }

  async debitPayout({ partnerId, amount, referenceId, description = null, conn = null }) {
    return walletRepo.debitPayout({ partnerId, amount, referenceId, description, conn });
  }

  async refundPayout({ partnerId, amount, referenceId, reason = null, conn = null }) {
    return walletRepo.refundPayout({ partnerId, amount, referenceId, reason, conn });
  }

  async getPricing() {
    return walletRepo.getBureauPricing();
  }

  async getBureauPrice(bureau) {
    return walletRepo.getBureauPrice(bureau);
  }

  async createRechargeOrder(partnerId, { amount, description }) {
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount < 10) {
      const err = new Error('Recharge amount must be at least ₹10');
      err.status = 400;
      throw err;
    }

    const partner = await partnerRepo.findById(partnerId);
    if (!partner) {
      const err = new Error('Partner not found');
      err.status = 404;
      throw err;
    }

    const orderId = `WAL_${partnerId}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const gateway = process.env.PAYMENT_GATEWAY || 'CASHFREE';

    let orderResult;
    if (gateway === 'CASHFREE') {
      orderResult = await cashfreeProvider.createOrder({
        orderId,
        amount: numAmount,
        partner,
        description: description || 'Earnmitra Partner Wallet Recharge'
      });
    } else {
      const err = new Error(`Payment gateway ${gateway} not supported for checkout`);
      err.status = 500;
      throw err;
    }

    await walletRepo.createPaymentOrder({
      orderId,
      partnerId,
      amount: numAmount,
      gateway,
      paymentSessionId: orderResult.paymentSessionId,
      gatewayOrderId: orderResult.cfOrderId || orderId
    });

    return {
      orderId,
      gateway,
      amount: numAmount,
      currency: 'INR',
      paymentSessionId: orderResult.paymentSessionId,
      cfOrderId: orderResult.cfOrderId
    };
  }

  async handleCashfreeWebhook(rawBody, signature, timestamp) {
    const isValid = cashfreeProvider.verifyWebhookSignature(rawBody, signature, timestamp);
    if (!isValid) {
      const err = new Error('Invalid Cashfree webhook signature');
      err.status = 400;
      throw err;
    }

    let event;
    try {
      event = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf8'));
    } catch (e) {
      const err = new Error('Malformed webhook payload');
      err.status = 400;
      throw err;
    }

    const data = event.data || {};
    const order = data.order || {};
    const payment = data.payment || {};

    const orderId = order.order_id;
    const paymentId = payment.cf_payment_id ? String(payment.cf_payment_id) : null;
    const paymentStatus = payment.payment_status || order.order_status;

    if (!orderId) {
      return { success: true, message: 'No order ID in event' };
    }

    const paymentOrder = await walletRepo.findPaymentOrder(orderId);
    if (!paymentOrder) {
      return { success: true, message: 'Unrecognized order' };
    }

    // Idempotency: If already paid, return immediately without duplicate credit
    if (paymentOrder.status === 'PAID') {
      return { success: true, message: 'Order already processed and paid' };
    }

    const isSuccess = paymentStatus === 'SUCCESS' || paymentStatus === 'PAID';
    if (!isSuccess) {
      return { success: true, message: `Payment status is ${paymentStatus}` };
    }

    // Atomic transaction for payment order update + wallet credit
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Re-verify order row FOR UPDATE inside transaction
      const [orderRows] = await conn.query(
        'SELECT * FROM payment_orders WHERE order_id = ? FOR UPDATE',
        [orderId]
      );

      const currentOrder = orderRows[0];
      if (!currentOrder || currentOrder.status === 'PAID') {
        await conn.rollback();
        conn.release();
        return { success: true, message: 'Order already processed' };
      }

      await walletRepo.markPaymentOrderPaid({
        orderId,
        paymentId,
        rawWebhook: event,
        conn
      });

      const creditResult = await walletRepo.creditWallet({
        partnerId: currentOrder.partner_id,
        amount: currentOrder.amount,
        description: `Wallet Recharge (Order ${orderId})`,
        referenceId: orderId,
        gateway: 'CASHFREE',
        conn
      });

      await conn.commit();
      conn.release();

      // Emit notification & audit log outside transaction
      await notificationService.createNotification(
        currentOrder.partner_id,
        'wallet',
        'Wallet Recharge Successful',
        `Your wallet was credited with ₹${currentOrder.amount}. New balance: ₹${creditResult.balanceAfter}.`,
        { orderId, amount: currentOrder.amount, balance: creditResult.balanceAfter }
      );

      await audit.log(
        currentOrder.partner_id,
        'wallet.recharge_success',
        'payment_order',
        orderId,
        { amount: currentOrder.amount, balanceAfter: creditResult.balanceAfter }
      );

      return {
        success: true,
        message: 'Wallet credited successfully',
        balance: creditResult.balanceAfter
      };
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  }

  async verifyRechargePayment(partnerId, orderId) {
    const paymentOrder = await walletRepo.findPaymentOrder(orderId);
    if (!paymentOrder) {
      const err = new Error('Payment order not found');
      err.status = 404;
      throw err;
    }

    if (paymentOrder.partner_id !== partnerId) {
      const err = new Error('Unauthorized: Order belongs to another partner');
      err.status = 403;
      throw err;
    }

    if (paymentOrder.status === 'PAID') {
      const wallet = await walletRepo.getOrCreateWallet(partnerId);
      return {
        status: 'PAID',
        orderId,
        balance: Number(wallet.balance)
      };
    }

    // Direct Cashfree server-to-server check
    if (paymentOrder.payment_gateway === 'CASHFREE') {
      const payments = await cashfreeProvider.getOrderPayments(orderId);
      const successfulPayment = Array.isArray(payments)
        ? payments.find(p => p.payment_status === 'SUCCESS')
        : null;

      if (successfulPayment) {
        const fakeWebhookBody = JSON.stringify({
          data: {
            order: { order_id: orderId, order_status: 'PAID' },
            payment: successfulPayment
          }
        });

        // Trigger safe atomic processing
        const conn = await pool.getConnection();
        await conn.beginTransaction();
        try {
          const [orderRows] = await conn.query(
            'SELECT * FROM payment_orders WHERE order_id = ? FOR UPDATE',
            [orderId]
          );

          if (orderRows[0]?.status !== 'PAID') {
            await walletRepo.markPaymentOrderPaid({
              orderId,
              paymentId: String(successfulPayment.cf_payment_id),
              rawWebhook: successfulPayment,
              conn
            });

            await walletRepo.creditWallet({
              partnerId,
              amount: paymentOrder.amount,
              description: `Wallet Recharge (Order ${orderId})`,
              referenceId: orderId,
              gateway: 'CASHFREE',
              conn
            });
          }

          await conn.commit();
          conn.release();
        } catch (e) {
          await conn.rollback();
          conn.release();
          throw e;
        }
      }
    }

    const wallet = await walletRepo.getOrCreateWallet(partnerId);
    const updatedOrder = await walletRepo.findPaymentOrder(orderId);

    return {
      status: updatedOrder.status,
      orderId,
      balance: Number(wallet.balance)
    };
  }

  async chargeBureauReport(partnerId, bureau) {
    const priceInfo = await walletRepo.getBureauPrice(bureau);
    if (!priceInfo || !priceInfo.isConfigured) {
      const err = new Error('Bureau pricing is not configured. Bureau inquiries are currently blocked.');
      err.code = 'PRICING_NOT_CONFIGURED';
      err.status = 400;
      throw err;
    }

    const debitResult = await walletRepo.debitWallet({
      partnerId,
      amount: priceInfo.totalPrice,
      category: `${bureau.toUpperCase()}_REPORT`,
      description: `${bureau.toUpperCase()} Credit Report Pull (₹${priceInfo.basePrice} + ${priceInfo.gstPercentage}% GST)`,
      referenceId: `${bureau.toUpperCase()}-${Date.now()}`
    });

    return {
      referenceId: debitResult.transactionId,
      chargedAmount: priceInfo.totalPrice,
      balanceAfter: debitResult.balanceAfter
    };
  }

  async reserveBureauReport(partnerId, bureau, referenceId) {
    const priceInfo = await walletRepo.getBureauPrice(bureau);
    if (!priceInfo || !priceInfo.isConfigured) {
      const err = new Error('Bureau pricing is not configured. Bureau inquiries are currently blocked.');
      err.code = 'PRICING_NOT_CONFIGURED';
      err.status = 400;
      throw err;
    }

    const reservationResult = await walletRepo.reserveWallet({
      partnerId,
      amount: priceInfo.totalPrice,
      bureau,
      referenceId,
      basePrice: priceInfo.basePrice,
      gstPercentage: priceInfo.gstPercentage,
      gstAmount: priceInfo.gstAmount
    });

    return {
      reservationId: reservationResult.reservationId,
      amount: priceInfo.totalPrice,
      balanceBefore: reservationResult.balanceBefore,
      balanceAfter: reservationResult.balanceAfter,
      priceInfo
    };
  }

  async finalizeBureauDebit(partnerId, reservationId, bureau, referenceId, category = 'BUREAU_REPORT') {
    const priceInfo = await walletRepo.getBureauPrice(bureau);
    const amount = priceInfo ? priceInfo.totalPrice : 0;
    return walletRepo.finalizeDebit({
      reservationId,
      partnerId,
      amount,
      bureau,
      referenceId,
      category,
      basePrice: priceInfo ? priceInfo.basePrice : null,
      gstPercentage: priceInfo ? priceInfo.gstPercentage : 18.00,
      gstAmount: priceInfo ? priceInfo.gstAmount : null
    });
  }

  async releaseBureauReservation(partnerId, reservationId, bureau, referenceId, reason) {
    const priceInfo = await walletRepo.getBureauPrice(bureau);
    const amount = priceInfo ? priceInfo.totalPrice : 0;
    return walletRepo.releaseReservation({
      reservationId,
      partnerId,
      amount,
      bureau,
      referenceId,
      reason
    });
  }

  async markBureauReservationReviewRequired(partnerId, reservationId, bureau, referenceId, reason) {
    return walletRepo.markReservationReviewRequired({
      reservationId,
      partnerId,
      bureau,
      referenceId,
      reason
    });
  }

  async refundBureauReport(partnerId, referenceId, bureau, reason) {
    const priceInfo = await walletRepo.getBureauPrice(bureau);
    if (!priceInfo || !priceInfo.isConfigured) {
      const err = new Error('Bureau pricing is not configured. Bureau inquiries are currently blocked.');
      err.code = 'PRICING_NOT_CONFIGURED';
      err.status = 400;
      throw err;
    }
    const refundAmount = priceInfo.totalPrice;

    const refundResult = await walletRepo.refundWallet({
      partnerId,
      amount: refundAmount,
      category: 'REPORT_FAILURE_REFUND',
      description: `Refund: ${bureau.toUpperCase()} report failed (${reason || 'Provider error'})`,
      referenceId: String(referenceId)
    });

    await notificationService.createNotification(
      partnerId,
      'wallet',
      'Wallet Refund Processed',
      `₹${refundAmount} has been refunded to your wallet for failed ${bureau.toUpperCase()} report.`,
      { referenceId, refundAmount, balance: refundResult.balanceAfter }
    );

    return refundResult;
  }

  async getTransactions(partnerId, options) {
    return walletRepo.getTransactions(partnerId, options);
  }

  async listWalletsAdmin(options) {
    return walletRepo.listAllWalletsForAdmin(options);
  }

  async listTransactionsAdmin(options) {
    return walletRepo.listAllTransactionsForAdmin(options);
  }
}

module.exports = new WalletService();

