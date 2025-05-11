const archiveProject = require('../../models/project/archiveProject');

module.exports = async function (req, res, next) {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const archived = await archiveProject(projectId, userId);

    if (!archived) {
      const err = new Error('Project not found or already archived');
      err.status = 404;
      throw err;
    }

    res.json({ message: 'Project archived successfully', project: archived });
  } catch (err) {
    next(err);
  }
};
