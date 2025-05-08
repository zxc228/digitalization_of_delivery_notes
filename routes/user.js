const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const getUserByToken = require('../controllers/user/getUser');
const deleteUser = require('../controllers/user/deleteUser');
const getSummary = require('../controllers/user/getSummary');
const { updatePersonalAndCompanyData } = require('../controllers/onboarding/updateData');


//documented
router.get('/me', auth, getUserByToken);
//documented
router.delete('/me', auth, deleteUser);
//documented
router.get('/summary', auth, getSummary);
//documented
router.put('/register', auth, updatePersonalAndCompanyData); // onboarding

module.exports = router;
