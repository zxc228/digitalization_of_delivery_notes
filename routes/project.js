const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');


const createProject = require('../controllers/project/createProject');
const getProjects = require('../controllers/project/getProjects');
const getProjectById = require('../controllers/project/getProjectById');
const updateProject = require('../controllers/project/updateProject');
const archiveProject = require('../controllers/project/archiveProject');
const restoreProject = require('../controllers/project/restoreProject');
const deleteProject = require('../controllers/project/deleteProject');


//documented
router.post('/', auth, createProject);
// documented
router.get('/', auth, getProjects);
// documented
router.get('/:id', auth, getProjectById);
// documented
router.put('/:id', auth, updateProject);
// documented
router.patch('/:id/archive', auth, archiveProject);
// documented
router.patch('/:id/restore', auth, restoreProject);
// documented
router.delete('/:id', auth, deleteProject);


module.exports = router;
