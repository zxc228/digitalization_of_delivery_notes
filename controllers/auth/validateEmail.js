const validateUser = require('../../models/user/updateUserValidation');

async function validateEmail(req, res, next) {
  try {
    const { code } = req.body;

  
    if (typeof code !== 'string' || code.trim().length !== 6) {
      const err = new Error('Invalid code');
      err.status = 422;
      throw err;
    }

    
    if (!req.user?.id) {
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const result = await validateUser(req.user.id, code);

    if (!result.success) {
      const err = new Error(
        result.reason === 'Invalid code'
          ? 'Incorrect code'
          : result.reason
      );
      err.status = 400;
      throw err;
    }

    res.status(200).json({ message: 'Email validated successfully' });

  } catch (err) {
    next(err);
  }
}

module.exports = validateEmail;
