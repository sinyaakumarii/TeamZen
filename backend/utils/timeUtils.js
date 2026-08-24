// utils/timeUtils.js
// Handles Pakistan Standard Time (Asia/Karachi) calculations for attendance.

// Returns the current date/time in Pakistan Standard Time as a JS Date-like breakdown
const getPakistanTimeNow = () => {
  const now = new Date();
  // Convert to Pakistan Standard Time string, then parse it back into usable parts
  const pktString = now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' });
  return new Date(pktString);
};

// Returns day of week name (e.g., "Monday")
const getDayOfWeek = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Karachi' });
};

// Returns date in YYYY-MM-DD format (for the attendance_date column)
const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculates how late an employee is, and which category they fall into.
 * @param {Date} checkInTime - actual check-in time (Pakistan time)
 * @param {string} standardStartTime - office start time, e.g. "09:00:00"
 * @param {object} thresholds - { grace_minutes, late_minutes, very_late_minutes }
 * @returns {object} { lateMinutes, lateStatus }
 */
const calculateLateStatus = (checkInTime, standardStartTime, thresholds) => {
  const { grace_minutes, late_minutes, very_late_minutes } = thresholds;

  // Build the "expected start time" as a Date object on the same day as check-in
  const [hours, minutes, seconds] = standardStartTime.split(':').map(Number);
  const expectedStart = new Date(checkInTime);
  expectedStart.setHours(hours, minutes, seconds || 0, 0);

  const diffMs = checkInTime - expectedStart;
  const lateMinutes = Math.max(0, Math.round(diffMs / 60000)); // convert ms to minutes, never negative

  let lateStatus;
  if (lateMinutes <= grace_minutes) {
    lateStatus = 'on_time'; // includes the grace window
  } else if (lateMinutes <= late_minutes) {
    lateStatus = 'late';
  } else if (lateMinutes <= very_late_minutes) {
    lateStatus = 'very_late';
  } else {
    lateStatus = 'critical_late';
  }

  return { lateMinutes, lateStatus };
};

module.exports = { getPakistanTimeNow, getDayOfWeek, getDateString, calculateLateStatus };