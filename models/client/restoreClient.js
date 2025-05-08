const pool = require('../../config/db');

async function restoreClient(clientId, userId) {
  const query = `
    UPDATE clients
    SET is_deleted = false
    WHERE id = $1 AND user_id = $2 AND is_deleted = true
    RETURNING *;
  `;
  const values = [clientId, userId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = restoreClient;
