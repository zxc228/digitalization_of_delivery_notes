const pool = require('../../config/db');

async function getNoteById(noteId, userId) {
  const noteQuery = `
    SELECT dn.*, p.name AS project_name, c.name AS client_name, c.email AS client_email, c.phone AS client_phone
    FROM delivery_notes dn
    JOIN projects p ON dn.project_id = p.id
    JOIN clients c ON dn.client_id = c.id
    WHERE dn.id = $1 AND dn.user_id = $2;
  `;

  const itemQuery = `
    SELECT type, description, quantity, unit_price, total
    FROM delivery_note_items
    WHERE delivery_note_id = $1;
  `;

  const noteResult = await pool.query(noteQuery, [noteId, userId]);
  if (noteResult.rowCount === 0) return null;

  const itemsResult = await pool.query(itemQuery, [noteId]);

  const note = noteResult.rows[0];
  note.items = itemsResult.rows;

  return note;
}

module.exports = getNoteById;
