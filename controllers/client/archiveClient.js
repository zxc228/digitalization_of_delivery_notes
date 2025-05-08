const archiveClient = require('../../models/client/archiveClient');

module.exports = async function (req, res) {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;

    const archived = await archiveClient(clientId, userId);

    if (!archived) {
      return res.status(404).json({ message: 'Client not found or already archived' });
    }

    res.json({ message: 'Client archived successfully', client: archived });
  } catch (err) {
    console.error('Error archiving client:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
