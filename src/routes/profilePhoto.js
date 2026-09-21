const express = require('express');
const multer = require('multer');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { authenticate } = require('../middleware/authMiddleware');
const { query } = require('../config/db');
const audit = require('../services/partnerAuditService');

const router = express.Router();
const PHOTO_ROOT = path.resolve(__dirname, '../../uploads/profile-photos');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

function detectImage(buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return { extension: 'png', mime: 'image/png' };
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { extension: 'jpg', mime: 'image/jpeg' };
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return { extension: 'webp', mime: 'image/webp' };
  return null;
}

router.use(authenticate, (req, res, next) => {
  if (!req.user.partnerId || req.user.actorType !== 'partner') return res.status(403).json({ error: 'Partner access required', code: 'PARTNER_REQUIRED' });
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await query('SELECT profile_image_path, profile_image_mime FROM partners WHERE id = ? LIMIT 1', [req.user.partnerId]);
    const row = rows[0];
    const resolved = path.resolve(row?.profile_image_path || '');
    if (!row?.profile_image_path || !resolved.startsWith(`${PHOTO_ROOT}${path.sep}`) || !fs.existsSync(resolved)) return res.status(404).json({ error: 'Profile photo not found', code: 'PROFILE_PHOTO_NOT_FOUND' });
    res.set({ 'Content-Type': row.profile_image_mime, 'Cache-Control': 'private, no-store' });
    fs.createReadStream(resolved).on('error', next).pipe(res);
  } catch (error) { next(error); }
});

router.post('/', upload.single('photo'), async (req, res, next) => {
  let newPath = null;
  try {
    if (!req.file) return res.status(400).json({ error: 'Select a profile image to upload.', code: 'PHOTO_REQUIRED' });
    const type = detectImage(req.file.buffer);
    if (!type) return res.status(422).json({ error: 'Use a valid JPG, PNG, or WebP image.', code: 'INVALID_IMAGE' });
    await fsp.mkdir(PHOTO_ROOT, { recursive: true });
    newPath = path.join(PHOTO_ROOT, `${crypto.randomUUID()}.${type.extension}`);
    await fsp.writeFile(newPath, req.file.buffer, { flag: 'wx', mode: 0o600 });
    const [rows] = await query('SELECT profile_image_path FROM partners WHERE id = ? LIMIT 1', [req.user.partnerId]);
    if (!rows[0]) return res.status(404).json({ error: 'Partner not found' });
    const oldPath = rows[0].profile_image_path;
    await query('UPDATE partners SET profile_image_path = ?, profile_image_mime = ?, profile_image_updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newPath, type.mime, req.user.partnerId]);
    await audit.log(req.user.partnerId, 'profile.photo_updated', 'partner', req.user.partnerId, { mimeType: type.mime, size: req.file.size }, req.ip);
    const oldResolved = path.resolve(oldPath || '');
    if (oldPath && oldResolved.startsWith(`${PHOTO_ROOT}${path.sep}`) && oldResolved !== newPath) await fsp.unlink(oldResolved).catch(() => {});
    res.json({ success: true, profileImageUrl: '/partners/me/profile-photo' });
  } catch (error) {
    if (newPath) await fsp.unlink(newPath).catch(() => {});
    next(error);
  }
});

module.exports = router;
module.exports.detectImage = detectImage;
