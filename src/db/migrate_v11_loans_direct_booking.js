const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function migrateV11() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'earnmitra';

  if (database.toLowerCase() === 'loancrm') {
    throw new Error('SAFETY CHECK FAILED: Target database cannot be loancrm! Must be earnmitra.');
  }

  console.log(`[migrate_v11] Connecting to '${database}' database at ${host}:${port}...`);
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  try {
    console.log(`[migrate_v11] Inspecting leads table...`);
    const [cols] = await conn.query(`SHOW COLUMNS FROM leads`);
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('pincode')) {
      console.log(`[migrate_v11] Adding pincode to leads...`);
      await conn.query(`ALTER TABLE leads ADD COLUMN pincode VARCHAR(10) NULL AFTER city`);
    }
    if (!colNames.includes('state')) {
      console.log(`[migrate_v11] Adding state to leads...`);
      await conn.query(`ALTER TABLE leads ADD COLUMN state VARCHAR(100) NULL AFTER pincode`);
    }
    if (!colNames.includes('mode')) {
      console.log(`[migrate_v11] Adding mode to leads...`);
      await conn.query(`ALTER TABLE leads ADD COLUMN mode VARCHAR(30) NOT NULL DEFAULT 'referral' AFTER current_stage`);
    }
    if (!colNames.includes('monthly_salary')) {
      console.log(`[migrate_v11] Adding monthly_salary to leads...`);
      await conn.query(`ALTER TABLE leads ADD COLUMN monthly_salary DECIMAL(15,2) NULL AFTER loan_amount`);
    }
    if (!colNames.includes('entity_type')) {
      console.log(`[migrate_v11] Adding entity_type to leads...`);
      await conn.query(`ALTER TABLE leads ADD COLUMN entity_type VARCHAR(100) NULL AFTER applicant_type`);
    }
    if (!colNames.includes('profession')) {
      console.log(`[migrate_v11] Adding profession to leads...`);
      await conn.query(`ALTER TABLE leads ADD COLUMN profession VARCHAR(100) NULL AFTER entity_type`);
    }

    console.log(`[migrate_v11] Creating loan_lead_details table...`);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS loan_lead_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL UNIQUE,
        applicant_type VARCHAR(50) NULL,
        entity_type VARCHAR(100) NULL,
        custom_entity_type VARCHAR(255) NULL,
        profession VARCHAR(100) NULL,
        custom_profession VARCHAR(255) NULL,
        monthly_salary DECIMAL(15,2) NULL,
        income DECIMAL(15,2) NULL,
        pincode VARCHAR(10) NULL,
        place VARCHAR(100) NULL,
        state VARCHAR(100) NULL,
        mode ENUM('referral', 'direct_booking') NOT NULL DEFAULT 'referral',
        customer_consent TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_loan_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log(`[migrate_v11] Creating direct_booking_codes table...`);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS direct_booking_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        partner_id INT NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        is_validated TINYINT(1) NOT NULL DEFAULT 0,
        validated_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_dbc_partner (partner_id),
        INDEX idx_dbc_lead (lead_id),
        INDEX idx_dbc_code (code),
        CONSTRAINT fk_dbc_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE,
        CONSTRAINT fk_dbc_partner FOREIGN KEY (partner_id) REFERENCES partners (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log(`[migrate_v11] Creating lender_contacts table...`);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lender_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lender_id INT NOT NULL,
        product_category VARCHAR(100) NULL,
        department VARCHAR(100) NOT NULL DEFAULT 'Partner Support Desk',
        contact_person VARCHAR(100) NULL,
        designation VARCHAR(100) NULL,
        phone VARCHAR(30) NULL,
        email VARCHAR(100) NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_lc_lender (lender_id),
        CONSTRAINT fk_lc_lender FOREIGN KEY (lender_id) REFERENCES lenders (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log(`[migrate_v11] Creating direct_booking_lender_selections table...`);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS direct_booking_lender_selections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        partner_id INT NOT NULL,
        lender_id INT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Shared',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_lead_lender (lead_id, lender_id),
        INDEX idx_dbs_partner (partner_id),
        CONSTRAINT fk_dbs_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE,
        CONSTRAINT fk_dbs_partner FOREIGN KEY (partner_id) REFERENCES partners (id) ON DELETE CASCADE,
        CONSTRAINT fk_dbs_lender FOREIGN KEY (lender_id) REFERENCES lenders (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    if (process.env.NODE_ENV === 'production') {
      console.log(
        '[migrate_v11] PRODUCTION: skipping development lender contact seed data. ' +
        'Production contacts require approved commercial data.'
      );
    } else {
      console.log(`[migrate_v11] Seeding verified lender contacts...`);
      const initialContacts = [
        { lenderCode: 'HDFC', dept: 'Partner Support Desk', person: 'Rohit Sharma', desig: 'Relationship Manager', phone: '1800 267 6161', email: 'leads@hdfcbank.com' },
        { lenderCode: 'ICICI', dept: 'Retail Loan Desk', person: 'Neha Verma', desig: 'Key Account Manager', phone: '1800 108 2424', email: 'directsales@icicibank.com' },
        { lenderCode: 'AXIS', dept: 'Personal Loan Support', person: 'Pooja Reddy', desig: 'Loan Relationship Officer', phone: '1860 419 5555', email: 'loans@axisbank.com' },
        { lenderCode: 'SBI', dept: 'SME & Retail Loans Desk', person: 'Amit Kumar', desig: 'Business Development Manager', phone: '1800 1234', email: 'customercare@sbi.co.in' },
        { lenderCode: 'BAJAJ', dept: 'Partner Business Desk', person: 'Vikram Singh', desig: 'Area Partner Lead', phone: '086980 10101', email: 'wecare@bajajfinserv.in' },
        { lenderCode: 'TATA', dept: 'Retail Finance Desk', person: 'Kavita Nair', desig: 'Regional Desk Officer', phone: '1860 267 6060', email: 'contactus@tatacapital.com' },
        { lenderCode: 'FEDERAL_BANK', dept: 'Partner Alliances', person: 'George Thomas', desig: 'Alliances Manager', phone: '1800 425 1199', email: 'support@federalbank.co.in' }
      ];

      for (const c of initialContacts) {
        const [lenders] = await conn.query(`SELECT id FROM lenders WHERE code = ? LIMIT 1`, [c.lenderCode]);
        if (lenders.length > 0) {
          const lid = lenders[0].id;
          const [existing] = await conn.query(`SELECT id FROM lender_contacts WHERE lender_id = ? LIMIT 1`, [lid]);
          if (existing.length === 0) {
            await conn.query(
              `INSERT INTO lender_contacts (lender_id, department, contact_person, designation, phone, email) VALUES (?, ?, ?, ?, ?, ?)`,
              [lid, c.dept, c.person, c.desig, c.phone, c.email]
            );
          }
        }
      }
    }

    console.log(`[migrate_v11] Migration V11 finished successfully!`);
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  migrateV11()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[migrate_v11] Migration failed:', err);
      process.exit(1);
    });
}

module.exports = migrateV11;
