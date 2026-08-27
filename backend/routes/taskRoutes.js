// backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { assignTask, updateTaskStatus, getMyTasks } = require('../controllers/taskController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Route: POST /api/tasks/assign (Admins only)
router.post('/assign', verifyToken, checkRole(['admin', 'super_admin']), assignTask);

// Route: GET /api/tasks/my-tasks (Employees/Interns only)
router.get('/my-tasks', verifyToken, checkRole(['employee', 'intern']), getMyTasks);

// Route: PUT /api/tasks/:id/status (Employees/Interns only)
router.put('/:id/status', verifyToken, checkRole(['employee', 'intern']), updateTaskStatus);

module.exports = router;