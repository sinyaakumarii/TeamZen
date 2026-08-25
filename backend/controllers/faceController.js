// controllers/faceController.js
const db = require('../config/db');

// REGISTER: saves the employee's face descriptor (first-time setup)
const registerFace = async (req, res) => {
  try {
    const { descriptor } = req.body;
    const userId = req.user.userId;

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ status: 'error', message: 'A valid 128-point face descriptor is required.' });
    }

    // Find the employee profile
    const [employees] = await db.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
    if (employees.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No employee profile found for your account.' });
    }
    const employeeId = employees[0].id;

    // Check if already registered
    const [existing] = await db.query('SELECT id FROM face_registrations WHERE employee_id = ?', [employeeId]);
    if (existing.length > 0) {
      return res.status(409).json({ status: 'error', message: 'Face already registered. Contact your Admin to re-register.' });
    }

    // Store the descriptor as a JSON string
    const descriptorJson = JSON.stringify(descriptor);

    await db.query(
      'INSERT INTO face_registrations (employee_id, face_descriptor) VALUES (?, ?)',
      [employeeId, descriptorJson]
    );

    res.status(201).json({ status: 'ok', message: 'Face registered successfully! This is now your reference face for attendance.' });

  } catch (error) {
    console.error('Face registration error:', error);
    res.status(500).json({ status: 'error', message: 'Face registration failed', error: error.message });
  }
};

// Check whether the logged-in user has already registered their face
const getFaceStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [employees] = await db.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
    if (employees.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No employee profile found for your account.' });
    }
    const employeeId = employees[0].id;

    const [existing] = await db.query('SELECT id, registered_at FROM face_registrations WHERE employee_id = ?', [employeeId]);

    res.json({
      status: 'ok',
      isRegistered: existing.length > 0,
      registeredAt: existing.length > 0 ? existing[0].registered_at : null
    });

  } catch (error) {
    console.error('Get face status error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to check face registration status', error: error.message });
  }
};

module.exports = { registerFace, getFaceStatus };