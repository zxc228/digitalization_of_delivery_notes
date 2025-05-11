const createNote = require('../../models/deliverynote/createNote');
const addItems = require('../../models/deliverynote/addItems');
const findProjectClient = require('../../models/project/findProjectClient');
const pool = require('../../config/db');

module.exports = async function (req, res, next) {
  const { project_id, items } = req.body;
  const userId = req.user.id;

  if (!project_id || !Array.isArray(items) || !items.length) {
    const err = new Error('Project ID and at least one item are required');
    err.status = 400;
    return next(err);
  }

  const client = await pool.connect();
  try {
    const clientId = await findProjectClient(project_id, userId);
    if (!clientId) {
      const err = new Error('Project not found or not yours');
      err.status = 404;
      throw err;
    }

    await client.query('BEGIN');
    const note = await createNote({ userId, clientId, projectId: project_id });
    await addItems(note.id, items);
    await client.query('COMMIT');

    res.status(201).json({ message: 'Delivery note created', noteId: note.id });
  } catch (err) {
    await client.query('ROLLBACK').catch(e => console.error('Rollback error:', e));
    console.error('Error creating delivery note:', err);
    next(err);
  } finally {
    client.release();
  }
};
