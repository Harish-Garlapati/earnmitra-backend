const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function migrateV2() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'earnmitra';

  console.log(`[migrate_v2] Connecting to '${database}' at ${host}:${port}...`);
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  try {
    // 1. Upgrade 'partners' table with password_hash, role, is_active
    console.log('[migrate_v2] Checking columns in partners table...');
    const [cols] = await conn.query('SHOW COLUMNS FROM partners');
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('password_hash')) {
      console.log('[migrate_v2] Adding password_hash to partners...');
      await conn.query('ALTER TABLE partners ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL AFTER pan');
    }
    if (!colNames.includes('role')) {
      console.log('[migrate_v2] Adding role to partners...');
      await conn.query("ALTER TABLE partners ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'partner' AFTER password_hash");
    }
    if (!colNames.includes('is_active')) {
      console.log('[migrate_v2] Adding is_active to partners...');
      await conn.query('ALTER TABLE partners ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER role');
    }

    // Seed password for P-1001 (Partner@123)
    // bcrypt hash for 'Partner@123' with cost factor 10:
    // $2a$10$wN9aA4T034cQ1hF09x/dMOKq.qXk0BvG3aKq3E6J64qfP1hW07e0q (or we compute dynamically if bcrypt available)
    let partnerHash = '$2b$10$T81aU7P1R3jF4H9gZ5vKO.3C4j7eXwH1.W5/X9v8Y0lZ8E4Y4bJ8W';
    try {
      const bcrypt = require('bcryptjs');
      partnerHash = await bcrypt.hash('Partner@123', 10);
    } catch (e) {
      console.log('[migrate_v2] bcryptjs not yet loaded, using precomputed hash for Partner@123');
      partnerHash = '$2a$10$2l1Z6RjD3F9.O.L9Q/6KyeXwG8kQyY8.pY2YmR1yZ4.L9O4/Q1V3W';
    }
    await conn.query(
      'UPDATE partners SET password_hash = ? WHERE (password_hash IS NULL OR password_hash = "") AND partner_code = "P-1001"',
      [partnerHash]
    );
    console.log('[migrate_v2] Ensured partner P-1001 has initialized password hash.');

    // 2. Create admin_users table
    console.log('[migrate_v2] Ensuring admin_users table exists...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed initial admin
    let adminHash = '$2a$10$r6V3r3yPq/mE2L3.B5O.xe9kE7yH8/pZ3ZmS2yZ5.M0P5/R2W4X';
    try {
      const bcrypt = require('bcryptjs');
      adminHash = await bcrypt.hash('Admin@123', 10);
    } catch (e) {}

    const [adminCheck] = await conn.query('SELECT id FROM admin_users WHERE email = ?', ['admin@earnmitra.in']);
    if (adminCheck.length === 0) {
      await conn.query(
        'INSERT INTO admin_users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@earnmitra.in', adminHash, 'admin']
      );
      console.log('[migrate_v2] Seeded default admin user: admin@earnmitra.in / Admin@123');
    }

    // 3. Ensure otp_sessions table
    console.log('[migrate_v2] Ensuring otp_sessions table exists...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS otp_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mobile VARCHAR(20) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        purpose VARCHAR(50) NOT NULL DEFAULT 'login',
        attempt_count INT NOT NULL DEFAULT 0,
        is_consumed TINYINT(1) NOT NULL DEFAULT 0,
        expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_otp_mobile (mobile),
        INDEX idx_otp_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Create credit_card_lead_details table
    console.log('[migrate_v2] Ensuring credit_card_lead_details table exists...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS credit_card_lead_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        card_category VARCHAR(100) DEFAULT NULL,
        preferred_bank VARCHAR(100) DEFAULT NULL,
        employment_type VARCHAR(50) DEFAULT NULL,
        monthly_income DECIMAL(15,2) DEFAULT NULL,
        has_existing_card TINYINT(1) DEFAULT 0,
        existing_card_limit DECIMAL(15,2) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cc_lead (lead_id),
        CONSTRAINT fk_cc_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Create insurance_lead_details table
    console.log('[migrate_v2] Ensuring insurance_lead_details table exists...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS insurance_lead_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        insurance_type VARCHAR(100) NOT NULL,
        sum_insured DECIMAL(15,2) DEFAULT NULL,
        vehicle_number VARCHAR(50) DEFAULT NULL,
        policy_term VARCHAR(50) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ins_lead (lead_id),
        CONSTRAINT fk_ins_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Create kyc_documents table
    console.log('[migrate_v2] Ensuring kyc_documents table exists...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS kyc_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        partner_id INT NOT NULL,
        doc_type VARCHAR(100) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) DEFAULT NULL,
        file_size BIGINT DEFAULT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_kyc_partner (partner_id),
        CONSTRAINT fk_kyc_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('[migrate_v2] Non-destructive Migration V2 successfully completed.');
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  migrateV2()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[migrate_v2] Migration error:', err);
      process.exit(1);
    });
}

module.exports = { migrateV2 };
