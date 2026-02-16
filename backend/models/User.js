const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['worker', 'hirer', 'admin'], required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  dob: { type: Date, required: true },
  
  // Worker-specific fields
  skills: [{ type: String }],
  experience: { type: Number },
  dailyWage: { type: Number },
  availability: { type: Boolean, default: true },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  
  // Hirer-specific fields
  companyName: { type: String },
  workLocation: { type: String },
  hiringFor: { type: String },
  preferredSkills: [{ type: String }],
  
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
