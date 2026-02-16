/**
 * Application Routes — /api/v1/applications
 */

const express = require('express');
const {
    applyForJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Worker routes
router.post('/:jobId', protect, authorize('worker'), applyForJob);
router.get('/my-applications', protect, authorize('worker'), getMyApplications);

// Hirer routes
router.get('/job/:jobId', protect, authorize('hirer'), getJobApplications);
router.patch('/:id/status', protect, authorize('hirer'), updateApplicationStatus);

module.exports = router;
