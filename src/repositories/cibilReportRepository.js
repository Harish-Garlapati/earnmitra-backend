const { query } = require('../config/db');

function maskPan(pan) {
  const value = String(pan || '').toUpperCase();
  return value.length === 10 ? `${value.slice(0, 2)}***${value.slice(5, 9)}*` : '';
}

function publicReport(row, includeCustomer = false) {
  if (!row) return null;
  const report = {
    id: row.id,
    customerName: row.customer_name,
    maskedPan: maskPan(row.pan),
    mobile: row.mobile ? `******${String(row.mobile).slice(-4)}` : '',
    gender: row.gender,
    creditScore: row.credit_score == null ? null : Number(row.credit_score),
    status: row.status,
    failureCode: row.failure_code || null,
    failureMessage: row.failure_message || null,
    hasOriginalReport: Boolean(row.report_storage_path),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
  if (includeCustomer) report.consentGivenAt = row.consented_at;
  return report;
}

class CibilReportRepository {
  async createAttempt(partnerId, input, requestMeta) {
    const [result] = await query(
      `INSERT INTO partner_cibil_reports
       (partner_id, customer_name, mobile, pan, gender, consent_given, consent_text_version,
        consented_at, consent_ip, consent_user_agent, status)
       VALUES (?, ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP, ?, ?, 'PROCESSING')`,
      [partnerId, input.name, input.mobile, input.pan, input.gender, 'earnmitra-cibil-v1', requestMeta.ip || null, requestMeta.userAgent || null]
    );
    return result.insertId;
  }

  async markSuccess(id, partnerId, data) {
    await query(
      `UPDATE partner_cibil_reports SET provider_client_id = ?, credit_score = ?, status = 'SUCCESS',
       report_storage_path = ?, report_mime_type = ?, provider_status_code = ?, failure_code = NULL,
       failure_message = NULL WHERE id = ? AND partner_id = ?`,
      [data.clientId || null, data.creditScore, data.storagePath, data.mimeType, data.providerStatusCode || 200, id, partnerId]
    );
  }

  async markFailed(id, partnerId, status, code, message, providerStatusCode = null) {
    await query(
      `UPDATE partner_cibil_reports SET status = ?, failure_code = ?, failure_message = ?,
       provider_status_code = ? WHERE id = ? AND partner_id = ?`,
      [status, code, message, providerStatusCode, id, partnerId]
    );
  }

  async listForPartner(partnerId) {
    const [rows] = await query(
      `SELECT * FROM partner_cibil_reports WHERE partner_id = ? ORDER BY created_at DESC, id DESC LIMIT 100`,
      [partnerId]
    );
    return rows.map(row => publicReport(row));
  }

  async findOwned(id, partnerId) {
    const [rows] = await query(
      `SELECT * FROM partner_cibil_reports WHERE id = ? AND partner_id = ? LIMIT 1`,
      [id, partnerId]
    );
    return rows[0] || null;
  }

  async findOwnedPublic(id, partnerId) {
    return publicReport(await this.findOwned(id, partnerId), true);
  }

  async listForAdmin(filters = {}) {
    const params = [];
    let where = '';
    if (filters.partnerId) {
      where = 'WHERE r.partner_id = ?';
      params.push(Number(filters.partnerId));
    }
    const [rows] = await query(
      `SELECT r.*, p.partner_code, p.full_name AS partner_name
       FROM partner_cibil_reports r JOIN partners p ON p.id = r.partner_id
       ${where} ORDER BY r.created_at DESC, r.id DESC LIMIT 250`, params
    );
    return rows.map(row => ({ ...publicReport(row, true), partnerId: row.partner_id, partnerCode: row.partner_code, partnerName: row.partner_name }));
  }

  async findForAdmin(id) {
    const [rows] = await query(
      `SELECT r.*, p.partner_code, p.full_name AS partner_name
       FROM partner_cibil_reports r JOIN partners p ON p.id = r.partner_id WHERE r.id = ? LIMIT 1`, [id]
    );
    const row = rows[0];
    return row ? { ...publicReport(row, true), partnerId: row.partner_id, partnerCode: row.partner_code, partnerName: row.partner_name } : null;
  }
}

module.exports = new CibilReportRepository();
module.exports.maskPan = maskPan;
module.exports.publicReport = publicReport;
