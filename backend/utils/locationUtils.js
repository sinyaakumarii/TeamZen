// utils/locationUtils.js
// Contains the Haversine formula to calculate distance between two GPS coordinates.

/**
 * Calculates the distance (in meters) between two GPS points using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1 (e.g., office location)
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2 (e.g., employee's current location)
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} distance in meters
 */
const calculateDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters

  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters

  return distance;
};

/**
 * Checks if a given location is within the allowed radius of the office.
 * @param {number} officeLat
 * @param {number} officeLon
 * @param {number} employeeLat
 * @param {number} employeeLon
 * @param {number} allowedRadiusMeters
 * @returns {object} { isWithinRadius: boolean, distanceMeters: number }
 */
const isWithinOfficeRadius = (officeLat, officeLon, employeeLat, employeeLon, allowedRadiusMeters) => {
  const distance = calculateDistanceInMeters(officeLat, officeLon, employeeLat, employeeLon);

  return {
    isWithinRadius: distance <= allowedRadiusMeters,
    distanceMeters: Math.round(distance)
  };
};

module.exports = { calculateDistanceInMeters, isWithinOfficeRadius };