// controllers/authController.js
// This file handles registration and login logic.

const bcrypt = require('bcryptjs');
const db = require('../config/db');

// REGISTER: creates a new user with a securely hashed password
const register = async (req, res) => {
  try {
    const { full_name, email, password, role, organization_id } = req.body;

    // Basic validation — make sure required fields are present
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ status: 'error', message: 'full_name, email, password, and role are required' });
    }

    // Check if a user with this email already exists
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ status: 'error', message: 'A user with this email already exists' });
    }

    // Hash the password — never store plain text passwords
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert the new user into the database
    const [result] = await db.query(
      'INSERT INTO users (organization_id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [organization_id || null, full_name, email, password_hash, role]
    );

    res.status(201).json({
      status: 'ok',
      message: 'User registered successfully',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ status: 'error', message: 'Registration failed', error: error.message });
  }
};

module.exports = { register };