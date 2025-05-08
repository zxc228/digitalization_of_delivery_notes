const db = require('../../config/db');

async function updateUserCompany(userId, name, cif, address) {
  const result = await db.query(
    'SELECT * FROM user_companies WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    await db.query(
      `INSERT INTO user_companies (user_id, name, cif, address)
       VALUES ($1, $2, $3, $4)`,
      [userId, name, cif, address]
    );
  } else {
    await db.query(
      `UPDATE user_companies
       SET name = $2, cif = $3, address = $4
       WHERE user_id = $1`,
      [userId, name, cif, address]
    );
  }

  return true;
}

module.exports = updateUserCompany;