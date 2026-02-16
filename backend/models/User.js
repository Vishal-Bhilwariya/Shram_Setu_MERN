/**
 * User Model — Shram Setu
 * 
 * Roles: worker, hirer, admin
 * - Worker-specific fields nested under workerDetails
 * - Hirer-specific fields nested under hirerDetails
 * - Password auto-hashed via pre-save hook
 * - refreshToken stored for token rotation
 * - Indexed on email, role, city for fast queries
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password by default
    },
    role: {
      type: String,
      enum: {
        values: ['worker', 'hirer', 'admin'],
        message: 'Role must be worker, hirer, or admin',
      },
      required: [true, 'Role is required'],
    },
    address: { type: String, required: [true, 'Address is required'], trim: true },
    city: { type: String, required: [true, 'City is required'], trim: true },
    state: { type: String, required: [true, 'State is required'], trim: true },
    pincode: { type: String, required: [true, 'Pincode is required'], trim: true },
    dob: { type: Date, required: [true, 'Date of birth is required'] },
    profileImage: {
      type: String,
      default: '',
    },

    // Worker-specific details
    workerDetails: {
      skills: [{ type: String, trim: true }],
      experience: { type: Number, default: 0 },
      dailyWage: { type: Number, default: 0 },
      availability: { type: Boolean, default: true },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      completedJobs: { type: Number, default: 0 },
    },

    // Hirer-specific details
    hirerDetails: {
      companyName: { type: String, trim: true, default: '' },
      workLocation: { type: String, trim: true, default: '' },
    },

    // Auth
    refreshToken: { type: String, select: false },
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// ─── Indexes ────────────────────────────────────────────────
// Note: email index is already created by `unique: true` on the field
userSchema.index({ role: 1 });
userSchema.index({ city: 1 });
userSchema.index({ 'workerDetails.skills': 1 });
userSchema.index({ 'workerDetails.rating': -1, 'workerDetails.completedJobs': -1 }); // For worker ranking

// ─── Pre-save Hook: Hash Password ──────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Methods ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
