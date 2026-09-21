const leadRepo = require('../repositories/leadRepository');
const partnerRepo = require('../repositories/partnerRepository');

class LeadService {
  formatTimeline(historyRows = [], currentStatus = '', currentStage = '') {
    const historyMap = new Map();
    historyRows.forEach(row => {
      historyMap.set(row.stage, {
        label: row.stage,
        when: row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '',
        done: true,
        current: row.stage === currentStage,
        note: row.note || ''
      });
    });

    if (historyRows.length > 0 && !Array.from(historyMap.values()).some(h => h.current)) {
      const lastRow = historyRows[historyRows.length - 1];
      const entry = historyMap.get(lastRow.stage);
      if (entry) entry.current = true;
    }

    if (currentStatus === 'Rejected') {
      return historyRows.map((h, idx) => ({
        label: h.stage,
        when: new Date(h.created_at).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        }),
        done: true,
        current: idx === historyRows.length - 1,
        note: h.note || ''
      }));
    }

    const timeline = [];
    const usedStages = new Set();

    // Add historical stages
    for (const h of historyRows) {
      if (!usedStages.has(h.stage)) {
        timeline.push({
          label: h.stage,
          when: h.created_at ? new Date(h.created_at).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          }) : '',
          done: true,
          current: h.stage === currentStage,
          note: h.note || ''
        });
        usedStages.add(h.stage);
      }
    }

    // Standard future milestones if not yet reached
    const futureMilestones = ['Documents verified', 'Sent to lender', 'Sanction', 'Disbursal'];
    for (const m of futureMilestones) {
      if (!usedStages.has(m) && currentStatus !== 'Disbursed' && currentStatus !== 'Rejected') {
        timeline.push({
          label: m,
          done: false,
          current: false,
          note: ''
        });
      }
    }

    return timeline;
  }

  formatLead(lead, history = [], extraDetails = {}) {
    if (!lead) return null;

    const dateFormatted = lead.created_at
      ? new Date(lead.created_at).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : '';

    const leadCode = lead.lead_code || `FTL${lead.id}`;
    const numAmount = Number(lead.loan_amount) || 0;

    return {
      id: leadCode,
      leadCode: leadCode,
      lead_code: leadCode,
      dbId: lead.id,
      partnerId: lead.partner_id,
      productCategory: lead.product_category || 'Loans',
      applicantName: lead.applicant_name || (lead.loan_type === 'Business Loan' ? '' : lead.business_name || ''),
      businessName: lead.business_name || (lead.loan_type === 'Business Loan' ? lead.applicant_name : undefined),
      mobile: lead.mobile,
      city: lead.city,
      loanType: lead.loan_type,
      amount: numAmount,
      loanAmount: numAmount,
      date: dateFormatted,
      status: lead.status,
      currentStage: lead.current_stage,
      applicantType: lead.applicant_type,
      pan: lead.pan,
      dobOrIncorporation: lead.dob_or_incorporation,
      incomeOrTurnover: lead.income_or_turnover ? Number(lead.income_or_turnover) : undefined,
      timeline: this.formatTimeline(history, lead.status, lead.current_stage),
      creditCardDetails: extraDetails.creditCardDetails || null,
      insuranceDetails: extraDetails.insuranceDetails || null
    };
  }

  async listLeads({ status, partnerId, partnerCode } = {}) {
    let resolvedPartnerId = partnerId;
    if (!resolvedPartnerId && partnerCode) {
      const p = await partnerRepo.findByCode(partnerCode);
      if (p) resolvedPartnerId = p.id;
    }

    const leads = await leadRepo.findAll({ partnerId: resolvedPartnerId, status });
    return leads.map(l => this.formatLead(l, []));
  }

  async getLeadById(idOrCode, partnerId = null, role = 'partner') {
    const lead = await leadRepo.findByIdOrCode(idOrCode);
    if (!lead) return null;

    // Strict multi-user isolation check
    if (role !== 'admin' && partnerId !== null && lead.partner_id !== partnerId) {
      return { forbidden: true };
    }

    const [history, ccDetails, insDetails] = await Promise.all([
      leadRepo.getTimeline(lead.id),
      leadRepo.getCreditCardDetails(lead.id),
      leadRepo.getInsuranceDetails(lead.id)
    ]);

    return this.formatLead(lead, history, {
      creditCardDetails: ccDetails,
      insuranceDetails: insDetails
    });
  }

  async createLead(payload, activePartnerId = null) {
    let resolvedPartnerId = activePartnerId;
    if (!resolvedPartnerId) {
      if (payload.partnerId) {
        const p = await partnerRepo.findById(payload.partnerId);
        if (p) resolvedPartnerId = p.id;
      } else if (payload.partnerCode) {
        const p = await partnerRepo.findByCode(payload.partnerCode);
        if (p) resolvedPartnerId = p.id;
      } else {
        const p = await partnerRepo.findByCode('P-1001');
        if (p) resolvedPartnerId = p.id;
      }
    }

    if (!resolvedPartnerId) {
      const err = new Error('Valid partner ID is required to create a lead');
      err.status = 400;
      throw err;
    }

    const partner = await partnerRepo.findById(resolvedPartnerId);
    if (!partner) {
      const err = new Error('Partner not found');
      err.status = 404;
      throw err;
    }

    if (partner.approval_status === 'suspended' || partner.is_active === 0) {
      const err = new Error('Partner account is suspended. Lead creation is disabled.');
      err.status = 403;
      throw err;
    }

    const {
      productCategory = 'Loans',
      applicantName,
      businessName,
      mobile,
      city,
      loanType,
      amount,
      loanAmount,
      applicantType,
      pan,
      dob,
      dob_or_incorporation,
      income,
      income_or_turnover,
      status = 'In Progress',
      currentStage = 'Lead submitted',
      note,
      creditCardDetails,
      insuranceDetails
    } = payload;

    const isBusiness = loanType === 'Business Loan';
    const isCreditCard = productCategory === 'Credit Cards';
    const isInsurance = productCategory === 'Insurance';

    const cleanBusinessName = businessName ? String(businessName).trim() : null;
    const cleanApplicantName = applicantName ? String(applicantName).trim() : null;

    if (isBusiness && !cleanBusinessName && !cleanApplicantName) {
      const err = new Error('Business name is required for Business Loan');
      err.status = 400;
      throw err;
    }
    if (!isBusiness && !cleanApplicantName) {
      const err = new Error('Applicant name is required');
      err.status = 400;
      throw err;
    }

    const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
    const cleanCity = String(city || '').trim();

    if (!cleanMobile || cleanMobile.length !== 10) {
      const err = new Error('Please enter a valid 10-digit mobile number');
      err.status = 400;
      throw err;
    }

    if (!cleanCity) {
      const err = new Error('City is required');
      err.status = 400;
      throw err;
    }

    const resolvedLoanType = loanType || (isCreditCard ? (creditCardDetails?.cardCategory || 'Credit Card') : (isInsurance ? (insuranceDetails?.insuranceType || 'Insurance') : 'Personal Loan'));

    const resolvedBusiness = isBusiness ? (cleanBusinessName || cleanApplicantName) : cleanBusinessName;
    const resolvedApplicant = isBusiness ? (cleanApplicantName && cleanApplicantName !== resolvedBusiness ? cleanApplicantName : null) : cleanApplicantName;

    const resolvedAmount = Number(loanAmount !== undefined ? loanAmount : amount) || 0;
    const resolvedDob = dob_or_incorporation || dob || null;
    const resolvedIncome = income_or_turnover !== undefined && income_or_turnover !== ''
      ? Number(income_or_turnover)
      : (income !== undefined && income !== '' ? Number(income) : null);

    const created = await leadRepo.create({
      partner_id: resolvedPartnerId,
      product_category: productCategory,
      loan_type: resolvedLoanType,
      applicant_name: resolvedApplicant,
      business_name: resolvedBusiness,
      mobile: cleanMobile,
      city: cleanCity,
      applicant_type: applicantType || (isBusiness ? 'Company' : 'Individual'),
      pan: pan || null,
      dob_or_incorporation: resolvedDob,
      income_or_turnover: resolvedIncome,
      loan_amount: resolvedAmount,
      status: status || 'In Progress',
      current_stage: currentStage || 'Lead submitted',
      note: note || 'Lead submitted',
      credit_card_details: creditCardDetails || null,
      insurance_details: insuranceDetails || null
    });

    return this.getLeadById(created.id, resolvedPartnerId, 'partner');
  }

  async updateLeadStatus(leadId, { status, stage, note = '' }) {
    const lead = await leadRepo.findByIdOrCode(leadId);
    if (!lead) {
      const err = new Error('Lead not found');
      err.status = 404;
      throw err;
    }

    const finalStage = stage || (
      status === 'Disbursed' ? 'Disbursal' :
      status === 'Rejected' ? 'Application rejected' :
      status === 'Approved' ? 'Sanction' :
      status === 'In Progress' ? 'Documents under review' : 'Lead submitted'
    );

    await leadRepo.addStatusHistory(lead.id, status, finalStage, note);
    return this.getLeadById(lead.id, null, 'admin');
  }

  getDocumentChecklist() {
    return [
      { name: 'PAN Card', required: true, uploaded: false },
      { name: 'Aadhaar Card', required: true, uploaded: false },
      { name: 'Income Proof / Salary Slip', required: false, uploaded: false },
      { name: 'Bank Statement (3 months)', required: false, uploaded: false },
      { name: 'Business / Address Proof', required: false, uploaded: false }
    ];
  }
}

module.exports = new LeadService();
