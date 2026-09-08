// backend/controllers/payrollController.js
const db = require('../config/db');

exports.generatePayroll = async (req, res) => {
  try {
    const { employee_id, salary_month, salary_year, allowances = 0, overtime_pay = 0, bonuses = 0, deductions = 0 } = req.body;

    // 1. Employee ki basic salary fetch karein
    const [empRows] = await db.query('SELECT salary FROM employees WHERE id = ?', [employee_id]);
    
    if (empRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Employee not found.' });
    }

    const basic_salary = parseFloat(empRows[0].salary || 0);

    // 2. Simple Tax Calculation (Agar salary 50,000 se zyada hai toh 5% tax)
    const tax = basic_salary > 50000 ? (basic_salary * 0.05) : 0;

    // 3. Final Net Salary Calculate Karein
    const net_salary = (basic_salary + parseFloat(allowances) + parseFloat(overtime_pay) + parseFloat(bonuses)) - parseFloat(deductions) - tax;

    // 4. Database mein save karein
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