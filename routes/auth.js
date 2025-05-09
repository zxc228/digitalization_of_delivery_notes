const express = require('express');
const router = express.Router();


const register = require('../controllers/auth/register');
const validateEmail = require('../controllers/auth/validateEmail');
const login = require('../controllers/auth/login');
const recoverPassword = require('../controllers/auth/recoverPassword');
const resetPassword = require('../controllers/auth/resetPassword');
const auth = require('../middleware/auth');

// documented
router.post('/register', register);
// documented
router.put('/validate', auth, validateEmail);
// documented
router.post('/login', login);
//documented
router.post('/recover-password', recoverPassword);
//documented
router.post('/reset-password', resetPassword);

module.exports = router;
