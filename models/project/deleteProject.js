const pool = require('../../config/db');

async function deleteProject(projectId, userId) {
  const query = `
    DELETE FROM projects
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [projectId, userId]);
  return result.rows[0];
}

module.exports = deleteProject;
