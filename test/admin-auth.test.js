// admin-auth.test.js
const http = require('http');

function request(path, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
    });
    req.on('error', reject);
    if (body) {
      req.setHeader('Content-Type', 'application/json');
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

async function runTests() {
  const testAdminEmail = `testadmin_${Date.now()}@earnmitra.in`;
  const tempPassword = crypto.randomBytes(16).toString('hex') + '!1Aa';

  try {
    const tempHash = await bcrypt.hash(tempPassword, 10);
    await pool.query(
      'INSERT INTO admin_users (username, email, password_hash, role, role_id, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      ['temp_admin', testAdminEmail, tempHash, 'admin', 1, 1]
    );

    console.log('Testing admin login with correct credentials...');
    let res = await request('/api/auth/admin/login', { method: 'POST' }, { email: testAdminEmail, password: tempPassword });
    if (res.status === 200 && res.body.admin && res.body.admin.role === 'admin') {
      console.log('SUCCESS: Admin login correct credentials');
    } else {
      console.error('FAILED: Admin login correct credentials', res);
    }
    const adminToken = res.body.token;

    console.log('Testing admin login with wrong password...');
    res = await request('/api/auth/admin/login', { method: 'POST' }, { email: testAdminEmail, password: 'wrong' });
    if (res.status === 401) {
      console.log('SUCCESS: Admin login wrong password -> 401');
    } else {
      console.error('FAILED: Admin login wrong password', res);
    }

    console.log('Testing GET /api/admin/leads with partner token...');
    // Create partner token
    const partnerToken = require('jsonwebtoken').sign({ id: 1, role: 'partner' }, 'earnmitra_super_secret_jwt_key_2026_secure');
    res = await request('/api/admin/leads', { method: 'GET', headers: { 'Authorization': `Bearer ${partnerToken}` } });
    if (res.status === 403) {
      console.log('SUCCESS: Partner token accessing admin route -> 403');
    } else {
      console.error('FAILED: Partner token accessing admin route', res);
    }

    console.log('Testing GET /api/admin/leads without auth...');
    res = await request('/api/admin/leads', { method: 'GET' });
    if (res.status === 401) {
      console.log('SUCCESS: No auth accessing admin route -> 401');
    } else {
      console.error('FAILED: No auth accessing admin route', res);
    }

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    try {
      await pool.query('DELETE FROM admin_users WHERE email = ?', [testAdminEmail]);
      await pool.end();
    } catch {}
  }
}

runTests();
