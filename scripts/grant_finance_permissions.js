require('dotenv').config();
const { pool } = require('../src/config/db');

async function grantPermissions() {
  try {
    const [perms] = await pool.query("SELECT id FROM admin_permissions WHERE permission_key = 'payouts.approve'");
    if (perms.length > 0) {
      await pool.query("INSERT IGNORE INTO admin_role_permissions (role_id, permission_id) VALUES (3, ?)", [perms[0].id]);
      console.log("Successfully granted payouts.approve to Finance role (role_id: 3)");
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

grantPermissions();
