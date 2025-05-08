const deleteClient = require('../../models/client/deleteClient');

module.exports = async function (req, res) {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;

    const deleted = await deleteClient(clientId, userId);

    if (!deleted) {
      return res.status(404).json({ message: 'Client not found or not yours' });
    }

    res.json({ message: 'Client permanently deleted' });
  } catch (err) {
    console.error('Error deleting client:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
