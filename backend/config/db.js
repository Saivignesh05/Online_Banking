// ─── PostgreSQL Connection Pools ────────────────────────────────
// Admin pool  →  DDL, migrations, auth queries (runs as superuser)
// Role pools  →  per-role queries with least-privilege DB users
// ────────────────────────────────────────────────────────────────
const { Pool } = require('pg');
require('dotenv').config();

const baseConfig = {
  host:     process.env.DB_HOST     || 'localhost',
  database: process.env.DB_NAME     || 'Online_Banking',
  port:     parseInt(process.env.DB_PORT) || 5432,
};

// ── Admin pool (superuser — used for auth, account creation, etc.)
const pool = new Pool({
  ...baseConfig,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('connect', () => console.log('✅  Admin pool connected to PostgreSQL'));
pool.on('error',   (err) => console.error('❌  Admin pool error:', err.message));

// ── Per-role pools (least-privilege, RLS-enforced) ───────────────
const rolePools = {
  1: new Pool({ ...baseConfig, user: process.env.DB_BRANCH_HEAD_USER, password: process.env.DB_BRANCH_HEAD_PASSWORD }),  // Branch Head
  2: new Pool({ ...baseConfig, user: process.env.DB_MANAGER_USER,     password: process.env.DB_MANAGER_PASSWORD     }),  // Manager
  3: new Pool({ ...baseConfig, user: process.env.DB_EMPLOYEE_USER,    password: process.env.DB_EMPLOYEE_PASSWORD    }),  // Employee
  4: new Pool({ ...baseConfig, user: process.env.DB_CUSTOMER_USER,    password: process.env.DB_CUSTOMER_PASSWORD    }),  // Customer
};

Object.entries(rolePools).forEach(([roleId, p]) => {
  p.on('error', (err) => console.error(`❌  Role-${roleId} pool error:`, err.message));
});

/**
 * Get the least-privilege pool for a given role_id.
 * Falls back to the admin pool if role is unknown.
 * @param {number} role_id
 * @returns {Pool}
 */
const getRolePool = (role_id) => rolePools[role_id] || pool;

/**
 * Execute a callback inside a transaction that first sets the
 * app.current_user_id session variable so PostgreSQL RLS policies
 * can filter rows to the authenticated user.
 *
 * Usage:
 *   const rows = await withRLS(req.user.role_id, req.user.user_id, async (client) => {
 *     const res = await client.query('SELECT * FROM account');
 *     return res.rows;
 *   });
 *
 * @param {number}   role_id   - The authenticated user's role ID
 * @param {number}   user_id   - The authenticated user's user ID (for RLS)
 * @param {Function} callback  - Async function receiving (client)
 * @returns {Promise<*>}
 */
const withRLS = async (role_id, user_id, callback) => {
  const rolePool = getRolePool(role_id);
  const client   = await rolePool.connect();
  try {
    await client.query('BEGIN');
    // Set session var so RLS policies can identify the current user
    await client.query(`SET LOCAL app.current_user_id = '${parseInt(user_id)}'`);
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = pool;            // default export — admin pool (backward-compatible)
module.exports.getRolePool = getRolePool;
module.exports.withRLS     = withRLS;
module.exports.rolePools   = rolePools;
