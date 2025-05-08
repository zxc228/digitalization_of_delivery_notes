const createProject = require('../../models/project/createProject');
const pool = require('../../config/db');

module.exports = async function (req, res) {
  try {
    const userId = req.user.id;
    const { client_id, name, description } = req.body;

    if (!client_id || !name) {
      return res.status(400).json({ message: 'Client ID and project name are required' });
    }

    // Проверка: существует ли клиент и принадлежит ли пользователю
    const clientCheck = await pool.query(
      'SELECT * FROM clients WHERE id = $1 AND user_id = $2 AND is_deleted = false',
      [client_id, userId]
    );

    if (clientCheck.rowCount === 0) {
      return res.status(404).json({ message: 'Client not found or not owned by user' });
    }

    const project = await createProject({
      userId,
      clientId: client_id,
      name,
      description
    });

    res.status(201).json(project);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
