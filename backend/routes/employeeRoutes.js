// backend/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const { getAllEmployees, createEmployee } = require('../controllers/employeeController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, checkRole(['admin', 'super_admin']), getAllEmployees);
router.post('/', verifyToken, checkRole(['admin', 'super_admin']), createEmployee);

module.exports = router;