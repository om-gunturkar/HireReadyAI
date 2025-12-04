const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Route: POST /api/auth/signup
router.post('/signup', registerUser);

// Route: POST /api/auth/login
router.post('/login', loginUser);

module.exports = router;