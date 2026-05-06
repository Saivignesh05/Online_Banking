// ─── Account Controller ─────────────────────────────────────────
const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    let result;
    if (req.user.role_id === 4) {
      // Account holders see only their own accounts
      result = await pool.query(
        `SELECT a.* FROM account a
         JOIN customer c ON a.customer_id = c.customer_id
         WHERE c.user_id = $1 ORDER BY a.account_id`, [req.user.user_id]
      );
    } else {
      result = await pool.query('SELECT * FROM account ORDER BY account_id');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch accounts.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM account WHERE account_id = $1', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Account not found.' });

    // Ownership check for account holders
    if (req.user.role_id === 4) {
      const cust = await pool.query('SELECT customer_id FROM customer WHERE user_id = $1', [req.user.user_id]);
      if (!cust.rows.length || result.rows[0].customer_id !== cust.rows[0].customer_id)
        return res.status(403).json({ error: 'Access denied.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch account.' });
  }
};

// Calls the create_account stored procedure
exports.create = async (req, res) => {
  try {
    const { customer_id, branch_id, account_number, account_type, balance } = req.body;
    if (!customer_id || !branch_id || !account_number || !account_type) {
      return res.status(400).json({ error: 'customer_id, branch_id, account_number, account_type required.' });
    }
    await pool.query('CALL create_account($1,$2,$3,$4,$5)',
      [customer_id, branch_id, account_number, account_type, balance || 0]);

    const result = await pool.query('SELECT * FROM account WHERE account_number = $1', [account_number]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('create account:', err.message);
    res.status(500).json({ error: 'Failed to create account.' });
  }
};

// Customer requesting a new account (status = pending)
exports.requestAccount = async (req, res) => {
  try {
    if (req.user.role_id !== 4) return res.status(403).json({ error: 'Only customers can request accounts here.' });
    const { branch_id, account_type } = req.body;
    if (!branch_id || !account_type) return res.status(400).json({ error: 'branch_id and account_type required.' });

    // get customer_id
    const custRes = await pool.query('SELECT customer_id FROM customer WHERE user_id = $1', [req.user.user_id]);
    if (!custRes.rows.length) return res.status(404).json({ error: 'Customer not found.' });
    const customer_id = custRes.rows[0].customer_id;

    // generate random account number
    const accNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // create the account with status = 'pending'
    await pool.query(
      `INSERT INTO account (customer_id, branch_id, account_number, account_type, balance, status)
       VALUES ($1, $2, $3, $4, 0, 'pending')`,
      [customer_id, branch_id, accNumber, account_type]
    );

    res.status(201).json({ message: 'Account request submitted. Waiting for approval.' });
  } catch (err) {
    console.error('request account:', err.message);
    res.status(500).json({ error: 'Failed to request account.' });
  }
};

exports.approveAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE account SET status='active', opened_date=CURRENT_DATE WHERE account_id=$1 AND status='pending' RETURNING *`,
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Pending account not found.' });
    res.json({ message: 'Account approved.', account: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve account.' });
  }
};

exports.rejectAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM account WHERE account_id=$1 AND status='pending' RETURNING *`, [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Pending account not found.' });
    res.json({ message: 'Account request rejected.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject account.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { account_type, status, daily_limit, min_balance } = req.body;
    const result = await pool.query(
      `UPDATE account SET account_type=COALESCE($1,account_type),
       status=COALESCE($2,status), daily_limit=COALESCE($3,daily_limit),
       min_balance=COALESCE($4,min_balance)
       WHERE account_id=$5 RETURNING *`,
      [account_type, status, daily_limit, min_balance, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Account not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update account.' });
  }
};

// Calls the get_balance function
exports.getBalance = async (req, res) => {
  try {
    const { id } = req.params;
    // Ownership check for account holders
    if (req.user.role_id === 4) {
      const acc = await pool.query(
        `SELECT a.account_id FROM account a
         JOIN customer c ON a.customer_id = c.customer_id
         WHERE c.user_id = $1 AND a.account_id = $2`, [req.user.user_id, id]
      );
      if (!acc.rows.length) return res.status(403).json({ error: 'Access denied.' });
    }
    const result = await pool.query('SELECT get_balance($1) AS balance', [id]);
    res.json({ account_id: Number(id), balance: result.rows[0].balance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get balance.' });
  }
};
