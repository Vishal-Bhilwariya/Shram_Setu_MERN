const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  skillsRequired: [{ type: String, required: true }],
  budget: { type: Number, required: true },
  location: { type: String, required: true },
  duration: { type: String, required: true },
  hirer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [{
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
