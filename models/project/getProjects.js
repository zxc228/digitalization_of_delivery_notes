const pool = require('../../config/db');

async function getProjects(userId) {
  const query = `
    SELECT * FROM projects
    WHERE user_id = $1 AND is_deleted = false
    ORDER BY created_at DESC;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

module.exports = getProjects;
