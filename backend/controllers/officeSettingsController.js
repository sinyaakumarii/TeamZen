// controllers/officeSettingsController.js
// Handles creating/updating office location settings (GPS radius, network IP, late thresholds)

const db = require('../config/db');

// CREATE or UPDATE office settings for the logged-in Admin's organization
const saveOfficeSettings = async (req, res) => {
  try {
    const {
      office_latitude,
      office_longitude,
      allowed_radius_meters,
      allowed_ip,
      grace_minutes,
      late_minutes,
      very_late_minutes,
      standard_start_time
    } = req.body;

    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(400).json({ status: 'error', message: 'Your account is not linked to an organization.' });
    }

    if (!office_latitude || !office_longitude) {
      return res.status(400).json({ status: 'error', message: 'office_latitude and office_longitude are required' });
    }

    // Check if settings already exist for this organization
    const [existing] = await db.query('SELECT id FROM office_settings WHERE organization_id = ?', [organizationId]);

    if (existing.length > 0) {
      // Update existing settings
      await db.query(
        `UPDATE office_settings SET
          office_latitude = ?, office_longitude = ?, allowed_radius_meters = ?,
          allowed_ip = ?, grace_minutes = ?, late_minutes = ?, very_late_minutes = ?,
          standard_start_time = ?
        WHERE organization_id = ?`,
        [
          office_latitude, office_longitude, allowed_radius_meters || 100,
          allowed_ip || null, grace_minutes || 10, late_minutes || 30, very_late_minutes || 60,
          standard_start_time || '09:00:00', organizationId
        ]
      );
      return res.json({ status: 'ok', message: 'Office settings updated successfully' });
    } else {
      // Create new settings
      const [result] = await db.query(
        `INSERT INTO office_settings
          (organization_id, office_latitude, office_longitude, allowed_radius_meters, allowed_ip, grace_minutes, late_minutes, very_late_minutes, standard_start_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          organizationId, office_latitude, office_longitude, allowed_radius_meters || 100,
          allowed_ip || null, grace_minutes || 10, late_minutes || 30, very_late_minutes || 60,
          standard_start_time || '09:00:00'
        ]
      );
      return res.status(201).json({ status: 'ok', message: 'Office settings created successfully', settingsId: result.insertId });
    }

  } catch (error) {
    console.error('Save office settings error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save office settings', error: error.message });
  }
};

// GET office settings for the logged-in user's organization
const getOfficeSettings = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const [settings] = await db.query('SELECT * FROM office_settings WHERE organization_id = ?', [organizationId]);

    if (settings.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No office settings found for your organization yet' });
    }

    res.json({ status: 'ok', settings: settings[0] });

  } catch (error) {
    console.error('Get office settings error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch office settings', error: error.message });
  }
};

module.exports = { saveOfficeSettings, getOfficeSettings };