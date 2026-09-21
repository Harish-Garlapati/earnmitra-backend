const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function migrateV5() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'earnmitra';

  console.log(`[migrate_v5] Connecting to '${database}' at ${host}:${port}...`);
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database
  });

  try {
    // 1. Departments table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        code VARCHAR(50) NOT NULL,
        member_count INT DEFAULT 0,
        description VARCHAR(255),
        scope VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const departments = [
      { name: 'Operations', code: 'OPS', member_count: 12, description: 'Partner verification, KYC processing, underwriting queue', scope: 'Partner approval, KYC, applications' },
      { name: 'Sales & Partner Growth', code: 'SALES', member_count: 18, description: 'Partner acquisition, DSA onboarding, relationship management', scope: 'Partner growth, lead tracking' },
      { name: 'Finance & Accounts', code: 'FIN', member_count: 8, description: 'Payout approvals, ledger reconciliation, TDS & GST filings', scope: 'Commission, payouts, TDS, GST' },
      { name: 'Marketing', code: 'MKT', member_count: 6, description: 'Campaign management, WhatsApp/Email templates, brand collateral', scope: 'Campaigns, content, leads' },
      { name: 'Technology', code: 'TECH', member_count: 10, description: 'Platform infrastructure, API integrations, security & audit', scope: 'Platform, integrations, security' },
      { name: 'HR & Admin', code: 'HR', member_count: 5, description: 'Internal team management, compliance, administrative support', scope: 'Employees, payroll, attendance' },
      { name: 'Support', code: 'SUP', member_count: 7, description: 'Partner helpdesk, ticket resolution, query escalations', scope: 'Partner & customer support' }
    ];

    for (const d of departments) {
      await conn.query(
        `INSERT INTO departments (name, code, member_count, description, scope) 
         VALUES (?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE member_count = ?, description = ?, scope = ?`,
        [d.name, d.code, d.member_count, d.description, d.scope, d.member_count, d.description, d.scope]
      );
    }
    console.log('[migrate_v5] Seeded departments.');

    // 2. Products Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_name VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        commission_type VARCHAR(50) DEFAULT 'percentage',
        default_rate DECIMAL(10, 2) DEFAULT 1.00,
        status VARCHAR(50) DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const products = [
      { name: 'Personal Loan', category: 'Personal Loan', rate: 1.50, type: 'percentage' },
      { name: 'Business Loan', category: 'Business Loan', rate: 1.00, type: 'percentage' },
      { name: 'Home Loan', category: 'Credit & Accounts', rate: 0.85, type: 'percentage' },
      { name: 'Loan Against Property', category: 'Insurance/Finance', rate: 0.90, type: 'percentage' },
      { name: 'Credit Cards', category: 'Personal/Finance', rate: 200.00, type: 'flat' },
      { name: 'Term Insurance', category: 'Companies/Corp', rate: 20.00, type: 'percentage' },
      { name: 'Health Insurance', category: 'Insurance', rate: 18.00, type: 'percentage' },
      { name: 'Working Capital Loan', category: 'Business Loan', rate: 1.25, type: 'percentage' }
    ];

    for (const p of products) {
      await conn.query(
        `INSERT INTO products (product_name, category, default_rate, commission_type, status)
         VALUES (?, ?, ?, ?, 'Active')
         ON DUPLICATE KEY UPDATE category = ?, default_rate = ?, commission_type = ?`,
        [p.name, p.category, p.rate, p.type, p.category, p.rate, p.type]
      );
    }
    console.log('[migrate_v5] Seeded products.');

    // 3. Lenders Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lenders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(100),
        code VARCHAR(50),
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const lenders = [
      { name: 'HDFC Bank', category: 'Private Bank', code: 'HDFC' },
      { name: 'ICICI Bank', category: 'Private Bank', code: 'ICICI' },
      { name: 'State Bank of India', category: 'Public Bank', code: 'SBI' },
      { name: 'Axis Bank', category: 'Private Bank', code: 'AXIS' },
      { name: 'Bajaj Finserv', category: 'NBFC', code: 'BAJAJ' },
      { name: 'Tata Capital', category: 'NBFC', code: 'TATA' },
      { name: 'HDFC ERGO', category: 'General Insurance', code: 'HDFCERGO' },
      { name: 'Star Health', category: 'Health Insurance', code: 'STAR' }
    ];

    for (const l of lenders) {
      await conn.query(
        `INSERT INTO lenders (name, category, code, is_active)
         VALUES (?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE category = ?, code = ?`,
        [l.name, l.category, l.code, l.category, l.code]
      );
    }
    console.log('[migrate_v5] Seeded lenders.');

    // 4. Commission Rules Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS commission_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_name VARCHAR(100) NOT NULL,
        partner_type VARCHAR(50) NOT NULL,
        commission_rate VARCHAR(50) NOT NULL,
        tds_rate DECIMAL(5,2) DEFAULT 5.00,
        gst_rate DECIMAL(5,2) DEFAULT 18.00,
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_name, partner_type)
      )
    `);

    const rules = [
      { product: 'Personal Loan', partnerType: 'DSA', rate: '1.50%', tds: 5.0, gst: 18.0 },
      { product: 'Business Loan', partnerType: 'CA/Tax', rate: '1.00%', tds: 5.0, gst: 18.0 },
      { product: 'Credit Card', partnerType: 'Agent', rate: '₹200', tds: 5.0, gst: 18.0 },
      { product: 'Term Insurance', partnerType: 'Agent', rate: '20%', tds: 5.0, gst: 18.0 },
      { product: 'Home Loan', partnerType: 'DSA', rate: '0.85%', tds: 5.0, gst: 18.0 },
      { product: 'Health Insurance', partnerType: 'CA/Tax', rate: '18%', tds: 5.0, gst: 18.0 }
    ];

    for (const r of rules) {
      await conn.query(
        `INSERT INTO commission_rules (product_name, partner_type, commission_rate, tds_rate, gst_rate, is_active)
         VALUES (?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE commission_rate = ?, tds_rate = ?, gst_rate = ?`,
        [r.product, r.partnerType, r.rate, r.tds, r.gst, r.rate, r.tds, r.gst]
      );
    }
    console.log('[migrate_v5] Seeded commission rules.');

    // 5. Marketing Campaigns Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS marketing_campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_name VARCHAR(150) NOT NULL,
        channel VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        leads_count INT DEFAULT 0,
        budget DECIMAL(10,2) DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const campaigns = [
      { name: 'DSA Onboarding Campaign', channel: 'WhatsApp', status: 'Active', leads: 2480 },
      { name: 'Business Loan Offer', channel: 'Email', status: 'Active', leads: 1100 },
      { name: 'Credit Card Campaign', channel: 'Push', status: 'Active', leads: 980 },
      { name: 'Insurance Awareness', channel: 'SMS', status: 'Active', leads: 760 },
      { name: 'Festival Campaign', channel: 'WhatsApp', status: 'Active', leads: 1850 }
    ];

    for (const c of campaigns) {
      const [existing] = await conn.query('SELECT id FROM marketing_campaigns WHERE campaign_name = ?', [c.name]);
      if (existing.length === 0) {
        await conn.query(
          `INSERT INTO marketing_campaigns (campaign_name, channel, status, leads_count)
           VALUES (?, ?, ?, ?)`,
          [c.name, c.channel, c.status, c.leads]
        );
      }
    }
    console.log('[migrate_v5] Seeded marketing campaigns.');

    // 6. Support Tickets Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_number VARCHAR(50) NOT NULL UNIQUE,
        partner_id INT DEFAULT NULL,
        partner_name VARCHAR(100),
        subject VARCHAR(200) NOT NULL,
        department VARCHAR(50) DEFAULT 'Operations',
        status VARCHAR(50) DEFAULT 'Open',
        priority VARCHAR(20) DEFAULT 'Normal',
        description TEXT,
        resolution_note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const tickets = [
      { num: 'TKT-101', partner: 'Rajesh Verma', subject: 'Payout not received', dept: 'Finance', status: 'Open', priority: 'High', desc: 'Requested withdrawal of Rs 25,250 on 18 Sep, still pending settlement' },
      { num: 'TKT-102', partner: 'Priya Sharma', subject: 'KYC Issue', dept: 'Operations', status: 'In-Progress', priority: 'Medium', desc: 'PAN document verification pending for 48 hours' },
      { num: 'TKT-103', partner: 'Amit Kumar', subject: 'Portal access', dept: 'IT', status: 'Resolved', priority: 'Low', desc: 'Reset mobile session token successfully' },
      { num: 'TKT-104', partner: 'Sunil Patil', subject: 'Commission query', dept: 'Finance', status: 'Open', priority: 'Medium', desc: 'Commission slab mismatch on Business Loan lead #L-1002' }
    ];

    for (const t of tickets) {
      await conn.query(
        `INSERT INTO support_tickets (ticket_number, partner_name, subject, department, status, priority, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = ?, department = ?`,
        [t.num, t.partner, t.subject, t.dept, t.status, t.priority, t.desc, t.status, t.dept]
      );
    }
    console.log('[migrate_v5] Seeded support tickets.');

    // 7. Platform Integrations Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS platform_integrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL,
        provider VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Connected',
        description VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const integrations = [
      { name: 'CIBIL', category: 'Credit Bureau', provider: 'TransUnion CIBIL', status: 'Connected', desc: 'Real-time soft credit pull and score verification' },
      { name: 'Experian', category: 'Credit Bureau', provider: 'Experian India', status: 'Connected', desc: 'Credit report validation and debt summary' },
      { name: 'TransUnion', category: 'Credit Bureau', provider: 'TransUnion', status: 'Connected', desc: 'Secondary bureau check for loan eligibility' },
      { name: 'Equifax', category: 'Credit Bureau', provider: 'Equifax', status: 'Disconnected', desc: 'Optional tertiary credit scoring integration' },
      { name: 'WhatsApp API', category: 'Communication', provider: 'Meta Cloud API', status: 'Connected', desc: 'Transactional notifications, OTPs & lead updates' },
      { name: 'Email SMTP', category: 'Communication', provider: 'SendGrid / Amazon SES', status: 'Connected', desc: 'Welcome emails, payout advisories & monthly statements' },
      { name: 'Payment Gateway', category: 'Payments', provider: 'RazorpayX / Cashfree', status: 'Connected', desc: 'Automated IMPS/NEFT partner payout disbursal' },
      { name: 'Accounting (Tally)', category: 'Finance', provider: 'TallyPrime XML/REST', status: 'Disconnected', desc: 'Automated ledger posting and TDS reconciliation' }
    ];

    for (const item of integrations) {
      await conn.query(
        `INSERT INTO platform_integrations (name, category, provider, status, description)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = ?, description = ?`,
        [item.name, item.category, item.provider, item.status, item.desc, item.status, item.desc]
      );
    }
    console.log('[migrate_v5] Seeded platform integrations.');

    // 8. Seed Default Company Profile in app_settings if not present
    const companyDefaults = [
      { key: 'company_name', val: 'Earnmitra' },
      { key: 'company_website', val: 'www.earnmitra.in' },
      { key: 'support_email', val: 'support@earnmitra.in' },
      { key: 'support_phone', val: '+91 98765 43210' },
      { key: 'company_address', val: 'Hyderabad, Telangana, India' },
      { key: 'min_payout_threshold', val: '500' },
      { key: 'tds_rate_standard', val: '5' },
      { key: 'gst_rate_standard', val: '18' },
      { key: 'system_maintenance_mode', val: '0' }
    ];

    for (const c of companyDefaults) {
      await conn.query(
        `INSERT INTO app_settings (setting_key, setting_value) 
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = IF(setting_value IS NULL OR setting_value = '', ?, setting_value)`,
        [c.key, c.val, c.val]
      );
    }
    console.log('[migrate_v5] Seeded company settings defaults.');

    console.log('[migrate_v5] Migration v5 completed successfully.');
  } catch (err) {
    console.error('[migrate_v5] Migration failed:', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

migrateV5();
