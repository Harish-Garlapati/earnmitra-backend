const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const repo = require('../repositories/cibilReportRepository');
const audit = require('./partnerAuditService');

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
  const input = {
    name: String(body.name || '').trim().replace(/\s+/g, ' '),
    mobile: String(body.mobile || '').replace(/\D/g, '').slice(-10),
    pan: String(body.pan || '').trim().toUpperCase(),
    gender: String(body.gender || '').trim().toLowerCase(),
    consent: body.consent === true
  };
  const errors = {};
  if (input.name.length < 2 || input.name.length > 120) errors.name = 'Enter the customer name (2-120 characters).';
  if (!/^\d{10}$/.test(input.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.';
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(input.pan)) errors.pan = 'Enter a valid PAN in ABCDE1234F format.';
  if (!['male', 'female'].includes(input.gender)) errors.gender = 'Select male or female.';
  if (!input.consent) errors.consent = 'Explicit customer consent is required.';
  if (Object.keys(errors).length) throw new ApiError(422, 'VALIDATION_FAILED', 'Please correct the highlighted fields.', errors);
  return input;
}

function sanitizeProviderMessage(value, fallback) {
  const message = String(value || fallback || '').replace(/[\r\n]+/g, ' ').trim();
  return message.slice(0, 240) || 'The CIBIL provider could not complete this request.';
}

function assertAllowedReportUrl(rawUrl) {
  let url;
  try { url = new URL(rawUrl); } catch { throw new ApiError(502, 'INVALID_PROVIDER_RESPONSE', 'The provider returned an invalid report link.'); }
  const hosts = String(process.env.CIBIL_REPORT_ALLOWED_HOSTS || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
  if (url.protocol !== 'https:' || hosts.length === 0 || !hosts.includes(url.hostname.toLowerCase())) {
    throw new ApiError(502, 'UNTRUSTED_REPORT_URL', 'The provider report link is not from an approved secure host.');
  }
  return url;
}

async function downloadPdf(rawUrl) {
  const url = assertAllowedReportUrl(rawUrl);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), redirect: 'error' });
  if (!response.ok) throw new ApiError(502, 'REPORT_DOWNLOAD_FAILED', 'The provider report could not be downloaded.');
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

async function fetchNewReport(partnerId, body, requestMeta = {}) {
  const input = validateInput(body);
  const id = await repo.createAttempt(partnerId, input, requestMeta);
  await audit.log(partnerId, 'cibil.fetch_requested', 'cibil_report', id, { consentTextVersion: 'earnmitra-cibil-v1' }, requestMeta.ip);
  try {
    const apiUrl = process.env.SUREPASS_CIBIL_API_URL;
    const apiKey = process.env.SUREPASS_CIBIL_API_KEY;
    if (!apiUrl || !apiKey) throw new ApiError(503, 'PROVIDER_NOT_CONFIGURED', 'CIBIL service is not configured. Please contact support.');

    const providerResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: input.mobile, pan: input.pan, name: input.name, gender: input.gender, consent: 'Y' }),
      signal: AbortSignal.timeout(30000)
    });
    let json = {};
    try { json = await providerResponse.json(); } catch { /* handled below */ }
    const data = json.data || json;
    if (providerResponse.status === 422) {
      const message = sanitizeProviderMessage(data.message || json.message, 'No CIBIL report was found for these details.');
      await repo.markFailed(id, partnerId, 'NOT_FOUND', 'REPORT_NOT_FOUND', message, 422);
      await audit.log(partnerId, 'cibil.fetch_not_found', 'cibil_report', id, {}, requestMeta.ip);
      throw new ApiError(422, 'REPORT_NOT_FOUND', message);
    }
    if (!providerResponse.ok) {
      const message = sanitizeProviderMessage(data.message || json.message, 'The CIBIL provider is temporarily unavailable.');
      throw new ApiError(502, 'PROVIDER_REJECTED', message);
    }
    if (!data.credit_report_link) throw new ApiError(502, 'INVALID_PROVIDER_RESPONSE', 'The provider response did not include a report file.');
    const downloaded = await downloadPdf(data.credit_report_link);
    await repo.markSuccess(id, partnerId, {
      clientId: data.client_id,
      creditScore: data.credit_score == null ? null : Number(data.credit_score),
      storagePath: downloaded.fullPath,
      mimeType: downloaded.mimeType,
      providerStatusCode: providerResponse.status
    });
    await audit.log(partnerId, 'cibil.fetch_succeeded', 'cibil_report', id, {}, requestMeta.ip);
    return repo.findOwnedPublic(id, partnerId);
  } catch (error) {
    if (error.code !== 'REPORT_NOT_FOUND') {
      const apiError = error instanceof ApiError ? error : new ApiError(502, error?.name === 'TimeoutError' ? 'PROVIDER_TIMEOUT' : 'PROVIDER_UNAVAILABLE', 'The CIBIL provider is currently unavailable. Please try again later.');
      await repo.markFailed(id, partnerId, 'FAILED', apiError.code, apiError.message, apiError.status === 502 ? 502 : null);
      await audit.log(partnerId, 'cibil.fetch_failed', 'cibil_report', id, { code: apiError.code }, requestMeta.ip);
      throw apiError;
    }
    throw error;
  }
}

function safeReportPath(storedPath) {
  const resolved = path.resolve(storedPath || '');
  if (!storedPath || !resolved.startsWith(`${REPORT_ROOT}${path.sep}`)) throw new ApiError(404, 'REPORT_FILE_NOT_FOUND', 'Original report file is unavailable.');
  return resolved;
}

module.exports = { ApiError, validateInput, fetchNewReport, safeReportPath, REPORT_ROOT };
