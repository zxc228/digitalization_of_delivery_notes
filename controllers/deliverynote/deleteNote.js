const deleteNote = require('../../models/deliverynote/deleteNote');

module.exports = async function (req, res, next) {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    const deleted = await deleteNote(noteId, userId);

    if (!deleted) {
      const err = new Error('Cannot delete: either not found or already signed');
      err.status = 400;
      throw err;
    }

    res.json({ message: 'Delivery note deleted successfully' });
  } catch (err) {
    console.error('Error deleting note:', err);
    next(err);
  }
};
