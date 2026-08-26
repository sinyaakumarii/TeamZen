// backend/routes/leaveRoutes.js
const express = require('express');
const router = express.Router();
const { applyLeave, reviewLeave } = require('../controllers/leaveController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Route: POST /api/leave/apply
// Only roles 'employee' and 'intern' are allowed to hit this endpoint
router.post('/apply', verifyToken, checkRole(['employee', 'intern']), applyLeave);

// Route: PUT /api/leave/:id/review
// Only roles 'admin' and 'super_admin' can approve/reject leaves
router.put('/:id/review', verifyToken, checkRole(['admin', 'super_admin']), reviewLeave);

module.exports = router;