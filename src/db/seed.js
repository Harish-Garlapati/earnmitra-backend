const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function seed() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'earnmitra';

  if (database.toLowerCase() === 'loancrm') {
    throw new Error('SAFETY CHECK FAILED: Target database cannot be loancrm!');
  }

  console.log(`[db:seed] Connecting to '${database}' database...`);
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database
  });

  try {
    console.log('[db:seed] Checking existing seed data...');

    // 1. Seed or find Partner 'P-1001'
    let partnerId;
    const [existingPartner] = await conn.query(
      'SELECT id FROM partners WHERE partner_code = ?',
      ['P-1001']
    );

    if (existingPartner.length > 0) {
      partnerId = existingPartner[0].id;
      console.log(`[db:seed] Partner 'P-1001' already exists with ID ${partnerId}.`);
    } else {
      const [insertPartner] = await conn.query(
        `INSERT INTO partners 
         (partner_code, full_name, mobile, email, partner_type, city, state, bank_name, bank_account_name, bank_account_number, bank_ifsc, kyc_status, approval_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'P-1001',
          'Ramesh Sharma',
          '9876543210',
          'ramesh.sharma@example.com',
          'CA & Tax Consultant',
          'Hyderabad',
          'Telangana',
          'HDFC Bank',
          'Ramesh Sharma',
          'XXXXXX1234',
          'HDFC0001234',
          'verified',
          'approved'
        ]
      );
      partnerId = insertPartner.insertId;
      console.log(`[db:seed] Inserted Partner 'P-1001' (ID: ${partnerId}).`);
    }

    // 2. Seed Leads & Timeline History
    const sampleLeads = [
      {
        lead_code: 'FTL123456',
        applicant_name: 'Suresh Kumar',
        business_name: 'Suresh Kumar',
        loan_type: 'Business Loan',
        product_category: 'Loans',
        loan_amount: 1000000.00,
        mobile: '9876500001',
        city: 'Hyderabad',
        status: 'In Progress',
        current_stage: 'Documents under review',
        created_at: '2026-08-12 10:30:00',
        timeline: [
          { status: 'In Progress', stage: 'Lead submitted', note: 'Lead submitted via partner portal', created_at: '2026-08-12 10:30:00' },
          { status: 'In Progress', stage: 'Documents under review', note: 'Financial documents being validated', created_at: '2026-08-12 11:15:00' }
        ]
      },
      {
        lead_code: 'FTL123455',
        applicant_name: 'Lakshmi Traders',
        business_name: 'Lakshmi Traders',
        loan_type: 'Business Loan',
        product_category: 'Loans',
        loan_amount: 2500000.00,
        mobile: '9876500002',
        city: 'Warangal',
        status: 'Disbursed',
        current_stage: 'Disbursed',
        created_at: '2026-08-02 09:00:00',
        timeline: [
          { status: 'In Progress', stage: 'Lead submitted', note: 'Initial submission', created_at: '2026-08-02 09:00:00' },
          { status: 'In Progress', stage: 'Documents verified', note: 'KYC and GST verified', created_at: '2026-08-04 11:00:00' },
          { status: 'In Progress', stage: 'Sent to lender', note: 'Sent to partner NBFC', created_at: '2026-08-05 14:00:00' },
          { status: 'Sanctioned', stage: 'Sanctioned', note: 'Loan sanctioned at 11.5% ROI', created_at: '2026-08-08 16:00:00' },
          { status: 'Disbursed', stage: 'Disbursed', note: 'Funds credited to borrower account', created_at: '2026-08-10 12:00:00' }
        ]
      },
      {
        lead_code: 'FTL123454',
        applicant_name: 'Venkat Reddy',
        business_name: null,
        loan_type: 'Equipment Loan',
        product_category: 'Loans',
        loan_amount: 1500000.00,
        mobile: '9876500003',
        city: 'Karimnagar',
        status: 'Under Review',
        current_stage: 'Credit under process',
        created_at: '2026-08-08 10:00:00',
        timeline: [
          { status: 'In Progress', stage: 'Lead submitted', note: 'Lead submitted', created_at: '2026-08-08 10:00:00' },
          { status: 'In Progress', stage: 'Documents verified', note: 'Quotation verified', created_at: '2026-08-09 11:30:00' },
          { status: 'Under Review', stage: 'Credit under process', note: 'Credit assessment in progress', created_at: '2026-08-09 15:00:00' }
        ]
      },
      {
        lead_code: 'FTL123453',
        applicant_name: 'Anita Rao',
        business_name: null,
        loan_type: 'Personal Loan',
        product_category: 'Loans',
        loan_amount: 500000.00,
        mobile: '9876500004',
        city: 'Hyderabad',
        status: 'Rejected',
        current_stage: 'Closed — lender declined',
        created_at: '2026-08-05 09:30:00',
        timeline: [
          { status: 'In Progress', stage: 'Lead submitted', note: 'Lead submitted', created_at: '2026-08-05 09:30:00' },
          { status: 'In Progress', stage: 'Sent to lender', note: 'Shared with lender credit team', created_at: '2026-08-06 11:00:00' },
          { status: 'Rejected', stage: 'Closed — lender declined', note: 'CIBIL score below policy threshold', created_at: '2026-08-07 14:00:00' }
        ]
      }
    ];

    for (const item of sampleLeads) {
      const [existingLead] = await conn.query(
        'SELECT id FROM leads WHERE lead_code = ?',
        [item.lead_code]
      );

      let leadId;
      if (existingLead.length > 0) {
        leadId = existingLead[0].id;
        console.log(`[db:seed] Lead '${item.lead_code}' already exists with ID ${leadId}.`);
      } else {
        const [insertLead] = await conn.query(
          `INSERT INTO leads 
           (lead_code, partner_id, product_category, loan_type, applicant_name, business_name, mobile, city, loan_amount, status, current_stage, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.lead_code,
            partnerId,
            item.product_category,
            item.loan_type,
            item.applicant_name,
            item.business_name,
            item.mobile,
            item.city,
            item.loan_amount,
            item.status,
            item.current_stage,
            item.created_at
          ]
        );
        leadId = insertLead.insertId;
        console.log(`[db:seed] Inserted lead '${item.lead_code}' (ID: ${leadId}).`);

        for (const t of item.timeline) {
          await conn.query(
            `INSERT INTO lead_status_history (lead_id, status, stage, note, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [leadId, t.status, t.stage, t.note, t.created_at]
          );
        }
      }
    }

    // 3. Seed Partner Earnings (avoid duplicates)
    const [existingEarnings] = await conn.query(
      'SELECT id FROM partner_earnings WHERE partner_id = ? LIMIT 1',
      [partnerId]
    );

    if (existingEarnings.length === 0) {
      const earningsData = [
        { amount: 22500, earning_type: 'commission', status: 'paid', description: 'Payout — FTL123455 (Lakshmi Traders)' },
        { amount: 13750, earning_type: 'commission', status: 'paid', description: 'Payout — FTL123449' },
        { amount: 8500, earning_type: 'commission', status: 'paid', description: 'Payout — FTL123441' },
        { amount: 12500, earning_type: 'commission', status: 'available', description: 'Commission — FTL123450 (Available for payout)' },
        { amount: -1125, earning_type: 'tds', status: 'paid', description: 'TDS deduction' }
      ];

      for (const e of earningsData) {
        await conn.query(
          `INSERT INTO partner_earnings (partner_id, amount, earning_type, status, description)
           VALUES (?, ?, ?, ?, ?)`,
          [partnerId, e.amount, e.earning_type, e.status, e.description]
        );
      }
      console.log(`[db:seed] Inserted initial partner earnings records.`);
    } else {
      console.log('[db:seed] Partner earnings already seeded.');
    }

    // 4. Seed Payout Requests
    const [existingPayouts] = await conn.query(
      'SELECT id FROM payout_requests WHERE partner_id = ? LIMIT 1',
      [partnerId]
    );
    if (existingPayouts.length === 0) {
      await conn.query(
        `INSERT INTO payout_requests (partner_id, amount, status, requested_at, processed_at, reference_number)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [partnerId, 36250.00, 'completed', '2026-08-12 12:00:00', '2026-08-12 15:30:00', 'PAY-20260812-9921']
      );
      console.log('[db:seed] Inserted sample completed payout request.');
    } else {
      console.log('[db:seed] Payout requests already seeded.');
    }

    // 5. Seed App Settings (FAQs, metadata, configs)
    const settings = [
      {
        key: 'partner_metadata',
        value: JSON.stringify({
          partnerTypes: [
            'CA', 'Tax Consultant', 'GST Practitioner', 'Accountant', 'Company HR',
            'Company Finance', 'DSA / Loan Agent', 'Automobile Dealer', 'Equipment Dealer',
            'Real Estate Agent', 'Business Consultant', 'Other'
          ],
          states: ['Telangana', 'Andhra Pradesh'],
          loanTypes: [
            { icon: '🏦', label: 'Business Loan' },
            { icon: '👤', label: 'Personal Loan' },
            { icon: '🚜', label: 'Equipment Loan' },
            { icon: '🏪', label: 'MSME Loan' },
            { icon: '🏠', label: 'Loan Against Property' },
            { icon: '📄', label: 'Other Loan' }
          ],
          loanPurposes: [
            'Business expansion', 'Working capital', 'Equipment purchase',
            'Machinery', 'Debt consolidation', 'Personal need', 'Other'
          ],
          lenders: ['Any (recommended)', 'HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Bajaj Finserv', 'Tata Capital']
        }),
        desc: 'Dropdown and metadata configuration for partner portal'
      },
      {
        key: 'faqs',
        value: JSON.stringify([
          { q: 'How do I become an Earnmitra partner?', a: 'Register with your mobile number, complete KYC and accept the partner agreement. Approval usually takes 1–2 working days.' },
          { q: 'Is there a registration fee?', a: 'No. Registration is free for all partner types.' },
          { q: 'When will I receive my commission?', a: 'Payouts are released after the lender settles, typically 3–5 working days after verification.' },
          { q: 'Which loan products are available?', a: 'Business, personal, MSME, equipment, working capital and loan against property.' },
          { q: 'How do I track my leads?', a: 'Open My Leads. Every status change is also sent to you on WhatsApp.' }
        ]),
        desc: 'Frequently Asked Questions for support'
      }
    ];

    for (const s of settings) {
      await conn.query(
        `INSERT INTO app_settings (setting_key, setting_value, description)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), description = VALUES(description)`,
        [s.key, s.value, s.desc]
      );
    }
    console.log('[db:seed] Seeded app_settings.');

    console.log('[db:seed] Database seeding completed successfully.');
  } catch (err) {
    console.error('[db:seed] Seeding failed:', err);
    throw err;
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seed };
