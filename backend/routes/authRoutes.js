// routes/authRoutes.js
// This file defines the URL endpoints related to authentication.

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// A protected test route — only accessible with a valid token
router.get('/me', verifyToken, (req, res) => {
  res.json({
    status: 'ok',
    message: 'This is protected data — you are authenticated!',
    user: req.user
  });
});

module.exports = router;