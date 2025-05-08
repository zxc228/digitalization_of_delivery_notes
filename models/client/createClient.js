const pool = require('../../config/db');

async function createClient({ userId, name, email, phone, address }) {
  const query = `
    INSERT INTO clients (user_id, name, email, phone, address)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [userId, name, email, phone, address];
  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = createClient;
