// backend/controllers/dashboardController.js
const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    // Total Employees
    const [[{ total_employees }]] = await db.query('SELECT COUNT(*) as total_employees FROM employees');
    
    // Present Today
    const [[{ present_today }]] = await db.query('SELECT COUNT(*) as present_today FROM attendance WHERE attendance_date = CURDATE() AND status != "Absent"');
    
    // Absent Today
    const [[{ absent_today }]] = await db.query('SELECT COUNT(*) as absent_today FROM attendance WHERE attendance_date = CURDATE() AND status = "Absent"');

    // Late Today
    const [[{ late_today }]] = await db.query('SELECT COUNT(*) as late_today FROM attendance WHERE attendance_date = CURDATE() AND late_status IN ("Late", "Very Late", "Critical Late")');

    // On Leave
    const [[{ on_leave }]] = await db.query('SELECT COUNT(*) as on_leave FROM leave_requests WHERE status = "Approved" AND CURDATE() BETWEEN start_date AND end_date');

    // Pending Leave Requests
    const [[{ pending_leaves }]] = await db.query('SELECT COUNT(*) as pending_leaves FROM leave_requests WHERE status = "pending"');

    res.json({
      status: 'success',
      data: {
        total_employees: total_employees || 0,
        present_today: present_today || 0,
        absent_today: absent_today || 0,
        late_today: late_today || 0,
        on_leave: on_leave || 0,
        working_remotely: 0,
        avg_working_hours: '8.2 hrs',
        overtime_hours: '14 hrs',
        attendance_percentage: total_employees > 0 ? Math.round((present_today / total_employees) * 100) : 0,
        pending_leave_requests: pending_leaves || 0,
        payroll_summary: 'Rs. 450,000',
        top_performers: 'Ayesha, Bilal',
        performance_risk: 'None'
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};