const path = require('path');
const fs = require('fs');
const uploadFile = require('../../utils/cloudUploader');
const signNote = require('../../models/deliverynote/signNote');

module.exports = async function (req, res) {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;
    const signatureFile = req.file;
    const storage = req.query.storage || 'cloud';

    if (!signatureFile) {
      return res.status(400).json({ message: 'Signature image is required' });
    }

    let signatureUrl;

    if (storage === 'local') {
      const sigDestDir = path.join('uploads', 'signatures');
      if (!fs.existsSync(sigDestDir)) fs.mkdirSync(sigDestDir, { recursive: true });

      const sigDestPath = path.join(sigDestDir, signatureFile.filename);
      fs.renameSync(signatureFile.path, sigDestPath);
      signatureUrl = `/uploads/signatures/${signatureFile.filename}`;
    } else {
      signatureUrl = await uploadFile(signatureFile.path, 'signatures');
    }


    const updated = await signNote(noteId, userId, signatureUrl, null); // no pdf yet
    if (!updated) {
      return res.status(400).json({ message: 'Note already signed or not found' });
    }

    res.json({
      message: 'Note signed successfully',
      signatureUrl
    });
  } catch (err) {
    console.error('Error signing note:', err);
    res.status(500).json({ message: 'Server error during signing' });
  }
};
