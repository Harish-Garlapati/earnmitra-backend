const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'earnmitra',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+05:30'
};

// Create a connection pool for general application queries
const pool = mysql.createPool(dbConfig);

/**
 * Health check helper for the database connection
 */
async function checkHealth() {
  try {
    const [rows] = await pool.query('SELECT 1 AS alive, VERSION() AS version');
    return {
      ok: true,
      database: 'connected',
      version: rows[0]?.version || 'unknown'
    };
  } catch (err) {
    return {
      ok: false,
      database: 'disconnected',
      error: err.message
    };
  }
}

/**
 * Helper to get a standalone connection without a default database,
 * primarily used for creating the `earnmitra` database if it doesn't exist.
 */
async function createAdminConnection() {
  return mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password
  });
}

module.exports = {
  pool,
  query: (sql, params) => pool.query(sql, params),
  checkHealth,
  createAdminConnection,
  dbConfig
};
