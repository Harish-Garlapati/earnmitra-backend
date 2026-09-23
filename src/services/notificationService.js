const repo = require('../repositories/notificationRepository');

class NotificationService {
  async getNotifications(partnerId, options = {}) {
    return repo.listByPartner(partnerId, options);
  }

  async getUnreadCount(partnerId) {
    return repo.getUnreadCount(partnerId);
  }

  async markAsRead(notificationId, partnerId) {
    return repo.markAsRead(notificationId, partnerId);
  }

  async markAllAsRead(partnerId) {
    return repo.markAllAsRead(partnerId);
  }

  async createNotification(dataOrPartnerId, type, title, message, meta = {}) {
    if (typeof dataOrPartnerId === 'object' && dataOrPartnerId !== null) {
      return repo.create(dataOrPartnerId);
    }
    return repo.create({
      partnerId: Number(dataOrPartnerId),
      type: type || 'system',
      title: title || 'Notification',
      message: message || '',
      resourceType: meta?.resourceType || type || null,
      resourceId: meta?.resourceId ? String(meta.resourceId) : null
    });
  }


  // --- Real Business Event Triggers ---

  async notifyKycStatus(partnerId, status, note = null) {
    const isApproved = String(status).toLowerCase() === 'verified' || String(status).toLowerCase() === 'approved';
    const title = isApproved ? 'KYC Verification Approved' : 'KYC Verification Update';
    const message = isApproved
      ? 'Your KYC documents have been reviewed and verified. You can now submit leads and withdraw payouts.'
      : `Your KYC status has been updated to ${status}.${note ? ` Note: ${note}` : ''}`;

    return repo.create({
      partnerId,
      type: 'kyc',
      title,
      message,
      resourceType: 'kyc',
      resourceId: String(partnerId)
    });
  }

  async notifyLeadStatus(partnerId, leadCode, newStatus, stage = null) {
    const title = `Lead ${leadCode} Status: ${newStatus}`;
    const message = stage
      ? `Your lead ${leadCode} has progressed to stage "${stage}" with status "${newStatus}".`
      : `Your lead ${leadCode} status was updated to "${newStatus}".`;

    return repo.create({
      partnerId,
      type: 'lead',
      title,
      message,
      resourceType: 'lead',
      resourceId: String(leadCode)
    });
  }

  async notifyCommission(partnerId, leadCode, amount, ruleBasis = '') {
    const num = Number(amount) || 0;
    const title = `Commission Credited: ₹${num.toLocaleString('en-IN')}`;
    const message = `A commission of ₹${num.toLocaleString('en-IN')} has been credited to your available balance for lead ${leadCode}.${ruleBasis ? ` (${ruleBasis})` : ''}`;

    return repo.create({
      partnerId,
      type: 'commission',
      title,
      message,
      resourceType: 'lead',
      resourceId: String(leadCode)
    });
  }

  async notifyPayoutStatus(partnerId, payoutId, status, utr = null) {
    const upper = String(status).toUpperCase();
    let title = `Payout Request #${payoutId}: ${upper}`;
    let message = `Your payout request #${payoutId} status has changed to ${upper}.`;

    if (upper === 'PAID' && utr) {
      title = `Payout Settled (UTR: ${utr})`;
      message = `Your payout request #${payoutId} has been successfully settled to your bank account. Bank UTR: ${utr}.`;
    } else if (upper === 'APPROVED') {
      message = `Your payout request #${payoutId} has been approved by finance and is being queued for bank transfer.`;
    } else if (upper === 'REJECTED') {
      message = `Your payout request #${payoutId} was rejected. Funds have been restored to your available balance.`;
    }

    return repo.create({
      partnerId,
      type: 'payout',
      title,
      message,
      resourceType: 'payout',
      resourceId: String(payoutId)
    });
  }

  async notifySupportReply(partnerId, ticketId, subject) {
    return repo.create({
      partnerId,
      type: 'support',
      title: `Response to Support Ticket #${ticketId}`,
      message: `Our support team has updated your ticket "${subject || `#${ticketId}`}". Please check the support section for details.`,
      resourceType: 'support',
      resourceId: String(ticketId)
    });
  }

  async notifyCibilReady(partnerId, reportId, customerName, creditScore) {
    const title = `CIBIL Report Generated for ${customerName}`;
    const message = creditScore
      ? `The credit report for ${customerName} is ready with a score of ${creditScore}. View or download the verified PDF report in the CIBIL section.`
      : `The credit report for ${customerName} has been processed. Access it in the CIBIL section.`;

    return repo.create({
      partnerId,
      type: 'cibil',
      title,
      message,
      resourceType: 'cibil',
      resourceId: String(reportId)
    });
  }
}

module.exports = new NotificationService();
