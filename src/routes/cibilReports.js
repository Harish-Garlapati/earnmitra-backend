const express = require('express');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/authMiddleware');
const repo = require('../repositories/cibilReportRepository');
const service = require('../services/cibilReportService');

const router = express.Router();
const fetchLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many CIBIL requests. Please try again later.', code: 'RATE_LIMITED' } });

router.use(authenticate, (req, res, next) => {
  if (!req.user.partnerId || req.user.actorType !== 'partner') return res.status(403).json({ error: 'Partner access required', code: 'PARTNER_REQUIRED' });
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const isConfigured = Boolean(process.env.SUREPASS_CIBIL_API_URL && process.env.SUREPASS_CIBIL_API_KEY);
    res.json({
      data: await repo.listForPartner(req.user.partnerId),
      providerConfigured: isConfigured
    });
  } catch (error) { next(error); }
});

router.post('/', fetchLimiter, async (req, res, next) => {
  try {
    const report = await service.fetchNewReport(req.user.partnerId, req.body, { ip: req.ip, userAgent: req.get('user-agent') });
    res.status(201).json({ report });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const report = await repo.findOwnedPublic(req.params.id, req.user.partnerId);
    if (!report) return res.status(404).json({ error: 'CIBIL report not found', code: 'REPORT_NOT_FOUND' });
    res.json(report);
  } catch (error) { next(error); }
});

router.get('/:id/original', async (req, res, next) => {
  try {
    const report = await repo.findOwned(req.params.id, req.user.partnerId);
    if (!report) return res.status(404).json({ error: 'CIBIL report not found', code: 'REPORT_NOT_FOUND' });
    const filePath = service.safeReportPath(report.report_storage_path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Original report file is unavailable', code: 'REPORT_FILE_NOT_FOUND' });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="cibil-report-${report.id}.pdf"`, 'Cache-Control': 'private, no-store' });
    fs.createReadStream(filePath).on('error', next).pipe(res);
  } catch (error) { next(error); }
});

module.exports = router;
