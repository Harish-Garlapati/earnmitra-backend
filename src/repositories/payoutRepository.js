const { query, pool } = require('../config/db');

class PayoutRepository {
  async getEarningsSummary(partnerId) {
    const [rows] = await query(
      `SELECT 
        SUM(CASE WHEN earning_type NOT IN ('tds','payout') THEN amount ELSE 0 END) AS total,
        SUM(CASE WHEN status = 'paid' AND earning_type NOT IN ('tds','payout') THEN amount ELSE 0 END) AS paid,
        SUM(CASE WHEN status = 'available' OR (earning_type = 'payout' AND status = 'pending') THEN amount ELSE 0 END) AS available,
        SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE()) AND earning_type NOT IN ('tds','payout') THEN amount ELSE 0 END) AS thisMonth
       FROM partner_earnings
       WHERE partner_id = ?`,
      [partnerId]
    );

    const stats = rows[0] || {};
    return {
      total: Number(stats.total) || 0,
      paid: Number(stats.paid) || 0,
      available: Number(stats.available) || 0,
      thisMonth: Number(stats.thisMonth) || 0
    };
  }

  async getTransactions(partnerId) {
    // Return unified chronological transactions (earnings credits + TDS debits + payout requests)
    const [earningsRows] = await query(
      `SELECT 
        description AS label,
        created_at AS dateRaw,
        amount,
        CASE WHEN amount >= 0 THEN 'credit' ELSE 'debit' END AS kind
       FROM partner_earnings
       WHERE partner_id = ?
       ORDER BY created_at DESC`,
      [partnerId]
    );

    const [payoutRows] = await query(
      `SELECT 
        CONCAT('Payout request — ', reference_number) AS label,
        requested_at AS dateRaw,
        amount,
        'debit' AS kind
       FROM payout_requests
       WHERE partner_id = ?
       ORDER BY requested_at DESC`,
      [partnerId]
    );

    const combined = [...earningsRows, ...payoutRows].sort(
      (a, b) => new Date(b.dateRaw) - new Date(a.dateRaw)
    );

    return combined.map(item => ({
      label: item.label,
      when: new Date(item.dateRaw).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      amount: Math.abs(Number(item.amount)),
      kind: item.kind
    }));
  }

  async createPayoutRequest(partnerId, amount, bank) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Check current available balance
      const [rows] = await conn.query(
        `SELECT SUM(CASE WHEN status = 'available' OR (earning_type = 'payout' AND status = 'pending') THEN amount ELSE 0 END) AS available
         FROM partner_earnings
         WHERE partner_id = ? FOR UPDATE`,
        [partnerId]
      );

      const available = Number(rows[0]?.available) || 0;
      if (amount > available) {
        throw new Error('Requested amount exceeds available balance');
      }

      const refNumber = `PAY-${Date.now().toString().slice(-6)}`;
      const [payoutResult] = await conn.query(
        `INSERT INTO payout_requests (partner_id, amount, status, reference_number)
         VALUES (?, ?, 'REQUESTED', ?)`,
        [partnerId, amount, refNumber]
      );

      // Debit from partner_earnings by adding a pending debit or reducing available
      await conn.query(
        `INSERT INTO partner_earnings (partner_id, amount, earning_type, status, description)
         VALUES (?, ?, 'payout', 'pending', ?)`,
        [partnerId, -amount, `Payout request ${refNumber}`]
      );

      // Reserve from partner_wallets earned_balance (strictly earned funds only)
      const walletRepo = require('./walletRepository');
      await walletRepo.debitPayout({
        partnerId,
        amount,
        referenceId: refNumber,
        description: `Payout request ${refNumber}`,
        conn
      });

      await conn.commit();

      return {
        id: payoutResult.insertId,
        referenceNumber: refNumber,
        amount,
        status: 'REQUESTED'
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async getPayoutRequests(partnerId) {
    const [rows] = await query(
      `SELECT id, reference_number AS ref, requested_at AS dateRaw, amount, status
       FROM payout_requests
       WHERE partner_id = ?
       ORDER BY requested_at DESC`,
      [partnerId]
    );

    return rows.map(r => ({
      id: String(r.id),
      ref: `Payout #${r.ref}`,
      date: new Date(r.dateRaw).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      amount: Number(r.amount),
      status: ({
        requested: 'Pending',
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Paid',
        paid: 'Paid',
        rejected: 'Rejected',
        failed: 'Failed'
      })[String(r.status || '').toLowerCase()] || 'Pending'
    }));
  }
}

module.exports = new PayoutRepository();
