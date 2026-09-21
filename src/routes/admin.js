const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin, requirePermission } = require('../middleware/adminMiddleware');
const { query } = require('../config/db');
const adminRepo = require('../repositories/adminRepository');
const auditService = require('../services/auditService');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const cibilReportRepo = require('../repositories/cibilReportRepository');

router.use(authenticate, requireAdmin);

router.get('/cibil-reports', requirePermission('reports.view'), async (req, res, next) => {
  try { res.json({ data: await cibilReportRepo.listForAdmin({ partnerId: req.query.partnerId }) }); } catch (error) { next(error); }
});

router.get('/cibil-reports/:id', requirePermission('reports.view'), async (req, res, next) => {
  try {
    const report = await cibilReportRepo.findForAdmin(req.params.id);
    if (!report) return res.status(404).json({ error: 'CIBIL report not found', code: 'REPORT_NOT_FOUND' });
    res.json(report);
  } catch (error) { next(error); }
});

// Dashboard
router.get('/dashboard/stats', requirePermission('dashboard.view'), async (req, res, next) => {
  try {
    const stats = await adminRepo.getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Leads
router.get('/leads', requirePermission('leads.view'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;
    
    let sql = `SELECT l.*, p.partner_code, p.full_name as partner_name FROM leads l LEFT JOIN partners p ON l.partner_id = p.id WHERE 1=1`;
    const params = [];
    let countSql = `SELECT COUNT(*) as total FROM leads l LEFT JOIN partners p ON l.partner_id = p.id WHERE 1=1`;
    const countParams = [];

    if (req.query.status) { sql += ` AND l.status = ?`; params.push(req.query.status); countSql += ` AND l.status = ?`; countParams.push(req.query.status); }
    if (req.query.partnerId) { sql += ` AND l.partner_id = ?`; params.push(req.query.partnerId); countSql += ` AND l.partner_id = ?`; countParams.push(req.query.partnerId); }
    if (req.query.productCategory) { sql += ` AND l.product_category = ?`; params.push(req.query.productCategory); countSql += ` AND l.product_category = ?`; countParams.push(req.query.productCategory); }
    if (req.query.city) { sql += ` AND l.city = ?`; params.push(req.query.city); countSql += ` AND l.city = ?`; countParams.push(req.query.city); }
    if (req.query.search) { 
      sql += ` AND (l.lead_code LIKE ? OR l.applicant_name LIKE ? OR l.business_name LIKE ? OR l.mobile LIKE ? OR p.partner_code LIKE ? OR p.full_name LIKE ?)`; 
      const searchStr = `%${req.query.search}%`;
      params.push(searchStr, searchStr, searchStr, searchStr, searchStr, searchStr); 
      countSql += ` AND (l.lead_code LIKE ? OR l.applicant_name LIKE ? OR l.business_name LIKE ? OR l.mobile LIKE ? OR p.partner_code LIKE ? OR p.full_name LIKE ?)`; 
      countParams.push(searchStr, searchStr, searchStr, searchStr, searchStr, searchStr); 
    }
    if (req.query.dateFrom) { sql += ` AND l.created_at >= ?`; params.push(req.query.dateFrom); countSql += ` AND l.created_at >= ?`; countParams.push(req.query.dateFrom); }
    if (req.query.dateTo) { sql += ` AND l.created_at <= ?`; params.push(req.query.dateTo); countSql += ` AND l.created_at <= ?`; countParams.push(req.query.dateTo); }

    sql += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [countRows] = await query(countSql, countParams);
    const [rows] = await query(sql, params);

    res.json({ data: rows, total: countRows[0].total, page, limit, totalPages: Math.ceil(countRows[0].total / limit) });
  } catch (err) {
    next(err);
  }
});

router.post('/leads', requirePermission('leads.view'), async (req, res, next) => {
  try {
    const leadService = require('../services/leadService');
    const newLead = await leadService.createLead(req.body, req.body.partnerId || null);
    await auditService.logAction(
      req.user.adminId || req.user.id,
      'lead.create',
      'lead',
      newLead.id || newLead.dbId,
      { leadCode: newLead.id, applicant: newLead.applicantName, amount: newLead.amount },
      req.ip
    );
    res.status(201).json(newLead);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

router.get('/leads/:id', requirePermission('leads.view'), async (req, res, next) => {
  try {
    const leadService = require('../services/leadService');
    const partnerRepo = require('../repositories/partnerRepository');
    const lead = await leadService.getLeadById(req.params.id, null, 'admin');
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const partner = lead.partnerId ? await partnerRepo.findById(lead.partnerId) : null;
    res.json({
      ...lead,
      partner: partner ? {
        id: partner.id,
        code: partner.partner_code,
        name: partner.full_name,
        mobile: partner.mobile,
        email: partner.email,
        type: partner.partner_type
      } : null
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/leads/:id/status', requirePermission('leads.update_status'), async (req, res, next) => {
  try {
    const { status, stage, note } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const [leadRows] = await query('SELECT * FROM leads WHERE id = ? OR lead_code = ?', [req.params.id, req.params.id]);
    if (leadRows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    const leadRecord = leadRows[0];
    const realId = leadRecord.id;

    const isCreditCard = leadRecord.product_category === 'Credit Cards';
    const isInsurance = leadRecord.product_category === 'Insurance';
    const finalStage = stage || (
      status === 'Disbursed' ? 'Disbursal' :
      status === 'Card Issued' ? 'Card Dispatched & Issued' :
      status === 'Policy Issued' ? 'Policy Generated & Active' :
      status === 'Under Review' ? 'Underwriting and verification' :
      status === 'Rejected' ? 'Application rejected' :
      status === 'Approved' ? (isCreditCard ? 'Card Approved' : isInsurance ? 'Policy Approved' : 'Sanction') :
      status === 'In Progress' ? 'Documents under review' : 'Lead submitted'
    );
    const finalNote = note || `Status updated to ${status} by admin (ID: ${req.user.adminId})`;

    const conn = await require('../config/db').pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        'UPDATE leads SET status = ?, current_stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, finalStage, realId]
      );
      await conn.query(
        'INSERT INTO lead_status_history (lead_id, status, stage, note) VALUES (?, ?, ?, ?)',
        [realId, status, finalStage, finalNote]
      );
      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    await auditService.log(req.user.adminId, 'lead.update_status', 'lead', String(realId), { old_status: leadRecord.status, new_status: status, stage: finalStage });

    // Dynamic Commission Rule Resolution on Business Milestone (No hardcoded values)
    let commissionResult = null;
    const isEarningMilestone = (
      status === 'Disbursed' || 
      status === 'Card Issued' || 
      status === 'Policy Issued'
    );

    if (isEarningMilestone) {
      const commissionService = require('../services/commissionService');
      commissionResult = await commissionService.resolveAndCreditLeadCommission(realId, req.user.adminId);
    }

    const [updated] = await query(
      `SELECT l.*, p.partner_code, p.full_name as partner_name FROM leads l LEFT JOIN partners p ON l.partner_id = p.id WHERE l.id = ?`,
      [realId]
    );
    res.json({ 
      success: true, 
      message: `Lead status updated to ${status}`, 
      lead: updated[0] || null,
      commission: commissionResult 
    });
  } catch (err) {
    next(err);
  }
});

// Partners
router.get('/partners', requirePermission('partners.view'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;
    
    let sql = `SELECT * FROM partners WHERE 1=1`;
    const params = [];
    let countSql = `SELECT COUNT(*) as total FROM partners WHERE 1=1`;
    const countParams = [];

    if (req.query.partnerType) { sql += ` AND partner_type = ?`; params.push(req.query.partnerType); countSql += ` AND partner_type = ?`; countParams.push(req.query.partnerType); }
    if (req.query.kycStatus) { sql += ` AND kyc_status = ?`; params.push(req.query.kycStatus); countSql += ` AND kyc_status = ?`; countParams.push(req.query.kycStatus); }
    if (req.query.approvalStatus) { sql += ` AND approval_status = ?`; params.push(req.query.approvalStatus); countSql += ` AND approval_status = ?`; countParams.push(req.query.approvalStatus); }
    if (req.query.city) { sql += ` AND city = ?`; params.push(req.query.city); countSql += ` AND city = ?`; countParams.push(req.query.city); }
    if (req.query.search) { 
      sql += ` AND (full_name LIKE ? OR mobile LIKE ? OR partner_code LIKE ?)`; 
      const searchStr = `%${req.query.search}%`;
      params.push(searchStr, searchStr, searchStr); 
      countSql += ` AND (full_name LIKE ? OR mobile LIKE ? OR partner_code LIKE ?)`; 
      countParams.push(searchStr, searchStr, searchStr); 
    }
    if (req.query.dateFrom) { sql += ` AND created_at >= ?`; params.push(req.query.dateFrom); countSql += ` AND created_at >= ?`; countParams.push(req.query.dateFrom); }
    if (req.query.dateTo) { sql += ` AND created_at <= ?`; params.push(req.query.dateTo); countSql += ` AND created_at <= ?`; countParams.push(req.query.dateTo); }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [countRows] = await query(countSql, countParams);
    const [rows] = await query(sql, params);

    res.json({ data: rows, total: countRows[0].total, page, limit, totalPages: Math.ceil(countRows[0].total / limit) });
  } catch (err) {
    next(err);
  }
});

router.get('/partners/:id', requirePermission('partners.view'), async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM partners WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Partner not found' });
    const partner = rows[0];

    const [leadsCount] = await query('SELECT COUNT(*) as count FROM leads WHERE partner_id = ?', [partner.id]);
    const [kycDocs] = await query('SELECT * FROM kyc_documents WHERE partner_id = ?', [partner.id]);
    const [earnings] = await query(
      `SELECT SUM(amount) as total_earned, SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid FROM partner_earnings WHERE partner_id = ?`, 
      [partner.id]
    );

    partner.leads_count = leadsCount[0].count;
    partner.kyc_documents = kycDocs;
    partner.earnings = earnings[0];

    res.json(partner);
  } catch (err) {
    next(err);
  }
});

router.patch('/partners/:id/kyc', requirePermission('partners.review_kyc'), async (req, res, next) => {
  try {
    const { kycStatus } = req.body;
    if (!kycStatus) return res.status(400).json({ error: 'kycStatus is required' });

    await query('UPDATE partners SET kyc_status = ? WHERE id = ?', [kycStatus, req.params.id]);
    await auditService.log(req.user.adminId, 'partner.kyc_update', 'partner', req.params.id, { new_status: kycStatus });
    res.json({ success: true, message: 'KYC status updated' });
  } catch (err) {
    next(err);
  }
});

// KYC Docs
router.get('/kyc', requirePermission('partners.review_kyc'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const countSql = 'SELECT COUNT(*) as total FROM kyc_documents';
    const sql = `SELECT kd.*, p.partner_code, p.full_name as partner_name FROM kyc_documents kd LEFT JOIN partners p ON kd.partner_id = p.id ORDER BY kd.created_at DESC LIMIT ? OFFSET ?`;

    const [countRows] = await query(countSql);
    const [rows] = await query(sql, [limit, offset]);

    res.json({ data: rows, total: countRows[0].total, page, limit, totalPages: Math.ceil(countRows[0].total / limit) });
  } catch (err) {
    next(err);
  }
});

router.get('/kyc/:id/document', requirePermission('partners.review_kyc'), async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM kyc_documents WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    const doc = rows[0];

    const filePath = path.resolve(__dirname, '../../uploads/kyc', path.basename(doc.file_path));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.original_filename || path.basename(filePath)}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
});

router.patch('/kyc/:id', requirePermission('partners.review_kyc'), async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    const [existing] = await query('SELECT * FROM kyc_documents WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'KYC document not found' });

    await query(
      'UPDATE kyc_documents SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, review_remarks = ? WHERE id = ?',
      [status, req.user.adminId, note || null, req.params.id]
    );

    // Also update partner kyc_status if all docs for this partner are approved
    const partnerId = existing[0].partner_id;
    if (status === 'approved') {
      const [pendingDocs] = await query(
        "SELECT COUNT(*) as cnt FROM kyc_documents WHERE partner_id = ? AND status != 'approved'",
        [partnerId]
      );
      if (pendingDocs[0].cnt === 0) {
        await query("UPDATE partners SET kyc_status = 'approved' WHERE id = ?", [partnerId]);
      }
    } else if (status === 'rejected') {
      await query("UPDATE partners SET kyc_status = 'rejected' WHERE id = ?", [partnerId]);
    }

    await auditService.log(req.user.adminId, 'kyc.review', 'kyc_document', String(req.params.id), { new_status: status, note: note || null, partner_id: partnerId });
    res.json({ success: true, message: 'KYC document status updated' });
  } catch (err) {
    next(err);
  }
});

// Payouts
router.get('/payouts', requirePermission('payouts.view'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const countSql = 'SELECT COUNT(*) as total FROM payout_requests';
    const sql = `SELECT pr.*, p.partner_code, p.full_name as partner_name FROM payout_requests pr LEFT JOIN partners p ON pr.partner_id = p.id ORDER BY pr.requested_at DESC LIMIT ? OFFSET ?`;

    const [countRows] = await query(countSql);
    const [rows] = await query(sql, [limit, offset]);

    res.json({ data: rows, total: countRows[0].total, page, limit, totalPages: Math.ceil(countRows[0].total / limit) });
  } catch (err) {
    next(err);
  }
});

// Audit
router.get('/audit', requirePermission('audit.view'), async (req, res, next) => {
  try {
    const result = await auditService.getAll({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 25,
      action: req.query.action,
      entityType: req.query.entityType,
      adminId: req.query.adminId,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Profile
router.get('/profile', async (req, res, next) => {
  try {
    const admin = await adminRepo.findById(req.user.adminId);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    const permissions = await adminRepo.getPermissions(admin.id);
    admin.permissions = permissions;
    delete admin.password_hash;
    res.json(admin);
  } catch (err) {
    next(err);
  }
});

router.patch('/profile/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'currentPassword and newPassword are required' });

    const admin = await adminRepo.findById(req.user.adminId);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await adminRepo.updatePassword(admin.id, newHash);
    await auditService.log(admin.id, 'admin.password_change', 'admin_user', admin.id);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

// Maker Review: REQUESTED -> UNDER_REVIEW
router.patch('/payouts/:id/review', requirePermission('payouts.approve'), async (req, res, next) => {
  try {
    const [payoutRows] = await query('SELECT * FROM payout_requests WHERE id = ?', [req.params.id]);
    if (payoutRows.length === 0) return res.status(404).json({ error: 'Payout request not found' });
    const payout = payoutRows[0];

    if (!['REQUESTED', 'ON_HOLD', 'pending'].includes(payout.status)) {
      return res.status(400).json({ error: `Cannot review payout in '${payout.status}' status. Must be REQUESTED or ON_HOLD.` });
    }

    await query(
      'UPDATE payout_requests SET status = "UNDER_REVIEW", reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.user.adminId, req.params.id]
    );

    await auditService.log(req.user.adminId, 'payout.review', 'payout_request', String(req.params.id), {
      old_status: payout.status,
      new_status: 'UNDER_REVIEW'
    });

    const [updated] = await query(
      'SELECT pr.*, p.partner_code, p.full_name as partner_name FROM payout_requests pr LEFT JOIN partners p ON pr.partner_id = p.id WHERE pr.id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Payout marked UNDER_REVIEW by Maker', payout: updated[0] });
  } catch (err) {
    next(err);
  }
});

// Checker Approve: UNDER_REVIEW -> APPROVED
router.patch('/payouts/:id/approve', requirePermission('payouts.approve'), async (req, res, next) => {
  try {
    const [payoutRows] = await query('SELECT * FROM payout_requests WHERE id = ?', [req.params.id]);
    if (payoutRows.length === 0) return res.status(404).json({ error: 'Payout request not found' });
    const payout = payoutRows[0];

    if (payout.status !== 'UNDER_REVIEW') {
      return res.status(400).json({ error: `Cannot approve payout in '${payout.status}' status. Must be UNDER_REVIEW.` });
    }

    // Enforce maker != checker separation if multiple active admins exist
    const [adminCount] = await query('SELECT COUNT(*) as count FROM admin_users WHERE is_active = 1');
    if (adminCount[0].count > 1 && payout.reviewed_by && payout.reviewed_by === req.user.adminId) {
      return res.status(400).json({ error: 'Maker-Checker separation violation: Reviewer cannot approve their own review.' });
    }

    await query(
      'UPDATE payout_requests SET status = "APPROVED", approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.user.adminId, req.params.id]
    );

    await auditService.log(req.user.adminId, 'payout.approve', 'payout_request', String(req.params.id), {
      old_status: payout.status,
      new_status: 'APPROVED',
      approved_by: req.user.adminId
    });

    const [updated] = await query(
      'SELECT pr.*, p.partner_code, p.full_name as partner_name FROM payout_requests pr LEFT JOIN partners p ON pr.partner_id = p.id WHERE pr.id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Payout APPROVED by Checker', payout: updated[0] });
  } catch (err) {
    next(err);
  }
});

// Processing Initiation: APPROVED -> PROCESSING
router.patch('/payouts/:id/process', requirePermission('payouts.approve'), async (req, res, next) => {
  try {
    const [payoutRows] = await query('SELECT * FROM payout_requests WHERE id = ?', [req.params.id]);
    if (payoutRows.length === 0) return res.status(404).json({ error: 'Payout request not found' });
    const payout = payoutRows[0];

    if (payout.status !== 'APPROVED') {
      return res.status(400).json({ error: `Cannot process payout in '${payout.status}' status. Must be APPROVED.` });
    }

    await query(
      'UPDATE payout_requests SET status = "PROCESSING" WHERE id = ?',
      [req.params.id]
    );

    await auditService.log(req.user.adminId, 'payout.process', 'payout_request', String(req.params.id), {
      old_status: payout.status,
      new_status: 'PROCESSING'
    });

    const [updated] = await query(
      'SELECT pr.*, p.partner_code, p.full_name as partner_name FROM payout_requests pr LEFT JOIN partners p ON pr.partner_id = p.id WHERE pr.id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Payout status updated to PROCESSING', payout: updated[0] });
  } catch (err) {
    next(err);
  }
});

// Final Settlement: PROCESSING -> PAID (requires UTR number)
router.patch('/payouts/:id/settle', requirePermission('payouts.approve'), async (req, res, next) => {
  try {
    const utrNumber = (req.body.utrNumber || req.body.utr_number || '').trim();
    if (!utrNumber) {
      return res.status(400).json({ error: 'UTR / Bank reference number is mandatory for settlement' });
    }

    const [payoutRows] = await query('SELECT * FROM payout_requests WHERE id = ?', [req.params.id]);
    if (payoutRows.length === 0) return res.status(404).json({ error: 'Payout request not found' });
    const payout = payoutRows[0];

    if (!['PROCESSING', 'APPROVED'].includes(payout.status)) {
      return res.status(400).json({ error: `Cannot settle payout in '${payout.status}' status. Must be PROCESSING or APPROVED.` });
    }

    const conn = await require('../config/db').pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        'UPDATE payout_requests SET status = "PAID", settled_by = ?, settled_at = CURRENT_TIMESTAMP, utr_number = ? WHERE id = ?',
        [req.user.adminId, utrNumber, req.params.id]
      );
      // Mark partner earnings debit as paid
      await conn.query(
        'UPDATE partner_earnings SET status = "paid" WHERE partner_id = ? AND description LIKE ?',
        [payout.partner_id, `%${payout.reference_number}%`]
      );
      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    await auditService.log(req.user.adminId, 'payout.settle', 'payout_request', String(req.params.id), {
      old_status: payout.status,
      new_status: 'PAID',
      utr_number: utrNumber,
      amount: payout.amount
    });

    const [updated] = await query(
      'SELECT pr.*, p.partner_code, p.full_name as partner_name FROM payout_requests pr LEFT JOIN partners p ON pr.partner_id = p.id WHERE pr.id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Payout settled and marked PAID with UTR', payout: updated[0] });
  } catch (err) {
    next(err);
  }
});

// Reject / Refund
router.patch('/payouts/:id/reject', requirePermission('payouts.approve'), async (req, res, next) => {
  try {
    const reason = (req.body.reason || req.body.note || '').trim();
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const [payoutRows] = await query('SELECT * FROM payout_requests WHERE id = ?', [req.params.id]);
    if (payoutRows.length === 0) return res.status(404).json({ error: 'Payout request not found' });
    const payout = payoutRows[0];

    if (payout.status === 'PAID') {
      return res.status(400).json({ error: 'Cannot reject a settled/paid payout' });
    }

    const conn = await require('../config/db').pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        'UPDATE payout_requests SET status = "REJECTED", rejection_reason = ? WHERE id = ?',
        [reason, req.params.id]
      );
      // Reverse debit: mark pending debit as rejected
      await conn.query(
        'UPDATE partner_earnings SET status = "rejected" WHERE partner_id = ? AND description LIKE ?',
        [payout.partner_id, `%${payout.reference_number}%`]
      );
      // Credit refund back to available wallet
      await conn.query(
        `INSERT INTO partner_earnings (partner_id, amount, earning_type, status, description)
         VALUES (?, ?, 'refund', 'available', ?)`,
        [payout.partner_id, payout.amount, `Refund for rejected payout #${payout.reference_number}: ${reason}`]
      );
      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    await auditService.log(req.user.adminId, 'payout.reject', 'payout_request', String(req.params.id), {
      old_status: payout.status,
      new_status: 'REJECTED',
      reason,
      refunded_amount: payout.amount
    });

    const [updated] = await query(
      'SELECT pr.*, p.partner_code, p.full_name as partner_name FROM payout_requests pr LEFT JOIN partners p ON pr.partner_id = p.id WHERE pr.id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Payout rejected and wallet balance refunded', payout: updated[0] });
  } catch (err) {
    next(err);
  }
});

// Hold
router.patch('/payouts/:id/hold', requirePermission('payouts.approve'), async (req, res, next) => {
  try {
    const [payoutRows] = await query('SELECT * FROM payout_requests WHERE id = ?', [req.params.id]);
    if (payoutRows.length === 0) return res.status(404).json({ error: 'Payout request not found' });
    const payout = payoutRows[0];

    if (payout.status === 'PAID') {
      return res.status(400).json({ error: 'Cannot put a settled/paid payout on hold' });
    }

    await query('UPDATE payout_requests SET status = "ON_HOLD" WHERE id = ?', [req.params.id]);
    await auditService.log(req.user.adminId, 'payout.hold', 'payout_request', String(req.params.id), {
      old_status: payout.status,
      new_status: 'ON_HOLD'
    });

    const [updated] = await query(
      'SELECT pr.*, p.partner_code, p.full_name as partner_name FROM payout_requests pr LEFT JOIN partners p ON pr.partner_id = p.id WHERE pr.id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Payout placed ON_HOLD', payout: updated[0] });
  } catch (err) {
    next(err);
  }
});

// Backward compatibility router for legacy PATCH /payouts/:id
router.patch('/payouts/:id', requirePermission('payouts.approve'), async (req, res, next) => {
  try {
    const { status, note, utrNumber, reason } = req.body;
    if (status === 'approved' || status === 'APPROVED') {
      req.url = `/payouts/${req.params.id}/approve`;
      return router.handle(req, res, next);
    }
    if (status === 'completed' || status === 'paid' || status === 'PAID') {
      if (!utrNumber) {
        return res.status(400).json({ error: 'UTR / Bank reference number is mandatory for settlement' });
      }
      req.url = `/payouts/${req.params.id}/settle`;
      return router.handle(req, res, next);
    }
    if (status === 'rejected' || status === 'REJECTED') {
      req.body.reason = reason || note || 'Rejected by administrator';
      req.url = `/payouts/${req.params.id}/reject`;
      return router.handle(req, res, next);
    }
    if (status === 'UNDER_REVIEW') {
      req.url = `/payouts/${req.params.id}/review`;
      return router.handle(req, res, next);
    }
    if (status === 'PROCESSING') {
      req.url = `/payouts/${req.params.id}/process`;
      return router.handle(req, res, next);
    }
    return res.status(400).json({ error: `Unsupported status action: ${status}` });
  } catch (err) {
    next(err);
  }
});

// Commission Ledger
router.get('/commissions', requirePermission('commissions.view'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    let sql = `SELECT pe.*, p.partner_code, p.full_name as partner_name, l.lead_code, l.loan_type 
               FROM partner_earnings pe 
               LEFT JOIN partners p ON pe.partner_id = p.id 
               LEFT JOIN leads l ON pe.lead_id = l.id 
               WHERE 1=1`;
    const params = [];
    let countSql = `SELECT COUNT(*) as total FROM partner_earnings pe LEFT JOIN partners p ON pe.partner_id = p.id WHERE 1=1`;
    const countParams = [];

    if (req.query.partnerId) {
      sql += ' AND pe.partner_id = ?';
      params.push(req.query.partnerId);
      countSql += ' AND pe.partner_id = ?';
      countParams.push(req.query.partnerId);
    }
    if (req.query.status) {
      sql += ' AND pe.status = ?';
      params.push(req.query.status);
      countSql += ' AND pe.status = ?';
      countParams.push(req.query.status);
    }
    if (req.query.search) {
      sql += ' AND (p.partner_code LIKE ? OR p.full_name LIKE ? OR pe.description LIKE ?)';
      const s = `%${req.query.search}%`;
      params.push(s, s, s);
      countSql += ' AND (p.partner_code LIKE ? OR p.full_name LIKE ? OR pe.description LIKE ?)';
      countParams.push(s, s, s);
    }

    sql += ' ORDER BY pe.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [countRows] = await query(countSql, countParams);
    const [rows] = await query(sql, params);

    // Summary KPIs
    const [summaryRows] = await query(
      `SELECT 
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as totalEarned,
        SUM(CASE WHEN status = 'paid' AND amount > 0 THEN amount ELSE 0 END) as totalPaid,
        SUM(CASE WHEN status = 'available' AND amount > 0 THEN amount ELSE 0 END) as totalPending
       FROM partner_earnings`
    );

    res.json({
      data: rows,
      total: countRows[0].total,
      page,
      limit,
      totalPages: Math.ceil(countRows[0].total / limit),
      summary: summaryRows[0] || { totalEarned: 0, totalPaid: 0, totalPending: 0 }
    });
  } catch (err) {
    next(err);
  }
});

// Toggle Partner Status (Active / Suspended)
router.patch('/partners/:id/toggle-status', requirePermission('partners.edit'), async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM partners WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Partner not found' });
    const partner = rows[0];

    const newStatus = partner.approval_status === 'approved' ? 'suspended' : 'approved';
    await query('UPDATE partners SET approval_status = ? WHERE id = ?', [newStatus, req.params.id]);

    await auditService.log(req.user.adminId, 'partner.toggle_status', 'partner', String(req.params.id), {
      old_status: partner.approval_status,
      new_status: newStatus
    });

    const [updated] = await query('SELECT * FROM partners WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: `Partner status changed to ${newStatus}`, partner: updated[0] });
  } catch (err) {
    next(err);
  }
});

// App Settings (GET & PATCH)
router.get('/settings', requirePermission('dashboard.view'), async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM app_settings ORDER BY setting_key ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.patch('/settings', requirePermission('users.manage'), async (req, res, next) => {
  try {
    const settings = req.body; // e.g. { "support_phone": "1800-123-456", ... }
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings payload must be a key-value object' });
    }

    for (const [key, val] of Object.entries(settings)) {
      await query(
        `INSERT INTO app_settings (setting_key, setting_value, updated_at) 
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
        [key, String(val), String(val)]
      );
    }

    await auditService.log(req.user.adminId, 'settings.update', 'app_settings', 'all', settings);
    const [rows] = await query('SELECT * FROM app_settings ORDER BY setting_key ASC');
    res.json({ success: true, message: 'Settings updated successfully', settings: rows });
  } catch (err) {
    next(err);
  }
});

// DEFAULT BRANDING THEME CONSTANT
const DEFAULT_BRANDING = {
  brandPrimary: '#1A56DB',
  brandPrimaryHover: '#1545B0',
  brandPrimarySoft: '#EBF2FF',
  brandAccent: '#0D9488',
  sidebarBackground: '#0B192C',
  sidebarText: '#94A3B8',
  sidebarMuted: '#64748B',
  sidebarActiveBackground: '#1A56DB',
  sidebarActiveText: '#FFFFFF',
  headerAccent: '#1A56DB',
  buttonPrimary: '#1A56DB',
  linkHighlight: '#1A56DB',
  pageBackground: '#F8FAFC',
  surfaceBackground: '#FFFFFF',
  surfaceCard: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  borderColor: '#E2E8F0',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',
  focusRing: 'rgba(26, 86, 219, 0.2)'
};

// GET /api/admin/settings/branding
router.get('/settings/branding', requirePermission('dashboard.view'), async (req, res, next) => {
  try {
    const [rows] = await query("SELECT setting_value FROM app_settings WHERE setting_key = 'branding_theme'");
    if (rows && rows.length > 0 && rows[0].setting_value) {
      try {
        const parsed = JSON.parse(rows[0].setting_value);
        return res.json({ success: true, branding: { ...DEFAULT_BRANDING, ...parsed } });
      } catch (e) {
        return res.json({ success: true, branding: DEFAULT_BRANDING });
      }
    }
    res.json({ success: true, branding: DEFAULT_BRANDING });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/settings/branding
router.patch('/settings/branding', requirePermission('users.manage'), async (req, res, next) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Invalid branding payload' });
    }

    // Validate HEX codes for color keys
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    for (const [key, val] of Object.entries(updates)) {
      if (typeof val === 'string' && val.startsWith('#') && !hexRegex.test(val)) {
        return res.status(400).json({ error: `Invalid HEX color format for ${key}: ${val}` });
      }
    }

    const [existing] = await query("SELECT setting_value FROM app_settings WHERE setting_key = 'branding_theme'");
    let current = DEFAULT_BRANDING;
    if (existing && existing.length > 0 && existing[0].setting_value) {
      try { current = { ...DEFAULT_BRANDING, ...JSON.parse(existing[0].setting_value) }; } catch (e) {}
    }

    const merged = { ...current, ...updates };

    await query(
      `INSERT INTO app_settings (setting_key, setting_value, updated_at)
       VALUES ('branding_theme', ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(merged), JSON.stringify(merged)]
    );

    await auditService.log(
      req.user.adminId,
      'settings.branding_update',
      'app_settings',
      'branding_theme',
      { oldValues: updates }
    );

    res.json({ success: true, message: 'Branding updated successfully', branding: merged });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/settings/branding/reset
router.post('/settings/branding/reset', requirePermission('users.manage'), async (req, res, next) => {
  try {
    await query(
      `INSERT INTO app_settings (setting_key, setting_value, updated_at)
       VALUES ('branding_theme', ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(DEFAULT_BRANDING), JSON.stringify(DEFAULT_BRANDING)]
    );

    await auditService.log(
      req.user.adminId,
      'settings.branding_reset',
      'app_settings',
      'branding_theme',
      { resetTo: 'Earnmitra Default' }
    );

    res.json({ success: true, message: 'Branding reset to Earnmitra defaults', branding: DEFAULT_BRANDING });
  } catch (err) {
    next(err);
  }
});

// Admin Roles & Users
router.get('/roles', requirePermission('users.manage'), async (req, res, next) => {
  try {
    const [rows] = await query(
      `SELECT ar.*, COUNT(arp.permission_id) as permissions_count 
       FROM admin_roles ar 
       LEFT JOIN admin_role_permissions arp ON ar.id = arp.role_id 
       GROUP BY ar.id`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/users', requirePermission('users.manage'), async (req, res, next) => {
  try {
    const [rows] = await query(
      `SELECT au.id, au.username, au.email, au.role_id, au.is_active, au.last_login_at, au.created_at, ar.role_name 
       FROM admin_users au 
       LEFT JOIN admin_roles ar ON au.role_id = ar.id 
       ORDER BY au.id ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Add Admin User
router.post('/users', requirePermission('users.manage'), async (req, res, next) => {
  try {
    const { username, email, password, role_id } = req.body;
    if (!username || !email || !password || !role_id) {
      return res.status(400).json({ error: 'username, email, password, and role_id are required' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await query(
      'INSERT INTO admin_users (username, email, password_hash, role_id, is_active) VALUES (?, ?, ?, ?, 1)',
      [username, email, hash, role_id]
    );
    await auditService.log(req.user.adminId, 'admin_user.create', 'admin_user', String(result.insertId), { username, email, role_id });
    res.status(201).json({ success: true, message: 'Admin user created successfully', id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// Toggle Admin User Active Status
router.patch('/users/:id/toggle-status', requirePermission('users.manage'), async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM admin_users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = rows[0];
    const newActive = user.is_active ? 0 : 1;
    await query('UPDATE admin_users SET is_active = ? WHERE id = ?', [newActive, req.params.id]);
    await auditService.log(req.user.adminId, 'admin_user.toggle_status', 'admin_user', req.params.id, { is_active: newActive });
    res.json({ success: true, message: `User status changed to ${newActive ? 'Active' : 'Inactive'}`, is_active: newActive });
  } catch (err) {
    next(err);
  }
});

// Departments
router.get('/departments', requirePermission('dashboard.view'), async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM departments ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Products
router.get('/products', requirePermission('dashboard.view'), async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM products ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/products', requirePermission('users.manage'), async (req, res, next) => {
  try {
    const { product_name, category, default_rate, commission_type, status } = req.body;
    if (!product_name || !category) {
      return res.status(400).json({ error: 'product_name and category are required' });
    }
    const [result] = await query(
      'INSERT INTO products (product_name, category, default_rate, commission_type, status) VALUES (?, ?, ?, ?, ?)',
      [product_name, category, default_rate || 1.00, commission_type || 'percentage', status || 'Active']
    );
    await auditService.log(req.user.adminId, 'product.create', 'product', String(result.insertId), { product_name, category });
    res.status(201).json({ success: true, message: 'Product created', id: result.insertId });
  } catch (err) {
    next(err);
  }
});

router.patch('/products/:id', requirePermission('users.manage'), async (req, res, next) => {
  try {
    const { product_name, category, default_rate, commission_type, status } = req.body;
    await query(
      'UPDATE products SET product_name = COALESCE(?, product_name), category = COALESCE(?, category), default_rate = COALESCE(?, default_rate), commission_type = COALESCE(?, commission_type), status = COALESCE(?, status) WHERE id = ?',
      [product_name, category, default_rate, commission_type, status, req.params.id]
    );
    await auditService.log(req.user.adminId, 'product.update', 'product', req.params.id, req.body);
    res.json({ success: true, message: 'Product updated' });
  } catch (err) {
    next(err);
  }
});

// Lenders
router.get('/lenders', requirePermission('dashboard.view'), async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM lenders ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/lenders', requirePermission('users.manage'), async (req, res, next) => {
  try {
    const { name, category, code } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const [result] = await query(
      'INSERT INTO lenders (name, category, code, is_active) VALUES (?, ?, ?, 1)',
      [name, category || 'Bank', code || name.slice(0, 4).toUpperCase()]
    );
    await auditService.log(req.user.adminId, 'lender.create', 'lender', String(result.insertId), { name, code });
    res.status(201).json({ success: true, message: 'Lender created', id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// Commission Rules
router.get('/commission-rules', requirePermission('commissions.view'), async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM commission_rules ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/commission-rules', requirePermission('users.manage'), async (req, res, next) => {
  try {
    const { product_name, partner_type, commission_rate, tds_rate, gst_rate } = req.body;
    if (!product_name || !partner_type || !commission_rate) {
      return res.status(400).json({ error: 'product_name, partner_type, and commission_rate are required' });
    }
    const [result] = await query(
      `INSERT INTO commission_rules (product_name, partner_type, commission_rate, tds_rate, gst_rate, is_active)
       VALUES (?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE commission_rate = VALUES(commission_rate), tds_rate = VALUES(tds_rate), gst_rate = VALUES(gst_rate)`,
      [product_name, partner_type, commission_rate, tds_rate != null ? tds_rate : 0.0, gst_rate != null ? gst_rate : 0.0]
    );
    await auditService.log(req.user.adminId, 'commission_rule.upsert', 'commission_rule', product_name, req.body);
    res.json({ success: true, message: 'Commission rule saved' });
  } catch (err) {
    next(err);
  }
});

// Marketing Campaigns
router.get('/marketing/campaigns', requirePermission('dashboard.view'), async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM marketing_campaigns ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/marketing/campaigns', requirePermission('users.manage'), async (req, res, next) => {
  try {
    const { campaign_name, channel, leads_count, budget } = req.body;
    if (!campaign_name || !channel) {
      return res.status(400).json({ error: 'campaign_name and channel are required' });
    }
    const [result] = await query(
      'INSERT INTO marketing_campaigns (campaign_name, channel, status, leads_count, budget) VALUES (?, ?, "Active", ?, ?)',
      [campaign_name, channel, leads_count || 0, budget || 0]
    );
    await auditService.log(req.user.adminId, 'campaign.create', 'marketing_campaign', String(result.insertId), { campaign_name, channel });
    res.status(201).json({ success: true, message: 'Campaign created', id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// Support Tickets
router.get('/support/tickets', requirePermission('dashboard.view'), async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM support_tickets ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/support/tickets', async (req, res, next) => {
  try {
    const { partner_name, subject, department, description, priority } = req.body;
    if (!subject) return res.status(400).json({ error: 'Subject is required' });
    const num = `TKT-${Math.floor(100 + Math.random() * 900)}`;
    const [result] = await query(
      'INSERT INTO support_tickets (ticket_number, partner_name, subject, department, status, priority, description) VALUES (?, ?, ?, ?, "Open", ?, ?)',
      [num, partner_name || 'Partner', subject, department || 'Operations', priority || 'Normal', description || '']
    );
    await auditService.log(req.user.adminId, 'ticket.create', 'support_ticket', num, { subject, department });
    res.status(201).json({ success: true, message: 'Ticket created', ticket_number: num });
  } catch (err) {
    next(err);
  }
});

router.patch('/support/tickets/:id', async (req, res, next) => {
  try {
    const { status, resolution_note } = req.body;
    const isNum = !isNaN(Number(req.params.id));
    const whereClause = isNum ? 'id = ?' : 'ticket_number = ?';
    await query(
      `UPDATE support_tickets SET status = COALESCE(?, status), resolution_note = COALESCE(?, resolution_note) WHERE ${whereClause}`,
      [status, resolution_note, req.params.id]
    );
    await auditService.log(req.user?.adminId || 1, 'ticket.update', 'support_ticket', String(req.params.id), { status, resolution_note });
    const [rows] = await query(`SELECT * FROM support_tickets WHERE ${whereClause}`, [req.params.id]);
    res.json({ success: true, message: 'Ticket updated', ticket: rows[0] || null });
  } catch (err) {
    next(err);
  }
});

// Platform Integrations
router.get('/integrations', requirePermission('dashboard.view'), async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM platform_integrations ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.patch('/integrations/:id/toggle', requirePermission('users.manage'), async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM platform_integrations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Integration not found' });
    const item = rows[0];
    const newStatus = item.status === 'Connected' ? 'Disconnected' : 'Connected';
    await query('UPDATE platform_integrations SET status = ? WHERE id = ?', [newStatus, req.params.id]);
    await auditService.log(req.user.adminId, 'integration.toggle', 'platform_integration', req.params.id, { new_status: newStatus });
    res.json({ success: true, message: `Integration status changed to ${newStatus}`, status: newStatus });
  } catch (err) {
    next(err);
  }
});

// Reports & Analytics
router.get('/reports/analytics', requirePermission('dashboard.view'), async (req, res, next) => {
  try {
    const [partnerCount] = await query('SELECT COUNT(*) as count FROM partners WHERE is_active = 1');
    const [leadsCount] = await query('SELECT COUNT(*) as count FROM leads');
    const [earningsSum] = await query('SELECT SUM(amount) as total FROM partner_earnings WHERE amount > 0');
    const [payoutsSum] = await query('SELECT SUM(amount) as total FROM payout_requests WHERE status = "PAID"');
    const [disbursedSum] = await query('SELECT SUM(loan_amount) as total FROM leads WHERE status IN ("Disbursed", "Card Issued", "Policy Issued")');

    // Monthly business trend for current year
    const [trendRows] = await query(`
      SELECT 
        MONTHNAME(created_at) as month,
        MONTH(created_at) as month_num,
        COUNT(*) as leads,
        SUM(CASE WHEN status IN ('Disbursed', 'Card Issued', 'Policy Issued') THEN 1 ELSE 0 END) as conversions,
        SUM(CASE WHEN loan_amount > 0 THEN loan_amount ELSE 0 END) as volume
      FROM leads
      WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
      GROUP BY month_num, month
      ORDER BY month_num ASC
    `);

    res.json({
      activePartners: partnerCount[0].count || 0,
      totalLeads: leadsCount[0].count || 0,
      totalRevenue: Number(earningsSum[0]?.total) || 0,
      totalPayouts: Number(payoutsSum[0]?.total) || 0,
      disbursedVolume: Number(disbursedSum[0]?.total) || 0,
      monthlyTrend: trendRows
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
