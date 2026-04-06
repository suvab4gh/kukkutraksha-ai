import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
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
  type: {
    type: String,
    enum: ['disease_outbreak', 'equipment_failure', 'environmental', 'predator_attack', 'other'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['reported', 'investigating', 'resolved', 'closed'],
    default: 'reported',
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedAt: {
    type: Date,
  },
  resolutionNotes: {
    type: String,
  },
  affectedBirds: {
    type: Number,
  },
  casualties: {
    type: Number,
  },
}, {
  timestamps: true,
});

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;
