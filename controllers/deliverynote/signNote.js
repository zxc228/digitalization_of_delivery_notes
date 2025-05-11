const fs = require('fs');
const path = require('path');
const uploadIPFS = require('../../utils/ipfsUploader');
const generatePdfStream = require('../../utils/pdfGenerator');
const pool = require('../../config/db');

module.exports = async (req, res, next) => {
  try {
    const noteId = +req.params.id;
    const userId = req.user.id;
    const file = req.file;
    const storage = req.query.storage || 'ipfs'; // 'ipfs' | 'local'

    if (!file) {
      const err = new Error('Signature image is required');
      err.status = 400;
      throw err;
    }

    // === 1. Upload signature ===
    let signatureUrl;
    if (storage === 'local') {
      const sigDir = path.join(process.env.UPLOAD_DIR || 'uploads', 'signatures');
      if (!fs.existsSync(sigDir)) fs.mkdirSync(sigDir, { recursive: true });

      const dest = path.join(sigDir, file.filename);
      fs.renameSync(file.path, dest);
      signatureUrl = `/uploads/signatures/${file.filename}`;
    } else {
      signatureUrl = await uploadIPFS(file.path);
      fs.unlinkSync(file.path); // delete temp file
    }

    // === 2. Save signature in DB ===
    const result = await pool.query(
      'UPDATE delivery_notes SET signature_url = $1, signed = true WHERE id = $2 AND user_id = $3 AND signed = false RETURNING id',
      [signatureUrl, noteId, userId]
    );

    if (!result.rowCount) {
      const err = new Error('Note already signed or not found');
      err.status = 400;
      throw err;
    }

    // === 3. Generate PDF with signature ===
    const pdfDoc = await generatePdfStream(noteId, userId);
    if (!pdfDoc) {
      const err = new Error('Note not found or access denied');
      err.status = 404;
      throw err;
    }

    // === 4. Save signed PDF ===
    let pdfUrl = null;
    if (storage === 'ipfs') {
      const tmpPath = path.join(process.env.UPLOAD_DIR || 'uploads', `note_${noteId}.pdf`);
      const out = fs.createWriteStream(tmpPath);
      pdfDoc.pipe(out);
      pdfDoc.end();

      await new Promise((resolve) => out.on('finish', resolve));

      pdfUrl = await uploadIPFS(tmpPath);
      fs.unlinkSync(tmpPath);
    } else {
      pdfDoc.end();
    }

    // === 5. Update PDF URL in DB ===
    if (pdfUrl) {
      await pool.query(
        'UPDATE delivery_notes SET pdf_url = $1 WHERE id = $2 AND user_id = $3',
        [pdfUrl, noteId, userId]
      );
    }

    res.json({
      message: 'Note signed successfully',
      signatureUrl,
      pdfUrl,
    });

  } catch (err) {
    console.error('Sign error:', err);
    next(err);
  }
};
