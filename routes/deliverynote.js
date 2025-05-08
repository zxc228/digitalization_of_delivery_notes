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

router.post('/', auth, createNote);
router.get('/', auth, getNotes);
router.get('/:id', auth, getNoteById);
router.delete('/:id', auth, deleteNote);
router.get('/pdf/:id', auth, generatePdf);


router.post('/:id/sign', auth, upload.single('signature'), signNote);

router.post('/test-upload', upload.single('signature'), (req, res) => {
    console.log('Received file:', req.file);
    if (!req.file) return res.status(400).json({ error: 'no file' });
    res.json({ ok: true, file: req.file });
  });
  
module.exports = router;
