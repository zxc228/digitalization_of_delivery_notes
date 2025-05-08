const db = require('../../config/db');

async function updateUserProfile(userId, name, surnames, nif) {
  
  const result = await db.query(
    'SELECT * FROM user_profiles WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
   
    await db.query(
      `INSERT INTO user_profiles (user_id, name, surname, nif)
       VALUES ($1, $2, $3, $4)`,
      [userId, name, surnames, nif]
    );
  } else {
    
    await db.query(
      `UPDATE user_profiles
       SET name = $2, surname = $3, nif = $4
       WHERE user_id = $1`,
      [userId, name, surnames, nif]
    );
  }

  return true;
}

module.exports = updateUserProfile;