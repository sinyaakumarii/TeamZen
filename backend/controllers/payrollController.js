// backend/controllers/payrollController.js
const db = require('../config/db');

exports.generatePayroll = async (req, res) => {
  try {
    const { employee_id, salary_month, salary_year, allowances = 0, overtime_pay = 0, bonuses = 0, deductions = 0 } = req.body;

    const [empRows] = await db.query('SELECT salary FROM employees WHERE id = ?', [employee_id]);
    
    if (empRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Employee not found.' });
    }

    const basic_salary = parseFloat(empRows[0].salary || 0);
    const tax = basic_salary > 50000 ? (basic_salary * 0.05) : 0;
    const net_salary = (basic_salary + parseFloat(allowances) + parseFloat(overtime_pay) + parseFloat(bonuses)) - parseFloat(deductions) - tax;

    const [result] = await db.query(
      `INSERT INTO payroll 
      (employee_id, salary_month, salary_year, basic_salary, allowances, overtime_pay, bonuses, deductions, tax, net_salary) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, salary_month, salary_year, basic_salary, allowances, overtime_pay, bonuses, deductions, tax, net_salary]
    );

    res.status(201).json({
      status: 'success',
      message: 'Payroll generated successfully.',
      data: {
        payroll_id: result.insertId,
        basic_salary,
        tax,
        net_salary
      }
    });

  } catch (error) {
    console.error('Error generating payroll:', error);
    res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
  }
};

exports.getAllPayroll = async (req, res) => {
  try {
    // Bina kisi JOIN ke direct payroll ka data nikalte hain
    const [payrollRecords] = await db.query('SELECT * FROM payroll ORDER BY id DESC');
    
    // Frontend ko error na aaye isliye hum default naam laga dete hain
    const formattedData = payrollRecords.map(record => ({
      ...record,
      first_name: 'Employee ID:',
      last_name: record.employee_id
    }));

    res.json({
      status: 'success',
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};