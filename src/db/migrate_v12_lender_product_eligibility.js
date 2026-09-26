const { pool } = require('../config/db');

async function migrateV12() {
  const conn = await pool.getConnection();
  try {
    console.log('[migrate_v12] Starting Lender Product Eligibility migration...');

    // 1. Create lender_product_mappings table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lender_product_mappings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lender_id INT NOT NULL,
        loan_type VARCHAR(100) NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_lpm_lender (lender_id),
        INDEX idx_lpm_loan_type (loan_type),
        UNIQUE KEY uq_lender_loan (lender_id, loan_type),
        CONSTRAINT fk_lpm_lender FOREIGN KEY (lender_id) REFERENCES lenders (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[migrate_v12] lender_product_mappings table verified/created.');

    // 2. Production Guard: Separate schema creation from development test seed data
    if (process.env.NODE_ENV === 'production') {
      console.log('[migrate_v12] PRODUCTION ENVIRONMENT DETECTED: Schema created safely.');
      console.log('[migrate_v12] Skipping development test seed data. Production lender-product mappings require confirmed commercial data.');
      console.log('[migrate_v12] Migration completed successfully.');
      return;
    }

    console.log('[migrate_v12] DEVELOPMENT/TEST ENVIRONMENT: Seeding configured test lender-product mappings for local verification...');

    // 3. Fetch lenders by code for clean relational foreign key seeding
    const [lenders] = await conn.query('SELECT id, code, name FROM lenders');
    const lenderMap = new Map();
    for (const l of lenders) {
      if (l.code) lenderMap.set(l.code.toUpperCase(), l.id);
    }

    // Configured development/test product-lender mappings for financial institutions
    const configuredMappings = [
      // Personal Loan
      { code: 'HDFC', loanType: 'Personal Loan' },
      { code: 'ICICI', loanType: 'Personal Loan' },
      { code: 'AXIS', loanType: 'Personal Loan' },
      { code: 'SBI', loanType: 'Personal Loan' },
      { code: 'BAJAJ', loanType: 'Personal Loan' },
      { code: 'TATA', loanType: 'Personal Loan' },
      { code: 'FEDERAL_BANK', loanType: 'Personal Loan' },

      // Business Loan
      { code: 'HDFC', loanType: 'Business Loan' },
      { code: 'ICICI', loanType: 'Business Loan' },
      { code: 'AXIS', loanType: 'Business Loan' },
      { code: 'SBI', loanType: 'Business Loan' },
      { code: 'BAJAJ', loanType: 'Business Loan' },
      { code: 'TATA', loanType: 'Business Loan' },
      { code: 'FEDERAL_BANK', loanType: 'Business Loan' },

      // Professional Loan (Doctors, CAs, Architects)
      { code: 'HDFC', loanType: 'Professional Loan' },
      { code: 'AXIS', loanType: 'Professional Loan' },
      { code: 'BAJAJ', loanType: 'Professional Loan' },

      // Loan Against Property (LAP)
      { code: 'HDFC', loanType: 'Loan Against Property' },
      { code: 'ICICI', loanType: 'Loan Against Property' },
      { code: 'AXIS', loanType: 'Loan Against Property' },
      { code: 'BAJAJ', loanType: 'Loan Against Property' },

      // Home Loan
      { code: 'HDFC', loanType: 'Home Loan' },
      { code: 'ICICI', loanType: 'Home Loan' },
      { code: 'AXIS', loanType: 'Home Loan' },
      { code: 'SBI', loanType: 'Home Loan' },
      { code: 'FEDERAL_BANK', loanType: 'Home Loan' },

      // Equipment Loan (Machinery & Industrial Finance)
      { code: 'TATA', loanType: 'Equipment Loan' },
      { code: 'BAJAJ', loanType: 'Equipment Loan' },

      // Commercial Vehicle Loan (Trucks, Fleet, Commercial Transport)
      { code: 'TATA', loanType: 'Commercial Vehicle Loan' },

      // Education Loan (India & Overseas Studies)
      { code: 'SBI', loanType: 'Education Loan' },
      { code: 'FEDERAL_BANK', loanType: 'Education Loan' },

      // Auto / Car Loan (4-Wheeler Passenger Vehicles)
      { code: 'HDFC', loanType: 'Auto / Car Loan' },
      { code: 'ICICI', loanType: 'Auto / Car Loan' },
      { code: 'SBI', loanType: 'Auto / Car Loan' }
    ];

    let insertedCount = 0;
    for (const m of configuredMappings) {
      const lenderId = lenderMap.get(m.code);
      if (lenderId) {
        await conn.query(
          `INSERT INTO lender_product_mappings (lender_id, loan_type, is_active)
           VALUES (?, ?, 1)
           ON DUPLICATE KEY UPDATE is_active = 1`,
          [lenderId, m.loanType]
        );
        insertedCount++;
      }
    }

    console.log(`[migrate_v12] Successfully seeded/verified ${insertedCount} product-lender eligibility mappings.`);
    console.log('[migrate_v12] Migration completed successfully.');
  } catch (err) {
    console.error('[migrate_v12] Migration failed:', err);
    throw err;
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  migrateV12()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = migrateV12;
