const pool = require('../../config/db');

async function getClients(userId) {
  const query = `
    SELECT * FROM clients
    WHERE user_id = $1 AND is_deleted = false
    ORDER BY created_at DESC;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

module.exports = getClients;
