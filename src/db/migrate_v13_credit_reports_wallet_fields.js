const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function migrateV13() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'earnmitra';

  if (database.toLowerCase() === 'loancrm') {
    throw new Error('SAFETY CHECK FAILED: Target database cannot be loancrm! Must be earnmitra.');
  }

  console.log(`[migrate_v13] Connecting to '${database}' database at ${host}:${port}...`);
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  try {
    console.log(`[migrate_v13] Inspecting partner_cibil_reports table...`);
    const [cols] = await conn.query(`SHOW COLUMNS FROM partner_cibil_reports`);
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('amount_charged')) {
      console.log(`[migrate_v13] Adding amount_charged column...`);
      await conn.query(`ALTER TABLE partner_cibil_reports ADD COLUMN amount_charged DECIMAL(10,2) NULL AFTER credit_score`);
      console.log(`[migrate_v13] Added amount_charged column.`);
    } else {
      console.log(`[migrate_v13] amount_charged column already exists.`);
    }

    if (!colNames.includes('payment_source')) {
      console.log(`[migrate_v13] Adding payment_source column...`);
      await conn.query(`ALTER TABLE partner_cibil_reports ADD COLUMN payment_source VARCHAR(30) NULL AFTER amount_charged`);
      console.log(`[migrate_v13] Added payment_source column.`);
    } else {
      console.log(`[migrate_v13] payment_source column already exists.`);
    }

    if (!colNames.includes('wallet_transaction_id')) {
      console.log(`[migrate_v13] Adding wallet_transaction_id column...`);
      await conn.query(`ALTER TABLE partner_cibil_reports ADD COLUMN wallet_transaction_id BIGINT NULL AFTER payment_source`);
      console.log(`[migrate_v13] Added wallet_transaction_id column.`);
    } else {
      console.log(`[migrate_v13] wallet_transaction_id column already exists.`);
    }

    // Inspect indexes
    const [indexes] = await conn.query(`SHOW INDEX FROM partner_cibil_reports`);
    const indexNames = indexes.map(i => i.Key_name);
    if (!indexNames.includes('idx_partner_reports_date')) {
      console.log(`[migrate_v13] Adding idx_partner_reports_date index...`);
      await conn.query(`CREATE INDEX idx_partner_reports_date ON partner_cibil_reports (partner_id, created_at)`);
      console.log(`[migrate_v13] Added idx_partner_reports_date index.`);
    }

    console.log(`[migrate_v13] Migration v13 completed successfully.`);
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  migrateV13()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[migrate_v13] Migration failed:', err);
      process.exit(1);
    });
}

module.exports = migrateV13;
