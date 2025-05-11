const PDFDocument = require('pdfkit');
const getNoteById = require('../models/deliverynote/getNoteById');
const fs = require('fs');
const path = require('path');
const { create } = require('ipfs-http-client');

const ipfs = create({ url: process.env.IPFS_API_URL || 'http://localhost:5001' });

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

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
        const localPath = path.join(__dirname, '..', note.signature_url);
        imageBuffer = fs.readFileSync(localPath);
      } else if (note.signature_url.includes('/ipfs/')) {
        const cid = note.signature_url.split('/ipfs/')[1];
        const stream = ipfs.cat(cid);
        imageBuffer = await streamToBuffer(stream);
      } else {
        throw new Error('Unsupported signature source');
      }

      doc.image(imageBuffer, {
        width: 150,
        align: 'left',
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
