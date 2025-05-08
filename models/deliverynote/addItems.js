const pool = require('../../config/db');

async function addItems(noteId, items) {
  const query = `
    INSERT INTO delivery_note_items (delivery_note_id, type, description, quantity, unit_price)
    VALUES ($1, $2, $3, $4, $5)
  `;

  for (const item of items) {
    await pool.query(query, [
      noteId,
      item.type,
      item.description,
      item.quantity,
      item.unit_price
    ]);
  }
}

module.exports = addItems;
