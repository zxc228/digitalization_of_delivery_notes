const pool = require('../../config/db');

async function restoreProject(projectId, userId) {
  const query = `
    UPDATE projects
    SET is_deleted = false
    WHERE id = $1 AND user_id = $2 AND is_deleted = true
    RETURNING *;
  `;
  const result = await pool.query(query, [projectId, userId]);
  return result.rows[0];
}

module.exports = restoreProject;
