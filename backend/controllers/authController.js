/**
 * Auth Controller — Shram Setu
 * 
 * Handles: register, login, refreshToken, logout, getProfile, updateProfile, updatePassword
 * 
 * Token Strategy:
 * - Access token sent in response body (frontend stores in memory/localStorage)
 * - Refresh token sent as httpOnly cookie (secure, can't be accessed by JS)
 * - On token refresh, old refresh token is rotated (invalidated + new one issued)
 */

const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const AppError = require('../utils/AppError');

// Helper: Set refresh token cookie
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ─────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// ─────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { email, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('A user with this email already exists.', 400));
    }

    // Build user data
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      role,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      dob: req.body.dob,
    };

    // Add role-specific details
    if (role === 'worker') {
      userData.workerDetails = {
        skills: req.body.skills || [],
        experience: req.body.experience || 0,
        dailyWage: req.body.dailyWage || 0,
        availability: req.body.availability !== undefined ? req.body.availability : true,
      };
    } else if (role === 'hirer') {
      userData.hirerDetails = {
        companyName: req.body.companyName || '',
        workLocation: req.body.workLocation || '',
      };
    }

    const user = await User.create(userData);

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    sendSuccess(res, 201, 'Registration successful', {
      accessToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // Check if blocked
    if (user.isBlocked) {
      return next(new AppError('Your account has been blocked. Contact admin.', 403));
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to DB (token rotation)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    sendSuccess(res, 200, 'Login successful', {
      accessToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/v1/auth/refresh-token
// ─────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return next(new AppError('No refresh token provided.', 401));
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    // Find user with refresh token
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return next(new AppError('Invalid refresh token. Please log in again.', 401));
    }

    // Generate new token pair (rotation)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    // Set new refresh token cookie
    setRefreshTokenCookie(res, newRefreshToken);

    sendSuccess(res, 200, 'Token refreshed', { accessToken: newAccessToken });
  } catch (error) {
    next(new AppError('Invalid refresh token. Please log in again.', 401));
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/v1/auth/logout
// ─────────────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    // Clear refresh token from DB
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });

    // Clear cookie
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/auth/profile
// ─────────────────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }
    sendSuccess(res, 200, 'Profile fetched', { user });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/v1/auth/profile
// ─────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'pincode',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle role-specific updates
    if (req.user.role === 'worker') {
      const workerFields = ['skills', 'experience', 'dailyWage', 'availability'];
      workerFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[`workerDetails.${field}`] = req.body[field];
        }
      });
    } else if (req.user.role === 'hirer') {
      const hirerFields = ['companyName', 'workLocation'];
      hirerFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[`hirerDetails.${field}`] = req.body[field];
        }
      });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, 200, 'Profile updated', { user });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/v1/auth/update-password
// ─────────────────────────────────────────────────────────────
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect.', 400));
    }

    user.password = newPassword;
    await user.save();

    // Generate new tokens after password change
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    setRefreshTokenCookie(res, refreshToken);

    sendSuccess(res, 200, 'Password updated successfully', { accessToken });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/v1/auth/upload-avatar
// ─────────────────────────────────────────────────────────────
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image file.', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: req.file.path },
      { new: true }
    );

    sendSuccess(res, 200, 'Profile image uploaded', {
      profileImage: user.profileImage,
    });
  } catch (error) {
    next(error);
  }
};
