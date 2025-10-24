import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  incidentType: {
    type: String,
    enum: [
      'Disease Outbreak',
      'Equipment Failure',
      'Bird Mortality',
      'Environmental Hazard',
      'Power Outage',
      'Water Supply Issue',
      'Predator Attack',
      'Unusual Behavior',
      'Other'
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true,
  },
  affectedZones: [String], // e.g., ["A", "B", "C"]
  affectedBirds: {
    count: Number,
    symptoms: String,
  },
  location: {
    zone: String,
    description: String, // e.g., "Near feeder 3"
  },
  photos: [{
    url: String,
    uploadedAt: Date,
    description: String,
  }],
  status: {
    type: String,
    enum: ['Open', 'Under Investigation', 'Resolved', 'Closed'],
    default: 'Open',
  },
  actionTaken: {
    type: String,
  },
  veterinaryConsultation: {
    required: { type: Boolean, default: false },
    consultedVet: String,
    consultationDate: Date,
    diagnosis: String,
    treatment: String,
  },
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,
    resolutionNotes: String,
    preventiveMeasures: String,
  },
  // Geofencing alert sent to nearby farms
  geofenceAlertSent: {
    type: Boolean,
    default: false,
  },
  notifiedFarms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
incidentSchema.index({ farmId: 1, status: 1 });
incidentSchema.index({ severity: 1, status: 1 });
incidentSchema.index({ createdAt: -1 });

// Methods
incidentSchema.methods.resolve = function(userId, notes) {
  this.status = 'Resolved';
  this.resolution = {
    resolvedBy: userId,
    resolvedAt: new Date(),
    resolutionNotes: notes,
  };
  return this.save();
};

incidentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Incident', incidentSchema);
