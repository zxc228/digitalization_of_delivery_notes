const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const createNote = require('../controllers/deliverynote/createNote');
const getNotes = require('../controllers/deliverynote/getNotes');
const getNoteById = require('../controllers/deliverynote/getNoteById');
const deleteNote = require('../controllers/deliverynote/deleteNote');
const generatePdf = require('../controllers/deliverynote/generatePdf');
const signNote = require('../controllers/deliverynote/signNote');
const upload = require('../middleware/upload');


//documented
router.post('/', auth, createNote);
//documented
router.get('/', auth, getNotes);
//documented
router.get('/:id', auth, getNoteById);
//documented
router.delete('/:id', auth, deleteNote);

//documented
router.get('/pdf/:id', auth, generatePdf);


router.post(
    '/:id/sign',
    auth,
    upload('tmp').single('signature'),  
    signNote
  );
  
module.exports = router;
