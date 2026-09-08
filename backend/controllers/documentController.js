// backend/controllers/documentController.js
const db = require('../config/db');

exports.addDocument = async (req, res) => {
  try {
    const { employee_id, document_type, file_url } = req.body;
    const [result] = await db.query(
      'INSERT INTO employee_documents (employee_id, document_type, file_url) VALUES (?, ?, ?)',
      [employee_id, document_type, file_url]
    );
    res.status(201).json({ status: 'success', message: 'Document added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const [docs] = await db.query('SELECT * FROM employee_documents WHERE employee_id = ?', [employee_id]);
    res.json({ status: 'success', data: docs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};