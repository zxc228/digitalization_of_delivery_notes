const pool = require('../../config/db');


module.exports = async function findProjectClient(projectId, userId) {
  const res = await pool.query(
    `SELECT client_id 
       FROM projects 
      WHERE id = $1 
        AND user_id = $2 
        AND is_deleted = false`,
    [projectId, userId]
  );
  return res.rowCount ? res.rows[0].client_id : null;
};