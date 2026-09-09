// backend/controllers/employeeController.js
const db = require('../config/db');

exports.getAllEmployees = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, u.first_name, u.last_name, u.email, u.role 
      FROM employees e 
      JOIN users u ON e.user_id = u.id
      ORDER BY e.id DESC
    `);
    res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { 
      user_id, cnic, department, designation, organization, 
      joining_date, employment_status, salary, bank_name_iban, 
      skills, emergency_contact, date_of_birth, gender, contact_number, 
      address, experience, certifications 
    } = req.body;

    await db.query(`
      INSERT INTO employees (
        user_id, cnic, department, designation, organization, 
        joining_date, employment_status, salary, bank_name_iban, 
        skills, emergency_contact, date_of_birth, gender, contact_number, 
        address, experience, certifications
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      user_id, cnic, department, designation, organization, 
      joining_date, employment_status || 'Active', salary, bank_name_iban, 
      skills, emergency_contact, date_of_birth, gender, contact_number, 
      address, experience, certifications
    ]);

    res.status(201).json({ status: 'success', message: 'Employee profile created successfully.' });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};