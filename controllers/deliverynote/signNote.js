const fs = require('fs');
const path = require('path');
const uploadIPFS = require('../../utils/ipfsUploader');
const generatePdfStream = require('../../utils/pdfGenerator');
const pool = require('../../config/db');

module.exports = async (req, res) => {
  try {
    const noteId = +req.params.id;
    const userId = req.user.id;
    const file = req.file;
    const storage = req.query.storage || 'ipfs'; // 'ipfs' | 'local'

    if (!file) {
      return res.status(400).json({ message: 'Signature image is required' });
    }

    // === 1. Загрузка подписи ===
    let signatureUrl;
    if (storage === 'local') {
      const sigDir = path.join(process.env.UPLOAD_DIR || 'uploads', 'signatures');
      if (!fs.existsSync(sigDir)) fs.mkdirSync(sigDir, { recursive: true });

      const dest = path.join(sigDir, file.filename);
      fs.renameSync(file.path, dest);
      signatureUrl = `/uploads/signatures/${file.filename}`;
    } else {
      signatureUrl = await uploadIPFS(file.path);
      fs.unlinkSync(file.path); // удаляем временный файл
    }

    // === 2. Обновляем БД: сохраняем подпись и помечаем как подписанное ===
    const result = await pool.query(
      'UPDATE delivery_notes SET signature_url = $1, signed = true WHERE id = $2 AND user_id = $3 AND signed = false RETURNING id',
      [signatureUrl, noteId, userId]
    );

    if (!result.rowCount) {
      return res.status(400).json({ message: 'Note already signed or not found' });
    }

    // === 3. Генерируем новый PDF с подписью ===
    const pdfDoc = await generatePdfStream(noteId, userId);
    if (!pdfDoc) {
      return res.status(404).json({ message: 'Note not found or access denied' });
    }

    // === 4. Сохраняем PDF в IPFS или локально ===
    let pdfUrl = null;
    if (storage === 'ipfs') {
      const tmpPath = path.join(process.env.UPLOAD_DIR || 'uploads', `note_${noteId}.pdf`);
      const out = fs.createWriteStream(tmpPath);
      pdfDoc.pipe(out);
      pdfDoc.end();

      await new Promise((resolve) => out.on('finish', resolve));

      pdfUrl = await uploadIPFS(tmpPath);
      fs.unlinkSync(tmpPath); // удаляем временный файл
    } else {
      pdfDoc.end(); // если локально — просто завершить стрим
    }

    // === 5. Обновляем ссылку на PDF в базе ===
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

  } catch (e) {
    console.error('Sign error:', e);
    res.status(500).json({ message: 'Server error during signing' });
  }
};
