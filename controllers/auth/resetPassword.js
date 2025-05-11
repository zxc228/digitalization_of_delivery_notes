const bcrypt = require('bcrypt');
const resetPasswordByToken = require('../../models/user/resetPasswordByToken');

async function resetPassword(req, res, next) {
  try {
    const { token, new_password } = req.body;

   
    if (
      typeof token !== 'string' || !token.trim() ||
      typeof new_password !== 'string' || new_password.length < 8
    ) {
      const err = new Error('Invalid input');
      err.status = 422;
      throw err;
    }

    
    const hashed = await bcrypt.hash(new_password, 10);

    
    const user = await resetPasswordByToken(token, hashed);
    if (!user) {
      const err = new Error('Invalid or expired token');
      err.status = 404;
      throw err;
    }

    res.status(200).json({ message: 'Password reset successful' });

  } catch (err) {
    next(err); 
  }
}

module.exports = resetPassword;
