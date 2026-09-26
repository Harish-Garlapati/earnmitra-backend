const { pool } = require('../config/db');

/**
 * Standalone Development/Test Seed Script:
 * Explicitly seeds configured development/test product-lender mappings.
 * Clearly identified as TEST DATA only. Not for production execution without approved business data.
 */
async function seedDevLenderProductMappings() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SECURITY VIOLATION: seed_dev_lender_product_mappings.js cannot be executed in a production environment. Production mappings require approved commercial agreements.');
  }

  const conn = await pool.getConnection();
  try {
    console.log('[seed_dev_mappings] Explicit development seed requested: Seeding test lender-product mappings...');

    const [lenders] = await conn.query('SELECT id, code, name FROM lenders');
    const lenderMap = new Map();
    for (const l of lenders) {
      if (l.code) lenderMap.set(l.code.toUpperCase(), l.id);
    }

    const testMappings = [
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

    let count = 0;
    for (const m of testMappings) {
      const lenderId = lenderMap.get(m.code);
      if (lenderId) {
        await conn.query(
          `INSERT INTO lender_product_mappings (lender_id, loan_type, is_active)
           VALUES (?, ?, 1)
           ON DUPLICATE KEY UPDATE is_active = 1`,
          [lenderId, m.loanType]
        );
        count++;
      }
    }

    console.log(`[seed_dev_mappings] Successfully seeded ${count} development/test mappings.`);
  } catch (err) {
    console.error('[seed_dev_mappings] Seeding failed:', err);
    throw err;
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  seedDevLenderProductMappings()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedDevLenderProductMappings;
