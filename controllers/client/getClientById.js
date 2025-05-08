const getClientById = require('../../models/client/getClientById');

module.exports = async function (req, res) {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;

    const client = await getClientById(clientId, userId);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (err) {
    console.error('Error fetching client:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
