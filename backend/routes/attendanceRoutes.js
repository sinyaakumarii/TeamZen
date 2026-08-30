// backend/routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { checkIn, getAllAttendance } = require('../controllers/attendanceController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Route: GET /api/attendance/all
router.get('/all', verifyToken, checkRole(['admin', 'super_admin']), getAllAttendance);

// Route: POST /api/attendance/check-in
router.post('/check-in', verifyToken, checkRole(['employee', 'intern']), checkIn);

// YEH LINE MISSING HONE SE SERVER CRASH HOTA HAI 👇
module.exports = router;