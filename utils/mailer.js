const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: +process.env.SMTP_PORT || 1025,
  secure: false,
  auth: null,
});

module.exports = async function sendMail(to, subject, text, html = null) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    html,
  });
};
