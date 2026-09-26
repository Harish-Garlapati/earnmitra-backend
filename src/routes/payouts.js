const express = require('express');
const router = express.Router();
const payoutService = require('../services/payoutService');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/payouts — balances + transaction history from MariaDB
router.get('/', authenticate, async (req, res, next) => {
  try {
    const partnerId = req.user.partnerId;
    const data = await payoutService.getPayoutData(partnerId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/payouts — request a payout
router.post('/', authenticate, async (req, res, next) => {
  try {
    const partnerId = req.user.partnerId;
    const { amount, bank, sourceBalance } = req.body;
    const result = await payoutService.requestPayout(amount, bank, partnerId, sourceBalance);
    res.status(201).json(result);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;
