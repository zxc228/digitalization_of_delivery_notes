const pool = require('../../config/db');

async function signNote(noteId, userId, signatureUrl, pdfUrl = null) {
  const query = `
    UPDATE delivery_notes
    SET signed = true,
        signature_url = $1,
        pdf_url = COALESCE($2, pdf_url)
    WHERE id = $3 AND user_id = $4 AND signed = false
    RETURNING *;
  `;

  const values = [signatureUrl, pdfUrl, noteId, userId];
  const result = await pool.query(query, values);
  return result.rows[0]; // или undefined, если ничего не обновилось
}

module.exports = signNote;
