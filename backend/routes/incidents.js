import express from 'express';
import Incident from '../models/Incident.js';
import User from '../models/User.js';
import Farm from '../models/Farm.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all incidents for a farm
router.get('/farm/:farmId', verifyToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    const { status, severity, incidentType } = req.query;
    
    const query = { farmId };
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (incidentType) query.incidentType = incidentType;
    
    const incidents = await Incident.find(query)
      .populate('reportedBy', 'name email phone')
      .populate('resolution.resolvedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Get incident by ID
router.get('/:incidentId', verifyToken, async (req, res) => {
  try {
    const { incidentId } = req.params;
    
    const incident = await Incident.findById(incidentId)
      .populate('reportedBy', 'name email phone role')
      .populate('farmId', 'farmName location')
      .populate('resolution.resolvedBy', 'name')
      .populate('notifiedFarms', 'farmName location');
    
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    res.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// Create new incident
router.post('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const incidentData = {
      ...req.body,
      reportedBy: user._id,
    };
    
    const incident = new Incident(incidentData);
    await incident.save();
    
    // If critical disease outbreak, send geofence alerts to nearby farms
    if (
      incident.incidentType === 'Disease Outbreak' &&
      (incident.severity === 'High' || incident.severity === 'Critical')
    ) {
      await sendGeofenceAlerts(incident);
    }
    
    await incident.populate('reportedBy', 'name email phone');
    res.status(201).json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// Update incident
router.put('/:incidentId', verifyToken, async (req, res) => {
  try {
    const { incidentId } = req.params;
    const user = await User.findOne({ uid: req.user.uid });
    
    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    // Check permissions
    const isReporter = incident.reportedBy.toString() === user._id.toString();
    const hasPermission = user.hasPermission('incidents', 'write');
    
    if (!isReporter && !hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    Object.assign(incident, req.body);
    await incident.save();
    
    await incident.populate('reportedBy', 'name email phone');
    res.json(incident);
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// Resolve incident
router.post('/:incidentId/resolve', verifyToken, async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { resolutionNotes, preventiveMeasures } = req.body;
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user.hasPermission('incidents', 'write')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    await incident.resolve(user._id, resolutionNotes);
    if (preventiveMeasures) {
      incident.resolution.preventiveMeasures = preventiveMeasures;
      await incident.save();
    }
    
    await incident.populate('reportedBy', 'name email phone');
    await incident.populate('resolution.resolvedBy', 'name');
    
    res.json(incident);
  } catch (error) {
    console.error('Error resolving incident:', error);
    res.status(500).json({ error: 'Failed to resolve incident' });
  }
});

// Get incident statistics
router.get('/farm/:farmId/stats', verifyToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    const { startDate, endDate } = req.query;
    
    const query = { farmId };
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    const stats = await Incident.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            status: '$status',
            severity: '$severity',
            type: '$incidentType',
          },
          count: { $sum: 1 },
        },
      },
    ]);
    
    const result = {
      total: 0,
      byStatus: {},
      bySeverity: {},
      byType: {},
    };
    
    stats.forEach((stat) => {
      result.total += stat.count;
      result.byStatus[stat._id.status] = (result.byStatus[stat._id.status] || 0) + stat.count;
      result.bySeverity[stat._id.severity] = (result.bySeverity[stat._id.severity] || 0) + stat.count;
      result.byType[stat._id.type] = (result.byType[stat._id.type] || 0) + stat.count;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching incident statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Helper function to send geofence alerts to nearby farms
async function sendGeofenceAlerts(incident) {
  try {
    const farm = await Farm.findById(incident.farmId);
    if (!farm || !farm.location) return;
    
    // Find farms within 5km radius
    const nearbyFarms = await Farm.find({
      _id: { $ne: incident.farmId },
      location: {
        $near: {
          $geometry: farm.location,
          $maxDistance: 5000, // 5km in meters
        },
      },
    }).limit(20);
    
    if (nearbyFarms.length > 0) {
      incident.geofenceAlertSent = true;
      incident.notifiedFarms = nearbyFarms.map(f => f._id);
      await incident.save();
      
      console.log(`✅ Geofence alert sent to ${nearbyFarms.length} nearby farms`);
      
      // Here you could also send push notifications or emails to farm owners
      // This would require additional implementation
    }
  } catch (error) {
    console.error('Error sending geofence alerts:', error);
  }
}

export default router;
