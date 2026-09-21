/**
 * In-memory data store. Replace with a real DB (Postgres/Mongo) later —
 * every route file only talks to the functions exported here, so that's
 * the one place to change.
 */
const partner = {
  id: 'P-1001',
  name: 'Ramesh Sharma',
  firstName: 'Ramesh',
  initials: 'R',
  type: 'CA & Tax Consultant',
  mobile: '+91 98765 43210',
  email: '',
  city: 'Hyderabad',
  state: 'Telangana',
  bank: 'HDFC Bank — ****1234',
  kycStatus: 'verified'
};

const earnings = { total: 48750, paid: 36250, available: 12500, thisMonth: 18500 };
const counts = { submitted: 24, disbursed: 8, inProgress: 6, rejected: 3 };

let leads = [
  {
    id: 'FTL123456', applicantName: 'Suresh Kumar', loanType: 'Business Loan', amount: 1000000,
    date: '12 Aug 2026', status: 'In Progress', currentStage: 'Documents under review',
    timeline: [
      { label: 'Lead submitted', when: '12 Aug 2026, 10:30 AM', done: true },
      { label: 'Documents under review', when: '12 Aug 2026, 11:15 AM', done: true, current: true },
      { label: 'Sent to lender', done: false },
      { label: 'Sanction', done: false },
      { label: 'Disbursal', done: false }
    ]
  },
  {
    id: 'FTL123455', applicantName: 'Lakshmi Traders', loanType: 'MSME Loan', amount: 2500000,
    date: '10 Aug 2026', status: 'Disbursed', currentStage: 'Disbursed',
    timeline: [
      { label: 'Lead submitted', when: '02 Aug 2026', done: true },
      { label: 'Documents verified', when: '04 Aug 2026', done: true },
      { label: 'Sent to lender', when: '05 Aug 2026', done: true },
      { label: 'Sanctioned', when: '08 Aug 2026', done: true },
      { label: 'Disbursed', when: '10 Aug 2026', done: true, current: true }
    ]
  },
  {
    id: 'FTL123454', applicantName: 'Venkat Reddy', loanType: 'Equipment Loan', amount: 1500000,
    date: '08 Aug 2026', status: 'Under Review', currentStage: 'Credit under process',
    timeline: [
      { label: 'Lead submitted', when: '08 Aug 2026', done: true },
      { label: 'Documents verified', when: '09 Aug 2026', done: true },
      { label: 'Credit under process', done: true, current: true },
      { label: 'Sanction', done: false },
      { label: 'Disbursal', done: false }
    ]
  },
  {
    id: 'FTL123453', applicantName: 'Anita Rao', loanType: 'Personal Loan', amount: 500000,
    date: '05 Aug 2026', status: 'Rejected', currentStage: 'Closed — lender declined',
    timeline: [
      { label: 'Lead submitted', when: '05 Aug 2026', done: true },
      { label: 'Sent to lender', when: '06 Aug 2026', done: true },
      { label: 'Lender declined', when: '07 Aug 2026', done: true, current: true }
    ]
  }
];

let documents = [
  { name: 'PAN Card', required: true, uploaded: false },
  { name: 'Aadhaar Card', required: true, uploaded: false },
  { name: 'Business Proof', required: false, uploaded: false },
  { name: 'Bank Statement (3 months)', required: false, uploaded: false },
  { name: 'Other Documents', required: false, uploaded: false }
];

let transactions = [
  { label: 'Payout — FTL123455', when: '12 Aug 2026', amount: 22500, kind: 'credit' },
  { label: 'TDS deduction', when: '12 Aug 2026', amount: 1125, kind: 'debit' },
  { label: 'Payout — FTL123449', when: '28 Jul 2026', amount: 13750, kind: 'credit' },
  { label: 'Payout — FTL123441', when: '14 Jul 2026', amount: 8500, kind: 'credit' }
];

const meta = {
  partnerTypes: ['CA', 'Tax Consultant', 'GST Practitioner', 'Accountant', 'Company HR',
    'Company Finance', 'DSA / Loan Agent', 'Automobile Dealer', 'Equipment Dealer',
    'Real Estate Agent', 'Business Consultant', 'Other'],
  states: ['Telangana', 'Andhra Pradesh'],
  loanTypes: [
    { icon: '🏦', label: 'Business Loan' }, { icon: '👤', label: 'Personal Loan' },
    { icon: '🚜', label: 'Equipment Loan' }, { icon: '🏪', label: 'MSME Loan' },
    { icon: '🏠', label: 'Loan Against Property' }, { icon: '📄', label: 'Other Loan' }
  ],
  loanPurposes: ['Business expansion', 'Working capital', 'Equipment purchase',
    'Machinery', 'Debt consolidation', 'Personal need', 'Other'],
  lenders: ['Any (recommended)', 'HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Bajaj Finserv', 'Tata Capital']
};

const faqs = [
  { q: 'How do I become an Earnmitra partner?', a: 'Register with your mobile number, complete KYC and accept the partner agreement. Approval usually takes 1–2 working days.' },
  { q: 'Is there a registration fee?', a: 'No. Registration is free for all partner types.' },
  { q: 'When will I receive my commission?', a: 'Payouts are released after the lender settles, typically 3–5 working days after verification.' },
  { q: 'Which loan products are available?', a: 'Business, personal, MSME, equipment, working capital and loan against property.' },
  { q: 'How do I track my leads?', a: 'Open My Leads. Every status change is also sent to you on WhatsApp.' }
];

function nextLeadId() {
  const n = 123457 + leads.length - 4;
  return 'FTL' + n;
}

module.exports = {
  partner, earnings, counts, leads, documents, transactions, meta, faqs, nextLeadId
};
