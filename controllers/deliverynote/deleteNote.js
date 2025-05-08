const deleteNote = require('../../models/deliverynote/deleteNote');

module.exports = async function (req, res) {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    const deleted = await deleteNote(noteId, userId);

    if (!deleted) {
      return res.status(400).json({ message: 'Cannot delete: either not found or already signed' });
    }

    res.json({ message: 'Delivery note deleted successfully' });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
