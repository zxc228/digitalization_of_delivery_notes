// controllers/deliverynote/generatePdf.js
const generatePdfStream = require('../../utils/pdfGenerator');
const pool   = require('../../config/db');
const path   = require('path');
const fs     = require('fs');
const uploadIPFS = require('../../utils/ipfsUploader');

module.exports = async (req, res) => {
  try {
    const noteId = +req.params.id;
    const userId = req.user.id;
    const storage = req.query.storage || 'auto';   // auto | ipfs | local

    
    const { rows } = await pool.query(
      'SELECT pdf_url, signed FROM delivery_notes WHERE id=$1 AND user_id=$2',
      [noteId, userId]
    );
    if (!rows.length) return res.status(404).json({ message:'Delivery note not found' });

    let { pdf_url: pdfUrl, signed } = rows[0];

    
    if (storage !== 'local' && signed && pdfUrl) {
      return res.redirect(pdfUrl);                
    }

    
    const doc = await generatePdfStream(noteId, userId);
    if (!doc) return res.status(404).json({ message:'Access denied' });

    
    if (storage === 'ipfs') {
      const tmp = path.join(process.env.UPLOAD_DIR || 'uploads', `note_${noteId}.pdf`);
      const out = fs.createWriteStream(tmp);
      doc.pipe(out);
      doc.end();

      out.on('finish', async () => {
        pdfUrl = await uploadIPFS(tmp);
        await pool.query(
          'UPDATE delivery_notes SET pdf_url=$1 WHERE id=$2',
          [pdfUrl, noteId]
        );
        fs.unlinkSync(tmp);
        res.redirect(pdfUrl);
      });
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=delivery_note_${noteId}.pdf`);
      doc.pipe(res);
      doc.end();
    }
  } catch (e) {
    console.error('PDF error:', e);
    res.status(500).json({ message:'Error generating or retrieving PDF' });
  }
};