const { query, pool } = require('../config/db');

class LeadRepository {
  async findAll({ partnerId, status, search, limit = 50, offset = 0 } = {}) {
    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (partnerId) {
      sql += ' AND partner_id = ?';
      params.push(partnerId);
    }
    if (status && status !== 'All') {
      if (status === 'In Progress') {
        sql += ' AND (status = ? OR status = ?)';
        params.push('In Progress', 'Under Review');
      } else {
        sql += ' AND status = ?';
        params.push(status);
      }
    }

    if (search) {
      sql += ' AND (applicant_name LIKE ? OR mobile LIKE ? OR lead_code LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    const safeLimit = Math.min(1000, Math.max(1, parseInt(limit, 10) || 500));
    const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(safeLimit, safeOffset);

    const [rows] = await query(sql, params);
    return rows;
  }

  async findByIdOrCode(idOrCode) {
    if (!idOrCode) return null;
    const trimmed = String(idOrCode).trim();
    const isNumeric = /^\d+$/.test(trimmed);

    let sql;
    let params;
    if (isNumeric) {
      sql = 'SELECT * FROM leads WHERE id = ? OR lead_code = ? LIMIT 1';
      params = [parseInt(trimmed, 10), trimmed];
    } else {
      sql = 'SELECT * FROM leads WHERE UPPER(lead_code) = UPPER(?) LIMIT 1';
      params = [trimmed];
    }
    const [rows] = await query(sql, params);
    return rows[0] || null;
  }

  async getTimeline(leadId) {
    const [rows] = await query(
      'SELECT * FROM lead_status_history WHERE lead_id = ? ORDER BY created_at ASC',
      [leadId]
    );
    return rows;
  }

  async getLoanDetails(leadId) {
    const [rows] = await query(
      'SELECT * FROM loan_lead_details WHERE lead_id = ? LIMIT 1',
      [leadId]
    );
    return rows[0] || null;
  }

  async getBookingCode(leadId) {
    const [rows] = await query(
      'SELECT * FROM direct_booking_codes WHERE lead_id = ? ORDER BY id DESC LIMIT 1',
      [leadId]
    );
    return rows[0] || null;
  }

  async getLenderSelections(leadId) {
    const [rows] = await query(
      `SELECT dbs.*, l.name as lender_name, l.code as lender_code 
       FROM direct_booking_lender_selections dbs
       JOIN lenders l ON l.id = dbs.lender_id
       WHERE dbs.lead_id = ? ORDER BY dbs.id ASC`,
      [leadId]
    );
    return rows;
  }

  async getCreditCardDetails(leadId) {
    const [rows] = await query(
      'SELECT * FROM credit_card_lead_details WHERE lead_id = ? LIMIT 1',
      [leadId]
    );
    return rows[0] || null;
  }

  async getInsuranceDetails(leadId) {
    const [rows] = await query(
      'SELECT * FROM insurance_lead_details WHERE lead_id = ? LIMIT 1',
      [leadId]
    );
    return rows[0] || null;
  }

  async getNextLeadCode() {
    const [rows] = await query(
      `SELECT lead_code FROM leads 
       WHERE lead_code LIKE 'FTL%' 
       ORDER BY LENGTH(lead_code) DESC, lead_code DESC 
       LIMIT 1`
    );

    if (rows.length > 0) {
      const match = rows[0].lead_code.match(/^FTL(\d+)$/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `FTL${nextNum}`;
      }
    }
    return 'FTL123461';
  }

  async create(data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const leadCode = data.lead_code || await this.getNextLeadCode();
      const insertLeadSql = `
        INSERT INTO leads (
          lead_code, partner_id, product_category, loan_type, applicant_name,
          business_name, mobile, city, pincode, state, applicant_type, entity_type,
          profession, pan, dob_or_incorporation, income_or_turnover, loan_amount,
          monthly_salary, status, current_stage, mode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [leadResult] = await conn.query(insertLeadSql, [
        leadCode,
        data.partner_id,
        data.product_category || 'Loans',
        data.loan_type,
        data.applicant_name || null,
        data.business_name || null,
        data.mobile,
        data.city,
        data.pincode || null,
        data.state || null,
        data.applicant_type || null,
        data.entity_type || null,
        data.profession || null,
        data.pan || null,
        data.dob_or_incorporation || null,
        data.income_or_turnover || null,
        data.loan_amount || 0,
        data.monthly_salary || null,
        data.status || 'In Progress',
        data.current_stage || 'Lead submitted',
        data.mode || 'referral'
      ]);

      const newLeadId = leadResult.insertId;

      // If loan product, persist in loan_lead_details
      if (data.product_category === 'Loans' || (!data.credit_card_details && !data.insurance_details)) {
        await conn.query(
          `INSERT INTO loan_lead_details (
            lead_id, applicant_type, entity_type, custom_entity_type,
            profession, custom_profession, monthly_salary, income,
            pincode, place, state, mode, customer_consent
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newLeadId,
            data.applicant_type || null,
            data.entity_type || null,
            data.custom_entity_type || null,
            data.profession || null,
            data.custom_profession || null,
            data.monthly_salary || null,
            data.income_or_turnover || null,
            data.pincode || null,
            data.city || null,
            data.state || null,
            data.mode || 'referral',
            data.customer_consent === false ? 0 : 1
          ]
        );
      }

      // If direct booking code provided, record it
      if (data.booking_code) {
        await conn.query(
          `INSERT INTO direct_booking_codes (lead_id, partner_id, code, is_validated) VALUES (?, ?, ?, 0)`,
          [newLeadId, data.partner_id, data.booking_code]
        );
      }

      // If credit card lead, save credit card specific details
      if (data.credit_card_details) {
        const cc = data.credit_card_details;
        await conn.query(
          `INSERT INTO credit_card_lead_details (
            lead_id, card_category, preferred_bank, employment_type,
            monthly_income, has_existing_card, existing_card_limit
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            newLeadId,
            cc.cardCategory || null,
            cc.preferredBank || null,
            cc.employmentType || null,
            cc.monthlyIncome || null,
            cc.hasExistingCard ? 1 : 0,
            cc.existingCardLimit || null
          ]
        );
      }

      // If insurance lead, save insurance specific details
      if (data.insurance_details) {
        const ins = data.insurance_details;
        await conn.query(
          `INSERT INTO insurance_lead_details (
            lead_id, insurance_type, sum_insured, vehicle_number, policy_term
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            newLeadId,
            ins.insuranceType || data.loan_type,
            ins.sumInsured || null,
            ins.vehicleNumber || null,
            ins.policyTerm || null
          ]
        );
      }

      // Add initial status history entry
      const insertHistorySql = `
        INSERT INTO lead_status_history (lead_id, status, stage, note)
        VALUES (?, ?, ?, ?)
      `;
      await conn.query(insertHistorySql, [
        newLeadId,
        data.status || 'In Progress',
        data.current_stage || 'Lead submitted',
        data.note || 'Lead submitted'
      ]);

      await conn.commit();

      return {
        id: newLeadId,
        lead_code: leadCode
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async addStatusHistory(leadId, status, stage, note) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `INSERT INTO lead_status_history (lead_id, status, stage, note) VALUES (?, ?, ?, ?)`,
        [leadId, status, stage, note]
      );

      await conn.query(
        `UPDATE leads SET status = ?, current_stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, stage, leadId]
      );

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async getDocuments(leadId) {
    const [rows] = await query(
      'SELECT * FROM lead_documents WHERE lead_id = ? ORDER BY created_at ASC',
      [leadId]
    );
    return rows;
  }
}

module.exports = new LeadRepository();
