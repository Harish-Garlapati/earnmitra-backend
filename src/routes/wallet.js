const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const walletService = require('../services/walletService');

const router = express.Router();

// Require authenticated partner
router.use(authenticate, (req, res, next) => {
  if (!req.user.partnerId || req.user.actorType !== 'partner') {
    return res.status(403).json({ error: 'Partner access required', code: 'PARTNER_REQUIRED' });
  }
  next();
});

/**
 * GET /api/wallet
 * Returns wallet balance, total recharged, and total spent for current partner
 */
router.get('/', async (req, res, next) => {
  try {
    const wallet = await walletService.getWallet(req.user.partnerId);
    res.json({
      success: true,
      wallet
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/wallet/pricing
 * Returns active bureau report prices and GST info
 */
router.get('/pricing', async (req, res, next) => {
  try {
    const pricing = await walletService.getPricing();
    res.json({
      success: true,
      pricing
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/wallet/transactions
 * Returns paginated wallet transactions for current partner
 */
router.get('/transactions', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const transactions = await walletService.getTransactions(req.user.partnerId, { limit, offset });
    res.json({
      success: true,
      transactions,
      limit,
      offset
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/wallet/recharge/order
 * Creates a Cashfree payment order for wallet recharge
 */
router.post('/recharge/order', async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    if (!amount || Number(amount) < 10) {
      return res.status(400).json({
        error: 'Minimum recharge amount is ₹10',
        code: 'INVALID_AMOUNT'
      });
    }

    const order = await walletService.createRechargeOrder(req.user.partnerId, {
      amount: Number(amount),
      description
    });

    res.json({
      success: true,
      order
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/wallet/winway/order
 * Creates an official Winway payment gateway order for wallet recharge
 */
router.post('/winway/order', async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    if (!amount || Number(amount) < 10) {
      return res.status(400).json({
        error: 'Minimum recharge amount is ₹10',
        code: 'INVALID_AMOUNT'
      });
    }

    const order = await walletService.createWinwayRechargeOrder(req.user.partnerId, {
      amount: Number(amount),
      description: description || 'Earnmitra Wallet Recharge via Winway'
    });

    res.json({
      success: true,
      order
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/wallet/winway/verify
 * Verifies Winway payment signature and atomically credits wallet
 */
router.post('/winway/verify', async (req, res, next) => {
  try {
    const { orderId, winwayPaymentId, winwaySignature } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required', code: 'MISSING_ORDER_ID' });
    }

    const result = await walletService.verifyWinwayRechargePayment(req.user.partnerId, orderId, {
      winwayPaymentId,
      winwaySignature
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
