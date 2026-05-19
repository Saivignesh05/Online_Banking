const generateUniqueAccNumber = async (client) => {
  let isUnique = false;
  let accNumber = '';
  
  while (!isUnique) {
    accNumber = '';
    for (let i = 0; i < 12; i++) accNumber += Math.floor(Math.random() * 10);
    if (accNumber[0] === '0') accNumber = '1' + accNumber.substring(1);
    
    // Check if it already exists in the database
    const res = await client.query('SELECT 1 FROM account WHERE account_number = $1', [accNumber]);
    if (res.rows.length === 0) {
      isUnique = true;
    }
  }
  
  return accNumber;
};

module.exports = {
  generateUniqueAccNumber
};
