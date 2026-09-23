const { query, pool } = require('../config/db');
const auditService = require('./auditService');

class CommissionService {
  /**
   * Resolves an approved, active commission rule from MariaDB commission_rules.
   * Matches product name and partner type with fallback to generic types.
   */
  async resolveRule(productName, partnerType) {
    const cleanProduct = String(productName || '').trim();
    const cleanType = String(partnerType || '').trim();

    const sql = `
      SELECT * FROM commission_rules 
      WHERE is_active = 1 
        AND (
          LOWER(product_name) = LOWER(?) 
          OR LOWER(?) LIKE CONCAT('%', LOWER(product_name), '%')
          OR LOWER(product_name) LIKE CONCAT('%', LOWER(?), '%')
        )
      ORDER BY 
        CASE 
          WHEN LOWER(partner_type) = LOWER(?) THEN 1
          WHEN LOWER(?) LIKE CONCAT('%', LOWER(partner_type), '%') THEN 2
          WHEN LOWER(partner_type) IN ('all', 'agent', 'individual', 'dsa') THEN 3
          ELSE 4
        END ASC,
        id ASC
      LIMIT 1
    `;

    const [rows] = await query(sql, [
      cleanProduct, cleanProduct, cleanProduct,
      cleanType, cleanType
    ]);

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Calculates gross, TDS deduction, and net commission based on rule definition.
   */
  calculate(rule, baseAmount) {
    if (!rule) return null;
    const numBase = Number(baseAmount) || 0;
    const rateStr = String(rule.commission_rate || '').trim();

    let gross = 0;
    let basis = '';

    if (rateStr.includes('%')) {
      const pct = parseFloat(rateStr.replace('%', ''));
      gross = Math.round(((numBase * pct) / 100) * 100) / 100;
      basis = `${pct}% of ₹${numBase.toLocaleString('en-IN')}`;
    } else {
      const flat = parseFloat(rateStr.replace(/[^\d.]/g, '')) || 0;
      gross = flat;
      basis = `Flat ₹${flat.toLocaleString('en-IN')}`;
    }

    // Read TDS strictly from rule configuration — if not configured, do not invent values
    const tdsRate = (rule.tds_rate != null && !isNaN(Number(rule.tds_rate))) ? Number(rule.tds_rate) : 0.0;
    const tdsAmount = tdsRate > 0 ? Math.round(((gross * tdsRate) / 100) * 100) / 100 : 0.0;
    const netAmount = Math.max(0, Math.round((gross - tdsAmount) * 100) / 100);

    return {
      ruleId: rule.id,
      productName: rule.product_name,
      partnerType: rule.partner_type,
      commissionRate: rule.commission_rate,
      grossAmount: gross,
      tdsRate,
      tdsAmount,
      netAmount,
      basis
    };
  }

  /**
   * Resolves rule and credits earnings only if an approved rule exists.
   * If no rule exists, stores/returns "Pending Commission Configuration" with zero money credited.
   */
  async resolveAndCreditLeadCommission(leadId, adminId = null) {
    const [leadRows] = await query(
      `SELECT l.*, p.partner_type, p.id AS partner_db_id 
       FROM leads l 
       JOIN partners p ON l.partner_id = p.id 
       WHERE l.id = ?`,
      [leadId]
    );

    if (leadRows.length === 0) {
      throw new Error(`Lead #${leadId} not found`);
    }

    const lead = leadRows[0];

    // Idempotency: Verify if commission was already processed for this lead
    const [existingEarnings] = await query(
      `SELECT * FROM partner_earnings WHERE lead_id = ? AND earning_type = 'lead_commission' LIMIT 1`,
      [leadId]
    );

    if (existingEarnings.length > 0) {
      return {
        success: true,
        alreadyProcessed: true,
        message: 'Commission already credited for this lead',
        earnings: existingEarnings[0]
      };
    }

    // Resolve matching rule
    const rule = await this.resolveRule(
      lead.loan_type || lead.product_category,
      lead.partner_type
    );

    if (!rule) {
      // Per Section 1: DO NOT credit money if no valid rule exists
      return {
        success: false,
        status: 'Pending Commission Configuration',
        credited: false,
        grossAmount: 0,
        netAmount: 0,
        reason: `No active commission rule configured for product '${lead.loan_type || lead.product_category}' and partner type '${lead.partner_type}'`
      };
    }

    // Calculate commission with deductions
    const calc = this.calculate(rule, lead.loan_amount);

    if (calc.netAmount <= 0) {
      return {
        success: false,
        status: 'Not Yet Eligible',
        credited: false,
        reason: 'Calculated commission net amount is zero or negative'
      };
    }

    const tdsPart = calc.tdsRate > 0 ? ` less Configured ${calc.tdsRate}% TDS: ₹${calc.tdsAmount}` : '';
    const description = `Commission for ${lead.loan_type || lead.product_category} (Rule #${calc.ruleId}: ${calc.basis}${tdsPart})`;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [earnRes] = await conn.query(
        `INSERT INTO partner_earnings (partner_id, lead_id, amount, earning_type, status, description)
         VALUES (?, ?, ?, 'lead_commission', 'available', ?)`,
        [lead.partner_db_id, lead.id, calc.netAmount, description]
      );

      // Atomically credit partner wallet earned_balance (idempotent via earning ID)
      const walletRepo = require('../repositories/walletRepository');
      await walletRepo.creditCommission({
        partnerId: lead.partner_db_id,
        amount: calc.netAmount,
        earningId: earnRes.insertId,
        description: `Commission: ${lead.loan_type || lead.product_category} (${lead.lead_code || 'Lead #' + lead.id})`,
        leadId: lead.id,
        conn
      });

      await conn.commit();

      const notificationService = require('./notificationService');
      notificationService.notifyCommission(
        lead.partner_db_id,
        lead.lead_code || `Lead #${lead.id}`,
        calc.netAmount,
        calc.basis
      ).catch(() => {});

      if (adminId) {
        await auditService.log(
          adminId,
          'commission.credited',
          'partner_earnings',
          String(earnRes.insertId),
          {
            leadId: lead.id,
            partnerId: lead.partner_db_id,
            ruleId: calc.ruleId,
            grossAmount: calc.grossAmount,
            tdsRate: calc.tdsRate,
            tdsAmount: calc.tdsAmount,
            netCommission: calc.netAmount
          }
        );
      }

      return {
        success: true,
        credited: true,
        status: 'Credited',
        earningsId: earnRes.insertId,
        ruleId: calc.ruleId,
        grossAmount: calc.grossAmount,
        tdsAmount: calc.tdsAmount,
        netCommission: calc.netAmount,
        basis: calc.basis,
        description
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = new CommissionService();
