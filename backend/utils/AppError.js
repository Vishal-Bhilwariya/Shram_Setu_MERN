/**
 * Custom Application Error Class
 * 
 * Extends the native Error to carry HTTP status codes.
 * Used throughout controllers and caught by the centralized error handler.
 */

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Distinguishes operational errors from programming bugs
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
