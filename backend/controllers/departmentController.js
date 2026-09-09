// backend/controllers/departmentController.js
const db = require('../config/db');

exports.getDepartments = async (req, res) => {
  try {
    // Hum sub-query use kar rahe hain taake employees table se live count nikal sakein
    const [departments] = await db.query(`
      SELECT d.id, d.department_name, d.department_head, 
             (SELECT COUNT(*) FROM employees e WHERE e.department = d.department_name) AS live_employee_count 
      FROM departments d 
      ORDER BY d.id DESC
    `);
    res.json({ status: 'success', data: departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.addDepartment = async (req, res) => {
  try {
    const { department_name, department_head } = req.body;
    await db.query(
      'INSERT INTO departments (department_name, department_head) VALUES (?, ?)',
      [department_name, department_head]
    );
    res.status(201).json({ status: 'success', message: 'Department added successfully.' });
  } catch (error) {
    console.error('Error adding department:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};