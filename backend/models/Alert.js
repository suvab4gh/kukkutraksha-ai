import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
    index: true,
  },
  alertType: {
    type: String,
    enum: ['disease_detected', 'high_risk', 'nearby_outbreak', 'sensor_offline', 'threshold_breach'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sensorData: {
    ammonia: Number,
    co2: Number,
    temperature: Number,
    tds: Number,
    humidity: Number,
  },
  affectedFarms: [{
    farmId: mongoose.Schema.Types.ObjectId,
    farmName: String,
    distance: Number,
  }],
  isRead: {
    type: Boolean,
    default: false,
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
  resolvedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for efficient alert queries
alertSchema.index({ farmId: 1, createdAt: -1 });
alertSchema.index({ isRead: 1, severity: 1 });

export default mongoose.model('Alert', alertSchema);
