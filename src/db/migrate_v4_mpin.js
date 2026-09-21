const { query, pool } = require('../config/db');

async function migrate() {
  try {
    console.log('Starting migration v4 (MPIN & Trusted Device Sessions)...');

    // 1. Add MPIN columns to partners table if they do not exist
    const [cols] = await query('SHOW COLUMNS FROM partners');
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('mpin_hash')) {
      await query('ALTER TABLE partners ADD COLUMN mpin_hash VARCHAR(255) DEFAULT NULL AFTER password_hash');
      console.log('Added mpin_hash column to partners table.');
    } else {
      console.log('mpin_hash column already exists.');
    }

    if (!colNames.includes('mpin_configured_at')) {
      await query('ALTER TABLE partners ADD COLUMN mpin_configured_at DATETIME DEFAULT NULL AFTER mpin_hash');
      console.log('Added mpin_configured_at column to partners table.');
    } else {
      console.log('mpin_configured_at column already exists.');
    }

    if (!colNames.includes('mpin_attempts')) {
      await query('ALTER TABLE partners ADD COLUMN mpin_attempts INT DEFAULT 0 AFTER mpin_configured_at');
      console.log('Added mpin_attempts column to partners table.');
    } else {
      console.log('mpin_attempts column already exists.');
    }

    if (!colNames.includes('mpin_locked_until')) {
      await query('ALTER TABLE partners ADD COLUMN mpin_locked_until DATETIME DEFAULT NULL AFTER mpin_attempts');
      console.log('Added mpin_locked_until column to partners table.');
    } else {
      console.log('mpin_locked_until column already exists.');
    }

    // 2. Create partner_devices table for trusted device sessions
    await query(`
      CREATE TABLE IF NOT EXISTS partner_devices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        partner_id INT NOT NULL,
        device_id VARCHAR(128) NOT NULL,
        device_token_hash VARCHAR(255) NOT NULL,
        device_name VARCHAR(100) DEFAULT 'Mobile Device',
        platform VARCHAR(50) DEFAULT 'android',
        is_trusted TINYINT(1) DEFAULT 1,
        last_unlocked_at DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
        UNIQUE KEY uq_partner_device (partner_id, device_id)
      )
    `);
    console.log('partner_devices table created or verified.');

    // 3. Ensure otp_sessions has purpose column (or verify existing structure)
    const [otpCols] = await query('SHOW COLUMNS FROM otp_sessions');
    const otpColNames = otpCols.map(c => c.Field);
    if (!otpColNames.includes('purpose')) {
      await query("ALTER TABLE otp_sessions ADD COLUMN purpose VARCHAR(50) DEFAULT 'login' AFTER otp_hash");
      console.log('Added purpose column to otp_sessions table.');
    }

    console.log('Migration v4 completed successfully!');
  } catch (err) {
    console.error('Migration v4 failed:', err);
    process.exit(1);
  } finally {
    pool.end();
  }
}

migrate();
