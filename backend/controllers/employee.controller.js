// ─── Employee Controller ────────────────────────────────────────
const pool = require('../config/db');

// ── GET /api/employees ──────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { user_id, role_id } = req.user;
    
    let query = `
       SELECT e.*, u.username
       FROM employee e
       JOIN user_login u ON e.user_id = u.user_id
    `;
    let params = [];

    // If manager, only show their employees
    if (role_id === 2) {
      const mgrRes = await pool.query('SELECT manager_id FROM manager WHERE user_id = $1', [user_id]);
      if (mgrRes.rows.length > 0) {
        query += ' WHERE e.manager_id = $1';
        params.push(mgrRes.rows[0].manager_id);
      }
    }
    
    query += ' ORDER BY e.employee_id DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('getAll employees:', err.message);
    res.status(500).json({ error: 'Failed to fetch employees.' });
  }
};

// ── GET /api/employees/:id ──────────────────────────────────────
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT e.*, u.username
       FROM employee e
       JOIN user_login u ON e.user_id = u.user_id
       WHERE e.employee_id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getById employee:', err.message);
    res.status(500).json({ error: 'Failed to fetch employee.' });
  }
};

exports.create = async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, password, name, phone, email, hire_date, salary } = req.body;
    const { user_id, role_id } = req.user;

    // Only Managers (Role 2) can create Employees
    if (role_id !== 2) {
      return res.status(403).json({ error: 'Only Managers can create employees.' });
    }

    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password, and name are required.' });
    }

    await client.query('BEGIN');

    // 1. Get branch_id and manager_id from the logged-in Manager
    const mgrRes = await client.query(
      `SELECT m.manager_id, bh.branch_id 
       FROM manager m
       JOIN branch_head bh ON m.branch_head_id = bh.branch_head_id
       WHERE m.user_id = $1`, [user_id]
    );
    if (mgrRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Manager profile not found.' });
    }
    const { manager_id, branch_id } = mgrRes.rows[0];

    // 2. Check if username exists
    const existsUser = await client.query('SELECT 1 FROM user_login WHERE username = $1', [username]);
    if (existsUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Username already taken.' });
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user_login (Role 3)
    const userRes = await client.query(
      `INSERT INTO user_login (username, password_hash, role_id) VALUES ($1, $2, 3) RETURNING user_id`,
      [username, hashedPassword]
    );
    const newUserId = userRes.rows[0].user_id;

    // 4. Insert into employee
    const result = await client.query(
      `INSERT INTO employee (user_id, name, branch_id, manager_id, phone, email, hire_date, salary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [newUserId, name, branch_id, manager_id, phone || null, email || null, hire_date || null, salary || null]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('create employee:', err.message);
    res.status(500).json({ error: 'Failed to create employee.' });
  } finally {
    client.release();
  }
};

// ── PUT /api/employees/:id ──────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, branch_id, manager_id, phone, email, salary, status } = req.body;
    const result = await pool.query(
      `UPDATE employee
       SET name       = COALESCE($1, name),
           branch_id  = COALESCE($2, branch_id),
           manager_id = COALESCE($3, manager_id),
           phone      = COALESCE($4, phone),
           email      = COALESCE($5, email),
           salary     = COALESCE($6, salary),
           status     = COALESCE($7, status)
       WHERE employee_id = $8 RETURNING *`,
      [name, branch_id, manager_id, phone, email, salary, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('update employee:', err.message);
    res.status(500).json({ error: 'Failed to update employee.' });
  }
};

// ── DELETE /api/employees/:id  (soft delete) ────────────────────
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE employee SET status = 'inactive' WHERE employee_id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    res.json({ message: 'Employee deactivated.', employee: result.rows[0] });
  } catch (err) {
    console.error('remove employee:', err.message);
    res.status(500).json({ error: 'Failed to deactivate employee.' });
  }
};
