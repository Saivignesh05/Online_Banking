// ─── Online Banking System — Express Server ─────────────────────
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Status ──────────────────────────────────────────────────
app.get('/api/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS server_time');
    res.json({
      message: 'Online Banking API is running.',
      db_connected: true,
      server_time: result.rows[0].server_time,
    });
  } catch (err) {
    res.json({ message: 'API running, but DB not connected.', db_connected: false });
  }
});

// ── Mount Routes ────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/branches',      require('./routes/branch.routes'));
app.use('/api/employees',     require('./routes/employee.routes'));
app.use('/api/customers',     require('./routes/customer.routes'));
app.use('/api/accounts',      require('./routes/account.routes'));
app.use('/api/beneficiaries', require('./routes/beneficiary.routes'));
app.use('/api/transactions',  require('./routes/transaction.routes'));
app.use('/api/loans',         require('./routes/loan.routes'));
app.use('/api/logs',          require('./routes/log.routes'));
app.use('/api/applications',  require('./routes/application.routes'));
app.use('/api/managers',      require('./routes/manager.routes'));

// ── 404 Handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ── Global Error Handler ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start Server ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.log(`📡  API base: http://localhost:${PORT}/api`);
});
