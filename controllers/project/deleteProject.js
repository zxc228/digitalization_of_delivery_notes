const deleteProject = require('../../models/project/deleteProject');

module.exports = async function (req, res) {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const deleted = await deleteProject(projectId, userId);

    if (!deleted) {
      return res.status(404).json({ message: 'Project not found or not yours' });
    }

    res.json({ message: 'Project permanently deleted' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
