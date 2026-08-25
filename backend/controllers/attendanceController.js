// controllers/attendanceController.js
const db = require('../config/db');
const { isWithinOfficeRadius } = require('../utils/locationUtils');
const { getPakistanTimeNow, getDayOfWeek, getDateString, calculateLateStatus } = require('../utils/timeUtils');

const checkIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ status: 'error', message: 'GPS latitude and longitude are required. Please enable location access.' });
    }

    // Step 1: Find the employee profile for this logged-in user
    const [employees] = await db.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
    if (employees.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No employee profile found for your account. Contact your Admin.' });
    }
    const employeeId = employees[0].id;

    // Step 2: Get office settings for GPS radius and late thresholds
    const [settingsRows] = await db.query('SELECT * FROM office_settings WHERE organization_id = ?', [organizationId]);
    if (settingsRows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Office location has not been configured yet. Contact your Admin.' });
    }
    const settings = settingsRows[0];

    // Step 3: CHECK 1 — GPS verification
    const { isWithinRadius, distanceMeters } = isWithinOfficeRadius(
      parseFloat(settings.office_latitude),
      parseFloat(settings.office_longitude),
      latitude,
      longitude,
      settings.allowed_radius_meters
    );

    if (!isWithinRadius) {
      return res.status(403).json({
        status: 'error',
        message: `GPS verification failed. You are ${distanceMeters}m away from the office, but only ${settings.allowed_radius_meters}m is allowed.`,
        check: 'gps',
        distanceMeters
      });
    }

    // Step 4: CHECK 2 — server-side Pakistan time
    const nowPKT = getPakistanTimeNow();
    const attendanceDate = getDateString(nowPKT);
    const dayOfWeek = getDayOfWeek(nowPKT);

    // Step 5: Prevent duplicate check-in for the same day
    const [existing] = await db.query(
      'SELECT id, check_in_time FROM attendance WHERE employee_id = ? AND attendance_date = ?',
      [employeeId, attendanceDate]
    );
    if (existing.length > 0 && existing[0].check_in_time) {
      return res.status(409).json({ status: 'error', message: 'You have already checked in today.' });
    }

    // Step 6: Calculate late status based on office standard start time
    const { lateMinutes, lateStatus } = calculateLateStatus(
      nowPKT,
      settings.standard_start_time,
      {
        grace_minutes: settings.grace_minutes,
        late_minutes: settings.late_minutes,
        very_late_minutes: settings.very_late_minutes
      }
    );

    // Step 7: Save the attendance record
    if (existing.length > 0) {
      // A row for today exists but check-in wasn't set yet (edge case) — update it
      await db.query(
        `UPDATE attendance SET
          check_in_time = ?, day_of_week = ?, check_in_latitude = ?, check_in_longitude = ?,
          late_status = ?, late_minutes = ?, verification_status = 'verified'
        WHERE id = ?`,
        [nowPKT, dayOfWeek, latitude, longitude, lateStatus, lateMinutes, existing[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO attendance
          (employee_id, attendance_date, day_of_week, check_in_time, check_in_latitude, check_in_longitude, late_status, late_minutes, verification_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'verified')`,
        [employeeId, attendanceDate, dayOfWeek, nowPKT, latitude, longitude, lateStatus, lateMinutes]
      );
    }

    res.status(201).json({
      status: 'ok',
      message: 'Check-in successful!',
      data: {
        checkInTime: nowPKT,
        distanceMeters,
        lateStatus,
        lateMinutes
      }
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ status: 'error', message: 'Check-in failed', error: error.message });
  }
};

module.exports = { checkIn };