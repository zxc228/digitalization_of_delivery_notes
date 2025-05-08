const db = require('../../config/db');

async function saveUserImage(userId, imageUrl) {
  const result = await db.query(
    'SELECT * FROM user_images WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    await db.query(
      'INSERT INTO user_images (user_id, image_url) VALUES ($1, $2)',
      [userId, imageUrl]
    );
  } else {
    await db.query(
      'UPDATE user_images SET image_url = $2 WHERE user_id = $1',
      [userId, imageUrl]
    );
  }
}

module.exports = saveUserImage;