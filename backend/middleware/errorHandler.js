/**
 * Centralized Error Handling Middleware
 * 
 * Catches all errors thrown via next(err) or thrown in async handlers.
 * Handles Mongoose validation errors, duplicate key errors, cast errors, and JWT errors.
 * Returns different detail levels based on NODE_ENV.
 */

const { sendError } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = null;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const validationErrors = Object.values(err.errors).map((e) => e.message);
        message = 'Validation Error';
        errors = validationErrors;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyPattern)[0];
        message = `Duplicate value for ${field}. This ${field} already exists.`;
    }

    // Mongoose bad ObjectId (CastError)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please log in again.';
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('ERROR:', err);
    }

    sendError(res, statusCode, message, errors);
};

module.exports = errorHandler;
