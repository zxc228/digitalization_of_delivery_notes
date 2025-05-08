const crypto = require('crypto');
const setResetToken = require('../../models/user/setResetToken');
const findUserByEmail = require('../../models/user/findUserByEmail');

async function recoverPassword(req, res) {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(422).json({ error: 'Invalid email' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');

  await setResetToken(email, resetToken);

  // In reality, the email would be sent, but here we just return it:
  res.json({
    message: 'Password reset token generated',
    resetToken
  });
}

module.exports = recoverPassword;