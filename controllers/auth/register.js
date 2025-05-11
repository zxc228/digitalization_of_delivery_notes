const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createUser = require('../../models/user/createUser');
const findUserByEmail = require('../../models/user/findUserByEmail');
const sendMail = require('../../utils/mailer');
const logger = require('../../utils/logger');

async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    
    if (
      !email || !email.includes('@') ||
      typeof password !== 'string' || password.length < 8
    ) {
      const err = new Error('Invalid email or password too short');
      err.status = 422;
      throw err;
    }

    
    const existing = await findUserByEmail(email);
    if (existing) {
      const err = new Error('User already exists');
      err.status = 409;
      throw err;
    }

    const hashed = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await createUser(email, hashed, code);

    
    await sendMail(
      email,
      'Confirm your email',
      `Your verification code is: ${code}`
    );

    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in environment');
    }

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        status: newUser.status ? 1 : 0,
        role: newUser.role
      }
    });

  } catch (err) {
    logger.error(`Register error: ${err.stack || err.message}`);
    next(err); // пробросим в глобальный обработчик + winston
  }
}

module.exports = register;
