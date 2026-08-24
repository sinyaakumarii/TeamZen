// routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const { createEmployee, getMyEmployeeProfile } = require('../controllers/employeeController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Only Admin/Super Admin can create employee profiles
router.post('/', verifyToken, checkRole(['admin', 'super_admin']), createEmployee);

// Any logged-in user can view their own employee profile
router.get('/me', verifyToken, getMyEmployeeProfile);

module.exports = router;
