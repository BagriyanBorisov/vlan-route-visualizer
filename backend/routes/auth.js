const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authValidation } = require('../middleware/validation');

// POST /api/auth/login - User login
router.post('/login', authValidation.login, authController.login);

// POST /api/auth/register - User registration
router.post('/register', authValidation.register, authController.register);

// POST /api/auth/logout - User logout
router.post('/logout', authController.logout);

module.exports = router; 