const path = require('path');
const saveUserImage = require('../../models/profile/saveImage');

async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const filename = req.file.filename;
    const imageUrl = `/uploads/${filename}`;

    await saveUserImage(req.user._id, imageUrl);

    res.json({
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = uploadImage;