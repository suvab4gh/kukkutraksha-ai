import express from 'express';
const router = express.Router();
import Farm from '../models/Farm.js';
import SensorData from '../models/SensorData.js';
import diseasePredictionService from '../services/diseasePredictionService.js';
import { verifyToken } from '../middleware/auth.js';

/**
 * GET /api/predictions/farm/:farmId
 * Get 10-day disease risk prediction for a specific farm
 */
router.get('/farm/:farmId', verifyToken, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.farmId);
    
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Check if user has access to this farm
    if (req.user.role !== 'admin') {
      // For non-admin users, verify ownership (implementation depends on your auth system)
      // This is a simplified check
    }

    // Get latest sensor data for the farm
    const latestSensorData = await SensorData.findOne({ farmId: req.params.farmId })
      .sort({ timestamp: -1 })
      .limit(1);

    const currentSensorData = latestSensorData ? {
      ammonia: latestSensorData.ammonia,
      co2: latestSensorData.co2,
      temperature: latestSensorData.temperature,
      humidity: latestSensorData.humidity,
      tds: latestSensorData.tds,
    } : {};

    // Extract coordinates from farm location
    // GeoJSON format: [longitude, latitude]
    const longitude = farm.location.coordinates[0];
    const latitude = farm.location.coordinates[1];

    // Generate prediction
    const predictionResult = await diseasePredictionService.generatePrediction(
      latitude,
      longitude,
      currentSensorData
    );

    if (!predictionResult.success) {
      return res.status(500).json({ 
        error: 'Failed to generate prediction',
        details: predictionResult.error 
      });
    }

    res.json(predictionResult.prediction);
  } catch (error) {
    console.error('Error generating prediction:', error);
    res.status(500).json({ error: 'Failed to generate disease prediction' });
  }
});

/**
 * GET /api/predictions/farm/:farmId/summary
 * Get simplified prediction summary with color-coded risk levels
 */
router.get('/farm/:farmId/summary', verifyToken, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.farmId);
    
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    const longitude = farm.location.coordinates[0];
    const latitude = farm.location.coordinates[1];

    const latestSensorData = await SensorData.findOne({ farmId: req.params.farmId })
      .sort({ timestamp: -1 })
      .limit(1);

    const currentSensorData = latestSensorData ? {
      ammonia: latestSensorData.ammonia,
      temperature: latestSensorData.temperature,
      humidity: latestSensorData.humidity,
    } : {};

    const predictionResult = await diseasePredictionService.generatePrediction(
      latitude,
      longitude,
      currentSensorData
    );

    if (!predictionResult.success) {
      return res.status(500).json({ error: 'Failed to generate prediction' });
    }

    const prediction = predictionResult.prediction;

    // Return simplified summary
    res.json({
      overallRisk: {
        level: prediction.overallRisk.level, // green, yellow, orange, red
        score: prediction.overallRisk.score,
        description: prediction.overallRisk.description,
      },
      highestRiskDay: prediction.highestRiskDay,
      next3Days: prediction.dailyForecasts.slice(0, 3).map(day => ({
        date: day.date,
        riskLevel: day.riskLevel,
        recommendations: day.recommendations.slice(0, 2),
      })),
      trend: prediction.summary.trend,
      generatedAt: prediction.generatedAt,
    });
  } catch (error) {
    console.error('Error generating prediction summary:', error);
    res.status(500).json({ error: 'Failed to generate prediction summary' });
  }
});

/**
 * GET /api/predictions/test/:latitude/:longitude
 * Test endpoint to get prediction for any coordinates (no auth required for testing)
 */
router.get('/test/:latitude/:longitude', async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    
    const predictionResult = await diseasePredictionService.generatePrediction(
      parseFloat(latitude),
      parseFloat(longitude),
      {}
    );

    if (!predictionResult.success) {
      return res.status(500).json({ error: predictionResult.error });
    }

    res.json(predictionResult.prediction);
  } catch (error) {
    console.error('Error in test prediction:', error);
    res.status(500).json({ error: 'Failed to generate test prediction' });
  }
});

export default router;
