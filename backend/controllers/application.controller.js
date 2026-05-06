// ─── Application Controller ────────────────────────────────────────────
const pool = require('../config/db');

exports.getApplications = async (req, res) => {
  try {
    // Fetch pending applications (customers with kyc_verified = false)
    const query = `
      SELECT c.*, u.username, u.created_at as applied_date
      FROM customer c
      JOIN user_login u ON c.user_id = u.user_id
      WHERE c.kyc_verified = false
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    // map the output to look like applications for the frontend
    const mapped = result.rows.map(r => ({
      application_id: r.customer_id,
      name: r.name,
      pan_card: r.pan_card,
      phone: r.phone,
      email: r.email,
      status: 'pending',
      applied_date: r.applied_date
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Fetch applications error:', err.message);
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
};

exports.approveApplication = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // customer_id
    const { branch_id, account_type } = req.body;

    if (!branch_id || !account_type) {
      return res.status(400).json({ error: 'branch_id and account_type are required to approve.' });
    }

    await client.query('BEGIN');

    // Get the customer
    const custResult = await client.query('SELECT * FROM customer WHERE customer_id = $1 FOR UPDATE', [id]);
    if (custResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Customer not found.' });
    }
    const customer = custResult.rows[0];

    if (customer.kyc_verified) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Customer is already verified.' });
    }

    // 1. Generate account number (e.g., 10 digits random)
    const accNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // 2. Create account
    await client.query(
      `INSERT INTO account (customer_id, branch_id, account_number, account_type, balance)
       VALUES ($1, $2, $3, $4, 0)`,
      [customer.customer_id, branch_id, accNumber, account_type]
    );

    // 3. Update customer status
    await client.query(`UPDATE customer SET kyc_verified = true WHERE customer_id = $1`, [id]);

    await client.query('COMMIT');
    res.json({ message: 'Application approved successfully.', account_number: accNumber });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Approve application error:', err.message);
    res.status(500).json({ error: 'Failed to approve application.' });
  } finally {
    client.release();
  }
};

exports.rejectApplication = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // customer_id
    
    await client.query('BEGIN');
    
    const custRes = await client.query('SELECT user_id, kyc_verified FROM customer WHERE customer_id = $1', [id]);
    if (custRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Application not found.' });
    }
    if (custRes.rows[0].kyc_verified) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot reject an already verified customer.' });
    }
    
    const user_id = custRes.rows[0].user_id;
    
    // Delete any dependent logs
    await client.query('DELETE FROM login_log WHERE user_id = $1', [user_id]);
    await client.query('DELETE FROM audit_log WHERE user_id = $1', [user_id]);

    // Delete customer
    await client.query('DELETE FROM customer WHERE customer_id = $1', [id]);
    
    // Delete user_login
    await client.query('DELETE FROM user_login WHERE user_id = $1', [user_id]);

    await client.query('COMMIT');
    res.json({ message: 'Application rejected and deleted.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Reject application error:', err.message);
    res.status(500).json({ error: 'Failed to reject application.' });
  } finally {
    client.release();
  }
};
