// backend/controllers/leaveController.js
const db = require('../config/db');

exports.applyLeave = async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;
    const userId = req.user.userId;

    const [employeeRows] = await db.query(
      'SELECT id FROM employees WHERE user_id = ?',
      [userId]
    );

    if (employeeRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Employee record not found for this user.' });
    }

    const employeeId = employeeRows[0].id;

    const [result] = await db.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [employeeId, leave_type, start_date, end_date, reason]
    );

    res.status(201).json({
      status: 'success',
      message: 'Leave request submitted successfully.',
      leaveId: result.insertId
    });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ status: 'error', message: 'Server error while applying for leave', error: error.message });
  }
};

exports.reviewLeave = async (req, res) => {
  try {
    const leaveId = req.params.id; 
    const { status, admin_notes } = req.body; 
    const adminUserId = req.user.userId; 

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'error', message: "Status must be either 'approved' or 'rejected'" });
    }

    const [result] = await db.query(
      `UPDATE leave_requests 
       SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, admin_notes = ?
       WHERE id = ?`,
      [status, adminUserId, admin_notes, leaveId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Leave request not found.' });
    }

    res.json({
      status: 'success',
      message: `Leave request successfully ${status}.`
    });
  } catch (error) {
    console.error('Error reviewing leave:', error);
    res.status(500).json({ status: 'error', message: 'Server error while reviewing leave', error: error.message });
  }
};

// --- NEW FUNCTION: GET ALL LEAVES FOR ADMIN ---
exports.getAllLeaves = async (req, res) => {
  try {
    // JOIN lagaya hai taake admin ko user ka email bhi nazar aaye jisne leave apply ki hai
    const [leaves] = await db.query(
      `SELECT lr.*, u.email as employee_email 
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       ORDER BY lr.created_at DESC`
    );

    res.json({
      status: 'success',
      data: leaves
    });
  } catch (error) {
    console.error('Error fetching all leaves:', error);
    res.status(500).json({ status: 'error', message: 'Server error while fetching leaves', error: error.message });
  }
};