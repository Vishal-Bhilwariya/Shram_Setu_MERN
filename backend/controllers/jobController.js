/**
 * Job Controller — Shram Setu
 * 
 * Handles: createJob, getAllJobs, getJobById, getMyJobs, updateJob,
 *          markJobCompleted, deleteJob
 * 
 * Features:
 * - Pagination with limit & page
 * - Search by keyword (text index)
 * - Filter by skill, location, budget range, status
 * - Worker ranking by rating + completed jobs
 */

const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const { sendSuccess } = require('../utils/responseHelper');
const AppError = require('../utils/AppError');

// ─────────────────────────────────────────────────────────────
// POST /api/v1/jobs — Create a new job (Hirer only)
// ─────────────────────────────────────────────────────────────
exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({
      title: req.body.title,
      description: req.body.description,
      skillsRequired: req.body.skillsRequired,
      budget: req.body.budget,
      location: req.body.location,
      duration: req.body.duration,
      postedBy: req.user._id,
    });

    sendSuccess(res, 201, 'Job posted successfully', { job });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/jobs — Get all jobs with pagination & filters
// Query: ?page=1&limit=10&search=plumber&skill=plumbing&location=delhi&minBudget=500&maxBudget=5000&status=open
// ─────────────────────────────────────────────────────────────
exports.getAllJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      skill,
      location,
      minBudget,
      maxBudget,
      status = 'open',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};

    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (skill) filter.skillsRequired = { $in: [new RegExp(skill, 'i')] };
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = parseInt(minBudget, 10);
      if (maxBudget) filter.budget.$lte = parseInt(maxBudget, 10);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    // Sort
    const sortObj = {};
    sortObj[sortBy] = order === 'asc' ? 1 : -1;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'firstName lastName hirerDetails.companyName')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(filter),
    ]);

    sendSuccess(res, 200, 'Jobs fetched', { jobs }, {
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
// GET /api/v1/jobs/:id — Get single job by ID
// ─────────────────────────────────────────────────────────────
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName email phone hirerDetails');

    if (!job) {
      return next(new AppError('Job not found.', 404));
    }

    // Get applications for this job
    const applications = await Application.find({ job: job._id })
      .populate('worker', 'firstName lastName workerDetails profileImage');

    sendSuccess(res, 200, 'Job fetched', { job, applications });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/jobs/my-jobs — Get jobs posted by logged-in hirer
// ─────────────────────────────────────────────────────────────
exports.getMyJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter = { postedBy: req.user._id };
    if (status) filter.status = status;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(filter),
    ]);

    // Get application counts for each job
    const jobIds = jobs.map((j) => j._id);
    const applicationCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    applicationCounts.forEach((ac) => {
      countMap[ac._id.toString()] = ac.count;
    });

    const jobsWithCounts = jobs.map((job) => ({
      ...job.toObject(),
      applicantCount: countMap[job._id.toString()] || 0,
    }));

    sendSuccess(res, 200, 'Your jobs fetched', { jobs: jobsWithCounts }, {
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
// PUT /api/v1/jobs/:id — Update a job (Hirer who posted it)
// ─────────────────────────────────────────────────────────────
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return next(new AppError('Job not found.', 404));
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only edit your own jobs.', 403));
    }

    if (job.status !== 'open') {
      return next(new AppError('Cannot edit a job that is closed or completed.', 400));
    }

    const allowedFields = ['title', 'description', 'skillsRequired', 'budget', 'location', 'duration'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    job = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, 200, 'Job updated', { job });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/jobs/:id/complete — Mark job as completed
// ─────────────────────────────────────────────────────────────
exports.markJobCompleted = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return next(new AppError('Job not found.', 404));
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the hirer who posted this job can mark it complete.', 403));
    }

    job.status = 'completed';
    await job.save();

    // Update accepted workers' completedJobs count
    const acceptedApps = await Application.find({ job: job._id, status: 'accepted' });
    for (const app of acceptedApps) {
      app.status = 'completed';
      await app.save();

      await User.findByIdAndUpdate(app.worker, {
        $inc: { 'workerDetails.completedJobs': 1 },
      });
    }

    sendSuccess(res, 200, 'Job marked as completed', { job });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/jobs/:id — Delete a job (Hirer who posted it or Admin)
// ─────────────────────────────────────────────────────────────
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return next(new AppError('Job not found.', 404));
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this job.', 403));
    }

    // Delete associated applications
    await Application.deleteMany({ job: job._id });
    await Job.findByIdAndDelete(req.params.id);

    sendSuccess(res, 200, 'Job deleted');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/jobs/top-workers — Get top-ranked workers
// Uses aggregation pipeline: sorted by rating DESC, completedJobs DESC
// ─────────────────────────────────────────────────────────────
exports.getTopWorkers = async (req, res, next) => {
  try {
    const { limit = 10, skill } = req.query;
    const limitNum = parseInt(limit, 10);

    const matchStage = { role: 'worker', isBlocked: false };
    if (skill) {
      matchStage['workerDetails.skills'] = { $in: [new RegExp(skill, 'i')] };
    }

    const workers = await User.find(matchStage)
      .select('firstName lastName profileImage city workerDetails')
      .sort({ 'workerDetails.rating': -1, 'workerDetails.completedJobs': -1 })
      .limit(limitNum);

    sendSuccess(res, 200, 'Top workers fetched', { workers });
  } catch (error) {
    next(error);
  }
};
