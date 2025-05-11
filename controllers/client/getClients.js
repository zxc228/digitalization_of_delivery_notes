const getClients = require('../../models/client/getClients');

module.exports = async function (req, res, next) {
  try {
    const userId = req.user.id;
    const clients = await getClients(userId);
    res.json(clients);
  } catch (err) {
    next(err);
  }
};
