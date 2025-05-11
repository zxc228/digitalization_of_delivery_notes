const path = require('path');
const saveUserImage = require('../../models/profile/saveImage');

async function uploadImage(req, res, next) {
  try {
    if (!req.file || !req.file.filename) {
      const err = new Error('No image file provided');
      err.status = 400;
      throw err;
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowedExt = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    if (!allowedExt.includes(ext)) {
      const err = new Error('Unsupported file type');
      err.status = 415;
      throw err;
    }

    const filename = req.file.filename;
    const imageUrl = `/uploads/${filename}`;

    await saveUserImage(req.user.id, imageUrl);

    res.json({
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (err) {
    next(err);
  }
}

module.exports = uploadImage;
