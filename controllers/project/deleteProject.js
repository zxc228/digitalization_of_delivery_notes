const deleteProject = require('../../models/project/deleteProject');

module.exports = async function (req, res, next) {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const deleted = await deleteProject(projectId, userId);

    if (!deleted) {
      const err = new Error('Project not found or not yours');
      err.status = 404;
      throw err;
    }

    res.json({ message: 'Project permanently deleted' });
  } catch (err) {
    next(err);
  }
};
