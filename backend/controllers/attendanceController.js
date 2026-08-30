const db = require('../config/db');

exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [employeeRows] = await db.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
    
    if (employeeRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Employee record not found.' });
    }
    
    const employeeId = employeeRows[0].id;
    await db.query('INSERT INTO attendance (employee_id) VALUES (?)', [employeeId]);
    
    res.json({ status: 'success', message: 'Attendance marked successfully.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error during check-in', error: error.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const [records] = await db.query(
      `SELECT a.*, u.email as employee_email 
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       ORDER BY a.check_in_time DESC`
    );
    res.json({ status: 'success', data: records });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
  }
};