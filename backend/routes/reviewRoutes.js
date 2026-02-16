/**
 * Review Routes — /api/v1/reviews
 */

const express = require('express');
const { createReview, getWorkerReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const { validateCreateReview } = require('../middleware/validate');

const router = express.Router();

router.post('/', protect, authorize('hirer'), validateCreateReview, createReview);
router.get('/worker/:workerId', protect, getWorkerReviews);

module.exports = router;
