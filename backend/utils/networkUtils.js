// utils/networkUtils.js
// Extracts the real client IP address from an incoming request.

const getClientIp = (req) => {
  // When behind a proxy/load balancer, the real IP is in this header.
  // Locally (no proxy), req.socket.remoteAddress is used instead.
  const forwarded = req.headers['x-forwarded-for'];
  let ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;

  // Normalize IPv6-mapped IPv4 addresses (e.g., "::ffff:127.0.0.1" -> "127.0.0.1")
  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  return ip;
};

module.exports = { getClientIp };