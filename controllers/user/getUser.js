const db = require('../../config/db');

async function getUserByToken(req, res) {
  try {
    const userId = req.user._id;

    const userRes = await db.query(
      'SELECT id, email, is_validated, role, created_at FROM users WHERE id = $1 AND is_deleted = false',
      [userId]
    );

    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      _id: user.id,
      email: user.email,
      status: user.is_validated ? 1 : 0,
      role: user.role,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = getUserByToken;