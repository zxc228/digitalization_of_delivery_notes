const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createUser = require('../../models/user/createUser');
const findUserByEmail = require('../../models/user/findUserByEmail');

async function register(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !email.includes('@') || typeof password !== 'string' || password.length < 8) {
      return res.status(422).json({ error: 'Invalid email or password too short' });
    }

    const existing = await findUserByEmail(email);
    if (existing && existing.is_validated) {
      return res.status(409).json({ error: 'User already exists and is validated' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await createUser(email, hashed, code);
    console.log(`Validation code for ${email}: ${code}`);
    const token = jwt.sign(
      { _id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.json({
      token,
      user: {
        _id: newUser.id,
        email: newUser.email,
        status: newUser.status ? 1 : 0,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = register;