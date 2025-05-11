const crypto = require('crypto');
const setResetToken = require('../../models/user/setResetToken');
const findUserByEmail = require('../../models/user/findUserByEmail');
const sendMail = require('../../utils/mailer'); 

async function recoverPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      const err = new Error('Invalid email');
      err.status = 422;
      throw err;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    await setResetToken(email, resetToken);

  
    await sendMail(
      email,
      'Password Reset',
      `Use this token to reset your password: ${resetToken}`
    );

    res.status(200).json({
      message: 'Reset token sent to email',
      resetToken
    });


  } catch (err) {
    next(err);
  }
}

module.exports = recoverPassword;
