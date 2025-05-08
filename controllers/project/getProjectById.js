const getProjectById = require('../../models/project/getProjectById');

module.exports = async function (req, res) {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const project = await getProjectById(projectId, userId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found or not yours' });
    }

    res.json(project);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
