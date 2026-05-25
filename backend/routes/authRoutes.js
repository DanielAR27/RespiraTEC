// routes/authRoutes.js
const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { proteger } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', proteger, getMe); // Protegida: solo responde si la cookie es válida

module.exports = router;