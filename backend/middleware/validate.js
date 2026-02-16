/**
 * Input Validation Middleware using express-validator
 * 
 * Contains reusable validation chains for all major endpoints.
 * Each chain is an array of validation rules that can be spread into route definitions.
 */

const { body, query, validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHelper');

// Middleware to check for validation errors and return them
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg);
        return sendError(res, 400, 'Validation failed', errorMessages);
    }
    next();
};

// --- Auth Validations ---

const validateRegister = [
    body('firstName').trim().notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName').trim().notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('email').trim().isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian phone number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number'),
    body('role').isIn(['worker', 'hirer']).withMessage('Role must be either worker or hirer'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('state').trim().notEmpty().withMessage('State is required'),
    body('pincode').trim().matches(/^\d{6}$/).withMessage('Please provide a valid 6-digit pincode'),
    body('dob').isISO8601().withMessage('Please provide a valid date of birth'),
    handleValidationErrors,
];

const validateLogin = [
    body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors,
];

// --- Job Validations ---

const validateCreateJob = [
    body('title').trim().notEmpty().withMessage('Job title is required')
        .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
    body('description').trim().notEmpty().withMessage('Job description is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('skillsRequired').isArray({ min: 1 }).withMessage('At least one skill is required'),
    body('budget').isNumeric().withMessage('Budget must be a number')
        .custom((val) => val > 0).withMessage('Budget must be greater than 0'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('duration').trim().notEmpty().withMessage('Duration is required'),
    handleValidationErrors,
];

// --- Review Validations ---

const validateCreateReview = [
    body('workerId').isMongoId().withMessage('Valid worker ID is required'),
    body('jobId').isMongoId().withMessage('Valid job ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('reviewText').optional().trim().isLength({ max: 500 }).withMessage('Review text max 500 characters'),
    handleValidationErrors,
];

// --- Profile Validations ---

const validateUpdateProfile = [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('phone').optional().trim().matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian phone number'),
    body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
    body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
    body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
    body('pincode').optional().trim().matches(/^\d{6}$/).withMessage('Please provide a valid 6-digit pincode'),
    handleValidationErrors,
];

const validateUpdatePassword = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
        .matches(/\d/).withMessage('New password must contain at least one number'),
    handleValidationErrors,
];

module.exports = {
    validateRegister,
    validateLogin,
    validateCreateJob,
    validateCreateReview,
    validateUpdateProfile,
    validateUpdatePassword,
};
