const Review = require('../models/Review');
const User = require('../models/User');

exports.createReview = async (req, res) => {
  try {
    const { workerId, jobId, rating, comment } = req.body;

    const review = await Review.create({
      job: jobId,
      worker: workerId,
      hirer: req.user.id,
      rating,
      comment
    });

    // Update worker's average rating
    const worker = await User.findById(workerId);
    const allReviews = await Review.find({ worker: workerId });
    const avgRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;
    
    worker.averageRating = avgRating;
    worker.totalRatings = allReviews.length;
    await worker.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('hirer', 'firstName lastName companyName')
      .populate('job', 'title');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
