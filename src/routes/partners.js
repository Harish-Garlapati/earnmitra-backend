const express = require('express');
const router = express.Router();
const partnerService = require('../services/partnerService');
const leadService = require('../services/leadService');
const { optionalAuth, authenticate } = require('../middleware/authMiddleware');

// Helper to determine active partner ID or code
function getActivePartnerIdentifier(req) {
  if (req.user && req.user.partnerId) {
    return req.user.partnerId;
  }
  return 'P-1001';
}

// GET /api/partners/me (and alias /api/partners/current)
const getMe = async (req, res, next) => {
  try {
    const identifier = getActivePartnerIdentifier(req);
    const partner = await partnerService.getCurrentPartner(identifier);
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    res.json(partner);
  } catch (err) {
    next(err);
  }
};
router.get('/me', optionalAuth, getMe);
router.get('/current', optionalAuth, getMe);

// Canonical partner summary endpoint:
// GET /api/partners/me/summary (and alias /api/partners/current/summary)
const getSummary = async (req, res, next) => {
  try {
    const identifier = getActivePartnerIdentifier(req);
    const summary = await partnerService.getSummary(identifier);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};
router.get('/me/summary', optionalAuth, getSummary);
router.get('/current/summary', optionalAuth, getSummary);

// GET /api/partners/me/dashboard (full dashboard data: partner + earnings + counts + recent leads from MariaDB)
router.get(['/me/dashboard', '/current/dashboard'], optionalAuth, async (req, res, next) => {
  try {
    const identifier = getActivePartnerIdentifier(req);
    const partner = await partnerService.getCurrentPartner(identifier);
    const summary = await partnerService.getSummary(identifier);
    const partnerId = partner ? partner.dbId : undefined;
    const allLeads = await leadService.listLeads({ partnerId });
    res.json({
      partner,
      earnings: summary.earnings,
      counts: summary.counts,
      recentLeads: allLeads.slice(0, 5)
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/partners/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, mobile, type, state } = req.body;
    if (!name || !mobile || !type || !state) {
      return res.status(400).json({ error: 'name, mobile, type and state are required' });
    }
    const created = await partnerService.registerPartner(req.body);
    res.status(201).json({ partner: created });
  } catch (err) {
    next(err);
  }
});

// GET /api/partners/meta  (dropdown options for registration + lead forms)
router.get('/meta', async (req, res, next) => {
  try {
    const meta = await partnerService.getMeta();
    res.json(meta);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
