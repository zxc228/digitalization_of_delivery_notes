const archiveClient = require('../../models/client/archiveClient');

module.exports = async function (req, res, next) {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;

    const archived = await archiveClient(clientId, userId);

    if (!archived) {
      const err = new Error('Client not found or already archived');
      err.status = 404;
      return next(err);
    }

    res.json({ message: 'Client archived successfully', client: archived });
  } catch (err) {
    next(err);
  }
};
