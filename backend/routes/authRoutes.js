/**
 * Auth Routes — /api/v1/auth
 */

const express = require('express');
const {
    register,
    login,
    refreshToken,
    logout,
    getProfile,
    updateProfile,
    updatePassword,
    uploadAvatar,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin, validateUpdateProfile, validateUpdatePassword } = require('../middleware/validate');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.put('/update-password', protect, validateUpdatePassword, updatePassword);
router.post('/upload-avatar', protect, upload.single('profileImage'), uploadAvatar);

module.exports = router;
