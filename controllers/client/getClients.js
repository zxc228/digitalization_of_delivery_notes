const getClients = require('../../models/client/getClients');

module.exports = async function (req, res) {
  try {
    const userId = req.user.id;

    const clients = await getClients(userId);
    res.json(clients);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
