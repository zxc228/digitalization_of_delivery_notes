const pool = require('../../config/db');

async function updateClient(clientId, userId, { name, email, phone, address }) {
  const query = `
    UPDATE clients
    SET name = $1,
        email = $2,
        phone = $3,
        address = $4
    WHERE id = $5 AND user_id = $6 AND is_deleted = false
    RETURNING *;
  `;

  const values = [name, email, phone, address, clientId, userId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = updateClient;
