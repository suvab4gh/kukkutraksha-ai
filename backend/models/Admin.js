import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin',
  },
  permissions: {
    viewAllFarms: { type: Boolean, default: true },
    manageUsers: { type: Boolean, default: false },
    exportData: { type: Boolean, default: true },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Admin', adminSchema);
