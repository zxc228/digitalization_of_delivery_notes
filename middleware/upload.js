// middleware/upload.js
const path   = require('path');
const fs     = require('fs');
const multer = require('multer');

const ROOT_DIR   = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const SIZE_LIMIT = Number(process.env.UPLOAD_LIMIT_MB || 10) * 1024 * 1024; // 10 MB

if (!fs.existsSync(ROOT_DIR)) fs.mkdirSync(ROOT_DIR, { recursive: true });


function upload(subDir = '') {
  const dest = path.join(ROOT_DIR, subDir);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, dest),
    filename   : (_, file, cb) => {
      const ext   = path.extname(file.originalname).toLowerCase();
      const stamp = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${stamp}${ext}`);
    }
  });

  const fileFilter = (_, file, cb) => {
    const ok = /\/(jpeg|jpg|png|webp|svg\+xml|pdf)$/.test(file.mimetype);
    cb(null, ok);
  };

  return multer({
    storage,
    limits: { fileSize: SIZE_LIMIT },
    fileFilter
  });
}

module.exports = upload;