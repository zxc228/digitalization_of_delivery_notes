const getNoteById = require('../../models/deliverynote/getNoteById');

module.exports = async function (req, res, next) {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    const note = await getNoteById(noteId, userId);
    if (!note) {
      const err = new Error('Delivery note not found or not yours');
      err.status = 404;
      throw err;
    }

    res.json(note);
  } catch (err) {
    console.error('Error fetching delivery note:', err);
    next(err);
  }
};
