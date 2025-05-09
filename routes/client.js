const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth'); 

const createClient = require('../controllers/client/createClient');
const getClients = require('../controllers/client/getClients');
const getClientById = require('../controllers/client/getClientById');
const updateClient = require('../controllers/client/updateClient');
const archiveClient = require('../controllers/client/archiveClient');
const restoreClient = require('../controllers/client/restoreClient');
const deleteClient = require('../controllers/client/deleteClient');


//documented
router.post('/', auth, createClient);
//documented
router.get('/', auth, getClients);
//documented
router.get('/:id', auth, getClientById);
//documented
router.put('/:id', auth, updateClient);
//documented
router.patch('/:id/archive', auth, archiveClient);
//documented
router.patch('/:id/restore', auth, restoreClient);

router.delete('/:id', auth, deleteClient);



module.exports = router;
