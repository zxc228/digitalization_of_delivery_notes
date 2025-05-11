const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const baseFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, status, stack }) => {
    return `[${timestamp}] ${level.toUpperCase()} (${status || '???'}): ${stack || message}`;
  })
);


const filter4xx = format((info) => {
  return info.status >= 400 && info.status < 500 ? info : false;
});


const filter5xx = format((info) => {
  return info.status >= 500 ? info : false;
});

const logger = createLogger({
  level: 'info',
  format: baseFormat,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    }),
  ],
});

if (process.env.LOG_4XX !== 'false') {
  logger.add(new transports.File({
    filename: path.join(logsDir, 'client-errors.log'),
    level: 'warn',
    format: format.combine(filter4xx(), baseFormat)
  }));
}

logger.add(new transports.File({
  filename: path.join(logsDir, 'server-errors.log'),
  level: 'error',
  format: format.combine(filter5xx(), baseFormat)
}));

module.exports = logger;
