import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedBy: {
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
  },
  taskType: {
    type: String,
    enum: ['Feeding', 'Cleaning', 'Inspection', 'Maintenance', 'Medication', 'Recording', 'Other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled', 'Overdue'],
    default: 'Pending',
  },
  assignedZones: [String], // e.g., ["A", "B", "C"]
  scheduledDate: {
    type: Date,
    required: true,
  },
  dueTime: {
    type: String, // e.g., "09:00 AM"
  },
  completedAt: {
    type: Date,
  },
  notes: {
    type: String,
  },
  photos: [{
    url: String,
    uploadedAt: Date,
    description: String,
  }],
  checklist: [{
    item: String,
    completed: { type: Boolean, default: false },
    completedAt: Date,
  }],
  recurring: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'],
    },
    endDate: Date,
  },
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
taskSchema.index({ farmId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ scheduledDate: 1 });

// Methods
taskSchema.methods.markComplete = function() {
  this.status = 'Completed';
  this.completedAt = new Date();
  return this.save();
};

taskSchema.methods.isOverdue = function() {
  if (this.status === 'Completed' || this.status === 'Cancelled') {
    return false;
  }
  const now = new Date();
  return this.scheduledDate < now;
};

// Middleware to update status if overdue
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.isOverdue() && this.status === 'Pending') {
    this.status = 'Overdue';
  }
  
  next();
});

export default mongoose.model('Task', taskSchema);
