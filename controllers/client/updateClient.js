const updateClient = require('../../models/client/updateClient');

module.exports = async function (req, res) {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;
    const { name, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    const updated = await updateClient(clientId, userId, { name, email, phone, address });

    if (!updated) {
      return res.status(404).json({ message: 'Client not found or not yours' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating client:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
