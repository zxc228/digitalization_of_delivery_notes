require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const { swaggerUi, swaggerSpec } = require('./config/swagger');
const routes = require('./routes');

const logger = require('./utils/logger');
const expressWinston = require('express-winston');

const app = express();

// === Ensure upload dirs ===
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
const TMP_DIR = path.join(UPLOAD_DIR, 'tmp');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// === Core Middleware ===
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// === Log all HTTP requests (optional)
// app.use(expressWinston.logger({
//   winstonInstance: logger,
//   meta: false,
//   msg: '{{req.method}} {{req.url}} {{res.statusCode}} - {{res.responseTime}}ms',
// }));

// === Main routes
app.use('/api', routes);

// === Attach status to error objects
// app.use((err, req, res, next) => {
//   if (!err.status && res.statusCode >= 400) {
//     err.status = res.statusCode;
//   }
//   next(err);
// });

// === Error logging to winston (4xx/5xx handled via filters in logger)
// app.use(expressWinston.errorLogger({
//   winstonInstance: logger,
// }));

// // === Fallback error response
// app.use((err, req, res, next) => {
//   res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
// });

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
