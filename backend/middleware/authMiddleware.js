// middleware/authMiddleware.js
// This middleware checks if a request has a valid JWT token before allowing it through.

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // The token is expected in the header like: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ status: 'error', message: 'No token provided. Access denied.' });
  }

  // authHeader looks like "Bearer eyJhbGciOi..." — we split and take the second part
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Malformed token. Access denied.' });
  }

  try {
    // Verify the token using our secret — this also decodes the data we stored in it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user info to the request, so later code can use it
    req.user = decoded; // { userId, role, organizationId }

    next(); // token is valid — let the request continue to the actual route
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token. Access denied.' });
  }
};

module.exports = { verifyToken };