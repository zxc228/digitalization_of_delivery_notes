const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const getUserByToken = require('../controllers/user/getUser');
const deleteUser = require('../controllers/user/deleteUser');
const getSummary = require('../controllers/user/getSummary');
const { updatePersonalAndCompanyData } = require('../controllers/onboarding/updateData');

router.get('/me', auth, getUserByToken);
router.delete('/me', auth, deleteUser);
router.get('/summary', auth, getSummary);
router.put('/register', auth, updatePersonalAndCompanyData); // onboarding

module.exports = router;
