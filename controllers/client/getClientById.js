const getClientById = require('../../models/client/getClientById');

module.exports = async function (req, res, next) {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;

    const client = await getClientById(clientId, userId);

    if (!client) {
      const err = new Error('Client not found');
      err.status = 404;
      throw err;
    }

    res.json(client);
  } catch (err) {
    next(err);
  }
};
