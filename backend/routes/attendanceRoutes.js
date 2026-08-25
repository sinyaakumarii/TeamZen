// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { checkIn, getMyIp } = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/check-in', verifyToken, checkIn);
router.get('/my-ip', verifyToken, getMyIp);

module.exports = router;