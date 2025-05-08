const pool = require('../../config/db');

async function updateProject(projectId, userId, { name, description }) {
  const query = `
    UPDATE projects
    SET name = $1,
        description = $2
    WHERE id = $3 AND user_id = $4 AND is_deleted = false
    RETURNING *;
  `;
  const values = [name, description, projectId, userId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = updateProject;
