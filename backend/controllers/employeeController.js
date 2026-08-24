// controllers/employeeController.js
const db = require('../config/db');


const createEmployee = async (req, res) => {
  try {
    const { user_id, department_id, employee_code, designation, join_date } = req.body;
    const organizationId = req.user.organizationId;

    if (!user_id || !employee_code) {
      return res.status(400).json({ status: 'error', message: 'user_id and employee_code are required' });
    }

    const [users] = await db.query('SELECT id, organization_id FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const [existing] = await db.query('SELECT id FROM employees WHERE user_id = ?', [user_id]);
    if (existing.length > 0) {
      return res.status(409).json({ status: 'error', message: 'This user already has an employee profile' });
    }

    const [result] = await db.query(
      `INSERT INTO employees (user_id, organization_id, department_id, employee_code, designation, join_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, organizationId, department_id || null, employee_code, designation || null, join_date || null]
    );

    res.status(201).json({
      status: 'ok',
      message: 'Employee profile created successfully',
      employeeId: result.insertId
    });

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create employee', error: error.message });
  }
};

const getMyEmployeeProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [employees] = await db.query(
      `SELECT e.*, u.full_name, u.email, u.role
       FROM employees e
       JOIN users u ON e.user_id = u.id
       WHERE e.user_id = ?`,
      [userId]
    );

    if (employees.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No employee profile found for your account' });
    }

    res.json({ status: 'ok', employee: employees[0] });

  } catch (error) {
    console.error('Get employee profile error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch employee profile', error: error.message });
  }
};

module.exports = { createEmployee, getMyEmployeeProfile };