const express = require('express');
const router = express.Router();
const createClient = require('../controllers/client/createClient');
const auth = require('../middleware/auth'); // если есть middleware для JWT

router.post('/', auth, createClient);

module.exports = router;
