const { query } = require('../config/db');

async function log(partnerId, action, entityType, entityId, metadata = {}, ip = null) {
  await query(
    `INSERT INTO partner_audit_logs (partner_id, action, entity_type, entity_id, metadata_json, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [partnerId, action, entityType, entityId == null ? null : String(entityId), JSON.stringify(metadata), ip]
  );
}

module.exports = { log };
