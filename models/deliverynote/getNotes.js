const pool = require('../../config/db');

async function getNotes(userId) {
  const query = `
    SELECT dn.*, p.name AS project_name, c.name AS client_name
    FROM delivery_notes dn
    JOIN projects p ON dn.project_id = p.id
    JOIN clients c ON dn.client_id = c.id
    WHERE dn.user_id = $1
    ORDER BY dn.created_at DESC;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

module.exports = getNotes;
