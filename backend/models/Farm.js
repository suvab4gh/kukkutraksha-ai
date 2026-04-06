import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  farmName: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
  },
  phone: {
    type: String,
  },
  district: {
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  farmType: {
    type: String,
    enum: ['Broiler', 'Layer', 'Breeder', 'Duckery'],
    default: 'Broiler',
  },
  aadhaarNumber: {
    type: String,
  },
  panCard: {
    type: String,
  },
  licenseStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  poultryFarmId: {
    type: String,
    unique: true,
  },
  currentStatus: {
    type: String,
    enum: ['safe', 'warning', 'critical'],
    default: 'safe',
  },
  deviceId: {
    type: String,
  },
  lastDataReceived: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Create 2dsphere index for geospatial queries
farmSchema.index({ location: '2dsphere' });

const Farm = mongoose.model('Farm', farmSchema);

export default Farm;
