const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Убедись, что папка есть
const dir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, dir);
  },
  filename: function (_, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

module.exports = upload;
