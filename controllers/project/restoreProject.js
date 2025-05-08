const restoreProject = require('../../models/project/restoreProject');

module.exports = async function (req, res) {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const restored = await restoreProject(projectId, userId);

    if (!restored) {
      return res.status(404).json({ message: 'Project not found or not archived' });
    }

    res.json({ message: 'Project restored successfully', project: restored });
  } catch (err) {
    console.error('Error restoring project:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
