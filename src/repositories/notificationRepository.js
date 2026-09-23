const { query } = require('../config/db');

class NotificationRepository {
  async listByPartner(partnerId, options = {}) {
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 50));
    const offset = Math.max(0, Number(options.offset) || 0);
    const unreadOnly = options.unreadOnly === true || options.unreadOnly === 'true';

    let sql = `
      SELECT id, partner_id AS partnerId, type, title, message,
             resource_type AS resourceType, resource_id AS resourceId,
             is_read AS isRead, created_at AS createdAt, read_at AS readAt
      FROM notifications
      WHERE partner_id = ?
    `;
    const params = [partnerId];

    if (unreadOnly) {
      sql += ' AND is_read = 0';
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await query(sql, params);
    return rows;
  }

  async getUnreadCount(partnerId) {
    const [rows] = await query(
      'SELECT COUNT(*) AS count FROM notifications WHERE partner_id = ? AND is_read = 0',
      [partnerId]
    );
    return rows[0] ? Number(rows[0].count) : 0;
  }

  async markAsRead(notificationId, partnerId) {
    const [result] = await query(
      `UPDATE notifications
       SET is_read = 1, read_at = NOW()
       WHERE id = ? AND partner_id = ?`,
      [notificationId, partnerId]
    );
    return result.affectedRows > 0;
  }

  async markAllAsRead(partnerId) {
    const [result] = await query(
      `UPDATE notifications
       SET is_read = 1, read_at = NOW()
       WHERE partner_id = ? AND is_read = 0`,
      [partnerId]
    );
    return result.affectedRows;
  }

  async create({ partnerId, type, title, message, resourceType = null, resourceId = null }) {
    const [result] = await query(
      `INSERT INTO notifications (partner_id, type, title, message, resource_type, resource_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [partnerId, type, title, message, resourceType, resourceId ? String(resourceId) : null]
    );
    return result.insertId;
  }
}

module.exports = new NotificationRepository();
