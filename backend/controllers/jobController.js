const Job = require('../models/Job');

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, hirer: req.user.id });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' }).populate('hirer', 'firstName lastName companyName');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('hirer', 'firstName lastName companyName email phone');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ hirer: req.user.id }).populate('applicants.worker', 'firstName lastName skills dailyWage averageRating');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const alreadyApplied = job.applicants.find(app => app.worker.toString() === req.user.id);
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied' });
    }

    job.applicants.push({ worker: req.user.id });
    await job.save();
    res.json({ message: 'Applied successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAppliedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ 'applicants.worker': req.user.id }).populate('hirer', 'firstName lastName companyName');
    const appliedJobs = jobs.map(job => {
      const application = job.applicants.find(app => app.worker.toString() === req.user.id);
      return {
        ...job.toObject(),
        applicationStatus: application.status,
        appliedAt: application.appliedAt
      };
    });
    res.json(appliedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.jobId);
    
    if (!job || job.hirer.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applicant = job.applicants.find(app => app.worker.toString() === req.params.workerId);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    applicant.status = status;
    await job.save();
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.hirer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
