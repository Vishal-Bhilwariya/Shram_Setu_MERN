/**
 * Review Controller — Shram Setu
 * 
 * Handles: createReview, getWorkerReviews
 * 
 * Uses aggregation pipeline to calculate and update worker average rating.
 * Validates that a review can only be left by the job's hirer.
 */

const Review = require('../models/Review');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const { sendSuccess } = require('../utils/responseHelper');
const AppError = require('../utils/AppError');

// ─────────────────────────────────────────────────────────────
// POST /api/v1/reviews — Create a review (Hirer only)
// Body: { workerId, jobId, rating, reviewText }
// ─────────────────────────────────────────────────────────────
exports.createReview = async (req, res, next) => {
  try {
    const { workerId, jobId, rating, reviewText } = req.body;

    // Verify the job exists and is completed
    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job not found.', 404));
    }

    if (job.status !== 'completed') {
      return next(new AppError('You can only review workers after the job is completed.', 400));
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only review workers for your own jobs.', 403));
    }

    // Verify the worker was accepted for this job
    const application = await Application.findOne({
      job: jobId,
      worker: workerId,
      status: 'completed',
    });
    if (!application) {
      return next(new AppError('This worker was not part of this job.', 400));
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({ job: jobId, hirer: req.user._id });
    if (existingReview) {
      return next(new AppError('You have already reviewed this job.', 400));
    }

    // Create review
    const review = await Review.create({
      job: jobId,
      worker: workerId,
      hirer: req.user._id,
      rating,
      reviewText: reviewText || '',
    });

    // ─── Aggregation Pipeline: Recalculate Average Rating ──
    const ratingStats = await Review.aggregate([
      { $match: { worker: review.worker } },
      {
        $group: {
          _id: '$worker',
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    if (ratingStats.length > 0) {
      await User.findByIdAndUpdate(workerId, {
        'workerDetails.rating': Math.round(ratingStats[0].averageRating * 10) / 10,
      });
    }

    sendSuccess(res, 201, 'Review submitted', { review });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/reviews/worker/:workerId — Get all reviews for a worker
// ─────────────────────────────────────────────────────────────
exports.getWorkerReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter = { worker: req.params.workerId };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('hirer', 'firstName lastName hirerDetails.companyName')
        .populate('job', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(filter),
    ]);

    // Get aggregated stats
    const stats = await Review.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          ratingBreakdown: { $push: '$rating' },
        },
      },
    ]);

    const ratingStats = stats.length > 0 ? {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalRatings: stats[0].totalRatings,
    } : {
      averageRating: 0,
      totalRatings: 0,
    };

    sendSuccess(res, 200, 'Reviews fetched', { reviews, ratingStats }, {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};
