// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { checkIn } = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/authMiddleware');

// Any logged-in employee/intern can check in (role restriction can be refined later)
router.post('/check-in', verifyToken, checkIn);

module.exports = router;