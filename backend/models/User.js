import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['farmer', 'admin', 'veterinarian'],
    default: 'farmer',
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  phone: {
    type: String,
  },
  district: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
