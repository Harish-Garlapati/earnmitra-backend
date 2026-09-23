const { query } = require('../config/db');

class AuditService {
  async log(adminId, action, entityType = null, entityId = null, metadata = null, ipAddress = null) {
    try {
      await query(
        `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, metadata, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [adminId, action, entityType, entityId, metadata ? JSON.stringify(metadata) : null, ipAddress]
      );
    } catch (err) {
      console.error('[AuditService] Failed to log audit:', err.message);
    }
  }

  async logAction(adminId, action, entityType = null, entityId = null, metadata = null, ipAddress = null) {
    return this.log(adminId, action, entityType, entityId, metadata, ipAddress);
  }

  async getAll({ page = 1, limit = 25, action, entityType, adminId, dateFrom, dateTo } = {}) {
    let sql = `SELECT al.*, au.username, au.email as admin_email
               FROM audit_logs al
               LEFT JOIN admin_users au ON al.admin_id = au.id
               WHERE 1=1`;
    const params = [];
    let countSql = 'SELECT COUNT(*) as total FROM audit_logs al WHERE 1=1';
    const countParams = [];

    if (action) { sql += ' AND al.action = ?'; params.push(action); countSql += ' AND al.action = ?'; countParams.push(action); }
    if (entityType) { sql += ' AND al.entity_type = ?'; params.push(entityType); countSql += ' AND al.entity_type = ?'; countParams.push(entityType); }
    if (adminId) { sql += ' AND al.admin_id = ?'; params.push(adminId); countSql += ' AND al.admin_id = ?'; countParams.push(adminId); }
    if (dateFrom) { sql += ' AND al.created_at >= ?'; params.push(dateFrom); countSql += ' AND al.created_at >= ?'; countParams.push(dateFrom); }
    if (dateTo) { sql += ' AND al.created_at <= ?'; params.push(dateTo); countSql += ' AND al.created_at <= ?'; countParams.push(dateTo); }

    const [countRows] = await query(countSql, countParams);
    const total = countRows[0]?.total || 0;
    const offset = (page - 1) * limit;
    sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await query(sql, params);
    return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new AuditService();
