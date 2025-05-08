const pool = require('../../config/db');

async function deleteNote(noteId, userId) {
  const query = `
    DELETE FROM delivery_notes
    WHERE id = $1 AND user_id = $2 AND signed = false
    RETURNING *;
  `;
  const result = await pool.query(query, [noteId, userId]);
  return result.rows[0];
}

module.exports = deleteNote;
