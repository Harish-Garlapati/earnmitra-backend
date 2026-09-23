const payoutRepo = require('../repositories/payoutRepository');
const partnerRepo = require('../repositories/partnerRepository');

class PayoutService {
  async getPayoutData(partnerIdOrCode = null) {
    let partner = null;
    if (typeof partnerIdOrCode === 'number' || /^\d+$/.test(String(partnerIdOrCode))) {
      partner = await partnerRepo.findById(Number(partnerIdOrCode));
    } else {
      partner = await partnerRepo.findByCode(partnerIdOrCode);
    }

    if (!partner) {
      return {
        earnings: { total: 0, paid: 0, available: 0, thisMonth: 0 },
        transactions: []
      };
    }

    const [earnings, transactions, payoutRequests] = await Promise.all([
      payoutRepo.getEarningsSummary(partner.id),
      payoutRepo.getTransactions(partner.id),
      payoutRepo.getPayoutRequests(partner.id)
    ]);

    const bankDisplay = partner.bank_name
      ? `${partner.bank_name} — ****${partner.bank_account_number ? partner.bank_account_number.slice(-4) : '****'}`
      : null;

    return { 
      earnings, 
      transactions, 
      bank: bankDisplay,
      payoutRequests 
    };
  }

  async requestPayout(amount, bank, partnerIdOrCode = null) {
    let partner = null;
    if (typeof partnerIdOrCode === 'number' || /^\d+$/.test(String(partnerIdOrCode))) {
      partner = await partnerRepo.findById(Number(partnerIdOrCode));
    } else {
      partner = await partnerRepo.findByCode(partnerIdOrCode);
    }

    if (!partner) {
      const err = new Error('Partner not found');
      err.status = 404;
      throw err;
    }

    if (partner.approval_status === 'suspended' || partner.is_active === 0) {
      const err = new Error('Partner account is suspended. Payout requests are disabled.');
      err.status = 403;
      throw err;
    }

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      const err = new Error('amount must be greater than 0');
      err.status = 400;
      throw err;
    }

    const walletService = require('./walletService');
    const wallet = await walletService.getWallet(partner.id);
    if (amt > wallet.earnedBalance) {
      const err = new Error('Requested payout amount exceeds available balance (withdrawable earned balance)');
      err.status = 400;
      throw err;
    }

    const earnings = await payoutRepo.getEarningsSummary(partner.id);
    if (amt > earnings.available) {
      const err = new Error('amount exceeds available balance');
      err.status = 400;
      throw err;
    }

    const payout = await payoutRepo.createPayoutRequest(partner.id, amt, bank);
    const updatedEarnings = await payoutRepo.getEarningsSummary(partner.id);

    return {
      requested: amt,
      bank: bank || partner.bank_name || 'Registered Bank Account',
      status: 'REQUESTED',
      referenceNumber: payout.referenceNumber,
      earnings: updatedEarnings
    };
  }
}

module.exports = new PayoutService();
