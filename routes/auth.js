const express = require('express');
const router = express.Router();

const register = require('../controllers/auth/register');
const login = require('../controllers/auth/login');
const validateEmail = require('../controllers/auth/validateEmail');
const recoverPassword = require('../controllers/auth/recoverPassword');
const resetPassword = require('../controllers/auth/resetPassword');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.put('/validate', auth, validateEmail);
router.post('/recover-password', recoverPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
