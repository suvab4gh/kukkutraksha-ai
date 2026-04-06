import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';
import { verifyToken } from '../middleware/auth.js';

// Get latest sensor data for a farm
router.get('/farm/:farmId/latest', verifyToken, async (req, res) => {
  try {
    const { data: sensorData, error } = await supabase
      .from('sensor_data')
      .select('*')
      .eq('farm_id', req.params.farmId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error || !sensorData) {
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
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { data: sensorData, error } = await supabase
      .from('sensor_data')
      .select('*')
      .eq('farm_id', req.params.farmId)
      .gte('timestamp', startTime)
      .order('timestamp', { ascending: true })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res.json(sensorData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get sensor data statistics
router.get('/farm/:farmId/stats', verifyToken, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // Note: This would need to be implemented with Supabase RPC or Postgres functions
    // For now, fetch data and calculate client-side
    const { data: sensorData, error } = await supabase
      .from('sensor_data')
      .select('ammonia, co2, temperature, tds, humidity')
      .eq('farm_id', req.params.farmId)
      .gte('timestamp', startTime);

    if (error) throw error;

    if (!sensorData || sensorData.length === 0) {
      return res.json({});
    }

    // Calculate stats
    const stats = {
      avgAmmonia: sensorData.reduce((sum, d) => sum + d.ammonia, 0) / sensorData.length,
      maxAmmonia: Math.max(...sensorData.map(d => d.ammonia)),
      minAmmonia: Math.min(...sensorData.map(d => d.ammonia)),
      avgCo2: sensorData.reduce((sum, d) => sum + d.co2, 0) / sensorData.length,
      maxCo2: Math.max(...sensorData.map(d => d.co2)),
      minCo2: Math.min(...sensorData.map(d => d.co2)),
      avgTemperature: sensorData.reduce((sum, d) => sum + d.temperature, 0) / sensorData.length,
      maxTemperature: Math.max(...sensorData.map(d => d.temperature)),
      minTemperature: Math.min(...sensorData.map(d => d.temperature)),
      avgTds: sensorData.reduce((sum, d) => sum + d.tds, 0) / sensorData.length,
      maxTds: Math.max(...sensorData.map(d => d.tds)),
      minTds: Math.min(...sensorData.map(d => d.tds)),
      avgHumidity: sensorData.reduce((sum, d) => sum + d.humidity, 0) / sensorData.length,
      maxHumidity: Math.max(...sensorData.map(d => d.humidity)),
      minHumidity: Math.min(...sensorData.map(d => d.humidity)),
      totalReadings: sensorData.length,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get risk distribution
router.get('/farm/:farmId/risk-distribution', verifyToken, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { data: sensorData, error } = await supabase
      .from('sensor_data')
      .select('risk_level')
      .eq('farm_id', req.params.farmId)
      .gte('timestamp', startTime);

    if (error) throw error;

    const result = {
      safe: 0,
      moderate: 0,
      danger: 0,
    };

    sensorData.forEach((item) => {
      if (result[item.risk_level] !== undefined) {
        result[item.risk_level]++;
      }
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

    let query = supabase
      .from('sensor_data')
      .select('*')
      .eq('farm_id', req.params.farmId)
      .order('timestamp', { ascending: true })
      .limit(parseInt(limit));

    if (startDate && endDate) {
      query = query
        .gte('timestamp', new Date(startDate).toISOString())
        .lte('timestamp', new Date(endDate).toISOString());
    }

    const { data: sensorData, error } = await query;

    if (error) throw error;

    res.json(sensorData);
  } catch (error) {
    console.error('Error fetching sensor data by range:', error);
    res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
});

export default router;
