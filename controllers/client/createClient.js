const createClient = require('../../models/client/createClient');

module.exports = async function (req, res, next) {
  try {
    const { name, email, phone, address } = req.body;
    const userId = req.user.id;

    if (!name) {
      const err = new Error('Client name is required');
      err.status = 400;
      throw err;
    }

    const client = await createClient({ userId, name, email, phone, address });
    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
};
