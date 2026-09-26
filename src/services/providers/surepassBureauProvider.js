/**
 * Surepass Bureau Provider Adapter
 * Handles real CIBIL and CRIF API calls to Surepass.
 * Adapted from MyLoanCRM controllers/cibilController.js & utils/surepassCrifAdapter.js
 */

class SurepassBureauProvider {
  constructor() {
    this.name = 'surepass';
  }

  isConfigured(bureau = 'CIBIL') {
    const url = process.env.SUREPASS_CIBIL_API_URL;
    const key = process.env.SUREPASS_CIBIL_API_KEY;
    return Boolean(url && key);
  }

  isDebited(apiResponse) {
    if (!apiResponse) return false;
    const candidates = [apiResponse.raw, apiResponse.data, apiResponse];
    return candidates.some(
      (c) => c && typeof c === 'object' && !Array.isArray(c) && (c.debited === true || c.is_debited === true || c.debited === 'true')
    );
  }

  parseResponse(json, bureau = 'CIBIL', payload = {}, status = 200) {
    const data = json.data || json;
    if (status === 422 || !data || json.status === 422 || /no record|not found/i.test(json.message || '')) {
      return {
        success: false,
        status: 422,
        code: 'REPORT_NOT_FOUND',
        message: data?.message || json.message || `No ${bureau} credit record found.`,
        raw: json
      };
    }
    const rawScore = data.credit_score;
    const parsedScore = (rawScore != null && !isNaN(Number(rawScore))) ? Number(rawScore) : null;
    return {
      success: true,
      status,
      bureau,
      provider: 'surepass',
      clientId: data.client_id || null,
      creditScore: parsedScore,
      providerReportId: data.client_id || null,
      reportUrl: data.credit_report_link || null,
      customerName: data.name || payload.name,
      normalizedData: {
        score: parsedScore,
        bureau,
        scoreCategory: parsedScore ? (parsedScore >= 750 ? 'Excellent' : parsedScore >= 700 ? 'Good' : parsedScore >= 650 ? 'Fair' : 'Needs Improvement') : null,
        clientId: data.client_id || null,
        paymentHistory: data.payment_history || data.credit_factors?.payment_history || null,
        creditUtilization: data.credit_utilization || data.credit_factors?.credit_utilization || null,
        creditAge: data.credit_age || data.credit_factors?.credit_age || (data.summary?.credit_age ? `${data.summary.credit_age} Years` : null),
        totalAccounts: data.summary?.total_accounts ?? (Array.isArray(data.accounts) ? data.accounts.length : null),
        recentEnquiries: data.summary?.recent_enquiries ?? (Array.isArray(data.enquiries) ? data.enquiries.length : null),
        summary: data.summary || null,
        accounts: data.accounts || null,
        enquiries: data.enquiries || null,
        reportDate: new Date().toISOString()
      },
      raw: json
    };
  }


  async fetchCibilReport({ name, mobile, pan, gender, consent }) {
    const apiUrl = process.env.SUREPASS_CIBIL_API_URL;
    const apiKey = process.env.SUREPASS_CIBIL_API_KEY;

    if (!apiUrl || !apiKey) {
      const err = new Error('Surepass CIBIL API is not configured.');
      err.code = 'PROVIDER_NOT_CONFIGURED';
      err.status = 503;
      throw err;
    }

    const payload = {
      name: String(name || '').trim(),
      mobile: String(mobile || '').replace(/\D/g, '').slice(-10),
      pan: String(pan || '').trim().toUpperCase(),
      gender: String(gender || 'male').toLowerCase(),
      consent: consent === true || consent === 'Y' ? 'Y' : 'N'
    };

    if (payload.consent !== 'Y') {
      const err = new Error('Explicit customer consent is required for CIBIL inquiry.');
      err.code = 'CONSENT_REQUIRED';
      err.status = 422;
      throw err;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    });

    let json = {};
    try {
      json = await response.json();
    } catch {
      // response body might not be valid JSON
    }

    const data = json.data || json;

    if (response.status === 422) {
      return {
        success: false,
        status: 422,
        code: 'REPORT_NOT_FOUND',
        message: data.message || json.message || 'No CIBIL credit record found for the provided details.',
        raw: json
      };
    }

    if (!response.ok) {
      const err = new Error(data.message || json.message || 'Surepass CIBIL API request failed');
      err.status = response.status >= 500 ? 502 : response.status;
      err.code = 'PROVIDER_REJECTED';
      err.raw = json;
      throw err;
    }

    const rawScore = data.credit_score;
    const parsedScore = (rawScore != null && !isNaN(Number(rawScore))) ? Number(rawScore) : null;

    return {
      success: true,
      status: response.status,
      bureau: 'CIBIL',
      provider: 'surepass',
      clientId: data.client_id || null,
      creditScore: parsedScore,
      reportUrl: data.credit_report_link || null,
      customerName: data.name || payload.name,
      mobile: data.mobile || payload.mobile,
      pan: data.pan || payload.pan,
      gender: data.gender || payload.gender,
      normalizedData: {
        score: parsedScore,
        bureau: 'CIBIL',
        scoreCategory: parsedScore ? (parsedScore >= 750 ? 'Excellent' : parsedScore >= 700 ? 'Good' : parsedScore >= 650 ? 'Fair' : 'Needs Improvement') : null,
        clientId: data.client_id || null,
        paymentHistory: data.payment_history || data.credit_factors?.payment_history || null,
        creditUtilization: data.credit_utilization || data.credit_factors?.credit_utilization || null,
        creditAge: data.credit_age || data.credit_factors?.credit_age || (data.summary?.credit_age ? `${data.summary.credit_age} Years` : null),
        totalAccounts: data.summary?.total_accounts ?? (Array.isArray(data.accounts) ? data.accounts.length : null),
        recentEnquiries: data.summary?.recent_enquiries ?? (Array.isArray(data.enquiries) ? data.enquiries.length : null),
        summary: data.summary || null,
        accounts: data.accounts || null,
        enquiries: data.enquiries || null,
        reportDate: new Date().toISOString()
      },
      raw: json
    };
  }

  async fetchCrifReport({ name, mobile, pan, aadhaarNumber, consent }) {
    const apiUrl = process.env.SUREPASS_CRIF_API_URL || process.env.SUREPASS_CIBIL_API_URL;
    const apiKey = process.env.SUREPASS_CRIF_API_KEY || process.env.SUREPASS_CIBIL_API_KEY;

    if (!apiUrl || !apiKey) {
      const err = new Error('Surepass CRIF API is not configured.');
      err.code = 'PROVIDER_NOT_CONFIGURED';
      err.status = 503;
      throw err;
    }

    const nameParts = String(name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '.';

    const payload = {
      first_name: firstName,
      last_name: lastName,
      mobile: String(mobile || '').replace(/\D/g, '').slice(-10),
      consent: consent === true || consent === 'Y' ? 'Y' : 'N',
      raw: false
    };
    if (pan) payload.pan = String(pan).trim().toUpperCase();
    if (aadhaarNumber) payload.aadhaar_number = String(aadhaarNumber).trim();

    if (payload.consent !== 'Y') {
      const err = new Error('Explicit customer consent is required for CRIF inquiry.');
      err.code = 'CONSENT_REQUIRED';
      err.status = 422;
      throw err;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    });

    let json = {};
    try {
      json = await response.json();
    } catch {}

    const data = json.data || json;

    if (response.status === 422) {
      return {
        success: false,
        status: 422,
        code: 'REPORT_NOT_FOUND',
        message: data.message || json.message || 'No CRIF credit record found for the provided details.',
        raw: json
      };
    }

    if (!response.ok) {
      const err = new Error(data.message || json.message || 'Surepass CRIF API request failed');
      err.status = response.status >= 500 ? 502 : response.status;
      err.code = 'PROVIDER_REJECTED';
      err.raw = json;
      throw err;
    }

    const rawScore = data.credit_score;
    const parsedScore = (rawScore != null && !isNaN(Number(rawScore))) ? Number(rawScore) : null;

    return {
      success: true,
      status: response.status,
      bureau: 'CRIF',
      provider: 'surepass',
      clientId: data.client_id || null,
      creditScore: parsedScore,
      reportUrl: data.credit_report_link || data.report_url || null,
      customerName: `${data.first_name || firstName} ${data.last_name || lastName}`.trim(),
      mobile: data.mobile || payload.mobile,
      pan: data.pan || payload.pan,
      normalizedData: {
        score: parsedScore,
        bureau: 'CRIF High Mark',
        scoreCategory: parsedScore ? (parsedScore >= 750 ? 'Excellent' : parsedScore >= 700 ? 'Good' : parsedScore >= 650 ? 'Fair' : 'Needs Improvement') : null,
        clientId: data.client_id || null,
        paymentHistory: data.payment_history || data.credit_factors?.payment_history || null,
        creditUtilization: data.credit_utilization || data.credit_factors?.credit_utilization || null,
        creditAge: data.credit_age || data.credit_factors?.credit_age || (data.summary?.credit_age ? `${data.summary.credit_age} Years` : null),
        totalAccounts: data.summary?.total_accounts ?? (Array.isArray(data.accounts) ? data.accounts.length : null),
        recentEnquiries: data.summary?.recent_enquiries ?? (Array.isArray(data.enquiries) ? data.enquiries.length : null),
        summary: data.summary || null,
        accounts: data.accounts || null,
        enquiries: data.enquiries || null,
        reportDate: new Date().toISOString()
      },
      raw: json
    };
  }
}

module.exports = new SurepassBureauProvider();
