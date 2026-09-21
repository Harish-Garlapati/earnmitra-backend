const partnerRepo = require('../repositories/partnerRepository');

class PartnerService {
  formatPartner(partner) {
    if (!partner) return null;
    const nameParts = (partner.full_name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const initials = (nameParts[0] ? nameParts[0][0] : '') + (nameParts[1] ? nameParts[1][0] : '');

    let bankDisplay = '';
    if (partner.bank_name) {
      const last4 = partner.bank_account_number ? partner.bank_account_number.slice(-4) : '****';
      bankDisplay = `${partner.bank_name} — ****${last4}`;
    }

    return {
      id: partner.partner_code || `P-${partner.id}`,
      dbId: partner.id,
      partnerCode: partner.partner_code,
      name: partner.full_name,
      fullName: partner.full_name,
      firstName,
      initials: initials.toUpperCase() || 'P',
      type: partner.partner_type,
      partnerType: partner.partner_type,
      mobile: partner.mobile.startsWith('+91') ? partner.mobile : `+91 ${partner.mobile}`,
      rawMobile: partner.mobile,
      email: partner.email || '',
      businessName: partner.business_name || '',
      city: partner.city || '',
      district: partner.district || '',
      state: partner.state,
      pan: partner.pan || '',
      bank: bankDisplay,
      kycStatus: partner.kyc_status,
      approvalStatus: partner.approval_status,
      profileImageUrl: partner.profile_image_path ? '/partners/me/profile-photo' : null,
      role: partner.role || 'partner'
    };
  }

  async getCurrentPartner(idOrCode = 'P-1001') {
    let row = null;
    if (typeof idOrCode === 'number' || /^\d+$/.test(String(idOrCode))) {
      row = await partnerRepo.findById(Number(idOrCode));
    } else {
      row = await partnerRepo.findByCode(idOrCode);
    }
    return this.formatPartner(row);
  }

  async getSummary(partnerIdOrCode = 'P-1001') {
    let partner = null;
    if (typeof partnerIdOrCode === 'number' || /^\d+$/.test(String(partnerIdOrCode))) {
      partner = await partnerRepo.findById(Number(partnerIdOrCode));
    } else {
      partner = await partnerRepo.findByCode(partnerIdOrCode);
    }

    if (!partner) {
      return {
        earnings: { total: 0, paid: 0, available: 0, thisMonth: 0 },
        counts: { submitted: 0, disbursed: 0, inProgress: 0, rejected: 0 }
      };
    }

    const [earnings, counts] = await Promise.all([
      partnerRepo.getEarnings(partner.id),
      partnerRepo.getCounts(partner.id)
    ]);

    return { earnings, counts };
  }

  async registerPartner(payload) {
    const { name, mobile, email, type, state, businessName, city, district, pan, password } = payload;
    const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);

    const authService = require('./authService');
    const partnerCode = await authService.getNextPartnerCode();

    let passwordHash = null;
    if (password) {
      const bcrypt = require('bcryptjs');
      passwordHash = await bcrypt.hash(password, 10);
    }

    const created = await partnerRepo.create({
      partner_code: partnerCode,
      full_name: name,
      mobile: cleanMobile,
      email: email || null,
      partner_type: type,
      business_name: businessName || null,
      city: city || null,
      district: district || null,
      state: state || 'Telangana',
      pan: pan || null,
      password_hash: passwordHash,
      kyc_status: 'pending',
      approval_status: 'active'
    });

    return this.formatPartner(created);
  }

  async getMeta() {
    const settingMeta = await partnerRepo.getSetting('partner_metadata');
    if (settingMeta) return settingMeta;

    return {
      partnerTypes: [
        'DSA / Loan Agent', 'Financial Advisor', 'Chartered Accountant (CA)',
        'Tax Consultant', 'GST Practitioner', 'Insurance Agent',
        'Builder / Real Estate Agent', 'Automobile Dealer', 'Business Consultant', 'Other'
      ],
      states: ['Telangana', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi NCR'],
      loanTypes: [
        { icon: '💼', label: 'Business Loan' },
        { icon: '👤', label: 'Personal Loan' },
        { icon: '🩺', label: 'Professional Loan' },
        { icon: '🏠', label: 'Loan Against Property' },
        { icon: '🏡', label: 'Home Loan' },
        { icon: '🚜', label: 'Equipment Loan' },
        { icon: '🚚', label: 'Commercial Vehicle Loan' },
        { icon: '🎓', label: 'Education Loan' },
        { icon: '🚗', label: 'Auto / Car Loan' }
      ],
      creditCardIssuers: [
        'HDFC Bank', 'SBI Card', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'IndusInd Bank', 'Standard Chartered'
      ],
      insuranceTypes: [
        'Health Insurance', 'Life Insurance / Term Plan', 'Motor Insurance (Car/Two-Wheeler)', 'Commercial / Shop Insurance'
      ],
      loanPurposes: [
        'Business expansion', 'Working capital', 'Equipment purchase',
        'Machinery', 'Debt consolidation', 'Personal need', 'Other'
      ],
      lenders: ['Any (recommended)', 'HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Bajaj Finserv', 'Tata Capital']
    };
  }

  async getFaqs(filterQuery = '') {
    const faqs = await partnerRepo.getSetting('faqs') || [];
    if (!filterQuery) return faqs;
    const q = filterQuery.toLowerCase();
    return faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }
}

module.exports = new PartnerService();
