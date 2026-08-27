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

exports.updateTaskStatus = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    const userId = req.user.userId;

    const [employeeRows] = await db.query('SELECT id FROM employees WHERE user_id = ?', [userId]);

    if (employeeRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Employee record not found.' });
    }
    const employeeId = employeeRows[0].id;

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ status: 'error', message: "Invalid status." });
    }

    let updateQuery;
    if (status === 'completed') {
      updateQuery = 'UPDATE tasks SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ? AND employee_id = ?';
    } else {
      updateQuery = 'UPDATE tasks SET status = ?, completed_at = NULL WHERE id = ? AND employee_id = ?';
    }

    const [result] = await db.query(updateQuery, [status, taskId, employeeId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Task not found or permission denied.' });
    }

    res.json({ status: 'success', message: `Task status successfully updated to ${status}.` });

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ status: 'error', message: 'Server error while updating task', error: error.message });
  }
};

// --- NEW FUNCTION: GET MY TASKS ---
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.userId; // The logged-in user

    // 1. Find their employee ID
    const [employeeRows] = await db.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
    
    if (employeeRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Employee record not found.' });
    }
    const employeeId = employeeRows[0].id;

    // 2. Get all tasks for this employee, sorted by due date
    const [tasks] = await db.query(
      'SELECT * FROM tasks WHERE employee_id = ? ORDER BY due_date ASC', 
      [employeeId]
    );

    res.json({
      status: 'success',
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ status: 'error', message: 'Server error while fetching tasks', error: error.message });
  }
};