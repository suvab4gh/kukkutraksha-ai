import express from 'express';
const router = express.Router();
import Alert from '../models/Alert.js';
import { verifyToken } from '../middleware/auth.js';

// Get alerts for a farm
router.get('/farm/:farmId', verifyToken, async (req, res) => {
  try {
    const { limit = 50, unreadOnly = false } = req.query;

    const query = { farmId: req.params.farmId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('affectedFarms.farmId', 'farmName');

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get all alerts (admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { limit = 100, severity, alertType } = req.query;

    const query = {};
    if (severity) query.severity = severity;
    if (alertType) query.alertType = alertType;

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('farmId', 'farmName district location');

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching all alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Mark alert as read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Resolve alert
router.patch('/:id/resolve', verifyToken, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        isResolved: true,
        resolvedAt: new Date(),
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

// Get alert statistics
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    const { farmId } = req.query;

    const matchStage = farmId ? { farmId: require('mongoose').Types.ObjectId(farmId) } : {};

    const stats = await Alert.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] },
          },
        },
      },
    ]);

    const summary = {
      low: { total: 0, unread: 0 },
      medium: { total: 0, unread: 0 },
      high: { total: 0, unread: 0 },
      critical: { total: 0, unread: 0 },
    };

    stats.forEach((item) => {
      summary[item._id] = {
        total: item.count,
        unread: item.unreadCount,
      };
    });

    res.json(summary);
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

// Delete old resolved alerts
router.delete('/cleanup', verifyToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await Alert.deleteMany({
      isResolved: true,
      resolvedAt: { $lt: cutoffDate },
    });

    res.json({
      message: 'Cleanup completed',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error cleaning up alerts:', error);
    res.status(500).json({ error: 'Failed to cleanup alerts' });
  }
});

export default router;
