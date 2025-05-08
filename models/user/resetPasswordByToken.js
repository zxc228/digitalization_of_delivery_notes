const db = require('../../config/db');

async function resetPasswordByToken(token, hashedPassword) {
  const result = await db.query(
    `UPDATE users
     SET password = $1, reset_token = NULL
     WHERE reset_token = $2
     RETURNING id, email`,
    [hashedPassword, token]
  );
  return result.rows[0];
}

module.exports = resetPasswordByToken;