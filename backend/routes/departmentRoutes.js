// backend/routes/departmentRoutes.js
const express = require('express');
const router = express.Router();
const { getDepartments, addDepartment } = require('../controllers/departmentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, checkRole(['admin', 'super_admin']), getDepartments);
router.post('/', verifyToken, checkRole(['admin', 'super_admin']), addDepartment);

module.exports = router;