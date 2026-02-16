/**
 * Review Model — Shram Setu
 * 
 * Hirers can review workers after a job is completed.
 * Unique constraint: one review per hirer per job.
 * Used in aggregation pipeline to calculate worker average ratings.
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Worker reference is required'],
    },
    hirer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Hirer reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewText: {
      type: String,
      trim: true,
      maxlength: [500, 'Review text cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────
reviewSchema.index({ worker: 1 });
reviewSchema.index({ hirer: 1 });
reviewSchema.index({ job: 1, hirer: 1 }, { unique: true }); // One review per hirer per job

module.exports = mongoose.model('Review', reviewSchema);
