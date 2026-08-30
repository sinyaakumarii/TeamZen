// backend/routes/performanceRoutes.js
const express = require('express');
const router = express.Router();
const { submitReview } = require('../controllers/performanceController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Route: POST /api/performance/review
// Sirf admin/super_admin employees ka review submit kar sakte hain
router.post('/review', verifyToken, checkRole(['admin', 'super_admin']), submitReview);

module.exports = router;