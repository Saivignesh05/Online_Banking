// ─── Transaction Controller ─────────────────────────────────────
const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    let result;
    if (req.user.role_id === 4) {
      // Account holders see only transactions involving their accounts
      result = await pool.query(
        `SELECT t.* FROM transaction t
         JOIN account a ON t.from_account = a.account_id OR t.to_account = a.account_id
         JOIN customer c ON a.customer_id = c.customer_id
         WHERE c.user_id = $1
         GROUP BY t.tx_id ORDER BY t.tx_time DESC`, [req.user.user_id]
      );
    } else {
      result = await pool.query('SELECT * FROM transaction ORDER BY tx_time DESC');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transaction WHERE tx_id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Transaction not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transaction.' });
  }
};

// Calls the transfer_money stored procedure
exports.transfer = async (req, res) => {
  try {
    const { from_account, to_account, amount } = req.body;
    if (!from_account || !to_account || !amount)
      return res.status(400).json({ error: 'from_account, to_account, and amount required.' });
    if (Number(amount) <= 0)
      return res.status(400).json({ error: 'Amount must be positive.' });

    // Ownership check
    if (req.user.role_id === 4) {
      const own = await pool.query(
        `SELECT a.account_id FROM account a
         JOIN customer c ON a.customer_id = c.customer_id
         WHERE c.user_id = $1 AND a.account_id = $2`, [req.user.user_id, from_account]
      );
      if (!own.rows.length) return res.status(403).json({ error: 'Access denied.' });
    }

    // 2. Resolve to_account (input is account_number)
    const toAccRes = await pool.query('SELECT account_id FROM account WHERE account_number = $1', [to_account.toString()]);
    if (!toAccRes.rows.length) {
      return res.status(404).json({ error: 'Recipient account number not found.' });
    }
    const to_account_id = toAccRes.rows[0].account_id;

    if (from_account === to_account_id) {
      return res.status(400).json({ error: 'Cannot transfer to the same account.' });
    }

    // Check balance before calling procedure
    const bal = await pool.query('SELECT get_balance($1) AS balance', [from_account]);
    if (Number(bal.rows[0].balance) < Number(amount))
      return res.status(400).json({ error: 'Insufficient balance.' });

    await pool.query('CALL transfer_money($1,$2,$3)', [from_account, to_account_id, amount]);

    // Return the newly created transaction
    const tx = await pool.query(
      'SELECT * FROM transaction ORDER BY tx_id DESC LIMIT 1'
    );
    res.status(201).json({ message: 'Transfer successful.', transaction: tx.rows[0] });
  } catch (err) {
    console.error('transfer:', err.message);
    res.status(500).json({ error: 'Transfer failed.' });
  }
};

exports.credit = async (req, res) => {
  try {
    const { to_account, amount, remarks } = req.body;
    if (!to_account || !amount)
      return res.status(400).json({ error: 'to_account and amount required.' });

    // Resolve to_account (input is account_number)
    const accRes = await pool.query('SELECT account_id FROM account WHERE account_number = $1', [to_account.toString()]);
    if (!accRes.rows.length) {
      return res.status(404).json({ error: 'Account number not found.' });
    }
    const target_account_id = accRes.rows[0].account_id;

    await pool.query('UPDATE account SET balance = balance + $1 WHERE account_id = $2', [amount, target_account_id]);

    const ref = 'CR' + Date.now();
    const result = await pool.query(
      `INSERT INTO transaction (from_account,to_account,amount,tx_type,status,reference_no,remarks)
       VALUES (NULL,$1,$2,'credit','success',$3,$4) RETURNING *`,
      [target_account_id, amount, ref, remarks || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Credit failed.' });
  }
};

exports.debit = async (req, res) => {
  try {
    const { from_account, amount, remarks } = req.body;
    if (!from_account || !amount)
      return res.status(400).json({ error: 'from_account and amount required.' });

    // Ownership check
    if (req.user.role_id === 4) {
      const own = await pool.query(
        `SELECT a.account_id FROM account a
         JOIN customer c ON a.customer_id = c.customer_id
         WHERE c.user_id = $1 AND a.account_id = $2`, [req.user.user_id, from_account]
      );
      if (!own.rows.length) return res.status(403).json({ error: 'Access denied.' });
    }

    const bal = await pool.query('SELECT get_balance($1) AS balance', [from_account]);
    if (Number(bal.rows[0].balance) < Number(amount))
      return res.status(400).json({ error: 'Insufficient balance.' });

    await pool.query('UPDATE account SET balance = balance - $1 WHERE account_id = $2', [amount, from_account]);

    const ref = 'DR' + Date.now();
    const result = await pool.query(
      `INSERT INTO transaction (from_account,to_account,amount,tx_type,status,reference_no,remarks)
       VALUES ($1,NULL,$2,'debit','success',$3,$4) RETURNING *`,
      [from_account, amount, ref, remarks || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Debit failed.' });
  }
};
