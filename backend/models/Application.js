/**
 * Application Model — Shram Setu
 * 
 * Tracks job applications from workers.
 * Status flow: pending → accepted/rejected → completed
 * Unique constraint: one application per worker per job.
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
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
        status: {
            type: String,
            enum: {
                values: ['pending', 'accepted', 'rejected', 'completed'],
                message: 'Status must be pending, accepted, rejected, or completed',
            },
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// ─── Indexes ────────────────────────────────────────────────
applicationSchema.index({ job: 1, worker: 1 }, { unique: true }); // One application per worker per job
applicationSchema.index({ worker: 1 });
applicationSchema.index({ hirer: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
