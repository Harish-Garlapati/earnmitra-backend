const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'earnmitra_super_secret_jwt_key_2026_secure';

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid token format. Expected: Bearer <token>' });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      partnerId: decoded.role === 'admin' ? null : decoded.id,
      adminId: decoded.role === 'admin' ? decoded.adminId || decoded.id : null,
      partnerCode: decoded.partnerCode || null,
      role: decoded.role || 'partner',
      actorType: decoded.role === 'admin' ? 'admin' : 'partner',
      mobile: decoded.mobile,
      email: decoded.email,
      username: decoded.username
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid or malformed authentication token' });
  }
}

// Optional authentication: attaches user if token valid, but does not block if missing
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    try {
      const decoded = jwt.verify(parts[1], JWT_SECRET);
      req.user = {
        id: decoded.id,
        partnerId: decoded.role === 'admin' ? null : decoded.id,
        adminId: decoded.role === 'admin' ? decoded.adminId || decoded.id : null,
        partnerCode: decoded.partnerCode || null,
        role: decoded.role || 'partner',
        actorType: decoded.role === 'admin' ? 'admin' : 'partner',
        mobile: decoded.mobile,
        email: decoded.email,
        username: decoded.username
      };
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}

module.exports = { authenticate, optionalAuth, JWT_SECRET };
