// backend/controllers/correctionController.js
const db = require('../config/db');

exports.requestCorrection = async (req, res) => {
  try {
    const { employee_id, correction_date, reason } = req.body;
    await db.query(
      'INSERT INTO attendance_corrections (employee_id, correction_date, reason, status) VALUES (?, ?, ?, "pending")',
      [employee_id, correction_date, reason]
    );
    res.status(201).json({ status: 'success', message: 'Correction request submitted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.getCorrections = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ac.*, e.id as emp_id FROM attendance_corrections ac JOIN employees e ON ac.employee_id = e.id ORDER BY ac.created_at DESC`
    );
    res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.updateCorrectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // approved / rejected
    await db.query('UPDATE attendance_corrections SET status = ? WHERE id = ?', [status, id]);
    res.json({ status: 'success', message: `Request ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};