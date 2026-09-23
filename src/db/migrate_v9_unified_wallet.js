const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function migrateV9() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'earnmitra';

  if (database.toLowerCase() === 'loancrm') {
    throw new Error('SAFETY CHECK FAILED: Target database cannot be loancrm! Must be earnmitra.');
  }

  console.log(`[migrate_v9] Connecting to '${database}' database at ${host}:${port}...`);
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  try {
    console.log(`[migrate_v9] Inspecting partner_wallets table...`);
    const [walletCols] = await conn.query(`SHOW COLUMNS FROM partner_wallets`);
    const colNames = walletCols.map(c => c.Field);

    if (!colNames.includes('earned_balance')) {
      console.log(`[migrate_v9] Adding earned_balance to partner_wallets...`);
      await conn.query(`
        ALTER TABLE partner_wallets
        ADD COLUMN earned_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER balance
      `);
    }

    if (!colNames.includes('recharge_balance')) {
      console.log(`[migrate_v9] Adding recharge_balance to partner_wallets...`);
      await conn.query(`
        ALTER TABLE partner_wallets
        ADD COLUMN recharge_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER earned_balance
      `);
    }

    console.log(`[migrate_v9] Preserving existing wallet funds as recharge_balance...`);
    // Preserve existing balance as recharge_balance (Added Money) so test/dev funds are NOT withdrawable
    await conn.query(`
      UPDATE partner_wallets
      SET recharge_balance = balance,
          earned_balance = 0.00
      WHERE recharge_balance = 0.00 AND earned_balance = 0.00 AND balance > 0
    `);

    console.log(`[migrate_v9] Inspecting partner_wallet_transactions table...`);
    const [txCols] = await conn.query(`SHOW COLUMNS FROM partner_wallet_transactions`);
    const txColNames = txCols.map(c => c.Field);

    if (!txColNames.includes('recharge_component')) {
      console.log(`[migrate_v9] Adding recharge_component to partner_wallet_transactions...`);
      await conn.query(`
        ALTER TABLE partner_wallet_transactions
        ADD COLUMN recharge_component DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER net_amount
      `);
    }

    if (!txColNames.includes('earned_component')) {
      console.log(`[migrate_v9] Adding earned_component to partner_wallet_transactions...`);
      await conn.query(`
        ALTER TABLE partner_wallet_transactions
        ADD COLUMN earned_component DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER recharge_component
      `);
    }

    // Add index on (partner_id, category, reference_id) for idempotent commission lookups
    const [indexes] = await conn.query(`SHOW INDEX FROM partner_wallet_transactions WHERE Key_name = 'idx_pwt_cat_ref'`);
    if (indexes.length === 0) {
      console.log(`[migrate_v9] Adding index idx_pwt_cat_ref to partner_wallet_transactions...`);
      await conn.query(`
        ALTER TABLE partner_wallet_transactions
        ADD INDEX idx_pwt_cat_ref (partner_id, category, reference_id)
      `);
    }

    // Verify partner 94 wallet state
    const [p94] = await conn.query(`SELECT partner_id, balance, earned_balance, recharge_balance FROM partner_wallets WHERE partner_id = 94`);
    if (p94.length > 0) {
      console.log(`[migrate_v9] Partner 94 verified: Balance=₹${p94[0].balance}, Earned=₹${p94[0].earned_balance}, Recharge=₹${p94[0].recharge_balance}`);
    }

    console.log(`[migrate_v9] Migration completed successfully.`);
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  migrateV9()
    .then(() => {
      console.log('[migrate_v9] DONE');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[migrate_v9] FAILED:', err);
      process.exit(1);
    });
}

module.exports = { migrateV9 };
