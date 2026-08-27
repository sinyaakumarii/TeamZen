// backend/controllers/taskController.js
const db = require('../config/db');

exports.assignTask = async (req, res) => {
  try {
    const { employee_id, title, description, priority, due_date } = req.body;
    const assigned_by = req.user.userId;

    const [result] = await db.query(
      `INSERT INTO tasks (employee_id, assigned_by, title, description, priority, status, due_date)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [employee_id, assigned_by, title, description, priority, due_date]
    );

    res.status(201).json({
      status: 'success',
      message: 'Task assigned successfully.',
      taskId: result.insertId
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ status: 'error', message: 'Server error while assigning task', error: error.message });
  }
};

// --- NEW FUNCTION: UPDATE TASK STATUS ---
exports.updateTaskStatus = async (req, res) => {
  try {
    const taskId = req.params.id; // Get the task ID from the URL
    const { status } = req.body; // 'pending', 'in_progress', or 'completed'
    const userId = req.user.userId; // The logged-in user's ID

    // 1. Find the employee ID for this user
    const [employeeRows] = await db.query(
      'SELECT id FROM employees WHERE user_id = ?',
      [userId]
    );

    if (employeeRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Employee record not found.' });
    }
    const employeeId = employeeRows[0].id;

    // 2. Make sure the status is valid
    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ status: 'error', message: "Invalid status." });
    }

    // 3. Update the task ONLY if it belongs to this employee
    let updateQuery;
    if (status === 'completed') {
      updateQuery = 'UPDATE tasks SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ? AND employee_id = ?';
    } else {
      updateQuery = 'UPDATE tasks SET status = ?, completed_at = NULL WHERE id = ? AND employee_id = ?';
    }

    const [result] = await db.query(updateQuery, [status, taskId, employeeId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Task not found or you do not have permission to update this task.' 
      });
    }

    res.json({
      status: 'success',
      message: `Task status successfully updated to ${status}.`
    });

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ status: 'error', message: 'Server error while updating task', error: error.message });
  }
};