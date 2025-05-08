const pool = require('../../config/db');

async function createNote({ userId, clientId, projectId }) {
  const query = `
    INSERT INTO delivery_notes (user_id, client_id, project_id)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [userId, clientId, projectId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = createNote;
