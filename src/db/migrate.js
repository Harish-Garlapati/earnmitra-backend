const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function migrate() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'earnmitra';

  // Explicit safety check: Ensure we only touch earnmitra
  if (database.toLowerCase() === 'loancrm') {
    throw new Error('SAFETY CHECK FAILED: Target database cannot be loancrm! Must be earnmitra.');
  }

  console.log(`[db:init] Connecting to MySQL server at ${host}:${port} as ${user}...`);
  const adminConn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true
  });

  try {
    console.log(`[db:init] Ensuring database '${database}' exists...`);
    await adminConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`[db:init] Database '${database}' is ready.`);
  } finally {
    await adminConn.end();
  }

  // Connect directly to the target database
  console.log(`[db:init] Connecting to '${database}' database...`);
  const dbConn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log(`[db:init] Reading schema definition from ${schemaPath}...`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log(`[db:init] Executing schema DDL...`);
    await dbConn.query(schemaSql);

    const [tables] = await dbConn.query('SHOW TABLES');
    const tableNames = tables.map(r => Object.values(r)[0]);

    console.log(`[db:init] Migration completed successfully.`);
    console.log(`[db:init] Tables in '${database}':\n  - ${tableNames.join('\n  - ')}`);
    return tableNames;
  } catch (err) {
    console.error(`[db:init] Migration error:`, err);
    throw err;
  } finally {
    await dbConn.end();
  }
}

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migrate };
