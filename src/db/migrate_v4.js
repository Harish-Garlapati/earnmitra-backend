const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function migrateV4() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'earnmitra';

  console.log(`[migrate_v4] Connecting to '${database}' at ${host}:${port}...`);
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database
  });

  try {
    // 1. Upgrade payout_requests
    console.log('[migrate_v4] Checking payout_requests schema...');
    const [payoutCols] = await conn.query('SHOW COLUMNS FROM payout_requests');
    const payoutColNames = payoutCols.map(c => c.Field);

    // Ensure status column is VARCHAR(50) so all state machine values are allowed
    await conn.query("ALTER TABLE payout_requests MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED'");

    if (!payoutColNames.includes('reviewed_by')) {
      await conn.query('ALTER TABLE payout_requests ADD COLUMN reviewed_by INT DEFAULT NULL');
      console.log('[migrate_v4] Added reviewed_by to payout_requests');
    }
    if (!payoutColNames.includes('reviewed_at')) {
      await conn.query('ALTER TABLE payout_requests ADD COLUMN reviewed_at DATETIME DEFAULT NULL');
      console.log('[migrate_v4] Added reviewed_at to payout_requests');
    }
    if (!payoutColNames.includes('approved_by')) {
      await conn.query('ALTER TABLE payout_requests ADD COLUMN approved_by INT DEFAULT NULL');
      console.log('[migrate_v4] Added approved_by to payout_requests');
    }
    if (!payoutColNames.includes('approved_at')) {
      await conn.query('ALTER TABLE payout_requests ADD COLUMN approved_at DATETIME DEFAULT NULL');
      console.log('[migrate_v4] Added approved_at to payout_requests');
    }
    if (!payoutColNames.includes('settled_by')) {
      await conn.query('ALTER TABLE payout_requests ADD COLUMN settled_by INT DEFAULT NULL');
      console.log('[migrate_v4] Added settled_by to payout_requests');
    }
    if (!payoutColNames.includes('settled_at')) {
      await conn.query('ALTER TABLE payout_requests ADD COLUMN settled_at DATETIME DEFAULT NULL');
      console.log('[migrate_v4] Added settled_at to payout_requests');
    }
    if (!payoutColNames.includes('utr_number')) {
      await conn.query('ALTER TABLE payout_requests ADD COLUMN utr_number VARCHAR(100) DEFAULT NULL');
      console.log('[migrate_v4] Added utr_number to payout_requests');
    }
    if (!payoutColNames.includes('rejection_reason')) {
      await conn.query('ALTER TABLE payout_requests ADD COLUMN rejection_reason TEXT DEFAULT NULL');
      console.log('[migrate_v4] Added rejection_reason to payout_requests');
    }

    // Normalize any legacy status values: 'pending' -> 'REQUESTED', 'approved' -> 'APPROVED', 'paid' -> 'PAID', 'rejected' -> 'REJECTED'
    await conn.query("UPDATE payout_requests SET status = 'REQUESTED' WHERE status = 'pending'");
    await conn.query("UPDATE payout_requests SET status = 'APPROVED' WHERE status = 'approved'");
    await conn.query("UPDATE payout_requests SET status = 'PAID' WHERE status = 'paid'");
    await conn.query("UPDATE payout_requests SET status = 'REJECTED' WHERE status = 'rejected'");

    // 2. Upgrade kyc_documents
    console.log('[migrate_v4] Checking kyc_documents schema...');
    const [kycCols] = await conn.query('SHOW COLUMNS FROM kyc_documents');
    const kycColNames = kycCols.map(c => c.Field);

    if (!kycColNames.includes('reviewed_by')) {
      await conn.query('ALTER TABLE kyc_documents ADD COLUMN reviewed_by INT DEFAULT NULL');
      console.log('[migrate_v4] Added reviewed_by to kyc_documents');
    }
    if (!kycColNames.includes('reviewed_at')) {
      await conn.query('ALTER TABLE kyc_documents ADD COLUMN reviewed_at DATETIME DEFAULT NULL');
      console.log('[migrate_v4] Added reviewed_at to kyc_documents');
    }
    if (!kycColNames.includes('review_remarks')) {
      await conn.query('ALTER TABLE kyc_documents ADD COLUMN review_remarks TEXT DEFAULT NULL');
      console.log('[migrate_v4] Added review_remarks to kyc_documents');
    }

    // 3. Upgrade partners table with referred_by_partner_id
    console.log('[migrate_v4] Checking partners schema...');
    const [partnerCols] = await conn.query('SHOW COLUMNS FROM partners');
    const partnerColNames = partnerCols.map(c => c.Field);

    if (!partnerColNames.includes('referred_by_partner_id')) {
      await conn.query('ALTER TABLE partners ADD COLUMN referred_by_partner_id INT DEFAULT NULL');
      console.log('[migrate_v4] Added referred_by_partner_id to partners');
    }

    // 4. Ensure a Checker Admin account exists for Maker-Checker workflows
    const [checkerRows] = await conn.query("SELECT id FROM admin_users WHERE username = 'finance_checker'");
    if (checkerRows.length === 0) {
      const [roleRows] = await conn.query("SELECT id FROM admin_roles WHERE role_name = 'Finance'");
      const roleId = roleRows.length > 0 ? roleRows[0].id : 1;
      const checkerHash = await bcrypt.hash('FinanceChecker@Secured2026#', 10);
      await conn.query(
        "INSERT INTO admin_users (username, email, password_hash, role_id, is_active) VALUES (?, ?, ?, ?, 1)",
        ['finance_checker', 'checker@earnmitra.in', checkerHash, roleId]
      );
      console.log('[migrate_v4] Seeded secondary finance_checker admin user.');
    }

    console.log('[migrate_v4] Migration v4 completed successfully.');
  } catch (err) {
    console.error('[migrate_v4] Migration failed:', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

migrateV4();
