/**
 * Razorpay / Winway Payment Gateway Adapter
 * Handles order creation, payment signature verification, and webhook verification.
 * Adapted from MyLoanCRM controllers/walletController.js & subscriptionController.js
 */

const crypto = require('crypto');

class RazorpayPaymentProvider {
  constructor() {
    this.name = 'razorpay';
  }

  isConfigured() {
    return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET);
  }

  async createOrder({ orderId, amount, partner = {}, description }) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_SECRET;

    if (!keyId || !keySecret) {
      const err = new Error('Razorpay payment gateway is not configured.');
      err.code = 'GATEWAY_NOT_CONFIGURED';
      err.status = 503;
      throw err;
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const payload = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: String(orderId).slice(0, 40),
      payment_capture: 1,
      notes: {
        partner_id: String(partner.id || partner.partnerId || '0'),
        partner_name: String(partner.fullName || partner.name || 'Earnmitra Partner').slice(0, 50),
        mobile: String(partner.mobile || '').replace(/\D/g, '').slice(-10),
        description: description || 'Earnmitra Wallet Recharge'
      }
    };

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    });

    let json = {};
    try {
      json = await response.json();
    } catch {}

    if (!response.ok) {
      const err = new Error(json.error?.description || json.message || 'Failed to create Razorpay order');
      err.status = response.status;
      err.details = json;
      throw err;
    }

    return {
      orderId,
      gatewayOrderId: json.id,
      razorpayOrderId: json.id,
      amount: Number(amount),
      currency: 'INR',
      keyId,
      raw: json
    };
  }

  verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const keySecret = process.env.RAZORPAY_SECRET;
    if (!keySecret || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    try {
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(razorpaySignature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
    } catch {
      return false;
    }
  }

  verifyWebhookSignature(rawBody, signature) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret || !signature || !rawBody) return false;

    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
    } catch {
      return false;
    }
  }
}

module.exports = new RazorpayPaymentProvider();
