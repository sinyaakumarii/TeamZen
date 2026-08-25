// controllers/attendanceController.js
const db = require('../config/db');
const { isWithinOfficeRadius } = require('../utils/locationUtils');
const { getPakistanTimeNow, getDayOfWeek, getDateString, calculateLateStatus } = require('../utils/timeUtils');
const { getClientIp } = require('../utils/networkUtils');

// Utility endpoint: lets a user see their own current IP (for Admin to configure office_settings.allowed_ip)
const getMyIp = (req, res) => {
  const ip = getClientIp(req);
  res.json({ status: 'ok', yourIp: ip });
};

const checkIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;
    const clientIp = getClientIp(req);

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ status: 'error', message: 'GPS latitude and longitude are required. Please enable location access.' });
    }

    // Step 1: Find the employee profile for this logged-in user
    const [employees] = await db.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
    if (employees.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No employee profile found for your account. Contact your Admin.' });
    }
    const employeeId = employees[0].id;

    // Step 2: Get office settings for GPS radius, allowed IP, and late thresholds
    const [settingsRows] = await db.query('SELECT * FROM office_settings WHERE organization_id = ?', [organizationId]);
    if (settingsRows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Office location has not been configured yet. Contact your Admin.' });
    }
    const settings = settingsRows[0];

    // Step 3: CHECK 1 — Network verification (IP-based, honest substitute for Wi-Fi SSID)
    // Only enforced if the Admin has actually configured an allowed_ip.
    if (settings.allowed_ip) {
      if (clientIp !== settings.allowed_ip) {
        return res.status(403).json({
          status: 'error',
          message: `Network verification failed. You must be connected to the office network to check in.`,
          check: 'network'
        });
      }
    }

    // Step 4: CHECK 2 — GPS verification
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

    // Step 5: CHECK 3 — server-side Pakistan time
    const nowPKT = getPakistanTimeNow();
    const attendanceDate = getDateString(nowPKT);
    const dayOfWeek = getDayOfWeek(nowPKT);

    // Step 6: Prevent duplicate check-in for the same day
    const [existing] = await db.query(
      'SELECT id, check_in_time FROM attendance WHERE employee_id = ? AND attendance_date = ?',
      [employeeId, attendanceDate]
    );
    if (existing.length > 0 && existing[0].check_in_time) {
      return res.status(409).json({ status: 'error', message: 'You have already checked in today.' });
    }

    // Step 7: Calculate late status based on office standard start time
    const { lateMinutes, lateStatus } = calculateLateStatus(
      nowPKT,
      settings.standard_start_time,
      {
        grace_minutes: settings.grace_minutes,
        late_minutes: settings.late_minutes,
        very_late_minutes: settings.very_late_minutes
      }
    );

    // Step 8: Save the attendance record (now including IP address for the audit log)
    if (existing.length > 0) {
      await db.query(
        `UPDATE attendance SET
          check_in_time = ?, day_of_week = ?, check_in_latitude = ?, check_in_longitude = ?,
          check_in_ip = ?, late_status = ?, late_minutes = ?, verification_status = 'verified'
        WHERE id = ?`,
        [nowPKT, dayOfWeek, latitude, longitude, clientIp, lateStatus, lateMinutes, existing[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO attendance
          (employee_id, attendance_date, day_of_week, check_in_time, check_in_latitude, check_in_longitude, check_in_ip, late_status, late_minutes, verification_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified')`,
        [employeeId, attendanceDate, dayOfWeek, nowPKT, latitude, longitude, clientIp, lateStatus, lateMinutes]
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

module.exports = { checkIn, getMyIp };