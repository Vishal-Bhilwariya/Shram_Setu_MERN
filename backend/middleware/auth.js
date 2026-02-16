/**
 * Authentication & Authorization Middleware
 * 
 * protect: Verifies JWT access token from Authorization header.
 *          Attaches user to req.user (excluding password).
 *          Blocks requests from blocked users.
 * 
 * authorize: Role-based access control. Accepts allowed roles as arguments.
 */

const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized. Please log in.', 401));
    }

    // Verify access token
    const decoded = verifyAccessToken(token);

    // Find user and check status
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('User no longer exists.', 401));
    }

    if (user.isBlocked) {
      return next(new AppError('Your account has been blocked. Contact admin.', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please refresh your token.', 401));
    }
    return next(new AppError('Not authorized. Invalid token.', 401));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Access denied. Role '${req.user.role}' is not authorized.`, 403));
    }
    next();
  };
};

module.exports = { protect, authorize };
