const {signUp, login} = require('../controllers/PublicController');
const express = require('express');
const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);

module.exports = router;