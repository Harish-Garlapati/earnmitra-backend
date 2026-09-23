require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

async function setCredentials() {
  try {
    const adminHash = await bcrypt.hash('Admin@123', 10);
    await pool.query(
      "UPDATE admin_users SET password_hash = ? WHERE username = 'admin' OR email = 'admin@earnmitra.in'",
      [adminHash]
    );

    const checkerHash = await bcrypt.hash('Checker@123', 10);
    await pool.query(
      "UPDATE admin_users SET password_hash = ? WHERE username = 'finance_checker' OR email = 'checker@earnmitra.in'",
      [checkerHash]
    );

    console.log('SUCCESS: Admin credentials set.');
    console.log('Super Admin: admin@earnmitra.in / Admin@123');
    console.log('Finance Checker: checker@earnmitra.in / Checker@123');
    await pool.end();
  } catch (err) {
    console.error('Error setting credentials:', err.message);
    process.exit(1);
  }
}

setCredentials();
