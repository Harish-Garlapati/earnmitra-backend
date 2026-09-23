const { query } = require('./src/config/db');

(async () => {
  const [result] = await query(
    'UPDATE bureau_pricing SET price = ?, gst_percentage = ?, is_active = ? WHERE bureau = ?',
    [10, 0, 1, 'CIBIL']
  );

  console.log('Updated rows:', result.affectedRows);

  const [rows] = await query(
    'SELECT id, bureau, provider, price, gst_percentage, is_active FROM bureau_pricing ORDER BY id'
  );

  console.table(rows);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
