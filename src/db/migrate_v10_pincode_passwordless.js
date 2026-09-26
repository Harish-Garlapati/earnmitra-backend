const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function migrateV10() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'earnmitra';

  if (database.toLowerCase() === 'loancrm') {
    throw new Error('SAFETY CHECK FAILED: Target database cannot be loancrm! Must be earnmitra.');
  }

  console.log(`[migrate_v10] Connecting to '${database}' database at ${host}:${port}...`);
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  try {
    console.log(`[migrate_v10] Inspecting partners table...`);
    const [cols] = await conn.query(`SHOW COLUMNS FROM partners`);
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('pincode')) {
      console.log(`[migrate_v10] Adding pincode to partners table...`);
      await conn.query(`
        ALTER TABLE partners
        ADD COLUMN pincode VARCHAR(10) NULL AFTER state
      `);
      console.log(`[migrate_v10] Added pincode to partners.`);
    } else {
      console.log(`[migrate_v10] pincode column already exists.`);
    }

    // Ensure password_hash is nullable for passwordless partner auth
    const pwCol = cols.find(c => c.Field === 'password_hash');
    if (pwCol && pwCol.Null === 'NO') {
      console.log(`[migrate_v10] Making password_hash nullable for passwordless flow...`);
      await conn.query(`
        ALTER TABLE partners
        MODIFY COLUMN password_hash VARCHAR(255) NULL
      `);
      console.log(`[migrate_v10] password_hash is now nullable.`);
    }

    console.log(`[migrate_v10] Inspecting pending_registrations table...`);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS pending_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mobile VARCHAR(20) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL,
        pincode VARCHAR(10) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_pending_mobile (mobile)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log(`[migrate_v10] pending_registrations table ready.`);

    console.log(`[migrate_v10] Migration V10 completed successfully!`);
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  migrateV10()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[migrate_v10] Migration failed:', err);
      process.exit(1);
    });
}

module.exports = migrateV10;
