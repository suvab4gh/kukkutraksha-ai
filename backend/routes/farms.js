import express from 'express';
const router = express.Router();
import Farm from '../models/Farm.js';
import SensorData from '../models/SensorData.js';
import { verifyToken } from '../middleware/auth.js';

// Get all farms (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const farms = await Farm.find({ isActive: true })
      .select('-userId')
      .sort({ farmName: 1 });

    // Get latest sensor data for each farm
    const farmsWithData = await Promise.all(
      farms.map(async (farm) => {
        const latestData = await SensorData.findOne({ farmId: farm._id })
          .sort({ timestamp: -1 })
          .limit(1);

        return {
          ...farm.toObject(),
          latestSensorData: latestData || null,
        };
      })
    );

    res.json(farmsWithData);
  } catch (error) {
    console.error('Error fetching farms:', error);
    res.status(500).json({ error: 'Failed to fetch farms' });
  }
});

// Get single farm by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Get latest sensor data
    const latestData = await SensorData.findOne({ farmId: farm._id })
      .sort({ timestamp: -1 })
      .limit(1);

    res.json({
      ...farm.toObject(),
      latestSensorData: latestData || null,
    });
  } catch (error) {
    console.error('Error fetching farm:', error);
    res.status(500).json({ error: 'Failed to fetch farm' });
  }
});

// Get farm by user ID
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const farm = await Farm.findOne({ userId: req.params.userId });
    
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Get latest sensor data
    const latestData = await SensorData.findOne({ farmId: farm._id })
      .sort({ timestamp: -1 })
      .limit(1);

    res.json({
      ...farm.toObject(),
      latestSensorData: latestData || null,
    });
  } catch (error) {
    console.error('Error fetching farm:', error);
    res.status(500).json({ error: 'Failed to fetch farm' });
  }
});

// Update farm device ID
router.patch('/:id/device', verifyToken, async (req, res) => {
  try {
    const { deviceId } = req.body;
    
    const farm = await Farm.findByIdAndUpdate(
      req.params.id,
      { deviceId },
      { new: true }
    );

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    res.json(farm);
  } catch (error) {
    console.error('Error updating farm:', error);
    res.status(500).json({ error: 'Failed to update farm' });
  }
});

// Get farms by district
router.get('/district/:district', verifyToken, async (req, res) => {
  try {
    const farms = await Farm.find({
      district: req.params.district,
      isActive: true,
    }).select('-userId');

    // Get latest sensor data for each farm
    const farmsWithData = await Promise.all(
      farms.map(async (farm) => {
        const latestData = await SensorData.findOne({ farmId: farm._id })
          .sort({ timestamp: -1 })
          .limit(1);

        return {
          ...farm.toObject(),
          latestSensorData: latestData || null,
        };
      })
    );

    res.json(farmsWithData);
  } catch (error) {
    console.error('Error fetching farms by district:', error);
    res.status(500).json({ error: 'Failed to fetch farms' });
  }
});

// Get nearby farms
router.post('/nearby', verifyToken, async (req, res) => {
  try {
    const { longitude, latitude, radiusKm } = req.body;
    const radiusMeters = (radiusKm || 10) * 1000;

    const farms = await Farm.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusMeters,
        },
      },
      isActive: true,
    }).select('-userId');

    // Get latest sensor data for each farm
    const farmsWithData = await Promise.all(
      farms.map(async (farm) => {
        const latestData = await SensorData.findOne({ farmId: farm._id })
          .sort({ timestamp: -1 })
          .limit(1);

        // Calculate distance
        const distance = calculateDistance(
          latitude,
          longitude,
          farm.location.coordinates[1],
          farm.location.coordinates[0]
        );

        return {
          ...farm.toObject(),
          latestSensorData: latestData || null,
          distance: distance.toFixed(2),
        };
      })
    );

    res.json(farmsWithData);
  } catch (error) {
    console.error('Error fetching nearby farms:', error);
    res.status(500).json({ error: 'Failed to fetch nearby farms' });
  }
});

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export default router;
