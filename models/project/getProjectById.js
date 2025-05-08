const pool = require('../../config/db');

async function getProjectById(projectId, userId) {
  const query = `
    SELECT * FROM projects
    WHERE id = $1 AND user_id = $2 AND is_deleted = false;
  `;
  const result = await pool.query(query, [projectId, userId]);
  return result.rows[0];
}

module.exports = getProjectById;
