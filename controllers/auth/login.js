const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const findUserByEmail = require('../../models/user/findUserByEmail');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || typeof password !== 'string' || password.length < 8) {
    return res.status(422).json({ error: 'Invalid credentials format' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.is_validated) {
    return res.status(403).json({ error: 'Email not validated' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const token = jwt.sign(
    { _id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '3d' }
  );

  res.json({
    token,
    user: {
      _id: user.id,
      email: user.email,
      status: user.is_validated ? 1 : 0,
      role: user.role,
    }
  });
}

module.exports = login;