/**
 * Application Controller — Shram Setu
 * 
 * Handles: applyForJob, getMyApplications, getJobApplications,
 *          updateApplicationStatus
 * 
 * Workflow:
 * 1. Worker applies → status = "pending"
 * 2. Hirer reviews → accepts/rejects
 * 3. Job completion → application marked "completed"
 */

const Application = require('../models/Application');
const Job = require('../models/Job');
const { sendSuccess } = require('../utils/responseHelper');
const AppError = require('../utils/AppError');

// ─────────────────────────────────────────────────────────────
// POST /api/v1/applications/:jobId — Worker applies for a job
// ─────────────────────────────────────────────────────────────
exports.applyForJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return next(new AppError('Job not found.', 404));
        }

        if (job.status !== 'open') {
            return next(new AppError('This job is no longer accepting applications.', 400));
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: job._id,
            worker: req.user._id,
        });
        if (existingApplication) {
            return next(new AppError('You have already applied for this job.', 400));
        }

        const application = await Application.create({
            job: job._id,
            worker: req.user._id,
            hirer: job.postedBy,
        });

        // Increment applicant count on job
        await Job.findByIdAndUpdate(job._id, { $inc: { applicantCount: 1 } });

        sendSuccess(res, 201, 'Applied successfully', { application });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/applications/my-applications — Worker's applied jobs
// ─────────────────────────────────────────────────────────────
exports.getMyApplications = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const filter = { worker: req.user._id };
        if (status) filter.status = status;

        const [applications, total] = await Promise.all([
            Application.find(filter)
                .populate({
                    path: 'job',
                    select: 'title location budget duration status',
                    populate: { path: 'postedBy', select: 'firstName lastName hirerDetails.companyName' },
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Application.countDocuments(filter),
        ]);

        sendSuccess(res, 200, 'Applications fetched', { applications }, {
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
// GET /api/v1/applications/job/:jobId — Hirer views applicants for a job
// ─────────────────────────────────────────────────────────────
exports.getJobApplications = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return next(new AppError('Job not found.', 404));
        }

        if (job.postedBy.toString() !== req.user._id.toString()) {
            return next(new AppError('You can only view applicants for your own jobs.', 403));
        }

        const applications = await Application.find({ job: job._id })
            .populate('worker', 'firstName lastName email phone city workerDetails profileImage')
            .sort({ createdAt: -1 });

        sendSuccess(res, 200, 'Applicants fetched', { applications });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/applications/:id/status — Hirer accepts/rejects application
// Body: { status: "accepted" | "rejected" }
// ─────────────────────────────────────────────────────────────
exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return next(new AppError('Status must be accepted or rejected.', 400));
        }

        const application = await Application.findById(req.params.id).populate('job');
        if (!application) {
            return next(new AppError('Application not found.', 404));
        }

        // Verify that the logged-in user is the hirer who posted the job
        if (application.hirer.toString() !== req.user._id.toString()) {
            return next(new AppError('You can only update applications for your own jobs.', 403));
        }

        if (application.status !== 'pending') {
            return next(new AppError('This application has already been processed.', 400));
        }

        application.status = status;
        await application.save();

        sendSuccess(res, 200, `Application ${status}`, { application });
    } catch (error) {
        next(error);
    }
};
