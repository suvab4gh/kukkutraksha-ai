import express from 'express';
const router = express.Router();
import SensorData from '../models/SensorData.js';
import { verifyToken } from '../middleware/auth.js';

// Get latest sensor data for a farm
router.get('/farm/:farmId/latest', verifyToken, async (req, res) => {
  try {
    const sensorData = await SensorData.findOne({ farmId: req.params.farmId })
      .sort({ timestamp: -1 })
      .limit(1);

    if (!sensorData) {
      return res.status(404).json({ error: 'No sensor data found' });
    }

    res.json(sensorData);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
});

// Get historical sensor data for a farm
router.get('/farm/:farmId/history', verifyToken, async (req, res) => {
  try {
    const { hours = 24, limit = 100 } = req.query;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const sensorData = await SensorData.find({
      farmId: req.params.farmId,
      timestamp: { $gte: startTime },
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(sensorData.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get sensor data statistics
router.get('/farm/:farmId/stats', verifyToken, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const stats = await SensorData.aggregate([
      {
        $match: {
          farmId: require('mongoose').Types.ObjectId(req.params.farmId),
          timestamp: { $gte: startTime },
        },
      },
      {
        $group: {
          _id: null,
          avgAmmonia: { $avg: '$ammonia' },
          maxAmmonia: { $max: '$ammonia' },
          minAmmonia: { $min: '$ammonia' },
          avgCo2: { $avg: '$co2' },
          maxCo2: { $max: '$co2' },
          minCo2: { $min: '$co2' },
          avgTemperature: { $avg: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          minTemperature: { $min: '$temperature' },
          avgTds: { $avg: '$tds' },
          maxTds: { $max: '$tds' },
          minTds: { $min: '$tds' },
          avgHumidity: { $avg: '$humidity' },
          maxHumidity: { $max: '$humidity' },
          minHumidity: { $min: '$humidity' },
          totalReadings: { $sum: 1 },
        },
      },
    ]);

    res.json(stats[0] || {});
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get risk distribution
router.get('/farm/:farmId/risk-distribution', verifyToken, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const distribution = await SensorData.aggregate([
      {
        $match: {
          farmId: require('mongoose').Types.ObjectId(req.params.farmId),
          timestamp: { $gte: startTime },
        },
      },
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      safe: 0,
      moderate: 0,
      danger: 0,
    };

    distribution.forEach((item) => {
      result[item._id] = item.count;
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching risk distribution:', error);
    res.status(500).json({ error: 'Failed to fetch risk distribution' });
  }
});

// Get sensor data by date range
router.get('/farm/:farmId/range', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, limit = 1000 } = req.query;

    const query = {
      farmId: req.params.farmId,
    };

    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const sensorData = await SensorData.find(query)
      .sort({ timestamp: 1 })
      .limit(parseInt(limit));

    res.json(sensorData);
  } catch (error) {
    console.error('Error fetching sensor data by range:', error);
    res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
});

export default router;
