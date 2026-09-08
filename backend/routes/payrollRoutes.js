// backend/routes/payrollRoutes.js
const express = require('express');
const router = express.Router();
const { generatePayroll } = require('../controllers/payrollController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Route: Sirf Admin ya Super Admin payroll generate kar sakte hain
router.post('/generate', verifyToken, checkRole(['admin', 'super_admin']), generatePayroll);

module.exports = router;