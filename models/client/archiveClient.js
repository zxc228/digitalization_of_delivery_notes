const pool = require('../../config/db');

async function archiveClient(clientId, userId) {
  const query = `
    UPDATE clients
    SET is_deleted = true
    WHERE id = $1 AND user_id = $2 AND is_deleted = false
    RETURNING *;
  `;
  const values = [clientId, userId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = archiveClient;
