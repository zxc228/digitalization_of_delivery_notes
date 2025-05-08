const express = require('express');
const router = express.Router();

const register = require('../controllers/auth/register');
const validateEmail = require('../controllers/auth/validateEmail');
const auth = require('../middleware/auth');
const login = require('../controllers/auth/login');
const updatePersonalData = require('../controllers/onboarding/updateData');
const { updatePersonalAndCompanyData } = require('../controllers/onboarding/updateData');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadImage = require('../controllers/profile/uploadImage');
const getUserByToken = require('../controllers/user/getUser');
const deleteUser = require('../controllers/user/deleteUser');
const getSummary = require('../controllers/user/getSummary');
const recoverPassword = require('../controllers/auth/recoverPassword');
const resetPassword = require('../controllers/auth/resetPassword');



router.post('/register', register);
router.put('/validate', auth, validateEmail);
router.post('/login', login);



router.put('/register', auth, updatePersonalAndCompanyData);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user._id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 2MB
});

router.patch('/profile-image', auth, upload.single('profile_image'), uploadImage);

router.get('/me', auth, getUserByToken);



router.delete('/me', auth, deleteUser);



router.get('/summary', auth, getSummary);




router.post('/recover-password', recoverPassword);
router.post('/reset-password', resetPassword);

module.exports = router;


