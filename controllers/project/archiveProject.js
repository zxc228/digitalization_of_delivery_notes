const archiveProject = require('../../models/project/archiveProject');

module.exports = async function (req, res) {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const archived = await archiveProject(projectId, userId);

    if (!archived) {
      return res.status(404).json({ message: 'Project not found or already archived' });
    }

    res.json({ message: 'Project archived successfully', project: archived });
  } catch (err) {
    console.error('Error archiving project:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
