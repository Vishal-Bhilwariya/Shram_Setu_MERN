const User = require('../models/User');
const Job = require('../models/Job');
const Review = require('../models/Review');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const totalHirers = await User.countDocuments({ role: 'hirer' });
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'open' });
    const totalReviews = await Review.countDocuments();

    res.json({
      totalUsers,
      totalWorkers,
      totalHirers,
      totalJobs,
      openJobs,
      totalReviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
