const PDFDocument = require('pdfkit');
const getNoteById = require('../models/deliverynote/getNoteById');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function generatePdfStream(noteId, userId) {
  const note = await getNoteById(noteId, userId);
  if (!note) return null;

  const doc = new PDFDocument({ autoFirstPage: true });

  doc.fontSize(20).text('Delivery Note', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Date: ${new Date(note.created_at).toLocaleDateString()}`);
  doc.text(`Client: ${note.client_name}`);
  doc.text(`Project: ${note.project_name}`);
  doc.moveDown();

  doc.fontSize(12).text('Items:', { underline: true });

  note.items.forEach(item => {
    doc.text(`• [${item.type.toUpperCase()}] ${item.description} — ${item.quantity} x ${item.unit_price} = ${item.total}`);
  });

  doc.moveDown();
  const total = note.items.reduce((sum, i) => sum + parseFloat(i.total), 0);
  doc.fontSize(14).text(`Total: €${total.toFixed(2)}`, { align: 'right' });

 
  if (note.signature_url) {
    doc.moveDown().moveDown();
    doc.text('Signed:', { underline: true });

    try {
      let imageBuffer;

      if (note.signature_url.startsWith('/uploads/')) {
        // Локальный файл
        const localPath = path.join(__dirname, '..', note.signature_url); // абсолютный путь
        imageBuffer = fs.readFileSync(localPath);
      } else {
        // Cloudinary или любой внешний
        const response = await axios.get(note.signature_url, { responseType: 'arraybuffer' });
        imageBuffer = Buffer.from(response.data, 'binary');
      }

      doc.image(imageBuffer, {
        width: 150,
        align: 'left'
      });

      doc.moveDown();
      doc.fontSize(10).text(`Signed on ${new Date().toLocaleString()}`);
    } catch (err) {
      console.error('⚠ Could not load signature image:', err.message);
      doc.fontSize(10).text('⚠ Signature image not available.');
    }
  }

  return doc;
}

module.exports = generatePdfStream;
