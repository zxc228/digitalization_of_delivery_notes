const bcrypt = require('bcrypt');
const resetPasswordByToken = require('../../models/user/resetPasswordByToken');

async function resetPassword(req, res) {
  const { token, new_password } = req.body;

  if (!token || typeof new_password !== 'string' || new_password.length < 8) {
    return res.status(422).json({ error: 'Invalid input' });
  }

  const hashed = await bcrypt.hash(new_password, 10);
  const user = await resetPasswordByToken(token, hashed);

  if (!user) {
    return res.status(404).json({ error: 'Invalid or expired token' });
  }

  res.json({ message: 'Password reset successful' });
}

module.exports = resetPassword;