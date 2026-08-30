// backend/routes/performanceRoutes.js
const express = require('express');
const router = express.Router();
const { submitReview, generateRecommendation } = require('../controllers/performanceController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Route 1: Admin submits a manual performance review
router.post('/review', verifyToken, checkRole(['admin', 'super_admin']), submitReview);

// Route 2: System generates an AI recommendation based on the review score
router.post('/recommend', verifyToken, checkRole(['admin', 'super_admin']), generateRecommendation);

module.exports = router;