const updateProject = require('../../models/project/updateProject');

module.exports = async function (req, res, next) {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { name, description } = req.body;

    if (!name) {
      const err = new Error('Project name is required');
      err.status = 400;
      throw err;
    }

    const updated = await updateProject(projectId, userId, { name, description });

    if (!updated) {
      const err = new Error('Project not found or not yours');
      err.status = 404;
      throw err;
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating project:', err);
    next(err);
  }
};
