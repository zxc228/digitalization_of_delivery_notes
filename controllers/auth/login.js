const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const findUserByEmail = require('../../models/user/findUserByEmail');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    
    if (!email || typeof password !== 'string' || password.length < 8) {
      const err = new Error('Invalid credentials format');
      err.status = 422;
      throw err;
    }

   
    const user = await findUserByEmail(email);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

   
    if (!user.is_validated) {
      const err = new Error('Email not validated');
      err.status = 403;
      throw err;
    }

    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const err = new Error('Incorrect password');
      err.status = 401;
      throw err;
    }

    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not set in environment');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        status: user.is_validated ? 1 : 0,
        role: user.role,
      }
    });

  } catch (err) {
    next(err); 
  }
}

module.exports = login;
