const db = require('../../config/db');

async function getSummary(req, res, next) {
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
      numActiveUsers: parseInt(activeUsers.rows[0].count, 10),
      numDeletedUsers: parseInt(deletedUsers.rows[0].count, 10),
      numInactiveUsers: parseInt(inactiveUsers.rows[0].count, 10),
      numActiveCompanyUsers: parseInt(companyUsers.rows[0].count, 10),
      numActivePersonalUsers: parseInt(personalUsers.rows[0].count, 10),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = getSummary;
