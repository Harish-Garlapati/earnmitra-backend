const { query } = require('../config/db');

function maskPan(pan) {
  const value = String(pan || '').toUpperCase();
  return value.length === 10 ? `${value.slice(0, 2)}***${value.slice(5, 9)}*` : '';
}

function publicReport(row, includeCustomer = false) {
  if (!row) return null;
  let parsedNormalized = null;
  if (row.normalized_data_json) {
    try {
      parsedNormalized = typeof row.normalized_data_json === 'string'
        ? JSON.parse(row.normalized_data_json)
        : row.normalized_data_json;
    } catch {}
  }

  const isMock = row.provider === 'MOCK' || parsedNormalized?.isMock === true;
  const testMode = isMock || parsedNormalized?.testMode === true;

  const report = {
    id: row.id,
    bureau: row.bureau || 'CIBIL',
    provider: row.provider || 'surepass',
    customerName: row.customer_name,
    maskedPan: maskPan(row.pan),
    mobile: row.mobile ? `******${String(row.mobile).slice(-4)}` : '',
    gender: row.gender,
    creditScore: row.credit_score == null ? null : Number(row.credit_score),
    status: row.status,
    billingStatus: row.billing_status || 'EXEMPT',
    failureCode: row.failure_code || null,
    failureMessage: row.failure_message || null,
    hasOriginalReport: Boolean(row.report_storage_path),
    normalizedData: parsedNormalized,
    isMock: Boolean(isMock),
    testMode: Boolean(testMode),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
  if (includeCustomer) report.consentGivenAt = row.consented_at;
  return report;
}

class CibilReportRepository {
  async createAttempt(partnerId, input, requestMeta = {}) {
    const bureau = (input.bureau || 'CIBIL').toUpperCase();
    const provider = input.provider || (['EXPERIAN', 'EQUIFAX'].includes(bureau) ? 'verifyal' : 'surepass');

    const [result] = await query(
      `INSERT INTO partner_cibil_reports
       (partner_id, bureau, provider, customer_name, mobile, pan, gender, consent_given, consent_text_version,
        consented_at, consent_ip, consent_user_agent, status, billing_status, requested_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP, ?, ?, 'PROCESSING', 'NOT_CALLED', CURRENT_TIMESTAMP)`,
      [
        partnerId,
        bureau,
        provider,
        input.name,
        input.mobile,
        input.pan,
        input.gender,
        'earnmitra-cibil-v1',
        requestMeta.ip || null,
        requestMeta.userAgent || null
      ]
    );
    return result.insertId;
  }

  async updateBillingStatus(id, partnerId, billingStatus) {
    await query(
      'UPDATE partner_cibil_reports SET billing_status = ? WHERE id = ? AND partner_id = ?',
      [billingStatus, id, partnerId]
    );
  }

  async markSuccess(id, partnerId, data, billingStatus = 'BILLED_REPORT_READY') {
    await query(
      `UPDATE partner_cibil_reports
       SET provider_client_id = ?, provider = COALESCE(?, provider), credit_score = ?, status = 'SUCCESS',
           report_storage_path = ?, report_mime_type = ?, provider_status_code = ?,
           normalized_data_json = ?, billing_status = ?, completed_at = CURRENT_TIMESTAMP,
           failure_code = NULL, failure_message = NULL
       WHERE id = ? AND partner_id = ?`,
      [
        data.clientId || null,
        data.provider || null,
        data.creditScore,
        data.storagePath,
        data.mimeType,
        data.providerStatusCode || 200,
        data.normalizedData ? JSON.stringify(data.normalizedData) : null,
        billingStatus,
        id,
        partnerId
      ]
    );
  }

  async markFailed(id, partnerId, status, code, message, providerStatusCode = null, billingStatus = 'NOT_BILLED') {
    await query(
      `UPDATE partner_cibil_reports
       SET status = ?, failure_code = ?, failure_message = ?,
           provider_status_code = ?, billing_status = ?, completed_at = CURRENT_TIMESTAMP
       WHERE id = ? AND partner_id = ?`,
      [status, code, message, providerStatusCode, billingStatus, id, partnerId]
    );
  }

  async listForPartner(partnerId, { bureau } = {}) {
    let sql = 'SELECT * FROM partner_cibil_reports WHERE partner_id = ?';
    const params = [partnerId];

    if (bureau && bureau !== 'ALL') {
      sql += ' AND UPPER(bureau) = ?';
      params.push(bureau.toUpperCase());
    }

    sql += ' ORDER BY created_at DESC, id DESC LIMIT 100';

    const [rows] = await query(sql, params);
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

const repoInstance = new CibilReportRepository();
repoInstance.maskPan = maskPan;
repoInstance.publicReport = publicReport;

module.exports = repoInstance;

