const restoreClient = require('../../models/client/restoreClient');

module.exports = async function (req, res) {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;

    const restored = await restoreClient(clientId, userId);

    if (!restored) {
      return res.status(404).json({ message: 'Client not found or not archived' });
    }

    res.json({ message: 'Client restored successfully', client: restored });
  } catch (err) {
    console.error('Error restoring client:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
