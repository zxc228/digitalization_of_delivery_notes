const db = require('../../config/db');

async function setResetToken(email, token) {
  const result = await db.query(
    'UPDATE users SET reset_token = $1 WHERE email = $2 RETURNING id, email',
    [token, email]
  );
  return result.rows[0];
}

module.exports = setResetToken;