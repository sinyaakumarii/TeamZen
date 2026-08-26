// backend/controllers/holidayController.js
const db = require('../config/db');

// Admin creates a new holiday
exports.createHoliday = async (req, res) => {
  try {
    const { holiday_name, holiday_date } = req.body;
    const organizationId = req.user.organizationId; // Extracted from the JWT token

    const [result] = await db.query(
      `INSERT INTO holidays (organization_id, holiday_name, holiday_date)
       VALUES (?, ?, ?)`,
      [organizationId, holiday_name, holiday_date]
    );

    res.status(201).json({
      status: 'success',
      message: 'Holiday added successfully.',
      holidayId: result.insertId
    });
  } catch (error) {
    console.error('Error creating holiday:', error);
    // Handle the unique constraint error if they try to add two holidays on the same day
    if (error.code === 'ER_DUP_ENTRY') {
       return res.status(400).json({ status: 'error', message: 'A holiday on this date already exists for your organization.' });
    }
    res.status(500).json({ status: 'error', message: 'Server error while creating holiday', error: error.message });
  }
};

// Any logged-in user can view the holidays
exports.getHolidays = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const [holidays] = await db.query(
      'SELECT id, holiday_name, holiday_date FROM holidays WHERE organization_id = ? ORDER BY holiday_date ASC',
      [organizationId]
    );

    res.json({
      status: 'success',
      data: holidays
    });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ status: 'error', message: 'Server error while fetching holidays', error: error.message });
  }
};