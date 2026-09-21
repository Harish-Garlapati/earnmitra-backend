const { query } = require('../config/db');

class PartnerRepository {
  async findByCode(partnerCode) {
    const [rows] = await query(
      'SELECT * FROM partners WHERE partner_code = ? LIMIT 1',
      [partnerCode]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await query(
      'SELECT * FROM partners WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  async findByMobile(mobile) {
    const [rows] = await query(
      'SELECT * FROM partners WHERE mobile = ? LIMIT 1',
      [mobile]
    );
    return rows[0] || null;
  }

  async create(data) {
    const sql = `
      INSERT INTO partners (
        partner_code, full_name, mobile, email, partner_type, 
        business_name, city, district, state, pan, kyc_status, approval_status,
        bank_account_name, bank_account_number, bank_ifsc, bank_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.partner_code,
      data.full_name,
      data.mobile,
      data.email || null,
      data.partner_type,
      data.business_name || null,
      data.city || null,
      data.district || null,
      data.state,
      data.pan || null,
      data.kyc_status || 'pending',
      data.approval_status || 'pending',
      data.bank_account_name || null,
      data.bank_account_number || null,
      data.bank_ifsc || null,
      data.bank_name || null
    ];
    const [result] = await query(sql, params);
    return this.findById(result.insertId);
  }

  async updateProfilePhoto(partnerId, storagePath, mimeType) {
    await query(
      'UPDATE partners SET profile_image_path = ?, profile_image_mime = ?, profile_image_updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [storagePath, mimeType, partnerId]
    );
    return this.findById(partnerId);
  }

  async getCounts(partnerId) {
    const [rows] = await query(
      `SELECT 
        COUNT(*) AS totalSubmitted,
        SUM(CASE WHEN status = 'Disbursed' THEN 1 ELSE 0 END) AS disbursed,
        SUM(CASE WHEN status = 'In Progress' OR status = 'Under Review' THEN 1 ELSE 0 END) AS inProgress,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected
       FROM leads 
       WHERE partner_id = ?`,
      [partnerId]
    );

    const counts = rows[0] || {};
    return {
      submitted: Number(counts.totalSubmitted) || 0,
      disbursed: Number(counts.disbursed) || 0,
      inProgress: Number(counts.inProgress) || 0,
      rejected: Number(counts.rejected) || 0
    };
  }

  async getEarnings(partnerId) {
    const [rows] = await query(
      `SELECT 
        SUM(CASE WHEN status = 'paid' AND earning_type != 'tds' THEN amount ELSE 0 END) AS totalPaid,
        SUM(CASE WHEN status = 'available' THEN amount ELSE 0 END) AS available,
        SUM(CASE WHEN earning_type != 'tds' THEN amount ELSE 0 END) AS totalEarnings,
        SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE()) AND earning_type != 'tds' THEN amount ELSE 0 END) AS thisMonth
       FROM partner_earnings
       WHERE partner_id = ?`,
      [partnerId]
    );

    const stats = rows[0] || {};
    return {
      total: Number(stats.totalEarnings) || 0,
      paid: Number(stats.totalPaid) || 0,
      available: Number(stats.available) || 0,
      thisMonth: Number(stats.thisMonth) || 0
    };
  }

  async getSetting(key) {
    const [rows] = await query(
      'SELECT setting_value FROM app_settings WHERE setting_key = ? LIMIT 1',
      [key]
    );
    if (!rows[0]) return null;
    try {
      return JSON.parse(rows[0].setting_value);
    } catch {
      return rows[0].setting_value;
    }
  }
}

module.exports = new PartnerRepository();
