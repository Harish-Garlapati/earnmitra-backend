const express = require('express');
const router = express.Router();
const partnerService = require('../services/partnerService');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/support/faqs?q=payout
router.get('/faqs', async (req, res, next) => {
  try {
    const list = await partnerService.getFaqs(req.query.q);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// GET /api/support/tickets — list partner's tickets
router.get('/tickets', authenticate, async (req, res, next) => {
  try {
    const partnerId = req.user.partnerId;
    const [rows] = await query(
      `SELECT * FROM support_tickets 
       WHERE partner_id = ? 
       ORDER BY created_at DESC`,
      [partnerId]
    );
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/support/tickets — raise a new ticket
router.post('/tickets', authenticate, async (req, res, next) => {
  try {
    const { subject, department = 'Operations', description, category, leadId, priority = 'Normal' } = req.body;

    if (!subject || !String(subject).trim()) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const partnerId = req.user.partnerId;
    let partnerName = 'Earnmitra Partner';

    if (partnerId) {
      const [pRows] = await query('SELECT full_name FROM partners WHERE id = ?', [partnerId]);
      if (pRows.length > 0) partnerName = pRows[0].full_name;
    }

    // Generate unique sequential ticket code
    const ticketSeq = Date.now().toString().slice(-4) + Math.floor(10 + Math.random() * 90);
    const ticketNumber = `TKT-${ticketSeq}`;

    const fullDesc = description || (category ? `Category: ${category}${leadId ? ` | Related Lead: #${leadId}` : ''}` : subject);

    const [result] = await query(
      `INSERT INTO support_tickets (
        ticket_number, partner_id, partner_name, subject, department, status, priority, description
      ) VALUES (?, ?, ?, ?, ?, 'Open', ?, ?)`,
      [ticketNumber, partnerId, partnerName, subject.trim(), department, priority, fullDesc]
    );

    const [created] = await query('SELECT * FROM support_tickets WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      ticket: created[0],
      ticketNumber: created[0].ticket_number,
      message: 'Support ticket raised successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
