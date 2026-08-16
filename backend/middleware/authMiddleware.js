// middleware/authMiddleware.js
// This middleware checks if a request has a valid JWT token, and optionally checks the user's role.

const jwt = require('jsonwebtoken');

// Checks that a valid token was provided
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ status: 'error', message: 'No token provided. Access denied.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Malformed token. Access denied.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role, organizationId }
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token. Access denied.' });
  }
};

// Checks that the logged-in user's role is in the allowed list
// Usage: checkRole(['admin', 'super_admin'])
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // This middleware must run AFTER verifyToken, so req.user should already exist
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Access denied. No user found on request.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    next(); // role is allowed — continue
  };
};

module.exports = { verifyToken, checkRole };