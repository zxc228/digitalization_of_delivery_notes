const createNote = require('../../models/deliverynote/createNote');
const addItems = require('../../models/deliverynote/addItems');
const pool = require('../../config/db');

module.exports = async function (req, res) {
  const client = await pool.connect();
  try {
    const { project_id, items } = req.body;
    const userId = req.user.id;

    if (!project_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Project ID and at least one item are required' });
    }

    // Получаем client_id через проект
    const projectRes = await pool.query(
      'SELECT client_id FROM projects WHERE id = $1 AND user_id = $2 AND is_deleted = false',
      [project_id, userId]
    );

    if (projectRes.rowCount === 0) {
      return res.status(404).json({ message: 'Project not found or not yours' });
    }

    const clientId = projectRes.rows[0].client_id;

    await client.query('BEGIN');
    const note = await createNote({ userId, clientId, projectId: project_id });
    await addItems(note.id, items);
    await client.query('COMMIT');

    res.status(201).json({ message: 'Delivery note created', noteId: note.id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating delivery note:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};
