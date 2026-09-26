const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { query, pool } = require('../config/db');
const leadService = require('../services/leadService');

/**
 * POST /api/direct-booking/validate
 * Validates a booking code for the authenticated partner.
 */
router.post('/validate', authenticate, async (req, res, next) => {
  try {
    const partnerId = req.user.partnerId;
    const { code, leadId } = req.body;

    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode) {
      return res.status(400).json({ error: 'Please enter a booking code to validate' });
    }

    let sql = 'SELECT * FROM direct_booking_codes WHERE UPPER(code) = UPPER(?) AND partner_id = ? LIMIT 1';
    let params = [cleanCode, partnerId];

    const [codes] = await query(sql, params);
    if (!codes || codes.length === 0) {
      return res.status(400).json({ error: 'Invalid or unrecognized booking code. Please check and try again.' });
    }

    const bookingRecord = codes[0];

    // If specific leadId provided, verify it matches
    if (leadId) {
      const lead = await leadService.getLeadById(leadId, partnerId, 'partner');
      if (!lead || lead.forbidden || (lead.dbId !== bookingRecord.lead_id && lead.leadCode !== leadId)) {
        return res.status(400).json({ error: 'Booking code does not match the current lead record' });
      }
    }

    // Mark booking code as validated
    await query(
      'UPDATE direct_booking_codes SET is_validated = 1, validated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [bookingRecord.id]
    );

    // Fetch lead details
    const lead = await leadService.getLeadById(bookingRecord.lead_id, partnerId, 'partner');

    // Fetch eligible active loan lenders for this specific loan product
    const loanType = lead?.loanType || 'Personal Loan';
    const isLoanLead = !lead || lead.productCategory === 'Loans';
    
    let lendersSql = `
      SELECT l.id, l.name, l.category, l.code, l.is_active 
      FROM lenders l 
      ${isLoanLead ? 'JOIN lender_product_mappings lpm ON lpm.lender_id = l.id AND lpm.loan_type = ? AND lpm.is_active = 1' : ''}
      WHERE l.is_active = 1 
        ${isLoanLead ? "AND l.category NOT IN ('General Insurance', 'Health Insurance', 'Life Insurance', 'Insurance')" : ""}
        AND EXISTS (
          SELECT 1 FROM lender_contacts lc 
          WHERE lc.lender_id = l.id AND lc.is_active = 1
        )
      ORDER BY CASE 
        WHEN l.code = 'HDFC' THEN 1
        WHEN l.code = 'ICICI' THEN 2
        WHEN l.code = 'AXIS' THEN 3
        WHEN l.code = 'SBI' THEN 4
        WHEN l.code = 'BAJAJ' THEN 5
        ELSE 6 END, l.name ASC
    `;
    const lendersParams = isLoanLead ? [loanType] : [];
    const [lenders] = await query(lendersSql, lendersParams);

    res.json({
      success: true,
      message: lenders.length > 0 ? 'Booking code validated successfully!' : 'No lenders currently configured for this product.',
      code: bookingRecord.code,
      lead,
      lenders: lenders.map(l => ({
        id: l.id,
        name: l.name,
        code: l.code,
        category: l.category,
        product: loanType
      }))
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/direct-booking/:leadId/lenders
 * Returns eligible active lenders for a lead.
 */
router.get('/:leadId/lenders', authenticate, async (req, res, next) => {
  try {
    const partnerId = req.user.partnerId;
    const lead = await leadService.getLeadById(req.params.leadId, partnerId, 'partner');
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    if (lead.forbidden) return res.status(403).json({ error: 'Access denied: You do not own this lead record' });

    const loanType = lead.loanType || 'Personal Loan';
    const isLoanLead = !lead.productCategory || lead.productCategory === 'Loans';
    
    let lendersSql = `
      SELECT l.id, l.name, l.category, l.code, l.is_active 
      FROM lenders l 
      ${isLoanLead ? 'JOIN lender_product_mappings lpm ON lpm.lender_id = l.id AND lpm.loan_type = ? AND lpm.is_active = 1' : ''}
      WHERE l.is_active = 1 
        ${isLoanLead ? "AND l.category NOT IN ('General Insurance', 'Health Insurance', 'Life Insurance', 'Insurance')" : ""}
        AND EXISTS (
          SELECT 1 FROM lender_contacts lc 
          WHERE lc.lender_id = l.id AND lc.is_active = 1
        )
      ORDER BY CASE 
        WHEN l.code = 'HDFC' THEN 1
        WHEN l.code = 'ICICI' THEN 2
        WHEN l.code = 'AXIS' THEN 3
        WHEN l.code = 'SBI' THEN 4
        WHEN l.code = 'BAJAJ' THEN 5
        ELSE 6 END, l.name ASC
    `;
    const lendersParams = isLoanLead ? [loanType] : [];
    const [lenders] = await query(lendersSql, lendersParams);

    res.json({
      success: true,
      lead,
      lenders: lenders.map(l => ({
        id: l.id,
        name: l.name,
        code: l.code,
        category: l.category,
        product: lead.loanType
      }))
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/direct-booking/:leadId/select-lenders
 * Submits partner's selected lenders and retrieves verified lender support contacts.
 */
router.post('/:leadId/select-lenders', authenticate, async (req, res, next) => {
  try {
    const partnerId = req.user.partnerId;
    const { lenderIds, bookingCode } = req.body;

    if (!Array.isArray(lenderIds) || lenderIds.length === 0) {
      return res.status(400).json({ error: 'Please select at least one lender' });
    }

    const lead = await leadService.getLeadById(req.params.leadId, partnerId, 'partner');
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    if (lead.forbidden) return res.status(403).json({ error: 'Access denied: You do not own this lead record' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      for (const lenderId of lenderIds) {
        await conn.query(
          `INSERT INTO direct_booking_lender_selections (lead_id, partner_id, lender_id, status)
           VALUES (?, ?, ?, 'Shared')
           ON DUPLICATE KEY UPDATE status = 'Shared', created_at = CURRENT_TIMESTAMP`,
          [lead.dbId, partnerId, lenderId]
        );
      }

      // Fetch lender names for history note
      const [chosenLenders] = await conn.query(
        `SELECT id, name FROM lenders WHERE id IN (?)`,
        [lenderIds]
      );
      const lenderNames = chosenLenders.map(l => l.name).join(', ');

      // Record lead history
      await conn.query(
        `INSERT INTO lead_status_history (lead_id, status, stage, note) VALUES (?, ?, ?, ?)`,
        [
          lead.dbId,
          'In Progress',
          'Sent to lender',
          `Direct Booking: Shared with lenders (${lenderNames})`
        ]
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    // Fetch verified contacts for the selected lenders
    const [contactRows] = await query(
      `SELECT lc.*, l.name as lender_name, l.code as lender_code
       FROM lenders l
       LEFT JOIN lender_contacts lc ON lc.lender_id = l.id AND lc.is_active = 1
       WHERE l.id IN (?)
       ORDER BY l.name ASC`,
      [lenderIds]
    );

    const lenderContacts = contactRows.map(row => ({
      lenderId: row.lender_id,
      lenderName: row.lender_name,
      lenderCode: row.lender_code,
      department: row.department || 'Partner Support Desk',
      contactPerson: row.contact_person || 'Relationship Desk',
      designation: row.designation || 'Partner Support Desk',
      phone: row.phone || null,
      email: row.email || null,
      hasContact: Boolean(row.phone || row.email)
    }));

    res.json({
      success: true,
      message: 'Lead sent to selected lenders successfully!',
      selectedLenders: lenderContacts
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
