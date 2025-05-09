require('dotenv').config();
const express    = require('express');
const morgan     = require('morgan');
const fs         = require('fs');
const path       = require('path');
const fileLogger = require('./utils/fileLogger');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const routes     = require('./routes');

const app = express();

// Ensure upload directories exist
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
const TMP_DIR    = path.join(UPLOAD_DIR, 'tmp');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(TMP_DIR))    fs.mkdirSync(TMP_DIR, { recursive: true });

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// Static files
app.use('/uploads', express.static(UPLOAD_DIR));

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Log server-side errors (5xx)
app.use(fileLogger);

// API Routes
app.use('/api', routes); 

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}