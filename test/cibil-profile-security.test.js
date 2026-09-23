const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const fs = require('fs/promises');
const { query, pool } = require('../src/config/db');
const { JWT_SECRET } = require('../src/middleware/authMiddleware');
const { validateInput } = require('../src/services/cibilReportService');
const { maskPan } = require('../src/repositories/cibilReportRepository');
const { detectImage } = require('../src/routes/profilePhoto');
const app = require('../src/server');

test('CIBIL validation, masking, persistence ownership, and profile photo access', async t => {
  assert.equal(maskPan('ABCDE1234F'), 'AB***1234*');
  assert.equal(validateInput({ name:'Test Customer', mobile:'9999999999', pan:'abcde1234f', gender:'male', consent:true }).pan, 'ABCDE1234F');
  assert.throws(() => validateInput({ name:'A', mobile:'1', pan:'bad', gender:'other', consent:false }), /highlighted fields/);
  assert.equal(detectImage(Buffer.from([137,80,78,71,13,10,26,10]))?.mime, 'image/png');
  assert.equal(detectImage(Buffer.from('not-an-image')), null);

  const suffix = `${Date.now()}${Math.floor(Math.random()*1000)}`;
  const mobileA = suffix.slice(-10).padStart(10, '7');
  const mobileB = String(BigInt(mobileA) - 1n).padStart(10, '6');
  const [a] = await query(`INSERT INTO partners (partner_code,full_name,mobile,partner_type,state,kyc_status,approval_status) VALUES (?,?,?,?,?,'approved','approved')`, [`T-A-${suffix}`,'Isolation Partner A',mobileA,'Test','Telangana']);
  const [b] = await query(`INSERT INTO partners (partner_code,full_name,mobile,partner_type,state,kyc_status,approval_status) VALUES (?,?,?,?,?,'approved','approved')`, [`T-B-${suffix}`,'Isolation Partner B',mobileB,'Test','Telangana']);
  const partnerA = a.insertId, partnerB = b.insertId;
  const tokenA = jwt.sign({ id:partnerA, role:'partner' }, JWT_SECRET, { expiresIn:'10m' });
  const tokenB = jwt.sign({ id:partnerB, role:'partner' }, JWT_SECRET, { expiresIn:'10m' });
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const headersA = { Authorization:`Bearer ${tokenA}`, 'Content-Type':'application/json' };
  const headersB = { Authorization:`Bearer ${tokenB}` };
  let photoPath = '';

  t.after(async () => {
    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }
    await new Promise(resolve => server.close(resolve));
    const [rows] = await query('SELECT profile_image_path FROM partners WHERE id = ?', [partnerA]);
    photoPath = rows[0]?.profile_image_path || photoPath;
    await query('DELETE FROM partner_audit_logs WHERE partner_id IN (?,?)', [partnerA, partnerB]);
    await query('DELETE FROM partner_cibil_reports WHERE partner_id IN (?,?)', [partnerA, partnerB]);
    await query('DELETE FROM partner_wallet_transactions WHERE partner_id IN (?,?)', [partnerA, partnerB]);
    await query('DELETE FROM partner_wallets WHERE partner_id IN (?,?)', [partnerA, partnerB]);
    await query('DELETE FROM partners WHERE id IN (?,?)', [partnerA, partnerB]);
    if (photoPath) await fs.unlink(photoPath).catch(() => {});
    await pool.end();
  });

  const walletRepo = require('../src/repositories/walletRepository');
  await walletRepo.creditWallet({ partnerId: partnerA, amount: 500, description: 'Test', referenceId: 'FUND_A' });

  const previousMock = process.env.DEV_BUREAU_MOCK;
  const previousUrl = process.env.SUREPASS_CIBIL_API_URL;
  const previousKey = process.env.SUREPASS_CIBIL_API_KEY;
  process.env.DEV_BUREAU_MOCK = 'false';
  delete process.env.SUREPASS_CIBIL_API_URL; delete process.env.SUREPASS_CIBIL_API_KEY;
  const create = await fetch(`${base}/cibil-reports`, { method:'POST', headers:headersA, body:JSON.stringify({ name:'Synthetic Customer', mobile:'9999999999', pan:'ABCDE1234F', gender:'male', consent:true }) });
  process.env.SUREPASS_CIBIL_API_URL = previousUrl; process.env.SUREPASS_CIBIL_API_KEY = previousKey;
  process.env.DEV_BUREAU_MOCK = previousMock;
  assert.equal(create.status, 503);
  assert.equal((await create.json()).code, 'PROVIDER_NOT_CONFIGURED');

  const listA = await (await fetch(`${base}/cibil-reports`, { headers:headersA })).json();
  assert.equal(listA.data.length, 1);
  assert.equal(listA.data[0].maskedPan, 'AB***1234*');
  assert.equal(Object.hasOwn(listA.data[0], 'pan'), false);
  const reportId = listA.data[0].id;
  const foreignDetail = await fetch(`${base}/cibil-reports/${reportId}`, { headers:headersB });
  assert.equal(foreignDetail.status, 404);
  const listB = await (await fetch(`${base}/cibil-reports`, { headers:headersB })).json();
  assert.equal(listB.data.length, 0);

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  const form = new FormData(); form.append('photo', new Blob([png], { type:'image/png' }), 'profile.png');
  const upload = await fetch(`${base}/partners/me/profile-photo`, { method:'POST', headers:{ Authorization:`Bearer ${tokenA}` }, body:form });
  assert.equal(upload.status, 200);
  const ownPhoto = await fetch(`${base}/partners/me/profile-photo`, { headers:headersA });
  assert.equal(ownPhoto.status, 200); assert.equal(ownPhoto.headers.get('content-type'), 'image/png');
  const foreignPhoto = await fetch(`${base}/partners/me/profile-photo`, { headers:headersB });
  assert.equal(foreignPhoto.status, 404);
});
