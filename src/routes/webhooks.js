const express = require('express');
const walletService = require('../services/walletService');

const router = express.Router();

/**
 * POST /api/webhooks/cashfree
 * Handles Cashfree payment webhooks with HMAC-SHA256 signature verification and idempotent crediting.
 */
router.post('/cashfree', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'] || req.headers['X-Webhook-Signature'];
    const timestamp = req.headers['x-webhook-timestamp'] || req.headers['X-Webhook-Timestamp'];

    if (!signature || !timestamp) {
      console.warn('[Webhook:Cashfree] Missing signature or timestamp headers');
      return res.status(400).json({ error: 'Missing webhook signature or timestamp headers' });
    }

    const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    const result = await walletService.handleCashfreeWebhook(rawBody, signature, timestamp);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[Webhook:Cashfree] Error handling webhook:', err.message);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
});

module.exports = router;
