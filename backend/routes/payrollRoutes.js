// backend/routes/payrollRoutes.js
const express = require('express');
const router = express.Router();
const { generatePayroll, getAllPayroll } = require('../controllers/payrollController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.post('/generate', verifyToken, checkRole(['admin', 'super_admin']), generatePayroll);
router.get('/all', verifyToken, checkRole(['admin', 'super_admin']), getAllPayroll);

module.exports = router;