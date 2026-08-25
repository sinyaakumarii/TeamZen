// controllers/attendanceController.js
const db = require('../config/db');
const { isWithinOfficeRadius } = require('../utils/locationUtils');
const { getPakistanTimeNow, getDayOfWeek, getDateString, calculateLateStatus, calculateWorkingHours } = require('../utils/timeUtils');
const { getClientIp } = require('../utils/networkUtils');
const { isFaceMatch } = require('../utils/faceUtils');

const getMyIp = (req, res) => {
  const ip = getClientIp(req);
  res.json({ status: 'ok', yourIp: ip });
};

const checkIn = async (req, res) => {
  try {
    const { latitude, longitude, faceDescriptor } = req.body;
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;
    const clientIp = getClientIp(req);

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ status: 'error', message: 'GPS latitude and longitude are required. Please enable location access.' });
    }

    if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
      return res.status(400).json({ status: 'error', message: 'A valid face scan is required to check in.' });
    }

    // Step 1: Find the employee profile
    const [employees] = await db.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
    if (employees.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No employee profile found for your account. Contact your Admin.' });
    }
    const employeeId = employees[0].id;

    // Step 2: CHECK — Face verification (must have a registered face first)
    const [faceRows] = await db.query('SELECT face_descriptor FROM face_registrations WHERE employee_id = ?', [employeeId]);
    if (faceRows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No face registered yet. Please register your face first.', check: 'face' });
    }

    const registeredDescriptor = JSON.parse(faceRows[0].face_descriptor);
    const { isMatch, distance } = isFaceMatch(faceDescriptor, registeredDescriptor);

    if (!isMatch) {
      return res.status(403).json({
        status: 'error',
        message: 'Face verification failed. The scanned face does not match your registered face.',
        check: 'face',
        distance
      });
    }

    // Step 3: Get office settings
    const [settingsRows] = await db.query('SELECT * FROM office_settings WHERE organization_id = ?', [organizationId]);
    if (settingsRows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Office location has not been configured yet. Contact your Admin.' });
    }
    const settings = settingsRows[0];

    // Step 4: CHECK — Network verification
    if (settings.allowed_ip) {
      if (clientIp !== settings.allowed_ip) {
        return res.status(403).json({
          status: 'error',
          message: 'Network verification failed. You must be connected to the office network to check in.',
          check: 'network'
        });
      }
    }

    // Step 5: CHECK — GPS verification
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

    // Step 6: CHECK — server-side Pakistan time
    const nowPKT = getPakistanTimeNow();
    const attendanceDate = getDateString(nowPKT);
    const dayOfWeek = getDayOfWeek(nowPKT);

    // Step 7: Prevent duplicate check-in
    const [existing] = await db.query(
      'SELECT id, check_in_time FROM attendance WHERE employee_id = ? AND attendance_date = ?',
      [employeeId, attendanceDate]
    );
    if (existing.length > 0 && existing[0].check_in_time) {
      return res.status(409).json({ status: 'error', message: 'You have already checked in today.' });
    }

    // Step 8: Calculate late status
    const { lateMinutes, lateStatus } = calculateLateStatus(
      nowPKT,
      settings.standard_start_time,
      {
        grace_minutes: settings.grace_minutes,
        late_minutes: settings.late_minutes,
        very_late_minutes: settings.very_late_minutes
      }
    );

    // Step 9: Save attendance
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
      message: 'Check-in successful! All verifications passed.',
      data: {
        checkInTime: nowPKT,
        distanceMeters,
        faceMatchDistance: distance,
        lateStatus,
        lateMinutes
      }
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ status: 'error', message: 'Check-in failed', error: error.message });
  }
};
const checkOut = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find the employee profile
    const [employees] = await db.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
    if (employees.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No employee profile found for your account.' });
    }
    const employeeId = employees[0].id;

    const nowPKT = getPakistanTimeNow();
    const attendanceDate = getDateString(nowPKT);

    // Find today's attendance record
    const [existing] = await db.query(
      'SELECT id, check_in_time, check_out_time FROM attendance WHERE employee_id = ? AND attendance_date = ?',
      [employeeId, attendanceDate]
    );

    if (existing.length === 0 || !existing[0].check_in_time) {
      return res.status(400).json({ status: 'error', message: 'You have not checked in today. Cannot check out.' });
    }

    if (existing[0].check_out_time) {
      return res.status(409).json({ status: 'error', message: 'You have already checked out today.' });
    }

    const checkInTime = new Date(existing[0].check_in_time);
    const { workingHours, overtimeHours } = calculateWorkingHours(checkInTime, nowPKT);

    await db.query(
      'UPDATE attendance SET check_out_time = ?, working_hours = ?, overtime_hours = ? WHERE id = ?',
      [nowPKT, workingHours, overtimeHours, existing[0].id]
    );

    res.json({
      status: 'ok',
      message: 'Check-out successful!',
      data: {
        checkOutTime: nowPKT,
        workingHours,
        overtimeHours
      }
    });

  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ status: 'error', message: 'Check-out failed', error: error.message });
  }
};
module.exports = { checkIn, getMyIp, checkOut };