const fs         = require('fs');
const path       = require('path');
const uploadIPFS = require('../../utils/ipfsUploader');
const signNoteDB = require('../../models/deliverynote/signNote');   
const generate   = require('../../utils/pdfGenerator');
const pool       = require('../../config/db');

module.exports = async (req, res) => {
  try {
    const noteId   = +req.params.id;
    const userId   = req.user.id;
    const file     = req.file;
    const storage  = req.query.storage || 'ipfs'; // ipfs | local

    if (!file) return res.status(400).json({ message:'Signature image is required' });

   
    let signatureUrl;

    if (storage === 'local') {
      const sigDir  = path.join(process.env.UPLOAD_DIR || 'uploads', 'signatures');
      if (!fs.existsSync(sigDir)) fs.mkdirSync(sigDir, { recursive:true });

      const dest = path.join(sigDir, file.filename);
      fs.renameSync(file.path, dest);                       
      signatureUrl = `/uploads/signatures/${file.filename}`;
    } else {
      signatureUrl = await uploadIPFS(file.path);           
      fs.unlinkSync(file.path);                            
    }

    
    let pdfUrl = null;

    const pdfDoc = await generate(noteId, userId);
    if (!pdfDoc) return res.status(404).json({ message:'Note not found or access denied' });

    if (storage === 'ipfs') {
      const tmp = path.join(process.env.UPLOAD_DIR || 'uploads', `note_${noteId}.pdf`);
      const out = fs.createWriteStream(tmp);
      pdfDoc.pipe(out);
      pdfDoc.end();

      await new Promise(r => out.on('finish', r));

      pdfUrl = await uploadIPFS(tmp);
      fs.unlinkSync(tmp);
    } else {
      
      pdfDoc.end();
    }

  
    const updated = await signNoteDB(noteId, userId, signatureUrl, pdfUrl);
    if (!updated)
      return res.status(400).json({ message:'Note already signed or not found' });

    res.json({ message:'Note signed successfully', signatureUrl, pdfUrl });

  } catch (e) {
    console.error('Sign error:', e);
    res.status(500).json({ message:'Server error during signing' });
  }
};