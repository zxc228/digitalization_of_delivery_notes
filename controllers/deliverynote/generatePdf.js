const generatePdfStream = require('../../utils/pdfGenerator');
const pool = require('../../config/db');

module.exports = async function (req, res) {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;
    const source = req.query.source || 'auto';

    // Получаем PDF URL (если он есть)
    const result = await pool.query(
      'SELECT pdf_url, signed FROM delivery_notes WHERE id = $1 AND user_id = $2',
      [noteId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Delivery note not found' });
    }

    const { pdf_url, signed } = result.rows[0];

    if ((source === 'cloud' || source === 'auto') && signed && pdf_url) {
      
      return res.redirect(pdf_url);
    }

    
    const doc = await generatePdfStream(noteId, userId);
    if (!doc) {
      return res.status(404).json({ message: 'Note not found or access denied' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=delivery_note_${noteId}.pdf`);
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error('Error generating or fetching PDF:', err);
    res.status(500).json({ message: 'Error generating or retrieving PDF' });
  }
};
