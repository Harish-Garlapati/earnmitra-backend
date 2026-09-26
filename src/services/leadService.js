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
      pincode: lead.pincode || extraDetails.loanDetails?.pincode || '',
      state: lead.state || extraDetails.loanDetails?.state || '',
      loanType: lead.loan_type,
      amount: numAmount,
      loanAmount: numAmount,
      monthlySalary: lead.monthly_salary ? Number(lead.monthly_salary) : (extraDetails.loanDetails?.monthly_salary ? Number(extraDetails.loanDetails.monthly_salary) : undefined),
      entityType: lead.entity_type || extraDetails.loanDetails?.entity_type || undefined,
      customEntityType: extraDetails.loanDetails?.custom_entity_type || undefined,
      profession: lead.profession || extraDetails.loanDetails?.profession || undefined,
      customProfession: extraDetails.loanDetails?.custom_profession || undefined,
      mode: lead.mode || extraDetails.loanDetails?.mode || 'referral',
      bookingCode: extraDetails.bookingCode?.code || null,
      bookingCodeValidated: Boolean(extraDetails.bookingCode?.is_validated),
      selectedLenders: extraDetails.lenderSelections || [],
      date: dateFormatted,
      status: lead.status,
      currentStage: lead.current_stage,
      applicantType: lead.applicant_type,
      pan: lead.pan,
      dobOrIncorporation: lead.dob_or_incorporation,
      incomeOrTurnover: lead.income_or_turnover ? Number(lead.income_or_turnover) : undefined,
      timeline: this.formatTimeline(history, lead.status, lead.current_stage),
      loanDetails: extraDetails.loanDetails || null,
      creditCardDetails: extraDetails.creditCardDetails || null,
      insuranceDetails: extraDetails.insuranceDetails || null
    };
  }

  async listLeads({ status, search, partnerId, partnerCode, limit = 500, offset = 0, page } = {}) {
    let resolvedPartnerId = partnerId;
    if (!resolvedPartnerId && partnerCode) {
      const p = await partnerRepo.findByCode(partnerCode);
      if (p) resolvedPartnerId = p.id;
    }

    let calculatedOffset = offset;
    if (page && !offset) {
      const parsedPage = Math.max(1, parseInt(page, 10) || 1);
      const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
      calculatedOffset = (parsedPage - 1) * parsedLimit;
    }

    const leads = await leadRepo.findAll({
      partnerId: resolvedPartnerId,
      status,
      search,
      limit,
      offset: calculatedOffset
    });
    return leads.map(l => this.formatLead(l, []));
  }

  async getLeadById(idOrCode, partnerId = null, role = 'partner') {
    const lead = await leadRepo.findByIdOrCode(idOrCode);
    if (!lead) return null;

    // Strict multi-user isolation check
    if (role !== 'admin') {
      if (!partnerId || lead.partner_id !== partnerId) return { forbidden: true };
    }

    const [history, ccDetails, insDetails, loanDetails, bookingCode, lenderSelections] = await Promise.all([
      leadRepo.getTimeline(lead.id),
      leadRepo.getCreditCardDetails(lead.id),
      leadRepo.getInsuranceDetails(lead.id),
      leadRepo.getLoanDetails(lead.id),
      leadRepo.getBookingCode(lead.id),
      leadRepo.getLenderSelections(lead.id)
    ]);

    return this.formatLead(lead, history, {
      creditCardDetails: ccDetails,
      insuranceDetails: insDetails,
      loanDetails: loanDetails,
      bookingCode: bookingCode,
      lenderSelections: lenderSelections
    });
  }

  generateBookingCode(loanType = '') {
    const prefixMap = {
      'Personal Loan': 'PL',
      'Business Loan': 'BL',
      'Professional Loan': 'PR',
      'Loan Against Property': 'LP',
      'Home Loan': 'HL',
      'Equipment Loan': 'EQ',
      'Commercial Vehicle Loan': 'CV',
      'Education Loan': 'ED',
      'Auto / Car Loan': 'AU'
    };
    const code = prefixMap[loanType] || 'LN';
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `EM-${code}-${rand}`;
  }

  async createLead(payload, activePartnerId = null) {
    const resolvedPartnerId = activePartnerId;

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
      pincode,
      state,
      loanType,
      amount,
      loanAmount,
      applicantType,
      entityType,
      customEntityType,
      profession,
      customProfession,
      salary,
      monthlySalary,
      income,
      income_or_turnover,
      mode = 'referral',
      consent,
      customerConsent,
      pan,
      dob,
      dob_or_incorporation,
      status = 'In Progress',
      currentStage = 'Lead submitted',
      note,
      creditCardDetails,
      insuranceDetails
    } = payload;

    const isCreditCard = productCategory === 'Credit Cards';
    const isInsurance = productCategory === 'Insurance';
    const resolvedLoanType = loanType || (isCreditCard ? (creditCardDetails?.cardCategory || 'Credit Card') : (isInsurance ? (insuranceDetails?.insuranceType || 'Insurance') : 'Personal Loan'));

    const isBusiness = resolvedLoanType === 'Business Loan';
    const isProfessional = resolvedLoanType === 'Professional Loan';
    const isDualApplicant = ['Home Loan', 'Loan Against Property', 'Auto / Car Loan'].includes(resolvedLoanType);

    const cleanBusinessName = businessName ? String(businessName).trim() : null;
    const cleanApplicantName = applicantName ? String(applicantName).trim() : null;
    const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
    const cleanPlace = String(payload.place || payload.city || '').trim();
    const cleanPincode = String(pincode || '').replace(/\D/g, '').slice(0, 6);
    const cleanState = String(state || '').trim();

    // Check Mobile
    if (!cleanMobile || cleanMobile.length !== 10) {
      const err = new Error('Please enter a valid 10-digit mobile number');
      err.status = 400;
      throw err;
    }

    let finalApplicantName = null;
    let finalBusinessName = null;
    let finalEntityType = null;
    let finalCustomEntity = null;
    let finalProfession = null;
    let finalCustomProfession = null;
    let finalSalary = null;
    let finalIncome = null;

    // Product-specific field validations
    if (isBusiness) {
      if (!cleanBusinessName) {
        const err = new Error('Business name is required for Business Loan');
        err.status = 400;
        throw err;
      }
      if (!entityType) {
        const err = new Error('Entity type is required for Business Loan');
        err.status = 400;
        throw err;
      }
      if (entityType === 'Others' && (!customEntityType || !String(customEntityType).trim())) {
        const err = new Error('Please enter your specific entity type');
        err.status = 400;
        throw err;
      }
      finalBusinessName = cleanBusinessName;
      finalEntityType = entityType;
      finalCustomEntity = entityType === 'Others' ? String(customEntityType).trim() : null;
      // Do NOT require or store applicantName for Business Loan
      finalApplicantName = null;
    } else if (isProfessional) {
      if (!cleanApplicantName) {
        const err = new Error('Applicant name is required for Professional Loan');
        err.status = 400;
        throw err;
      }
      if (!profession) {
        const err = new Error('Profession is required for Professional Loan');
        err.status = 400;
        throw err;
      }
      if (profession === 'Others' && (!customProfession || !String(customProfession).trim())) {
        const err = new Error('Please enter your specific profession');
        err.status = 400;
        throw err;
      }
      finalApplicantName = cleanApplicantName;
      finalProfession = profession;
      finalCustomProfession = profession === 'Others' ? String(customProfession).trim() : null;
    } else if (isDualApplicant) {
      const isNonInd = applicantType === 'Non-Individual';
      if (isNonInd) {
        if (!cleanBusinessName) {
          const err = new Error('Business name is required for Non-Individual applicants');
          err.status = 400;
          throw err;
        }
        const parsedIncome = Number(income_or_turnover !== undefined && income_or_turnover !== '' ? income_or_turnover : income);
        if (!parsedIncome || parsedIncome <= 0) {
          const err = new Error('Annual income is required for Non-Individual applicants');
          err.status = 400;
          throw err;
        }
        finalBusinessName = cleanBusinessName;
        finalIncome = parsedIncome;
        finalApplicantName = null;
        finalSalary = null;
      } else {
        if (!cleanApplicantName) {
          const err = new Error('Applicant name is required for Individual applicants');
          err.status = 400;
          throw err;
        }
        const parsedSalary = Number(monthlySalary !== undefined && monthlySalary !== '' ? monthlySalary : salary);
        if (!parsedSalary || parsedSalary <= 0) {
          const err = new Error('Monthly salary is required for Individual applicants');
          err.status = 400;
          throw err;
        }
        finalApplicantName = cleanApplicantName;
        finalSalary = parsedSalary;
        finalBusinessName = null;
        finalIncome = null;
      }
    } else if (!isCreditCard && !isInsurance) {
      if (!cleanApplicantName) {
        const err = new Error('Applicant name is required');
        err.status = 400;
        throw err;
      }
      finalApplicantName = cleanApplicantName;
    }

    const resolvedAmount = Number(loanAmount !== undefined ? loanAmount : amount) || 0;
    if ((productCategory === 'Loans' || (!isCreditCard && !isInsurance)) && resolvedAmount <= 0) {
      const err = new Error('Please enter a valid loan amount');
      err.status = 400;
      throw err;
    }

    // Pincode, Place, and State validation for Loan products
    if (productCategory === 'Loans') {
      if (!cleanPincode || cleanPincode.length !== 6) {
        const err = new Error('Please enter a valid 6-digit PIN code');
        err.status = 400;
        throw err;
      }
      if (!cleanPlace) {
        const err = new Error('Place is required');
        err.status = 400;
        throw err;
      }
      if (!cleanState) {
        const err = new Error('State is required');
        err.status = 400;
        throw err;
      }
    } else {
      if (!cleanPlace) {
        const err = new Error('City is required');
        err.status = 400;
        throw err;
      }
    }

    const hasConsent = consent === true || consent === 'true' || consent === 1 || customerConsent === true || customerConsent === 'true' || customerConsent === 1;

    // Consent check for Loans
    if (productCategory === 'Loans' && !hasConsent) {
      const err = new Error('Customer consent is required to submit a loan application');
      err.status = 400;
      throw err;
    }


    const resolvedDob = dob_or_incorporation || dob || null;
    const isDirectBooking = mode === 'direct_booking';
    const bookingCode = isDirectBooking ? this.generateBookingCode(resolvedLoanType) : null;

    const created = await leadRepo.create({
      partner_id: resolvedPartnerId,
      product_category: productCategory,
      loan_type: resolvedLoanType,
      applicant_name: finalApplicantName,
      business_name: finalBusinessName,
      mobile: cleanMobile,
      city: cleanPlace,
      pincode: cleanPincode || null,
      state: cleanState || null,
      applicant_type: applicantType || (isBusiness || applicantType === 'Non-Individual' ? 'Non-Individual' : 'Individual'),
      entity_type: finalEntityType,
      custom_entity_type: finalCustomEntity,
      profession: finalProfession,
      custom_profession: finalCustomProfession,
      pan: pan || null,
      dob_or_incorporation: resolvedDob,
      income_or_turnover: finalIncome,
      monthly_salary: finalSalary,
      loan_amount: resolvedAmount,
      mode: isDirectBooking ? 'direct_booking' : 'referral',
      customer_consent: hasConsent ? 1 : 0,
      booking_code: bookingCode,
      status: status || 'In Progress',
      current_stage: currentStage || 'Lead submitted',
      note: note || (isDirectBooking ? `Direct Booking lead initiated (${bookingCode})` : 'Referral lead submitted'),
      credit_card_details: creditCardDetails || null,
      insurance_details: insuranceDetails || null
    });

    const result = await this.getLeadById(created.id, resolvedPartnerId, 'partner');
    if (bookingCode) {
      result.bookingCode = bookingCode;
    }
    return result;
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
