const db = require('../../config/db');

async function getSummary(req, res) {
  try {
    const [
      activeUsers,
      deletedUsers,
      inactiveUsers,
      companyUsers,
      personalUsers,
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM users WHERE is_validated = true AND is_deleted = false`),
      db.query(`SELECT COUNT(*) FROM users WHERE is_deleted = true`),
      db.query(`SELECT COUNT(*) FROM users WHERE is_validated = false AND is_deleted = false`),
      db.query(`SELECT COUNT(DISTINCT user_id) FROM user_companies`),
      db.query(`SELECT COUNT(DISTINCT user_id) FROM user_profiles`),
    ]);

    res.json({
      numActiveUsers: parseInt(activeUsers.rows[0].count),
      numDeletedUsers: parseInt(deletedUsers.rows[0].count),
      numInactiveUsers: parseInt(inactiveUsers.rows[0].count),
      numActiveCompanyUsers: parseInt(companyUsers.rows[0].count),
      numActivePersonalUsers: parseInt(personalUsers.rows[0].count),
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = getSummary;