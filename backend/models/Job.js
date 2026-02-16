/**
 * Job Model — Shram Setu
 * 
 * Posted by Hirers. Workers apply via the Application model.
 * Status: open → closed → completed
 * Text index on title + description for full-text search.
 */

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    skillsRequired: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [1, 'Budget must be at least 1'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'closed', 'completed'],
        message: 'Status must be open, closed, or completed',
      },
      default: 'open',
    },
    applicantCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────
jobSchema.index({ status: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ skillsRequired: 1 });
jobSchema.index({ title: 'text', description: 'text' }); // Full-text search

module.exports = mongoose.model('Job', jobSchema);
