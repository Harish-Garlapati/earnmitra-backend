const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

class AdminRepository {
  async findById(id) {
    const [rows] = await query(
      `SELECT au.*, ar.role_name FROM admin_users au
       LEFT JOIN admin_roles ar ON au.role_id = ar.id
       WHERE au.id = ? LIMIT 1`, [id]
    );
    return rows[0] || null;
  }

  async findByUsernameOrEmail(identifier) {
    const [rows] = await query(
      'SELECT * FROM admin_users WHERE username = ? OR email = ? LIMIT 1',
      [identifier, identifier]
    );
    return rows[0] || null;
  }

  async updateLastLogin(id) {
    await query('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [id]);
  }

  async updatePassword(id, newPasswordHash) {
    await query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [newPasswordHash, id]);
  }

  async getPermissions(adminId) {
    const [rows] = await query(
      `SELECT ap.permission_key, ap.module, ap.description
       FROM admin_role_permissions arp
       JOIN admin_permissions ap ON arp.permission_id = ap.id
       JOIN admin_users au ON au.role_id = arp.role_id
       WHERE au.id = ?`, [adminId]
    );
    return rows;
  }

  async getDashboardStats(category = null) {
    const [partners] = await query(`
      SELECT
        COUNT(*) as total_partners,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_partners,
        SUM(CASE WHEN kyc_status = 'pending' THEN 1 ELSE 0 END) as pending_kyc
      FROM partners
    `);

    let leadWhere = 'WHERE 1=1';
    const leadParams = [];
    if (category && category !== 'All') {
      leadWhere += ' AND product_category = ?';
      leadParams.push(category);
    }

    const [leads] = await query(`
      SELECT
        COUNT(*) as total_leads,
        SUM(CASE WHEN status = 'In Progress' OR status = 'Under Review' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE 
          WHEN (product_category = 'Loans' AND status = 'Disbursed')
            OR (product_category = 'Credit Cards' AND status = 'Card Issued')
            OR (product_category = 'Insurance' AND status = 'Policy Issued')
          THEN 1 ELSE 0 
        END) as disbursed,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
        COALESCE(SUM(CASE 
          WHEN (product_category = 'Loans' AND status = 'Disbursed')
            OR (product_category = 'Credit Cards' AND status = 'Card Issued')
            OR (product_category = 'Insurance' AND status = 'Policy Issued')
          THEN loan_amount ELSE 0 
        END), 0) as disbursed_amount,
        SUM(CASE WHEN status != 'In Progress' AND current_stage != 'Lead submitted' THEN 1 ELSE 0 END) as total_applications
      FROM leads
      ${leadWhere}
    `, leadParams);
    const [payouts] = await query(`
      SELECT
        COUNT(*) as total_payouts,
        SUM(CASE WHEN status IN ('requested', 'REQUESTED', 'UNDER_REVIEW') THEN 1 ELSE 0 END) as pending_payouts,
        COALESCE(SUM(CASE WHEN status IN ('requested', 'REQUESTED', 'UNDER_REVIEW') THEN amount ELSE 0 END), 0) as pending_payout_amount,
        COALESCE(SUM(CASE WHEN status IN ('paid', 'PAID') THEN amount ELSE 0 END), 0) as settled_payout_amount
      FROM payout_requests
    `);
    const [earnings] = await query(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END), 0) as commission_payable,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as commission_paid
      FROM partner_earnings
    `);
    const [tickets] = await query(`
      SELECT COUNT(*) as open_tickets FROM support_tickets WHERE status != 'resolved'
    `);

    // 12-Month Real DB aggregation
    const [monthlyRows] = await query(`
      SELECT 
        MONTH(created_at) as month_num,
        DATE_FORMAT(created_at, '%b') as month_name,
        COUNT(*) as count,
        COALESCE(SUM(loan_amount), 0) as total_volume,
        COALESCE(SUM(CASE 
          WHEN (product_category = 'Loans' AND status = 'Disbursed')
            OR (product_category = 'Credit Cards' AND status = 'Card Issued')
            OR (product_category = 'Insurance' AND status = 'Policy Issued')
          THEN loan_amount ELSE 0 
        END), 0) as disbursed_volume
      FROM leads
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY MONTH(created_at), DATE_FORMAT(created_at, '%b')
      ORDER BY month_num ASC
    `);

    // Application Status breakdown
    const [statusRows] = await query(`
      SELECT status, COUNT(*) as count FROM leads GROUP BY status
    `);

    // Top States aggregation
    const [stateRows] = await query(`
      SELECT COALESCE(NULLIF(p.state, ''), NULLIF(l.city, ''), 'Other') as region,
             COUNT(*) as count,
             COALESCE(SUM(l.loan_amount), 0) as total_volume
      FROM leads l
      LEFT JOIN partners p ON l.partner_id = p.id
      GROUP BY region
      ORDER BY total_volume DESC
      LIMIT 5
    `);

    // Top Products aggregation
    const [productRows] = await query(`
      SELECT COALESCE(loan_type, product_category, 'Personal Loan') as product_name,
             COUNT(*) as count,
             COALESCE(SUM(loan_amount), 0) as total_volume
      FROM leads
      GROUP BY product_name
      ORDER BY count DESC
      LIMIT 6
    `);

    const [recentLeads] = await query(`
      SELECT l.*, p.partner_code, p.full_name as partner_name
      FROM leads l JOIN partners p ON l.partner_id = p.id
      ORDER BY l.created_at DESC LIMIT 10
    `);
    const [recentPartners] = await query(`
      SELECT * FROM partners ORDER BY created_at DESC LIMIT 10
    `);
    const [pendingKycDocs] = await query(`
      SELECT kd.*, p.full_name as partner_name, p.partner_code
      FROM kyc_documents kd
      JOIN partners p ON kd.partner_id = p.id
      WHERE kd.status IN ('uploaded', 'pending')
      ORDER BY kd.created_at DESC LIMIT 10
    `);

    return {
      kpis: {
        totalPartners: Number(partners[0]?.total_partners) || 0,
        activePartners: Number(partners[0]?.active_partners) || 0,
        pendingKyc: Number(partners[0]?.pending_kyc) || 0,
        totalLeads: Number(leads[0]?.total_leads) || 0,
        inProgress: Number(leads[0]?.in_progress) || 0,
        approved: Number(leads[0]?.approved) || 0,
        disbursed: Number(leads[0]?.disbursed) || 0,
        rejected: Number(leads[0]?.rejected) || 0,
        totalApplications: Number(leads[0]?.total_applications) || 0,
        disbursedAmount: Number(leads[0]?.disbursed_amount) || 0,
        pendingPayouts: Number(payouts[0]?.pending_payouts) || 0,
        pendingPayoutAmount: Number(payouts[0]?.pending_payout_amount) || 0,
        settledPayoutAmount: Number(payouts[0]?.settled_payout_amount) || 0,
        commissionPayable: Number(earnings[0]?.commission_payable) || 0,
        commissionPaid: Number(earnings[0]?.commission_paid) || 0,
        openTickets: Number(tickets[0]?.open_tickets) || 0
      },
      monthlyOverview: monthlyRows,
      applicationStatus: statusRows,
      topStates: stateRows,
      topProducts: productRows,
      recentLeads: recentLeads,
      recentPartners: recentPartners,
      pendingKycReviews: pendingKycDocs
    };
  }
}

module.exports = new AdminRepository();
