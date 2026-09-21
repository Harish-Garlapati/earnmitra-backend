require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

async function rotateSuperAdminPassword() {
  try {
    const highEntropyPassword = crypto.randomBytes(32).toString('hex') + '!' + crypto.randomInt(1000, 9999);
    const hash = await bcrypt.hash(highEntropyPassword, 10);
    
    await pool.query(
      "UPDATE admin_users SET password_hash = ? WHERE username = 'admin' OR email = 'admin@earnmitra.in'",
      [hash]
    );
    
    console.log("Development Super Admin credential rotated successfully.");
    await pool.end();
  } catch (err) {
    console.error("Rotation error:", err.message);
    process.exit(1);
  }
}

rotateSuperAdminPassword();
