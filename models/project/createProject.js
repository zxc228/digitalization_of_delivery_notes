const pool = require('../../config/db');

async function createProject({ userId, clientId, name, description }) {
  const query = `
    INSERT INTO projects (user_id, client_id, name, description)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [userId, clientId, name, description];
  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = createProject;
