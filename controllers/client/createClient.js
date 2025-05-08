const createClient = require('../../models/client/createClient');

module.exports = async function (req, res) {
  try {
    const { name, email, phone, address } = req.body;
    const userId = req.user.id; 

    if (!name) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    const client = await createClient({ userId, name, email, phone, address });
    res.status(201).json(client);
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
