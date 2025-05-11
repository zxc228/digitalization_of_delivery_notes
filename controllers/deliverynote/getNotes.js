const getNotes = require('../../models/deliverynote/getNotes');

module.exports = async function (req, res, next) {
  try {
    const userId = req.user.id;
    const notes = await getNotes(userId);
    res.json(notes);
  } catch (err) {
    console.error('Error fetching delivery notes:', err);
    next(err);
  }
};
