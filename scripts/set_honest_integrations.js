const { query } = require('../src/config/db');

async function run() {
  await query("UPDATE platform_integrations SET status = 'Not Configured' WHERE name IN ('CIBIL', 'TransUnion', 'WhatsApp API')");
  await query("UPDATE platform_integrations SET status = 'Sandbox' WHERE name IN ('Experian', 'Payment Gateway', 'Email SMTP')");
  await query("UPDATE platform_integrations SET status = 'Coming Soon' WHERE name = 'Accounting (Tally)'");
  await query("UPDATE platform_integrations SET status = 'Disconnected' WHERE name = 'Equifax'");
  const [rows] = await query('SELECT name, status FROM platform_integrations');
  console.log('Updated platform_integrations to honest statuses:');
  console.log(rows);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
