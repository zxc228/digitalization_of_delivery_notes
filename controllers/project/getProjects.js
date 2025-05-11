const getProjects = require('../../models/project/getProjects');

module.exports = async function (req, res, next) {
  try {
    const userId = req.user.id;
    const projects = await getProjects(userId);
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    next(err);
  }
};
