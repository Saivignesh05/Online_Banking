const pool = require('../config/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

exports.getAll = async (req, res) => {
  try {
    const { user_id, role_id } = req.user;

    // Only Branch Head (role 1) should be able to fetch managers they created.
    if (role_id !== 1) {
      return res.status(403).json({ error: 'Only Branch Heads can view managers.' });
    }

    // Get the branch_head_id for the logged in user
    const bhRes = await pool.query('SELECT branch_head_id FROM branch_head WHERE user_id = $1', [user_id]);
    if (bhRes.rows.length === 0) {
      return res.status(404).json({ error: 'Branch head profile not found.' });
    }
    const branch_head_id = bhRes.rows[0].branch_head_id;

    const result = await pool.query(
      `SELECT m.*, u.username, u.created_at
       FROM manager m
       JOIN user_login u ON m.user_id = u.user_id
       WHERE m.branch_head_id = $1
       ORDER BY m.manager_id DESC`,
      [branch_head_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch managers error:', err.message);
    res.status(500).json({ error: 'Failed to fetch managers.' });
  }
};

exports.create = async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, password, department, appointed_date } = req.body;
    const { user_id, role_id } = req.user;

    if (role_id !== 1) {
      return res.status(403).json({ error: 'Only Branch Heads can create managers.' });
    }

    if (!username || !password || !department) {
      return res.status(400).json({ error: 'Username, password, and department are required.' });
    }

    await client.query('BEGIN');

    // 1. Get branch_head_id
    const bhRes = await client.query('SELECT branch_head_id FROM branch_head WHERE user_id = $1', [user_id]);
    if (bhRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Branch head profile not found.' });
    }
    const branch_head_id = bhRes.rows[0].branch_head_id;

    // 2. Check if username exists
    const existsUser = await client.query('SELECT 1 FROM user_login WHERE username = $1', [username]);
    if (existsUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Username already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Create user_login (role 2 for Manager)
    const userRes = await client.query(
      `INSERT INTO user_login (username, password_hash, role_id) VALUES ($1, $2, 2) RETURNING user_id`,
      [username, hashedPassword]
    );
    const newUserId = userRes.rows[0].user_id;

    // 4. Create manager record
    const mgrRes = await client.query(
      `INSERT INTO manager (user_id, branch_head_id, department, appointed_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [newUserId, branch_head_id, department, appointed_date || null]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Manager created successfully.', manager: mgrRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create manager error:', err.message);
    res.status(500).json({ error: 'Failed to create manager.' });
  } finally {
    client.release();
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE manager SET status = 'inactive' WHERE manager_id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Manager not found.' });
    res.json({ message: 'Manager deactivated.', manager: result.rows[0] });
  } catch (err) {
    console.error('remove manager:', err.message);
    res.status(500).json({ error: 'Failed to deactivate manager.' });
  }
};
