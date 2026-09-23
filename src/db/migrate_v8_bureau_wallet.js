const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function migrateV8() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'earnmitra';

  if (database.toLowerCase() === 'loancrm') {
    throw new Error('SAFETY CHECK FAILED: Target database cannot be loancrm! Must be earnmitra.');
  }

  console.log(`[migrate_v8] Connecting to '${database}' database at ${host}:${port}...`);
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  try {
    console.log(`[migrate_v8] Ensuring bureau_pricing table exists...`);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS bureau_pricing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bureau VARCHAR(30) NOT NULL UNIQUE,
        provider VARCHAR(30) NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 18.00,
        is_active TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_bp_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Initialize / update temporary development pricing
    console.log(`[migrate_v8] Configuring temporary development bureau pricing...`);
    await conn.query(`
      INSERT INTO bureau_pricing (bureau, provider, price, gst_percentage, is_active)
      VALUES
        ('CIBIL', 'surepass', 99.00, 18.00, 1),
        ('CRIF', 'surepass', 69.00, 18.00, 1),
        ('EXPERIAN', 'verifyal', 79.00, 18.00, 1),
        ('EQUIFAX', 'verifyal', 79.00, 18.00, 1)
      ON DUPLICATE KEY UPDATE
        provider = VALUES(provider),
        price = VALUES(price),
        gst_percentage = VALUES(gst_percentage),
        is_active = VALUES(is_active);
    `);

    console.log(`[migrate_v8] Ensuring partner_wallets table exists with UNIQUE(partner_id)...`);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS partner_wallets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        partner_id INT NOT NULL,
        balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        total_recharged DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        total_spent DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_pw_partner_id (partner_id),
        INDEX idx_pw_partner (partner_id),
        CONSTRAINT fk_pw_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log(`[migrate_v8] Ensuring partner_wallet_transactions table exists...`);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS partner_wallet_transactions (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        partner_id INT NOT NULL,
        transaction_type ENUM('CREDIT', 'DEBIT', 'REFUND', 'RESERVATION', 'RESERVATION_RELEASE', 'ADJUSTMENT') NOT NULL,
        category VARCHAR(50) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        gst_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        net_amount DECIMAL(15,2) NOT NULL,
        balance_before DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        balance_after DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        description VARCHAR(255) DEFAULT NULL,
        reference_id VARCHAR(100) DEFAULT NULL,
        payment_gateway VARCHAR(30) DEFAULT NULL,
        status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REVERTED') NOT NULL DEFAULT 'SUCCESS',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_pwt_partner (partner_id, created_at),
        INDEX idx_pwt_ref (reference_id),
        CONSTRAINT fk_pwt_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure transaction_type enum includes RESERVATION and RESERVATION_RELEASE
    await conn.query(`
      ALTER TABLE partner_wallet_transactions
      MODIFY COLUMN transaction_type ENUM('CREDIT', 'DEBIT', 'REFUND', 'RESERVATION', 'RESERVATION_RELEASE', 'ADJUSTMENT') NOT NULL;
    `).catch(() => {});

    console.log(`[migrate_v8] Ensuring payment_orders table exists with unique constraints...`);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS payment_orders (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(100) NOT NULL,
        partner_id INT NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'INR',
        payment_gateway VARCHAR(30) NOT NULL,
        gateway_order_id VARCHAR(100) DEFAULT NULL,
        payment_session_id VARCHAR(255) DEFAULT NULL,
        payment_id VARCHAR(100) DEFAULT NULL,
        status ENUM('CREATED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'CREATED',
        raw_webhook_json LONGTEXT DEFAULT NULL,
        paid_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_po_order_id (order_id),
        INDEX idx_po_partner (partner_id),
        INDEX idx_po_gateway (payment_gateway, gateway_order_id),
        CONSTRAINT fk_po_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log(`[migrate_v8] Upgrading partner_cibil_reports for multi-bureau and billing status...`);
    const [cols] = await conn.query('SHOW COLUMNS FROM partner_cibil_reports');
    const existingCols = new Set(cols.map(c => c.Field));

    if (!existingCols.has('bureau')) {
      await conn.query(`ALTER TABLE partner_cibil_reports ADD COLUMN bureau VARCHAR(30) NOT NULL DEFAULT 'CIBIL' AFTER partner_id;`);
    }
    if (!existingCols.has('provider')) {
      await conn.query(`ALTER TABLE partner_cibil_reports ADD COLUMN provider VARCHAR(30) NOT NULL DEFAULT 'surepass' AFTER bureau;`);
    }
    if (!existingCols.has('report_type')) {
      await conn.query(`ALTER TABLE partner_cibil_reports ADD COLUMN report_type VARCHAR(30) NOT NULL DEFAULT 'cibil' AFTER provider;`);
    }
    if (!existingCols.has('provider_report_id')) {
      await conn.query(`ALTER TABLE partner_cibil_reports ADD COLUMN provider_report_id VARCHAR(100) DEFAULT NULL AFTER provider_client_id;`);
    }
    if (!existingCols.has('provider_request_id')) {
      await conn.query(`ALTER TABLE partner_cibil_reports ADD COLUMN provider_request_id VARCHAR(100) DEFAULT NULL AFTER provider_report_id;`);
    }
    if (!existingCols.has('normalized_data_json')) {
      await conn.query(`ALTER TABLE partner_cibil_reports ADD COLUMN normalized_data_json LONGTEXT DEFAULT NULL AFTER report_storage_path;`);
    }
    if (!existingCols.has('billing_status')) {
      await conn.query(`
        ALTER TABLE partner_cibil_reports
        ADD COLUMN billing_status ENUM('NOT_CALLED', 'NOT_BILLED', 'BILLED_REPORT_READY', 'BILLED_NO_REPORT', 'BILLING_UNKNOWN', 'REVIEW_REQUIRED', 'RESERVED', 'DEBITED', 'REFUNDED', 'EXEMPT') NOT NULL DEFAULT 'EXEMPT'
        AFTER failure_message;
      `);
    } else {
      // Modify billing_status to include comprehensive states
      await conn.query(`
        ALTER TABLE partner_cibil_reports
        MODIFY COLUMN billing_status ENUM('NOT_CALLED', 'NOT_BILLED', 'BILLED_REPORT_READY', 'BILLED_NO_REPORT', 'BILLING_UNKNOWN', 'REVIEW_REQUIRED', 'RESERVED', 'DEBITED', 'REFUNDED', 'EXEMPT') NOT NULL DEFAULT 'EXEMPT';
      `);
    }
    if (!existingCols.has('requested_at')) {
      await conn.query(`ALTER TABLE partner_cibil_reports ADD COLUMN requested_at DATETIME DEFAULT NULL AFTER billing_status;`);
    }
    if (!existingCols.has('completed_at')) {
      await conn.query(`ALTER TABLE partner_cibil_reports ADD COLUMN completed_at DATETIME DEFAULT NULL AFTER requested_at;`);
    }

    console.log(`[migrate_v8] Auto-provisioning wallets for any partner missing a wallet...`);
    // Fully unambiguous idempotent INSERT with WHERE NOT EXISTS
    const [provisionResult] = await conn.query(`
      INSERT INTO partner_wallets (partner_id, balance, total_recharged, total_spent)
      SELECT p.id, 0.00, 0.00, 0.00
      FROM partners p
      WHERE NOT EXISTS (
        SELECT 1 FROM partner_wallets pw WHERE pw.partner_id = p.id
      );
    `);
    console.log(`[migrate_v8] Auto-provisioned ${provisionResult.affectedRows} missing partner wallets.`);

    const [partnerCount] = await conn.query(`SELECT COUNT(*) as cnt FROM partners`);
    const [walletCount] = await conn.query(`SELECT COUNT(*) as cnt FROM partner_wallets`);
    console.log(`[migrate_v8] Partner count: ${partnerCount[0].cnt}, Wallet count: ${walletCount[0].cnt}`);

    if (partnerCount[0].cnt !== walletCount[0].cnt) {
      throw new Error(`Integrity violation: partner count (${partnerCount[0].cnt}) does not match wallet count (${walletCount[0].cnt})`);
    }

    console.log(`[migrate_v8] Migration V8 completed successfully.`);
  } catch (err) {
    console.error(`[migrate_v8] Migration error:`, err);
    throw err;
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  migrateV8()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migrateV8 };
