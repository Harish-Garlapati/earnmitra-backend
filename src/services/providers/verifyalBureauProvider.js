/**
 * Verifyal Bureau Provider Adapter
 * Handles real Experian, Equifax, CRIF, and fallback CIBIL requests to Verifyal API.
 * Adapted from MyLoanCRM controllers/creditReportsController.js & creditReportsApiController.js
 */

class VerifyalBureauProvider {
  constructor() {
    this.name = 'verifyal';
  }

  isConfigured() {
    const url = process.env.VERIFYAL_CREDIT_REPORT_API_URL;
    const key = process.env.VERIFYAL_CREDIT_REPORT_API_KEY;
    const token = process.env.VERIFYAL_CREDIT_REPORT_API_TOKEN;
    return Boolean(url && key && token);
  }

  isDebited(apiResponse) {
    if (!apiResponse) return false;
    const candidates = [apiResponse.raw, apiResponse.error, apiResponse.data, apiResponse];
    return candidates.some(
      (c) => c && typeof c === 'object' && !Array.isArray(c) && (c.debited === true || c.is_debited === true || c.debited === 'true')
    );
  }

  parseResponse(json, bureau = 'EXPERIAN', payload = {}, status = 200) {
    const data = json.data || json;
    const bodyStatus = json.status !== false && json.success !== false;
    if (status >= 400 || !bodyStatus || json.status === 422 || /no record|not found/i.test(json.message || '')) {
      return {
        success: false,
        status: 422,
        code: 'REPORT_NOT_FOUND',
        message: json.message || `No ${bureau} credit record found.`,
        raw: json
      };
    }
    const rawScore = data.credit_score || data.score || json.credit_score || json.score;
    const parsedScore = (rawScore != null && !isNaN(Number(rawScore))) ? Number(rawScore) : null;
    const reportId = data.report_id || json.report_id || null;
    return {
      success: true,
      status,
      bureau,
      provider: 'verifyal',
      clientId: reportId,
      creditScore: parsedScore,
      providerReportId: reportId,
      reportUrl: data.pdf_url || data.report_url || json.pdf_url || json.report_url || null,
      customerName: data.name || json.name || payload.name,
      normalizedData: {
        score: parsedScore,
        bureau,
        scoreCategory: parsedScore ? (parsedScore >= 750 ? 'Excellent' : parsedScore >= 700 ? 'Good' : parsedScore >= 650 ? 'Fair' : 'Needs Improvement') : null,
        clientId: data.report_id || null,
        totalAccounts: data.data?.total_accounts || data.total_accounts || null,
        reportDate: new Date().toISOString()
      },
      raw: json
    };
  }


  async fetchReport({ bureau, name, mobile, pan, gender, consent, dob, address, state, pincode }) {
    const url = process.env.VERIFYAL_CREDIT_REPORT_API_URL;
    const apiKey = process.env.VERIFYAL_CREDIT_REPORT_API_KEY;
    const token = process.env.VERIFYAL_CREDIT_REPORT_API_TOKEN;

    if (!url || !apiKey || !token) {
      const err = new Error(`Verifyal API is not configured for ${bureau}.`);
      err.code = 'PROVIDER_NOT_CONFIGURED';
      err.status = 503;
      throw err;
    }

    const reportType = String(bureau || 'experian').toLowerCase();
    const consentVal = consent === true || consent === 'Y' ? 'Y' : 'N';

    if (consentVal !== 'Y') {
      const err = new Error(`Explicit customer consent is required for ${bureau} inquiry.`);
      err.code = 'CONSENT_REQUIRED';
      err.status = 422;
      throw err;
    }

    // Build form data
    const formData = new FormData();
    formData.append('name', String(name || '').trim());
    formData.append('mobile', String(mobile || '').replace(/\D/g, '').slice(-10));
    formData.append('pan_card', String(pan || '').trim().toUpperCase());
    formData.append('report_type', reportType);
    formData.append('gender', String(gender || 'male').toLowerCase());
    formData.append('consent', consentVal);

    if (reportType === 'equifax') {
      if (dob) formData.append('dob', String(dob).trim());
      if (address) formData.append('address', String(address).trim());
      if (state) formData.append('state', String(state).trim().toUpperCase());
      if (pincode) formData.append('pincode', String(pincode).trim());
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Token: token,
        'API-KEY': apiKey
      },
      body: formData,
      signal: AbortSignal.timeout(30000)
    });

    let json = {};
    try {
      json = await response.json();
    } catch {}

    const data = json.data || json;

    // Verifyal returns HTTP 200 with status=false or error codes in body
    const bodyStatus = json.status !== false && json.success !== false;
    if (!response.ok || !bodyStatus) {
      const isNotFound = json.status === 422 || json.code === 'NOT_FOUND' || /no record|not found/i.test(json.message || '');
      if (isNotFound) {
        return {
          success: false,
          status: 422,
          code: 'REPORT_NOT_FOUND',
          message: json.message || `No ${bureau} credit record found for the provided details.`,
          raw: json
        };
      }

      const err = new Error(json.message || `${bureau} provider inquiry failed.`);
      err.status = response.status >= 500 ? 502 : response.status;
      err.code = 'PROVIDER_REJECTED';
      err.raw = json;
      throw err;
    }

    const rawScore = data.credit_score || data.score;
    const parsedScore = (rawScore != null && !isNaN(Number(rawScore))) ? Number(rawScore) : null;

    return {
      success: true,
      status: response.status,
      bureau: bureau.toUpperCase(),
      provider: 'verifyal',
      clientId: data.client_id || data.report_id || null,
      creditScore: parsedScore,
      reportUrl: data.credit_report_link || data.report_url || data.pdf_url || null,
      customerName: data.name || name,
      mobile: data.mobile || mobile,
      pan: data.pan || pan,
      normalizedData: {
        score: parsedScore,
        bureau: bureau.toUpperCase(),
        scoreCategory: parsedScore ? (parsedScore >= 750 ? 'Excellent' : parsedScore >= 700 ? 'Good' : parsedScore >= 650 ? 'Fair' : 'Needs Improvement') : null,
        reportDate: new Date().toISOString(),
        clientId: data.client_id || data.report_id || null
      },
      raw: json
    };
  }
}

module.exports = new VerifyalBureauProvider();
