const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function backup() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'earnmitra';

  console.log(`[backup] Connecting to '${database}' at ${host}:${port}...`);
  const conn = await mysql.createConnection({ host, port, user, password, database });

  try {
    const [tables] = await conn.query('SHOW TABLES');
    const tableNames = tables.map(r => Object.values(r)[0]);
    console.log(`[backup] Found ${tableNames.length} tables:`, tableNames);

    let sqlDump = `-- Backup of ${database} at ${new Date().toISOString()}\n\n`;

    for (const table of tableNames) {
      const [[createTable]] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
      sqlDump += `DROP TABLE IF EXISTS \`${table}\`;\n`;
      sqlDump += `${createTable['Create Table']};\n\n`;

      const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
      if (rows.length > 0) {
        console.log(`[backup] Table ${table}: ${rows.length} rows`);
        for (const row of rows) {
          const cols = Object.keys(row).map(c => `\`${c}\``).join(', ');
          const vals = Object.values(row).map(v => {
            if (v === null) return 'NULL';
            if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
            if (typeof v === 'number') return v;
            return `'${String(v).replace(/'/g, "\\'")}'`;
          }).join(', ');
          sqlDump += `INSERT INTO \`${table}\` (${cols}) VALUES (${vals});\n`;
        }
        sqlDump += '\n';
      } else {
        console.log(`[backup] Table ${table}: 0 rows`);
      }
    }

    const backupPath = path.join(__dirname, 'backup_earnmitra.sql');
    fs.writeFileSync(backupPath, sqlDump, 'utf-8');
    console.log(`[backup] Backup written successfully to ${backupPath} (${fs.statSync(backupPath).size} bytes)`);
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  backup()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[backup] Error:', err);
      process.exit(1);
    });
}

module.exports = { backup };
