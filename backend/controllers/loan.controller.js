// ─── Loan Controller ────────────────────────────────────────────
const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    let result;
    if (req.user.role_id === 4) {
      result = await pool.query(
        `SELECT l.* FROM loan l
         JOIN customer c ON l.customer_id = c.customer_id
         WHERE c.user_id = $1 ORDER BY l.loan_id`, [req.user.user_id]
      );
    } else {
      result = await pool.query('SELECT * FROM loan ORDER BY loan_id');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loans.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM loan WHERE loan_id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Loan not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loan.' });
  }
};

exports.apply = async (req, res) => {
  try {
    const { account_id, loan_type, loan_amount, interest_rate, tenure_months } = req.body;
    if (!account_id || !loan_type || !loan_amount || !interest_rate || !tenure_months)
      return res.status(400).json({ error: 'All loan fields are required.' });

    // Get customer_id from logged-in user
    const cust = await pool.query('SELECT customer_id FROM customer WHERE user_id = $1', [req.user.user_id]);
    if (!cust.rows.length) return res.status(404).json({ error: 'Customer not found.' });

    const result = await pool.query(
      `INSERT INTO loan (customer_id, account_id, loan_type, loan_amount, interest_rate, tenure_months, start_date, status)
       VALUES ($1,$2,$3,$4,$5,$6, CURRENT_DATE, 'pending') RETURNING *`,
      [cust.rows[0].customer_id, account_id, loan_type, loan_amount, interest_rate, tenure_months]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply for loan.' });
  }
};

exports.approve = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    // Get employee_id of the approver
    const emp = await client.query('SELECT employee_id FROM employee WHERE user_id = $1', [req.user.user_id]);
    const approvedBy = emp.rows.length ? emp.rows[0].employee_id : null;

    await client.query('BEGIN');

    // 1. Update loan status to active
    const loanRes = await client.query(
      `UPDATE loan SET status = 'active', approved_by = $1 WHERE loan_id = $2 RETURNING *`,
      [approvedBy, id]
    );

    if (loanRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Loan not found.' });
    }
    const loan = loanRes.rows[0];

    // 2. Calculate EMI
    const emiRes = await client.query('SELECT calculate_emi($1) AS emi', [id]);
    const emiAmount = Number(emiRes.rows[0].emi);

    // 3. Generate EMI Schedule (Pending payments)
    for (let i = 1; i <= loan.tenure_months; i++) {
      await client.query(
        `INSERT INTO emi_payment (loan_id, emi_amount, due_date, payment_status, penalty_amount)
         VALUES ($1, $2, ($3::date + (interval '1 month' * $4))::date, 'pending', 0)`,
        [loan.loan_id, emiAmount, loan.start_date, i]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Loan approved and EMI schedule generated.', loan });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('approve error:', err.message);
    res.status(500).json({ error: 'Failed to approve loan.' });
  } finally {
    client.release();
  }
};

// Calls the calculate_emi database function
exports.calculateEmi = async (req, res) => {
  try {
    const result = await pool.query('SELECT calculate_emi($1) AS emi', [req.params.id]);
    res.json({ loan_id: Number(req.params.id), emi: result.rows[0].emi });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate EMI.' });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM emi_payment 
       WHERE loan_id = $1 
       AND (due_date <= CURRENT_DATE OR payment_status = 'paid')
       ORDER BY due_date`, [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch EMI payments.' });
  }
};

exports.recordPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id: loan_id } = req.params;
    
    // 1. Get loan details and customer_id
    const loanRes = await client.query(
      `SELECT l.*, c.customer_id, c.user_id 
       FROM loan l 
       JOIN customer c ON l.customer_id = c.customer_id 
       WHERE l.loan_id = $1`, [loan_id]
    );

    if (loanRes.rows.length === 0) return res.status(404).json({ error: 'Loan not found.' });
    const loan = loanRes.rows[0];

    // 2. Security check: does this loan belong to the logged-in customer?
    if (loan.user_id !== req.user.user_id) {
      return res.status(403).json({ error: 'You do not have permission to pay for this loan.' });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({ error: 'Loan is not active.' });
    }

    // 3. Calculate EMI amount using the DB function
    const emiRes = await client.query('SELECT calculate_emi($1) AS emi', [loan_id]);
    const emi_amount = Number(emiRes.rows[0].emi);

    // 4. Check account balance
    const accRes = await client.query('SELECT balance FROM account WHERE account_id = $1', [loan.account_id]);
    if (accRes.rows.length === 0) return res.status(404).json({ error: 'Linked account not found.' });
    const balance = Number(accRes.rows[0].balance);

    if (balance < emi_amount) {
      return res.status(400).json({ error: 'Insufficient balance in linked account.' });
    }

    // 5. Start transaction for atomicity
    await client.query('BEGIN');

    // 6. Deduct balance and create bank transaction
    await client.query('UPDATE account SET balance = balance - $1 WHERE account_id = $2', [emi_amount, loan.account_id]);
    
    const ref = 'EMI' + Date.now();
    const txRes = await client.query(
      `INSERT INTO transaction (from_account, to_account, amount, tx_type, status, reference_no, remarks)
       VALUES ($1, NULL, $2, 'debit', 'success', $3, $4) RETURNING tx_id`,
      [loan.account_id, emi_amount, ref, `EMI Payment for Loan #${loan_id}`]
    );
    const tx_id = txRes.rows[0].tx_id;

    // 7. Find the next pending installment
    let pendingRes = await client.query(
      `SELECT emi_id, due_date FROM emi_payment 
       WHERE loan_id = $1 AND payment_status = 'pending' 
       ORDER BY due_date ASC LIMIT 1`, [loan_id]
    );

    // SELF-HEALING: If no pending installments exist, generate the missing schedule
    if (pendingRes.rows.length === 0) {
      const paidCountRes = await client.query('SELECT COUNT(*) FROM emi_payment WHERE loan_id = $1', [loan_id]);
      const paidCount = parseInt(paidCountRes.rows[0].count);
      
      if (paidCount < loan.tenure_months) {
        // Generate the rest of the schedule
        for (let i = paidCount + 1; i <= loan.tenure_months; i++) {
          await client.query(
            `INSERT INTO emi_payment (loan_id, emi_amount, due_date, payment_status, penalty_amount)
             VALUES ($1, $2, ($3::date + (interval '1 month' * $4))::date, 'pending', 0)`,
            [loan.loan_id, emi_amount, loan.start_date, i]
          );
        }
        
        // Re-fetch the first newly created pending installment
        pendingRes = await client.query(
          `SELECT emi_id, due_date FROM emi_payment 
           WHERE loan_id = $1 AND payment_status = 'pending' 
           ORDER BY due_date ASC LIMIT 1`, [loan_id]
        );
      }
    }

    if (pendingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No pending installments found and could not generate schedule.' });
    }

    const { emi_id, due_date } = pendingRes.rows[0];
    const today = new Date();
    const dueDateObj = new Date(due_date);

    let cibilDelta = 0;
    if (today <= dueDateObj) {
      cibilDelta = 10; // On time
    } else {
      cibilDelta = -20; // Late
    }

    await client.query(
      'UPDATE customer SET cibil_score = GREATEST(300, LEAST(900, cibil_score + $1)) WHERE customer_id = $2',
      [cibilDelta, loan.customer_id]
    );

    // 8. Update the EMI installment record
    const result = await client.query(
      `UPDATE emi_payment 
       SET paid_date = CURRENT_DATE, payment_status = 'paid', tx_id = $1 
       WHERE emi_id = $2 RETURNING *`,
      [tx_id, emi_id]
    );

    await client.query('COMMIT');
    res.status(200).json({
      message: 'EMI payment successful.',
      payment: result.rows[0],
      cibil_change: cibilDelta
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('recordPayment error:', err.message);
    res.status(500).json({ error: 'Failed to record EMI payment.' });
  } finally {
    client.release();
  }
};
