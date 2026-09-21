const { query } = require('../config/db');

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.actorType !== 'admin' || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
  }
  next();
}

function requirePermission(...permissionKeys) {
  return async (req, res, next) => {
    if (!req.user || req.user.actorType !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const [rows] = await query(
        `SELECT ap.permission_key FROM admin_role_permissions arp
         JOIN admin_permissions ap ON arp.permission_id = ap.id
         JOIN admin_users au ON au.role_id = arp.role_id
         WHERE au.id = ? AND ap.permission_key IN (?)`,
        [req.user.adminId, permissionKeys]
      );
      const foundKeys = rows.map(r => r.permission_key);
      const hasPermission = permissionKeys.some(k => foundKeys.includes(k));
      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      req.adminPermissions = foundKeys;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireAdmin, requirePermission };
