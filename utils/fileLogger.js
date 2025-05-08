const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '..', 'logs', 'errors.log');

if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

module.exports = function fileLogger(error, req, res, next) {
  if (res.headersSent) return next(error);
  if ((res.statusCode >= 500 || error.status >= 500) && error.stack) {
    const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\n${error.stack}\n\n`;

    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) console.error('❌ Failed to write error log:', err);
    });
  }

  next(error);
};
