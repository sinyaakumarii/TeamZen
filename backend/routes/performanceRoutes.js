const express = require('express');
const router = express.Router();
const { 
  submitReview, generateRecommendation, reviewRecommendation, getAllRecommendations, getMyPerformance 
} = require('../controllers/performanceController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.post('/review', verifyToken, checkRole(['admin', 'super_admin']), submitReview);
router.post('/recommend', verifyToken, checkRole(['admin', 'super_admin']), generateRecommendation);
router.put('/recommend/:recommendation_id/review', verifyToken, checkRole(['admin', 'super_admin']), reviewRecommendation);
router.get('/recommendations', verifyToken, checkRole(['admin', 'super_admin']), getAllRecommendations);

// --- NAYA ROUTE: EMPLOYEE KE LIYE ---
router.get('/my-performance', verifyToken, checkRole(['employee', 'intern']), getMyPerformance);

module.exports = router;