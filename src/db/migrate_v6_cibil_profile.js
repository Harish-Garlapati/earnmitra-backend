const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function addColumnIfMissing(conn, table, column, definition) {
  const [rows] = await conn.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
  if (rows.length === 0) await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
}

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'earnmitra'
  });
  try {
    await addColumnIfMissing(conn, 'partners', 'profile_image_path', 'VARCHAR(500) DEFAULT NULL');
    await addColumnIfMissing(conn, 'partners', 'profile_image_mime', 'VARCHAR(100) DEFAULT NULL');
    await addColumnIfMissing(conn, 'partners', 'profile_image_updated_at', 'DATETIME DEFAULT NULL');
    await conn.query(`CREATE TABLE IF NOT EXISTS partner_cibil_reports (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      partner_id INT NOT NULL,
      provider_client_id VARCHAR(191) DEFAULT NULL,
      customer_name VARCHAR(120) NOT NULL,
      mobile VARCHAR(20) NOT NULL,
      pan VARCHAR(10) NOT NULL,
      gender VARCHAR(20) NOT NULL,
      consent_given TINYINT(1) NOT NULL DEFAULT 0,
      consent_text_version VARCHAR(80) NOT NULL,
      consented_at DATETIME NOT NULL,
      consent_ip VARCHAR(64) DEFAULT NULL,
      consent_user_agent VARCHAR(500) DEFAULT NULL,
      credit_score INT DEFAULT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'PROCESSING',
      report_storage_path VARCHAR(500) DEFAULT NULL,
      report_mime_type VARCHAR(100) DEFAULT NULL,
      provider_status_code INT DEFAULT NULL,
      failure_code VARCHAR(80) DEFAULT NULL,
      failure_message VARCHAR(255) DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_cibil_partner_created (partner_id, created_at),
      INDEX idx_cibil_status (status),
      CONSTRAINT fk_cibil_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    await conn.query(`CREATE TABLE IF NOT EXISTS partner_audit_logs (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      partner_id INT NOT NULL,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(80) NOT NULL,
      entity_id VARCHAR(80) DEFAULT NULL,
      metadata_json TEXT DEFAULT NULL,
      ip_address VARCHAR(64) DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_partner_audit_actor (partner_id, created_at),
      INDEX idx_partner_audit_entity (entity_type, entity_id),
      CONSTRAINT fk_partner_audit_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log('[migrate_v6] CIBIL and profile-photo schema ready.');
  } finally { await conn.end(); }
}

migrate().catch(error => { console.error('[migrate_v6] Migration failed:', error); process.exit(1); });
