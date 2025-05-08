const express = require('express');
const router = express.Router();

router.use('/api/user', require('./auth'));
router.use('/api/user', require('./user'));
router.use('/api/user', require('./profile'));
router.use('/api/client', require('./client'));
router.use('/api/project', require('./project'));
router.use('/api/deliverynote', require('./deliverynote'));

module.exports = router;
