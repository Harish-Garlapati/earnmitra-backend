const express = require('express');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/authMiddleware');
const repo = require('../repositories/cibilReportRepository');
const service = require('../services/cibilReportService');
const walletService = require('../services/walletService');

const router = express.Router();
const fetchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many bureau requests. Please try again later.', code: 'RATE_LIMITED' }
});

router.use(authenticate, (req, res, next) => {
  if (!req.user.partnerId || req.user.actorType !== 'partner') {
    return res.status(403).json({ error: 'Partner access required', code: 'PARTNER_REQUIRED' });
  }
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const { bureau } = req.query;
    const isMock = Boolean(String(process.env.DEV_BUREAU_MOCK || '').toLowerCase() === 'true' && process.env.NODE_ENV !== 'production');
    const hasSurepass = Boolean(process.env.SUREPASS_CIBIL_API_URL && process.env.SUREPASS_CIBIL_API_KEY) || isMock;
    const hasVerifyal = Boolean(process.env.VERIFYAL_CREDIT_REPORT_API_URL && process.env.VERIFYAL_CREDIT_REPORT_API_KEY) || isMock;

    const availableBureaus = [
      { id: 'CIBIL', label: 'CIBIL', available: hasSurepass || hasVerifyal, provider: isMock ? 'MOCK' : (hasSurepass ? 'surepass' : 'verifyal') },
      { id: 'CRIF', label: 'CRIF High Mark', available: hasSurepass || hasVerifyal, provider: isMock ? 'MOCK' : (hasSurepass ? 'surepass' : 'verifyal') },
      { id: 'EXPERIAN', label: 'Experian', available: hasVerifyal, provider: isMock ? 'MOCK' : 'verifyal' },
      { id: 'EQUIFAX', label: 'Equifax', available: hasVerifyal, provider: isMock ? 'MOCK' : 'verifyal' }
    ];

    const wallet = await walletService.getWallet(req.user.partnerId);
    const pricing = await walletService.getPricing();

    res.json({
      data: await repo.listForPartner(req.user.partnerId, { bureau }),
      providerConfigured: hasSurepass || hasVerifyal,
      availableBureaus,
      walletBalance: wallet.balance,
      wallet: {
        balance: wallet.balance,
        walletMoney: wallet.rechargeBalance,
        earnings: wallet.earnedBalance,
        withdrawableBalance: wallet.withdrawableBalance
      },
      pricing,
      testMode: isMock,
      isMock
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', fetchLimiter, async (req, res, next) => {
  try {
    const report = await service.fetchNewReport(
      req.user.partnerId,
      req.body,
      { ip: req.ip, userAgent: req.get('user-agent') }
    );
    res.status(201).json({ report });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const report = await repo.findOwnedPublic(req.params.id, req.user.partnerId);
    if (!report) {
      return res.status(404).json({ error: 'Credit bureau report not found', code: 'REPORT_NOT_FOUND' });
    }
    res.json(report);
  } catch (error) {
    next(error);
  }
});

async function serveReportPdf(req, res, next, mode = 'inline') {
  try {
    const report = await repo.findOwned(req.params.id, req.user.partnerId);
    if (!report) {
      return res.status(404).json({ error: 'Credit bureau report not found', code: 'REPORT_NOT_FOUND' });
    }

    if (report.isMock || !report.report_storage_path) {
      return res.status(404).json({
        error: 'Original PDF report is not available for this development test report.',
        code: 'PDF_UNAVAILABLE'
      });
    }

    const filePath = service.safeReportPath(report.report_storage_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Original report file is unavailable', code: 'REPORT_FILE_NOT_FOUND' });
    }

    const bureau = (report.bureau || 'CIBIL').toUpperCase();
    const cleanCustomerName = (report.customer_name || '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .toUpperCase()
      .slice(0, 30);
    const dateStr = new Date(report.created_at || Date.now()).toISOString().split('T')[0];
    const safeFilename = `${bureau}_${cleanCustomerName || 'REPORT_' + report.id}_${dateStr}.pdf`;

    const disposition = mode === 'attachment'
      ? `attachment; filename="${safeFilename}"`
      : `inline; filename="${safeFilename}"`;

    const audit = require('../services/partnerAuditService');
    audit.log(req.user.partnerId, mode === 'attachment' ? 'cibil.pdf_downloaded' : 'cibil.pdf_viewed', 'cibil_report', report.id, {
      bureau,
      mode
    }, req.ip).catch(() => {});

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': disposition,
      'Cache-Control': 'private, no-store'
    });
    fs.createReadStream(filePath).on('error', next).pipe(res);
  } catch (error) {
    next(error);
  }
}

router.get('/:id/pdf', (req, res, next) => {
  const mode = req.query.mode === 'download' ? 'attachment' : 'inline';
  return serveReportPdf(req, res, next, mode);
});

router.get('/:id/download', (req, res, next) => {
  return serveReportPdf(req, res, next, 'attachment');
});

router.get('/:id/original', (req, res, next) => {
  const mode = req.query.mode === 'download' ? 'attachment' : 'inline';
  return serveReportPdf(req, res, next, mode);
});

router.serveReportPdf = serveReportPdf;

module.exports = router;
