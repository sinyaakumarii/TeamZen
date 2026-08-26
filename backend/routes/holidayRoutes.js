// backend/routes/holidayRoutes.js
const express = require('express');
const router = express.Router();
const { createHoliday, getHolidays } = require('../controllers/holidayController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Route: POST /api/holidays
// Only admins and super admins can create a holiday
router.post('/', verifyToken, checkRole(['admin', 'super_admin']), createHoliday);

// Route: GET /api/holidays
// All logged-in users can view the holidays (no checkRole needed, just verifyToken)
router.get('/', verifyToken, getHolidays);

module.exports = router;