// controllers/authController.js
// This file handles registration and login logic.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// REGISTER: creates a new user with a securely hashed password
const register = async (req, res) => {
  try {
    const { full_name, email, password, role, organization_id } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ status: 'error', message: 'full_name, email, password, and role are required' });
    }

    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ status: 'error', message: 'A user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

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

// LOGIN: checks email/password, returns a JWT token if correct
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'email and password are required' });
    }

    // Find the user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const user = users[0];

    // Compare the given password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    // Check if the account is active
    if (user.status !== 'active') {
      return res.status(403).json({ status: 'error', message: 'This account is inactive. Contact your admin.' });
    }

    // Create a JWT token containing the user's id, role, and organization
    const token = jwt.sign(
      { userId: user.id, role: user.role, organizationId: user.organization_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      status: 'ok',
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'Login failed', error: error.message });
  }
};

module.exports = { register, login };