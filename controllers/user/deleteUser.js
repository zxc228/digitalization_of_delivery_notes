const db = require('../../config/db');

async function deleteUser(req, res) {
  const userId = req.user.id;
  const soft = req.query.soft !== 'false'; // deafalut to soft

  try {
    if (soft) {
      await db.query('UPDATE users SET is_deleted = true WHERE id = $1', [userId]);
    } else {
      await db.query('DELETE FROM users WHERE id = $1', [userId]);
    }

    res.json({ message: soft ? 'User soft-deleted' : 'User permanently deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = deleteUser;