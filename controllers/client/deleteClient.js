const deleteClient = require('../../models/client/deleteClient');

module.exports = async function (req, res, next) {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;

    const deleted = await deleteClient(clientId, userId);

    if (!deleted) {
      const err = new Error('Client not found or not yours');
      err.status = 404;
      throw err;
    }

    res.json({ message: 'Client permanently deleted' });
  } catch (err) {
    next(err);
  }
};
