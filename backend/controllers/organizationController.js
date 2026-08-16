// controllers/organizationController.js
// Handles creating and listing organizations. Only Super Admin can create them.

const db = require('../config/db');

// CREATE: adds a new organization
const createOrganization = async (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({ status: 'error', message: 'Organization name is required' });
    }

    const [result] = await db.query(
      'INSERT INTO organizations (name, address) VALUES (?, ?)',
      [name, address || null]
    );

    res.status(201).json({
      status: 'ok',
      message: 'Organization created successfully',
      organizationId: result.insertId
    });

  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create organization', error: error.message });
  }
};

// LIST: returns all organizations
const getOrganizations = async (req, res) => {
  try {
    const [organizations] = await db.query('SELECT * FROM organizations ORDER BY created_at DESC');
    res.json({ status: 'ok', organizations });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch organizations', error: error.message });
  }
};

module.exports = { createOrganization, getOrganizations };