const express = require('express');
const router = express.Router();
const payoutService = require('../services/payoutService');
const { optionalAuth } = require('../middleware/authMiddleware');

// GET /api/payouts — balances + transaction history from MariaDB
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const partnerId = req.user ? req.user.partnerId : 1;
    const data = await payoutService.getPayoutData(partnerId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/payouts — request a payout
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const partnerId = req.user ? req.user.partnerId : 1;
    const { amount, bank } = req.body;
    const result = await payoutService.requestPayout(amount, bank, partnerId);
    res.status(201).json(result);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;
