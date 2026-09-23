const express = require('express');
const router = express.Router();
const leadService = require('../services/leadService');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/leads?status=In+Progress&limit=50&offset=0&page=1
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, limit, offset, page } = req.query;
    const partnerId = req.user.partnerId;
    const list = await leadService.listLeads({ status, partnerId, limit, offset, page });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/documents/checklist — checklist for the upload screen
// Keep this route before /:id so "documents" is not mistaken for a lead id.
router.get('/documents/checklist', authenticate, (req, res) => {
  res.json(leadService.getDocumentChecklist());
});

// GET /api/leads/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const partnerId = req.user.partnerId;
    const role = req.user.role;

    const lead = await leadService.getLeadById(req.params.id, partnerId, role);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    if (lead.forbidden) {
      return res.status(403).json({ error: 'Access denied: You do not own this lead record' });
    }
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

// POST /api/leads — create from the lead flow
router.post('/', authenticate, async (req, res, next) => {
  try {
    const partnerId = req.user.partnerId;
    const lead = await leadService.createLead(req.body, partnerId);
    res.status(201).json(lead);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});

// POST /api/leads/:id/documents — mark doc uploaded
router.post('/:id/documents', authenticate, async (req, res, next) => {
  const ownedLead = await leadService.getLeadById(req.params.id, req.user.partnerId, 'partner');
  if (!ownedLead) return res.status(404).json({ error: 'Lead not found' });
  if (ownedLead.forbidden) return res.status(403).json({ error: 'Access denied: You do not own this lead record' });
  const { name, uploaded } = req.body;
  const docs = leadService.getDocumentChecklist();
  const doc = docs.find(d => d.name === name);
  if (!doc) return res.status(404).json({ error: 'Unknown document type' });
  doc.uploaded = !!uploaded;
  res.json(doc);
});

module.exports = router;
