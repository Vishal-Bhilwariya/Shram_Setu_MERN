/**
 * Admin Routes — /api/v1/admin
 */

const express = require('express');
const { getAllUsers, blockUser, deleteJob, getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/block', blockUser);
router.delete('/jobs/:id', deleteJob);
router.get('/analytics', getAnalytics);

module.exports = router;
