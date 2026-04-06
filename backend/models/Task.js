import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
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
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  category: {
    type: String,
    enum: ['feeding', 'cleaning', 'health_check', 'maintenance', 'vaccination', 'other'],
  },
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
