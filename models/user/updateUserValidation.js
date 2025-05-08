const db = require('../../config/db');

async function validateUser(userId, code) {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = result.rows[0];
  if (!user) return { success: false, reason: 'User not found' };

  if (user.is_validated) {
    return { success: false, reason: 'Already validated' };
  }

  if (user.validation_code !== code) {
    await db.query(
      'UPDATE users SET validation_attempts = validation_attempts + 1 WHERE id = $1',
      [userId]
    );
    return { success: false, reason: 'Invalid code' };
  }

  await db.query(
    `UPDATE users
     SET is_validated = TRUE,
         validation_code = NULL,
         validation_attempts = 0
     WHERE id = $1`,
    [userId]
  );

  return { success: true };
}

module.exports = validateUser;