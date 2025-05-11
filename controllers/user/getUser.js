const db = require('../../config/db');

async function getUserByToken(req, res, next) {
  try {
    const userId = req.user.id;

    const userRes = await db.query(
      'SELECT id, email, is_validated, role, created_at FROM users WHERE id = $1 AND is_deleted = false',
      [userId]
    );

    const user = userRes.rows[0];
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    res.json({
      _id: user.id,
      email: user.email,
      status: user.is_validated ? 1 : 0,
      role: user.role,
      createdAt: user.created_at,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = getUserByToken;
