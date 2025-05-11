const updateClient = require('../../models/client/updateClient');

module.exports = async function (req, res, next) {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;
    const { name, email, phone, address } = req.body;

    if (!name) {
      const err = new Error('Client name is required');
      err.status = 400;
      throw err;
    }

    const updated = await updateClient(clientId, userId, { name, email, phone, address });

    if (!updated) {
      const err = new Error('Client not found or not yours');
      err.status = 404;
      throw err;
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};
