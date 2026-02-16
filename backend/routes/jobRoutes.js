const express = require('express');
const {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  applyJob,
  getAppliedJobs,
  updateApplicationStatus,
  deleteJob
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('hirer'), createJob);
router.get('/', protect, getAllJobs);
router.get('/my-jobs', protect, authorize('hirer'), getMyJobs);
router.get('/applied', protect, authorize('worker'), getAppliedJobs);
router.get('/:id', protect, getJobById);
router.post('/:id/apply', protect, authorize('worker'), applyJob);
router.patch('/:jobId/applicants/:workerId', protect, authorize('hirer'), updateApplicationStatus);
router.delete('/:id', protect, deleteJob);

module.exports = router;
