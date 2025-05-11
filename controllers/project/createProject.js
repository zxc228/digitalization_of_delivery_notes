const createProject = require('../../models/project/createProject');
const pool = require('../../config/db');

module.exports = async function (req, res, next) {
  try {
    const userId = req.user.id;
    const { client_id, name, description } = req.body;

    if (!client_id || !name) {
      const err = new Error('Client ID and project name are required');
      err.status = 400;
      throw err;
    }

    const clientCheck = await pool.query(
      'SELECT * FROM clients WHERE id = $1 AND user_id = $2 AND is_deleted = false',
      [client_id, userId]
    );

    if (clientCheck.rowCount === 0) {
      const err = new Error('Client not found or not owned by user');
      err.status = 404;
      throw err;
    }

    const project = await createProject({
      userId,
      clientId: client_id,
      name,
      description
    });

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};
