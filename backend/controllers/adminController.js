/**
 * Admin Controller — Shram Setu
 * 
 * Handles: getAllUsers, blockUser, deleteJob, getAnalytics
 * All endpoints require admin role authorization.
 */

const User = require('../models/User');
const Job = require('../models/Job');
const Review = require('../models/Review');
const Application = require('../models/Application');
const { sendSuccess } = require('../utils/responseHelper');
const AppError = require('../utils/AppError');

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/users — Get all users (paginated)
// Query: ?page=1&limit=10&role=worker&search=john
// ─────────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    sendSuccess(res, 200, 'Users fetched', { users }, {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/users/:id/block — Toggle block/unblock user
// ─────────────────────────────────────────────────────────────
exports.blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    if (user.role === 'admin') {
      return next(new AppError('Cannot block an admin.', 400));
    }

    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });

    sendSuccess(res, 200, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, {
      userId: user._id,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/admin/jobs/:id — Delete any job (Admin)
// ─────────────────────────────────────────────────────────────
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return next(new AppError('Job not found.', 404));
    }

    // Cascade delete: remove applications and reviews for this job
    await Application.deleteMany({ job: job._id });
    await Review.deleteMany({ job: job._id });
    await Job.findByIdAndDelete(req.params.id);

    sendSuccess(res, 200, 'Job and related data deleted');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/analytics — Dashboard analytics
// ─────────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res, next) => {
  try {
    // Run all count queries in parallel for performance
    const [
      totalUsers,
      totalWorkers,
      totalHirers,
      totalJobs,
      openJobs,
      closedJobs,
      completedJobs,
      totalApplications,
      totalReviews,
      recentUsers,
      recentJobs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'worker' }),
      User.countDocuments({ role: 'hirer' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'open' }),
      Job.countDocuments({ status: 'closed' }),
      Job.countDocuments({ status: 'completed' }),
      Application.countDocuments(),
      Review.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email role createdAt'),
      Job.find().sort({ createdAt: -1 }).limit(5)
        .select('title location budget status createdAt')
        .populate('postedBy', 'firstName lastName'),
    ]);

    // Aggregation: applications by status
    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    sendSuccess(res, 200, 'Analytics fetched', {
      counts: {
        totalUsers,
        totalWorkers,
        totalHirers,
        totalJobs,
        openJobs,
        closedJobs,
        completedJobs,
        totalApplications,
        totalReviews,
      },
      applicationsByStatus,
      recentUsers,
      recentJobs,
    });
  } catch (error) {
    next(error);
  }
};
