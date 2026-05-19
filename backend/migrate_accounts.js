const pool = require('./config/db');

async function migrate() {
  try {
    const res = await pool.query(`SELECT account_id FROM account WHERE length(account_number) < 12`);
    const accounts = res.rows;
    console.log(`Found ${accounts.length} accounts to migrate.`);

    for (let acc of accounts) {
      let newAcc = '';
      for (let i = 0; i < 12; i++) newAcc += Math.floor(Math.random() * 10);
      if (newAcc[0] === '0') newAcc = '1' + newAcc.substring(1);

      await pool.query('UPDATE account SET account_number = $1 WHERE account_id = $2', [newAcc, acc.account_id]);
      console.log(`Updated account_id ${acc.account_id} to ${newAcc}`);
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
