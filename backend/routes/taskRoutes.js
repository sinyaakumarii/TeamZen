// backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { assignTask, updateTaskStatus } = require('../controllers/taskController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Route: POST /api/tasks/assign
// Only roles 'admin' and 'super_admin' can assign tasks
router.post('/assign', verifyToken, checkRole(['admin', 'super_admin']), assignTask);

// Route: PUT /api/tasks/:id/status
// Only roles 'employee' and 'intern' can update their own tasks
router.put('/:id/status', verifyToken, checkRole(['employee', 'intern']), updateTaskStatus);

module.exports = router;