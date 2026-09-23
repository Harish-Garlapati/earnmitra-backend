const https = require('https');

/**
 * Normalizes and strictly validates a 10-digit Indian mobile number.
 * Accepts formats:
 * - 9876543210
 * - +919876543210, +91 98765 43210
 * - 919876543210
 * - 09876543210
 * Rejects non-Indian or invalid formats.
 */
function normalizeIndianMobile(raw) {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, '');

  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  } else if (digits.length > 10) {
    if (/^[6-9]\d{9}$/.test(digits.slice(-10))) {
      digits = digits.slice(-10);
    }
  }

  if (/^[6-9]\d{9}$/.test(digits)) {
    return digits;
  }
  return null;
}

/**
 * Masks mobile number for safe security logging (e.g., 98765*****).
 */
function maskMobile(mobile) {
  const m = String(mobile || '');
  if (m.length === 10) {
    return m.slice(0, 5) + '*****';
  }
  return '*****';
}

class SmsService {
  constructor() {
    this.apiKey = process.env.FAST2SMS_API_KEY || '';
    this.senderId = process.env.FAST2SMS_SENDER_ID || 'WNWCPL';
    this.dltTemplateId = process.env.FAST2SMS_DLT_TEMPLATE_ID || process.env.FAST2SMS_TEMPLATE_ID || '191203';
    this.route = process.env.FAST2SMS_ROUTE || 'dlt';
  }

  isConfigured() {
    const key = process.env.FAST2SMS_API_KEY || this.apiKey;
    return !!(key && key.trim());
  }

  /**
   * Primary entrypoint for sending OTP SMS.
   */
  async sendOtp(mobile, otp) {
    const result = await this.sendOtpSms(mobile, otp);
    if (!result.success) {
      const err = new Error(result.error || 'SMS delivery failed');
      err.status = 502;
      err.code = result.code || 'SMS_DELIVERY_FAILED';
      throw err;
    }
    return result;
  }

  /**
   * Dispatches OTP SMS via Fast2SMS DLT route.
   * NEVER logs or returns raw OTP in production.
   */
  async sendOtpSms(mobile, otp) {
    const cleanMobile = normalizeIndianMobile(mobile);
    if (!cleanMobile) {
      return {
        success: false,
        error: 'Invalid 10-digit Indian mobile number. Must start with 6-9.',
        code: 'INVALID_MOBILE',
        provider: 'none'
      };
    }

    // Guard test suite execution against unnecessary SMS balance consumption
    const isTestEnv = process.env.NODE_ENV === 'test';
    const forceRealSms = process.env.SEND_REAL_SMS === 'true';
    if (isTestEnv && !forceRealSms) {
      return {
        success: true,
        provider: 'mock',
        status: 'mocked',
        requestId: `test-${Date.now()}`
      };
    }

    const apiKey = process.env.FAST2SMS_API_KEY || this.apiKey;
    if (!apiKey) {
      console.warn(`[SMS] Provider not configured. SMS dispatch skipped for ${maskMobile(cleanMobile)}.`);
      return {
        success: false,
        error: 'SMS provider is not configured. Please set FAST2SMS_API_KEY.',
        code: 'SMS_PROVIDER_NOT_CONFIGURED',
        provider: 'none'
      };
    }

    const payload = JSON.stringify({
      sender_id: process.env.FAST2SMS_SENDER_ID || this.senderId,
      message: process.env.FAST2SMS_DLT_TEMPLATE_ID || process.env.FAST2SMS_TEMPLATE_ID || this.dltTemplateId,
      route: process.env.FAST2SMS_ROUTE || this.route,
      variables_values: String(otp),
      numbers: cleanMobile
    });

    return new Promise((resolve) => {
      const options = {
        hostname: 'www.fast2sms.com',
        port: 443,
        path: '/dev/bulkV2',
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const data = JSON.parse(rawData || '{}');
            if (res.statusCode === 200 && data.return === true) {
              console.log(`[SMS] OTP dispatched successfully to ${maskMobile(cleanMobile)}. Request ID: ${data.request_id}`);
              return resolve({
                success: true,
                status: 'sent',
                provider: 'fast2sms',
                statusCode: res.statusCode,
                requestId: data.request_id,
                message: Array.isArray(data.message) ? data.message[0] : (data.message || 'SMS sent successfully')
              });
            } else {
              const errMsg = Array.isArray(data.message) ? data.message[0] : (data.message || 'SMS delivery failed');
              console.error(`[SMS] Fast2SMS error for ${maskMobile(cleanMobile)}: HTTP ${res.statusCode} - ${errMsg}`);
              return resolve({
                success: false,
                status: 'failed',
                provider: 'fast2sms',
                statusCode: res.statusCode,
                errorCode: data.status_code || res.statusCode,
                error: errMsg
              });
            }
          } catch (parseErr) {
            console.error(`[SMS] Failed to parse provider response for ${maskMobile(cleanMobile)}:`, parseErr.message);
            return resolve({
              success: false,
              provider: 'fast2sms',
              statusCode: res.statusCode,
              error: 'Invalid response from SMS provider'
            });
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        console.error(`[SMS] Request timed out connecting to Fast2SMS for ${maskMobile(cleanMobile)}`);
        return resolve({
          success: false,
          provider: 'fast2sms',
          error: 'SMS gateway timed out',
          code: 'GATEWAY_TIMEOUT'
        });
      });

      req.on('error', (err) => {
        console.error(`[SMS] Network error connecting to Fast2SMS for ${maskMobile(cleanMobile)}:`, err.message);
        return resolve({
          success: false,
          provider: 'fast2sms',
          error: err.message,
          code: 'NETWORK_ERROR'
        });
      });

      req.write(payload);
      req.end();
    });
  }

  /**
   * Checks current Fast2SMS wallet balance and SMS credits.
   */
  async getWalletBalance() {
    const apiKey = process.env.FAST2SMS_API_KEY || this.apiKey;
    if (!apiKey) {
      return { configured: false, error: 'FAST2SMS_API_KEY not set' };
    }

    return new Promise((resolve) => {
      const options = {
        hostname: 'www.fast2sms.com',
        port: 443,
        path: '/dev/wallet',
        method: 'GET',
        headers: { 'authorization': apiKey },
        timeout: 8000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            resolve({
              configured: true,
              statusCode: res.statusCode,
              data
            });
          } catch (e) {
            resolve({ configured: true, statusCode: res.statusCode, error: 'Parse error' });
          }
        });
      });

      req.on('error', err => resolve({ configured: true, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ configured: true, error: 'Timeout' }); });
      req.end();
    });
  }
}

module.exports = new SmsService();
module.exports.normalizeIndianMobile = normalizeIndianMobile;
module.exports.maskMobile = maskMobile;
