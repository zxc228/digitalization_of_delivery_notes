const getProjects = require('../../models/project/getProjects');

module.exports = async function (req, res) {
  try {
    const userId = req.user.id;
    const projects = await getProjects(userId);
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
