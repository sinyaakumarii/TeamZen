// utils/faceUtils.js
// Compares two face descriptors (128-number fingerprints) to check if they match.

/**
 * Calculates Euclidean distance between two face descriptors.
 * Lower distance = more similar faces.
 */
const calculateFaceDistance = (descriptor1, descriptor2) => {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Descriptors must be the same length');
  }

  let sumOfSquares = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sumOfSquares += diff * diff;
  }

  return Math.sqrt(sumOfSquares);
};

/**
 * Checks if two face descriptors belong to the same person.
 * @param {number[]} liveDescriptor - descriptor captured at check-in
 * @param {number[]} registeredDescriptor - descriptor saved during registration
 * @param {number} threshold - max distance to be considered a match (face-api.js recommends 0.6)
 * @returns {object} { isMatch: boolean, distance: number }
 */
const isFaceMatch = (liveDescriptor, registeredDescriptor, threshold = 0.6) => {
  const distance = calculateFaceDistance(liveDescriptor, registeredDescriptor);
  return {
    isMatch: distance <= threshold,
    distance: parseFloat(distance.toFixed(4))
  };
};

module.exports = { calculateFaceDistance, isFaceMatch };