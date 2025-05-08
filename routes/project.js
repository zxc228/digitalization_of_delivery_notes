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


router.post('/', auth, createProject);
router.get('/', auth, getProjects);
router.get('/:id', auth, getProjectById);
router.put('/:id', auth, updateProject);
router.patch('/:id/archive', auth, archiveProject);
router.patch('/:id/restore', auth, restoreProject);

router.delete('/:id', auth, deleteProject);


module.exports = router;
