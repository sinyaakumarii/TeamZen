// utils/timeUtils.js
// Handles Pakistan Standard Time (Asia/Karachi) calculations for attendance.

const getPakistanTimeNow = () => {
  const now = new Date();
  const pktString = now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' });
  return new Date(pktString);
};

const getDayOfWeek = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Karachi' });
};

const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const calculateLateStatus = (checkInTime, standardStartTime, thresholds) => {
  const { grace_minutes, late_minutes, very_late_minutes } = thresholds;

  const [hours, minutes, seconds] = standardStartTime.split(':').map(Number);
  const expectedStart = new Date(checkInTime);
  expectedStart.setHours(hours, minutes, seconds || 0, 0);

  const diffMs = checkInTime - expectedStart;
  const lateMinutes = Math.max(0, Math.round(diffMs / 60000));

  let lateStatus;
  if (lateMinutes <= grace_minutes) {
    lateStatus = 'on_time';
  } else if (lateMinutes <= late_minutes) {
    lateStatus = 'late';
  } else if (lateMinutes <= very_late_minutes) {
    lateStatus = 'very_late';
  } else {
    lateStatus = 'critical_late';
  }

  return { lateMinutes, lateStatus };
};

/**
 * Calculates total working hours and overtime between check-in and check-out.
 * @param {Date} checkInTime
 * @param {Date} checkOutTime
 * @param {number} standardWorkingHours - e.g. 8
 * @returns {object} { workingHours, overtimeHours }
 */
const calculateWorkingHours = (checkInTime, checkOutTime, standardWorkingHours = 8) => {
  const diffMs = checkOutTime - checkInTime;
  const totalHours = diffMs / (1000 * 60 * 60); // convert ms to hours

  const workingHours = Math.max(0, parseFloat(totalHours.toFixed(2)));
  const overtimeHours = workingHours > standardWorkingHours
    ? parseFloat((workingHours - standardWorkingHours).toFixed(2))
    : 0;

  return { workingHours, overtimeHours };
};

module.exports = { getPakistanTimeNow, getDayOfWeek, getDateString, calculateLateStatus, calculateWorkingHours };