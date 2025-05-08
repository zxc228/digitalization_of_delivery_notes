const getNoteById = require('../../models/deliverynote/getNoteById');

module.exports = async function (req, res) {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    const note = await getNoteById(noteId, userId);
    if (!note) {
      return res.status(404).json({ message: 'Delivery note not found or not yours' });
    }

    res.json(note);
  } catch (err) {
    console.error('Error fetching delivery note:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
