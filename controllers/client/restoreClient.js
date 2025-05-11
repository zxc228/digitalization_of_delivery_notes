const restoreClient = require('../../models/client/restoreClient');

module.exports = async function (req, res, next) {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;

    const restored = await restoreClient(clientId, userId);

    if (!restored) {
      return res.status(404).json({ message: 'Client not found or not archived' });
    }

    res.json({ message: 'Client restored successfully', client: restored });
  } catch (err) {
    next(err);
  }
};
