const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const repo = require('../repositories/cibilReportRepository');
const audit = require('./partnerAuditService');
const walletService = require('./walletService');
const notificationService = require('./notificationService');
const surepassProvider = require('./providers/surepassBureauProvider');
const verifyalProvider = require('./providers/verifyalBureauProvider');

const REPORT_ROOT = path.resolve(__dirname, '../../uploads/cibil-reports');
const MAX_PDF_BYTES = 15 * 1024 * 1024;

class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function validateInput(body = {}) {
  const bureau = String(body.bureau || 'CIBIL').toUpperCase();
  const validBureaus = ['CIBIL', 'EXPERIAN', 'EQUIFAX', 'CRIF'];
  if (!validBureaus.includes(bureau)) {
    throw new ApiError(422, 'INVALID_BUREAU', `Bureau must be one of: ${validBureaus.join(', ')}`);
  }

  const input = {
    bureau,
    name: String(body.name || '').trim().replace(/\s+/g, ' '),
    mobile: String(body.mobile || '').replace(/\D/g, '').slice(-10),
    pan: String(body.pan || '').trim().toUpperCase(),
    gender: body.gender ? String(body.gender).trim().toLowerCase() : '',
    consent: body.consent === true,
    dob: body.dob ? String(body.dob).trim() : undefined,
    address: body.address ? String(body.address).trim() : undefined,
    state: body.state ? String(body.state).trim().toUpperCase() : undefined,
    pincode: body.pincode ? String(body.pincode).trim() : undefined,
    aadhaarNumber: body.aadhaarNumber ? String(body.aadhaarNumber).trim() : undefined
  };

  const errors = {};
  if (input.name.length < 2 || input.name.length > 120) errors.name = 'Enter the customer name (2-120 characters).';
  if (!/^\d{10}$/.test(input.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.';
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(input.pan)) errors.pan = 'Enter a valid PAN in ABCDE1234F format.';
  if (!input.gender || !['male', 'female'].includes(input.gender)) errors.gender = 'Customer gender is required (male or female).';
  if (!input.consent) errors.consent = 'Explicit customer consent is required.';

  // Equifax specific checks
  if (bureau === 'EQUIFAX') {
    if (!input.dob) errors.dob = 'Date of birth (YYYY-MM-DD) is required for Equifax.';
    if (!input.address) errors.address = 'Address is required for Equifax.';
    if (!input.state || input.state.length !== 2) errors.state = '2-letter state code is required for Equifax (e.g. TS, MH).';
    if (!input.pincode || !/^\d{6}$/.test(input.pincode)) errors.pincode = 'Valid 6-digit pincode is required for Equifax.';
  }

  if (Object.keys(errors).length) {
    throw new ApiError(422, 'VALIDATION_FAILED', 'Please correct the highlighted fields.', errors);
  }
  return input;
}

function sanitizeProviderMessage(value, fallback) {
  const message = String(value || fallback || '').replace(/[\r\n]+/g, ' ').trim();
  return message.slice(0, 240) || 'The credit bureau provider could not complete this request.';
}

function assertAllowedReportUrl(rawUrl) {
  let url;
  try { url = new URL(rawUrl); } catch {
    throw new ApiError(502, 'INVALID_PROVIDER_RESPONSE', 'The provider returned an invalid report link.');
  }

  const hosts = String(process.env.CIBIL_REPORT_ALLOWED_HOSTS || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
  const hostname = url.hostname.toLowerCase();

  const isApproved = hosts.length > 0 && hosts.some(h => hostname === h || hostname.endsWith(`.${h}`));
  if (url.protocol !== 'https:' || !isApproved) {
    throw new ApiError(502, 'UNTRUSTED_REPORT_URL', 'The provider report link is not from an approved secure host.');
  }
  return url;
}

async function downloadPdf(rawUrl) {
  const url = assertAllowedReportUrl(rawUrl);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), redirect: 'follow' });
  if (!response.ok) throw new ApiError(502, 'REPORT_DOWNLOAD_FAILED', 'The provider report could not be downloaded.');
  if (response.url) assertAllowedReportUrl(response.url);
  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > MAX_PDF_BYTES) throw new ApiError(502, 'REPORT_TOO_LARGE', 'The provider report exceeded the secure file-size limit.');
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_PDF_BYTES || bytes.subarray(0, 5).toString() !== '%PDF-') {
    throw new ApiError(502, 'INVALID_REPORT_FILE', 'The provider response was not a valid PDF report.');
  }
  await fs.mkdir(REPORT_ROOT, { recursive: true });
  const fileName = `${crypto.randomUUID()}.pdf`;
  const fullPath = path.join(REPORT_ROOT, fileName);
  await fs.writeFile(fullPath, bytes, { flag: 'wx', mode: 0o600 });
  return { fullPath, mimeType: 'application/pdf' };
}

async function extractScoreFromPdf(filePath, bureau = 'CIBIL') {
  try {
    const { PDFParse } = require('pdf-parse');
    const buf = await fs.readFile(filePath);
    const parser = new PDFParse(new Uint8Array(buf));
    await parser.load();
    const res = await parser.getText();
    const text = res?.text || '';

    // CIBIL patterns in CIR report:
    // CIBILTRANSUNIONSCORE3 	756
    // CIBILTRANSUNIONSCORE 	756
    // SCORE NAME SCORE SCORING FACTORS \n CIBILTRANSUNIONSCORE 756
    const cibilMatch = text.match(/CIBILTRANSUNIONSCORE\w*\s*[:\-]?\s*(-?1|[0-9]{3})/i)
      || text.match(/SCORE\s+NAME[\s\S]*?CIBIL[^\n]*\s*[:\-]?\s*(-?1|[0-9]{3})/i)
      || text.match(/(?:CIBIL|TRANSUNION)[^\n]*?SCORE[^\n]*?\s*[:\-]?\s*(-?1|[0-9]{3})/i)
      || text.match(/CREDIT\s+SCORE\s*[:\-]?\s*(-?1|[0-9]{3})/i);

    if (cibilMatch && cibilMatch[1]) {
      return parseInt(cibilMatch[1], 10);
    }
    return null;
  } catch (err) {
    console.warn(`[extractScoreFromPdf] Warning: ${err.message}`);
    return null;
  }
}

function isDevBureauMockEnabled() {
  const isMock = String(process.env.DEV_BUREAU_MOCK || '').toLowerCase() === 'true';
  const isProd = process.env.NODE_ENV === 'production';
  if (isMock && isProd) {
    console.error('[SECURITY ERROR] DEV_BUREAU_MOCK is set to true in production environment! Refusing mock mode. Safe fallback to real providers.');
    return false;
  }
  return isMock;
}

async function fetchNewReport(partnerId, body, requestMeta = {}) {
  const input = validateInput(body);
  const bureau = input.bureau;

  const paymentSource = ['wallet_money', 'earnings'].includes(body.paymentSource) ? body.paymentSource : 'any';

  // 1. Create pending report attempt record with initial NOT_CALLED status
  const id = await repo.createAttempt(partnerId, { ...input, paymentSource }, requestMeta);
  await audit.log(partnerId, 'cibil.fetch_requested', 'cibil_report', id, {
    bureau,
    consentTextVersion: 'earnmitra-cibil-v1'
  }, requestMeta.ip);

  const mockActive = isDevBureauMockEnabled();
  const activeProvider = (bureau === 'EXPERIAN' || bureau === 'EQUIFAX' || (bureau === 'CRIF' && !surepassProvider.isConfigured('CRIF')) || (bureau === 'CIBIL' && verifyalProvider.isConfigured()))
    ? verifyalProvider
    : surepassProvider;

  // 2. Validate provider is actively configured (bypassed in safe development mock mode)
  if (!mockActive) {
    if (bureau === 'CIBIL') {
      if (!verifyalProvider.isConfigured() && !surepassProvider.isConfigured('CIBIL')) {
        await repo.markFailed(id, partnerId, 'FAILED', 'PROVIDER_NOT_CONFIGURED', 'CIBIL service is not configured. Please contact support.', 503, 'NOT_CALLED');
        throw new ApiError(503, 'PROVIDER_NOT_CONFIGURED', 'CIBIL service is not configured. Please contact support.');
      }
    } else if (bureau === 'CRIF') {
      if (!surepassProvider.isConfigured('CRIF') && !verifyalProvider.isConfigured()) {
        await repo.markFailed(id, partnerId, 'FAILED', 'PROVIDER_NOT_CONFIGURED', 'No active CRIF provider is configured.', 503, 'NOT_CALLED');
        throw new ApiError(503, 'PROVIDER_NOT_CONFIGURED', 'No active CRIF provider is configured.');
      }
    } else if (bureau === 'EXPERIAN' || bureau === 'EQUIFAX') {
      if (!verifyalProvider.isConfigured()) {
        await repo.markFailed(id, partnerId, 'FAILED', 'PROVIDER_NOT_CONFIGURED', `No active provider is configured for ${bureau}.`, 503, 'NOT_CALLED');
        throw new ApiError(503, 'PROVIDER_NOT_CONFIGURED', `No active provider is configured for ${bureau}.`);
      }
    }
  }

  // 3. Verify bureau pricing is configured before attempting financial reservation
  const priceInfo = await walletService.getBureauPrice(bureau);
  if (!priceInfo || !priceInfo.isConfigured) {
    await repo.markFailed(id, partnerId, 'FAILED', 'PRICING_NOT_CONFIGURED', 'Bureau pricing is not configured. Bureau inquiries are currently blocked.', 400, 'NOT_CALLED');
    throw new ApiError(400, 'PRICING_NOT_CONFIGURED', 'Bureau pricing is not configured. Bureau inquiries are currently blocked.');
  }

  // 4. Reserve funds in partner service wallet
  let reservation = null;
  try {
    reservation = await walletService.reserveBureauReport(partnerId, bureau, `REP-${id}`, paymentSource);
    await repo.updateBillingStatus(id, partnerId, 'RESERVED');
  } catch (walletErr) {
    if (walletErr.code === 'INSUFFICIENT_WALLET_BALANCE' || walletErr.status === 402) {
      await repo.markFailed(id, partnerId, 'FAILED', 'INSUFFICIENT_WALLET_BALANCE', 'Insufficient wallet balance', 402, 'NOT_CALLED');
      throw new ApiError(402, 'INSUFFICIENT_WALLET_BALANCE', 'Insufficient wallet balance to fetch this credit report. Please recharge your wallet.');
    }
    await repo.markFailed(id, partnerId, 'FAILED', walletErr.code || 'WALLET_RESERVATION_ERROR', walletErr.message, 500, 'NOT_CALLED');
    throw walletErr;
  }

  // 5. Call appropriate bureau provider (or Safe Development Mock Interception)
  let providerResult = null;
  let providerError = null;

  if (mockActive) {
    console.log(`[cibilReportService] SAFE DEVELOPMENT MOCK active for ${bureau}. Zero external calls dispatched.`);

    const mockScores = {
      CIBIL: 720,
      EXPERIAN: 735,
      EQUIFAX: 710,
      CRIF: 745
    };
    const mockScore = mockScores[bureau] || 720;

    providerResult = {
      success: true,
      status: 200,
      bureau,
      provider: 'MOCK',
      clientId: `DEV-MOCK-${bureau}-${Date.now()}`,
      creditScore: mockScore,
      reportUrl: null,
      customerName: input.name,
      mobile: input.mobile,
      pan: input.pan,
      isMock: true,
      testMode: true,
      normalizedData: {
        score: mockScore,
        bureau,
        scoreCategory: 'TEST DATA',
        paymentHistory: 'TEST DATA',
        creditUtilization: 'TEST DATA',
        creditAge: 'TEST DATA',
        totalAccounts: 5,
        recentEnquiries: 2,
        writtenOff: 0,
        settled: 0,
        isMock: true,
        testMode: true,
        reportDate: new Date().toISOString()
      },
      raw: {
        mock: true,
        bureau,
        notice: 'Development test report — not a real credit bureau report.'
      }
    };
  } else {
    try {
      if (bureau === 'CIBIL') {
        if (verifyalProvider.isConfigured()) {
          try {
            providerResult = await verifyalProvider.fetchReport({ ...input, bureau: 'cibil' });
          } catch (verErr) {
            console.warn(`[cibilReportService] Verifyal CIBIL error: ${verErr.message}, checking Surepass fallback`);
            if (surepassProvider.isConfigured('CIBIL')) {
              providerResult = await surepassProvider.fetchCibilReport(input);
            } else {
              throw verErr;
            }
          }
        } else if (surepassProvider.isConfigured('CIBIL')) {
          providerResult = await surepassProvider.fetchCibilReport(input);
        }
      } else if (bureau === 'CRIF') {
        if (surepassProvider.isConfigured('CRIF')) {
          providerResult = await surepassProvider.fetchCrifReport(input);
        } else {
          providerResult = await verifyalProvider.fetchReport({ ...input, bureau: 'crif' });
        }
      } else if (bureau === 'EXPERIAN' || bureau === 'EQUIFAX') {
        providerResult = await verifyalProvider.fetchReport(input);
      }
    } catch (callErr) {
      providerError = callErr;
    }
  }

  // 6. Evaluate Billing Outcome

  // Case A: Provider succeeded with valid credit report
  if (providerResult && providerResult.success) {
    // Finalize debit
    const debitRes = await walletService.finalizeBureauDebit(partnerId, reservation.reservationId, bureau, `REP-${id}`, 'BUREAU_REPORT');

    // Download original PDF if provided
    let downloaded = { fullPath: null, mimeType: null };
    if (providerResult.reportUrl) {
      try {
        downloaded = await downloadPdf(providerResult.reportUrl);
      } catch (pdfErr) {
        console.warn(`[cibilReportService] PDF download skipped or failed: ${pdfErr.message}`);
      }
    }

    // If credit score was not returned in API JSON (e.g. Verifyal CIBIL CIR PDF reports), extract from downloaded PDF
    if ((providerResult.creditScore == null || providerResult.creditScore === undefined) && downloaded.fullPath) {
      try {
        const parsedScore = await extractScoreFromPdf(downloaded.fullPath, bureau);
        if (parsedScore != null) {
          providerResult.creditScore = parsedScore;
          if (providerResult.normalizedData) {
            providerResult.normalizedData.score = parsedScore;
            providerResult.normalizedData.scoreCategory = parsedScore >= 750 ? 'Excellent' : parsedScore >= 700 ? 'Good' : parsedScore >= 650 ? 'Fair' : (parsedScore === -1 ? 'No History' : 'Needs Improvement');
          }
        }
      } catch (extractErr) {
        console.warn(`[cibilReportService] PDF score extraction failed: ${extractErr.message}`);
      }
    }

    let resolvedPaymentSource = paymentSource;
    if (resolvedPaymentSource === 'any') {
      if (reservation.earnedComponent > 0 && reservation.rechargeComponent === 0) {
        resolvedPaymentSource = 'earnings';
      } else {
        resolvedPaymentSource = 'wallet_money';
      }
    }

    // Mark success
    await repo.markSuccess(id, partnerId, {
      clientId: providerResult.clientId,
      provider: providerResult.provider || null,
      creditScore: providerResult.creditScore,
      storagePath: downloaded.fullPath,
      mimeType: downloaded.mimeType,
      providerStatusCode: providerResult.status || 200,
      normalizedData: providerResult.normalizedData,
      amountCharged: reservation.amount,
      paymentSource: resolvedPaymentSource,
      walletTransactionId: debitRes?.transactionId || reservation.reservationId
    }, 'BILLED_REPORT_READY');

    await audit.log(partnerId, 'cibil.fetch_succeeded', 'cibil_report', id, {
      bureau,
      creditScore: providerResult.creditScore,
      isMock: Boolean(providerResult.isMock)
    }, requestMeta.ip);

    await notificationService.createNotification(
      partnerId,
      'cibil',
      `${bureau} Report Ready`,
      `Your ${bureau} credit bureau report for ${input.name} is ready.`,
      { reportId: id, bureau, score: providerResult.creditScore }
    );

    return repo.findOwnedPublic(id, partnerId);
  }

  // Check whether provider debited the account
  const rawResponse = providerResult || providerError?.raw;
  const isDebited = mockActive ? false : (activeProvider && typeof activeProvider.isDebited === 'function' ? activeProvider.isDebited(rawResponse) : false);

  // Case B: Provider returned structured non-success (e.g. 422 REPORT_NOT_FOUND or rejection)
  if (providerResult && !providerResult.success) {
    const isNotFound = providerResult.code === 'REPORT_NOT_FOUND' || providerResult.status === 422;
    const failStatus = isNotFound ? 'NOT_FOUND' : 'FAILED';

    if (isDebited) {
      // BILLED_NO_REPORT: Provider debited account, finalize debit
      await walletService.finalizeBureauDebit(partnerId, reservation.reservationId, bureau, `REP-${id}`, 'BILLED_NO_REPORT');
      await repo.markFailed(id, partnerId, failStatus, providerResult.code || 'PROVIDER_REJECTED', providerResult.message, providerResult.status || 422, 'BILLED_NO_REPORT');
      await audit.log(partnerId, 'cibil.fetch_billed_no_report', 'cibil_report', id, { bureau, code: providerResult.code }, requestMeta.ip);
      throw new ApiError(providerResult.status || 422, providerResult.code || 'REPORT_NOT_FOUND', providerResult.message);
    } else {
      // NOT_BILLED: Provider did not debit, release reservation (no money moved)
      await walletService.releaseBureauReservation(partnerId, reservation.reservationId, bureau, `REP-${id}`, providerResult.message || 'Provider not billed');
      await repo.markFailed(id, partnerId, failStatus, providerResult.code || 'REPORT_NOT_FOUND', providerResult.message, providerResult.status || 422, 'NOT_BILLED');
      await audit.log(partnerId, 'cibil.fetch_not_billed', 'cibil_report', id, { bureau, code: providerResult.code }, requestMeta.ip);
      throw new ApiError(providerResult.status || 422, providerResult.code || 'REPORT_NOT_FOUND', providerResult.message);
    }
  }

  // Case C: Provider threw an error (timeout, network drop, 5xx)
  if (providerError) {
    if (isDebited) {
      await walletService.finalizeBureauDebit(partnerId, reservation.reservationId, bureau, `REP-${id}`, 'BILLED_NO_REPORT');
      await repo.markFailed(id, partnerId, 'FAILED', providerError.code || 'PROVIDER_ERROR', providerError.message, providerError.status || 502, 'BILLED_NO_REPORT');
      throw new ApiError(providerError.status || 502, providerError.code || 'PROVIDER_ERROR', providerError.message);
    } else if (providerError.name === 'TimeoutError' || providerError.code === 'ETIMEDOUT' || providerError.code === 'ECONNRESET' || !providerError.status) {
      // BILLING_UNKNOWN: Timeout / network drop where billing state is undetermined
      // DO NOT blindly refund, DO NOT blindly debit. Mark as REVIEW_REQUIRED
      await walletService.markBureauReservationReviewRequired(partnerId, reservation.reservationId, bureau, `REP-${id}`, providerError.message);
      await repo.markFailed(id, partnerId, 'FAILED', 'BILLING_UNKNOWN', 'Provider billing status undetermined: flagged for admin review', 504, 'BILLING_UNKNOWN');
      await audit.log(partnerId, 'cibil.fetch_billing_unknown', 'cibil_report', id, { bureau, error: providerError.message }, requestMeta.ip);
      throw new ApiError(504, 'PROVIDER_TIMEOUT', `The ${bureau} provider inquiry timed out. Your request has been queued for review.`);
    } else {
      // Known non-billed error
      await walletService.releaseBureauReservation(partnerId, reservation.reservationId, bureau, `REP-${id}`, providerError.message || 'Provider error: not billed');
      await repo.markFailed(id, partnerId, 'FAILED', providerError.code || 'PROVIDER_REJECTED', providerError.message, providerError.status || 502, 'NOT_BILLED');
      await audit.log(partnerId, 'cibil.fetch_failed', 'cibil_report', id, { bureau, code: providerError.code }, requestMeta.ip);
      throw new ApiError(providerError.status || 502, providerError.code || 'PROVIDER_REJECTED', providerError.message || 'Provider request failed');
    }
  }
}

function safeReportPath(storedPath) {
  const resolved = path.resolve(storedPath || '');
  if (!storedPath || !resolved.startsWith(`${REPORT_ROOT}${path.sep}`)) {
    throw new ApiError(404, 'REPORT_FILE_NOT_FOUND', 'Original report file is unavailable.');
  }
  return resolved;
}

module.exports = { ApiError, validateInput, fetchNewReport, safeReportPath, isDevBureauMockEnabled, REPORT_ROOT, downloadPdf, assertAllowedReportUrl, extractScoreFromPdf };
