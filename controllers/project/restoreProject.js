const restoreProject = require('../../models/project/restoreProject');

module.exports = async function (req, res, next) {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const restored = await restoreProject(projectId, userId);

    if (!restored) {
      const err = new Error('Project not found or not archived');
      err.status = 404;
      throw err;
    }

    res.json({ message: 'Project restored successfully', project: restored });
  } catch (err) {
    console.error('Error restoring project:', err);
    next(err);
  }
};
