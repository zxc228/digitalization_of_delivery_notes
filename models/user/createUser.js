const db = require('../../config/db');

async function createUser(email, hashedPassword, code) {
  const result = await db.query(
    `INSERT INTO users (email, password, validation_code, validation_attempts)
     VALUES ($1, $2, $3, 0)
     RETURNING id, email, is_validated AS status, role`,
    [email, hashedPassword, code]
  );
  return result.rows[0];
}

module.exports = createUser;