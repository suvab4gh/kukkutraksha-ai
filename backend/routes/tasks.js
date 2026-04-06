import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks for a farm
router.get('/farm/:farmId', verifyToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    const { status, date, assignedTo } = req.query;
    
    const query = { farmId };
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email phone')
      .populate('assignedBy', 'name')
      .sort({ scheduledDate: -1, priority: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get tasks assigned to current user
router.get('/my-tasks', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { status, date } = req.query;
    const query = { assignedTo: user._id };
    
    if (status) {
      query.status = status;
    } else {
      // Default: show pending and in-progress tasks
      query.status = { $in: ['Pending', 'In Progress', 'Overdue'] };
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    } else {
      // Default: show today's and overdue tasks
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.scheduledDate = { $lte: new Date() };
    }
    
    const tasks = await Task.find(query)
      .populate('farmId', 'farmName')
      .populate('assignedBy', 'name')
      .sort({ priority: -1, scheduledDate: 1 });
    
    // Update overdue tasks
    for (const task of tasks) {
      if (task.isOverdue()) {
        await task.save();
      }
    }
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create a new task
router.post('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user || !user.hasPermission('tasks', 'write')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const taskData = {
      ...req.body,
      assignedBy: user._id,
    };
    
    const task = new Task(taskData);
    await task.save();
    
    await task.populate('assignedTo', 'name email phone');
    await task.populate('assignedBy', 'name');
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:taskId', verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findOne({ uid: req.user.uid });
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check permissions
    const isAssignedUser = task.assignedTo.toString() === user._id.toString();
    const hasWritePermission = user.hasPermission('tasks', 'write');
    
    if (!isAssignedUser && !hasWritePermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Update task fields
    Object.assign(task, req.body);
    await task.save();
    
    await task.populate('assignedTo', 'name email phone');
    await task.populate('assignedBy', 'name');
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Mark task as complete
router.post('/:taskId/complete', verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findOne({ uid: req.user.uid });
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user is assigned to this task
    if (task.assignedTo.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Only assigned user can complete this task' });
    }
    
    await task.markComplete();
    await task.populate('assignedTo', 'name email phone');
    await task.populate('assignedBy', 'name');
    
    res.json(task);
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Toggle checklist item
router.post('/:taskId/checklist/:itemIndex', verifyToken, async (req, res) => {
  try {
    const { taskId, itemIndex } = req.params;
    const user = await User.findOne({ uid: req.user.uid });
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.assignedTo.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const index = parseInt(itemIndex);
    if (!task.checklist || index >= task.checklist.length) {
      return res.status(400).json({ error: 'Invalid checklist item' });
    }
    
    task.checklist[index].completed = !task.checklist[index].completed;
    if (task.checklist[index].completed) {
      task.checklist[index].completedAt = new Date();
    } else {
      task.checklist[index].completedAt = undefined;
    }
    
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error toggling checklist item:', error);
    res.status(500).json({ error: 'Failed to update checklist' });
  }
});

// Add note to task
router.post('/:taskId/notes', verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { note } = req.body;
    const user = await User.findOne({ uid: req.user.uid });
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.assignedTo.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    task.notes = task.notes ? `${task.notes}\n\n[${new Date().toLocaleString()}] ${note}` : note;
    await task.save();
    
    res.json(task);
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Delete task
router.delete('/:taskId', verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user.hasPermission('tasks', 'delete')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get task statistics
router.get('/farm/:farmId/stats', verifyToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    
    const stats = await Task.aggregate([
      { $match: { farmId: mongoose.Types.ObjectId(farmId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    
    const result = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
    };
    
    stats.forEach((stat) => {
      result.total += stat.count;
      if (stat._id === 'Pending') result.pending = stat.count;
      if (stat._id === 'In Progress') result.inProgress = stat.count;
      if (stat._id === 'Completed') result.completed = stat.count;
      if (stat._id === 'Overdue') result.overdue = stat.count;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching task statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
