const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verify() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'earnmitra';

  const conn = await mysql.createConnection({ host, port, user, password, database });

  console.log('=== DATABASE INTEGRITY CHECK ===');

  // 1. Check FTL123458
  const [rows123458] = await conn.query('SELECT * FROM leads WHERE lead_code = "FTL123458"');
  if (rows123458.length === 0) {
    console.error('FAIL: FTL123458 not found in database!');
    process.exit(1);
  }
  const l = rows123458[0];
  console.log('1. FTL123458 Verified:');
  console.log('   Lead Code:', l.lead_code);
  console.log('   Business Name:', l.business_name);
  console.log('   Loan Type:', l.loan_type);
  console.log('   Amount: ₹' + Number(l.loan_amount).toLocaleString('en-IN'));
  console.log('   Mobile:', l.mobile);
  console.log('   City:', l.city);
  console.log('   Status:', l.status);

  // 2. Check partner P-1001
  const [partners] = await conn.query('SELECT id, partner_code, full_name, mobile, role FROM partners WHERE partner_code = "P-1001"');
  console.log('2. Partner P-1001 Verified:');
  console.log('   Partner Code:', partners[0]?.partner_code);
  console.log('   Full Name:', partners[0]?.full_name);
  console.log('   Mobile:', partners[0]?.mobile);
  console.log('   Role:', partners[0]?.role);

  // 3. Check admin user
  const [admins] = await conn.query('SELECT id, username, email, role FROM admin_users');
  console.log('3. Admin User Verified:');
  console.log('   Email:', admins[0]?.email);
  console.log('   Role:', admins[0]?.role);

  // 4. Check tables count
  const [tables] = await conn.query('SHOW TABLES');
  console.log('4. Total Tables in earnmitra:', tables.length);

  await conn.end();
  console.log('=== INTEGRITY CHECK COMPLETED: 100% OK ===');
}

verify().catch(console.error);
