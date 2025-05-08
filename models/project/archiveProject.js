const pool = require('../../config/db');

async function archiveProject(projectId, userId) {
  const query = `
    UPDATE projects
    SET is_deleted = true
    WHERE id = $1 AND user_id = $2 AND is_deleted = false
    RETURNING *;
  `;
  const result = await pool.query(query, [projectId, userId]);
  return result.rows[0];
}

module.exports = archiveProject;
