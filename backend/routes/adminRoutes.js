const express = require('express');
const { getAllUsers, blockUser, getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/users', protect, authorize('admin'), getAllUsers);
router.patch('/users/:id/block', protect, authorize('admin'), blockUser);
router.get('/analytics', protect, authorize('admin'), getAnalytics);

module.exports = router;
