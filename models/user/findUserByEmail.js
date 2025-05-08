const db = require('../../config/db');

async function findUserByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

module.exports = findUserByEmail;