const validateUser = require('../../models/user/updateUserValidation');

async function validateEmail(req, res) {
  const { code } = req.body;

  if (!code || code.length !== 6) {
    return res.status(422).json({ error: 'Invalid code' });
  }

  const result = await validateUser(req.user._id, code);

  if (!result.success) {
    const message = result.reason === 'Invalid code'
      ? 'Incorrect code'
      : result.reason;
    return res.status(400).json({ error: message });
  }

  return res.json({ message: 'Email validated successfully' });
}

module.exports = validateEmail;