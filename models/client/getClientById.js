const pool = require('../../config/db');

async function getClientById(clientId, userId) {
  const query = `
    SELECT * FROM clients
    WHERE id = $1 AND user_id = $2 AND is_deleted = false;
  `;
  const result = await pool.query(query, [clientId, userId]);
  return result.rows[0];
}

module.exports = getClientById;
