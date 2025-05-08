const pool = require('../../config/db');

async function deleteClient(clientId, userId) {
  const query = `
    DELETE FROM clients
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const values = [clientId, userId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = deleteClient;
