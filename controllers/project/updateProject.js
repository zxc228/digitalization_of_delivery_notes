const updateProject = require('../../models/project/updateProject');

module.exports = async function (req, res) {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const updated = await updateProject(projectId, userId, { name, description });

    if (!updated) {
      return res.status(404).json({ message: 'Project not found or not yours' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
