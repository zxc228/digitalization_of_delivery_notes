const getProjectById = require('../../models/project/getProjectById');

module.exports = async function (req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const project = await getProjectById(projectId, userId);

    if (!project) {
      const err = new Error('Project not found or not yours');
      err.status = 404;
      throw err;
    }

    res.json(project);
  } catch (err) {
    next(err);
  }
};
