const express = require('express');
const router = express.Router();

router.use('/user', require('./auth'));
router.use('/user', require('./user'));

//disabled the profile image upload
//router.use('/user', require('./profile'));

router.use('/client', require('./client'));
router.use('/project', require('./project'));
router.use('/deliverynote', require('./deliverynote'));

module.exports = router;
