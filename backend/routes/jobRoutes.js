/**
 * Job Routes — /api/v1/jobs
 */

const express = require('express');
const {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  markJobCompleted,
  deleteJob,
  getTopWorkers,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');
const { validateCreateJob } = require('../middleware/validate');

const router = express.Router();

// Public-ish (requires auth but both roles can access)
router.get('/', protect, getAllJobs);
router.get('/top-workers', protect, getTopWorkers);
router.get('/my-jobs', protect, authorize('hirer'), getMyJobs);
router.get('/:id', protect, getJobById);

// Hirer only
router.post('/', protect, authorize('hirer'), validateCreateJob, createJob);
router.put('/:id', protect, authorize('hirer'), updateJob);
router.patch('/:id/complete', protect, authorize('hirer'), markJobCompleted);
router.delete('/:id', protect, deleteJob); // Hirer (own job) or Admin

module.exports = router;
