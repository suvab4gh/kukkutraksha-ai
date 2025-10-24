import mongoose from 'mongoose';

const sensorDataSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
    index: true,
  },
  deviceId: {
    type: String,
    required: true,
  },
  zone: {
    type: String, // A, B, C, D, etc.
    required: false,
  },
  ammonia: {
    type: Number,
    required: true,
  },
  co2: {
    type: Number,
    required: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  tds: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  riskLevel: {
    type: String,
    enum: ['safe', 'moderate', 'danger'],
    default: 'safe',
  },
  riskScore: {
    type: Number, // 0-100 percentage
    default: 0,
  },
  overallStatus: {
    type: String,
    enum: ['safe', 'warning', 'critical'],
    default: 'safe',
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for efficient queries
sensorDataSchema.index({ farmId: 1, timestamp: -1 });

// TTL index - automatically delete records older than 90 days
sensorDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('SensorData', sensorDataSchema);
