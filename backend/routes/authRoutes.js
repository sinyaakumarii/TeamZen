// routes/authRoutes.js
// This file defines the URL endpoints related to authentication.

const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');

router.post('/register', register);

module.exports = router;