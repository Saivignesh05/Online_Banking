// --- Transaction Controller -------------------------------------
const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    let result;
    if (req.user.role_id === 4) {
      result = await pool.query(
        `SELECT t.*, 
                af.account_number AS from_account_number,
                at.account_number AS to_account_number
         FROM transaction t
         LEFT JOIN account af ON t.from_account = af.account_id
         LEFT JOIN account at ON t.to_account = at.account_id
         JOIN account a ON t.from_account = a.account_id OR t.to_account = a.account_id
         JOIN customer c ON a.customer_id = c.customer_id
         WHERE c.user_id = $1
         GROUP BY t.tx_id, af.account_number, at.account_number ORDER BY t.tx_time DESC`, [req.user.user_id]
      );
    } else {
      result = await pool.query(
        `SELECT t.*, 
                af.account_number AS from_account_number,
                at.account_number AS to_account_number
         FROM transaction t
         LEFT JOIN account af ON t.from_account = af.account_id
         LEFT JOIN account at ON t.to_account = at.account_id
         ORDER BY t.tx_time DESC`
      );
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

exports.transfer = async (req, res) => {
  try {
    const { from_account, to_account, amount } = req.body;
    if (!from_account || !to_account || !amount)
      return res.status(400).json({ error: 'from_account, to_account, and amount required.' });
    if (Number(amount) <= 0)
      return res.status(400).json({ error: 'Amount must be positive.' });

    if (req.user.role_id === 4) {
      const own = await pool.query(
        `SELECT a.account_id FROM account a
         JOIN customer c ON a.customer_id = c.customer_id
         WHERE c.user_id = $1 AND a.account_id = $2`, [req.user.user_id, from_account]
      );
      if (!own.rows.length) {
        return res.status(403).json({ error: 'Access denied.' });
      }
    }

    const toAccRes = await pool.query('SELECT account_id FROM account WHERE account_number = $1', [to_account.toString()]);
    if (!toAccRes.rows.length) {
      return res.status(404).json({ error: 'Recipient account number not found.' });
    }
    const to_account_id = toAccRes.rows[0].account_id;

    if (from_account === to_account_id) {
      return res.status(400).json({ error: 'Cannot transfer to the same account.' });
    }

    const ref = 'TR' + Date.now();
    await pool.query('CALL transfer_money($1, $2, $3, $4, $5)', [from_account, to_account_id, amount, ref, 'Transfer successful']);
    
    const tx = await pool.query('SELECT * FROM transaction WHERE reference_no = $1', [ref]);
    res.status(201).json({ message: 'Transfer successful.', transaction: tx.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Transfer failed.' });
  }
};

exports.credit = async (req, res) => {
  try {
    const { to_account, amount, remarks } = req.body;
    if (!to_account || !amount) return res.status(400).json({ error: 'to_account and amount required.' });

    const accRes = await pool.query('SELECT account_id FROM account WHERE account_number = $1', [to_account.toString()]);
    if (!accRes.rows.length) {
      return res.status(404).json({ error: 'Account number not found.' });
    }
    const target_account_id = accRes.rows[0].account_id;

    const ref = 'CR' + Date.now();
    await pool.query('CALL credit_account($1, $2, $3, $4)', [target_account_id, amount, ref, remarks || null]);
    
    const tx = await pool.query('SELECT * FROM transaction WHERE reference_no = $1', [ref]);
    res.status(201).json(tx.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Credit failed.' });
  }
};

exports.debit = async (req, res) => {
  try {
    const { from_account, amount, remarks } = req.body;
    if (!from_account || !amount) return res.status(400).json({ error: 'from_account and amount required.' });

    if (req.user.role_id === 4) {
      const own = await pool.query(
        `SELECT a.account_id FROM account a
         JOIN customer c ON a.customer_id = c.customer_id
         WHERE c.user_id = $1 AND a.account_id = $2`, [req.user.user_id, from_account]
      );
      if (!own.rows.length) {
        return res.status(403).json({ error: 'Access denied.' });
      }
    }

    const ref = 'DR' + Date.now();
    await pool.query('CALL debit_account($1, $2, $3, $4)', [from_account, amount, ref, remarks || null]);
    
    const tx = await pool.query('SELECT * FROM transaction WHERE reference_no = $1', [ref]);
    res.status(201).json(tx.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Debit failed.' });
  }
};
