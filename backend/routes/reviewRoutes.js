const express = require('express');
const { createReview, getWorkerReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('hirer'), createReview);
router.get('/worker/:workerId', protect, getWorkerReviews);

module.exports = router;
