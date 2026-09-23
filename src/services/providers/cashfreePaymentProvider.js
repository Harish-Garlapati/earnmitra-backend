/**
 * Cashfree Payment Gateway Adapter
 * Handles order creation, payment status checks, and webhook verification.
 * Adapted from MyLoanCRM controllers/walletController.js
 */

const crypto = require('crypto');

class CashfreePaymentProvider {
  constructor() {
    this.name = 'cashfree';
  }

  getBaseUrl() {
    const raw = process.env.CASHFREE_BASE_URL || 'https://sandbox.cashfree.com/pg';
    // Ensure /pg suffix is handled properly
    return raw.replace(/\/+$/, '').endsWith('/pg') ? raw.replace(/\/+$/, '') : `${raw.replace(/\/+$/, '')}/pg`;
  }

  isConfigured() {
    return Boolean(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET);
  }

  async createOrder({ orderId, amount, partner, description, notifyUrl }) {
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    const baseUrl = this.getBaseUrl();

    if (!clientId || !clientSecret) {
      const err = new Error('Cashfree payment gateway is not configured.');
      err.code = 'GATEWAY_NOT_CONFIGURED';
      err.status = 503;
      throw err;
    }

    const payload = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: String(partner.id || partner.partnerId || '0'),
        customer_name: String(partner.fullName || partner.name || 'Earnmitra Partner').slice(0, 100),
        customer_phone: String(partner.mobile || '9999999999').replace(/\D/g, '').slice(-10),
        customer_email: String(partner.email || 'partner@earnmitra.in')
      },
      order_meta: {
        notify_url: notifyUrl || process.env.CASHFREE_WALLET_NOTIFY_URL || 'https://earnmitra.in/api/webhooks/cashfree',
        return_url: process.env.CASHFREE_RETURN_URL || 'https://earnmitra.in/wallet'
      },
      order_note: description || 'Earnmitra Wallet Recharge'
    };

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': clientId,
        'x-client-secret': clientSecret
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    });

    let json = {};
    try {
      json = await response.json();
    } catch {}

    if (!response.ok) {
      const err = new Error(json.message || 'Failed to create Cashfree order');
      err.status = response.status;
      err.details = json;
      throw err;
    }

    return {
      orderId: json.order_id || orderId,
      cfOrderId: json.cf_order_id,
      paymentSessionId: json.payment_session_id,
      orderStatus: json.order_status,
      orderAmount: json.order_amount,
      orderCurrency: json.order_currency,
      raw: json
    };
  }

  verifyWebhookSignature(rawBody, signature, timestamp) {
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    if (!clientSecret || !signature || !timestamp) return false;

    try {
      const expectedSignature = crypto
        .createHmac('sha256', clientSecret)
        .update(String(timestamp) + String(rawBody))
        .digest('base64');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
    } catch (e) {
      return false;
    }
  }

  async getOrderPayments(orderId) {
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    const baseUrl = this.getBaseUrl();

    if (!clientId || !clientSecret) throw new Error('Cashfree not configured');

    const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, {
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': clientId,
        'x-client-secret': clientSecret
      },
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) return [];
    try {
      return await response.json();
    } catch {
      return [];
    }
  }
}

module.exports = new CashfreePaymentProvider();
