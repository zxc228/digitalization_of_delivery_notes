const db = require('../../config/db');

async function deleteUser(req, res, next) {
  const userId = req.user.id;
  const soft = req.query.soft !== 'false'; // default to soft delete

  try {
    let result;
    if (soft) {
      result = await db.query(
        'UPDATE users SET is_deleted = true WHERE id = $1 AND is_deleted = false',
        [userId]
      );
    } else {
      result = await db.query('DELETE FROM users WHERE id = $1', [userId]);
    }

    if (result.rowCount === 0) {
      const err = new Error('User not found or already deleted');
      err.status = 404;
      throw err;
    }

    res.json({ message: soft ? 'User soft-deleted' : 'User permanently deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = deleteUser;
