import express from 'express';
import IoTDevice from '../models/IoTDevice.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { publishControlCommand } from '../services/mqttService.js';

const router = express.Router();

// Get all devices for a farm
router.get('/farm/:farmId', verifyToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    const { status, deviceType, zone } = req.query;
    
    const query = { farmId, isActive: true };
    if (status) query.status = status;
    if (deviceType) query.deviceType = deviceType;
    if (zone) query.zone = zone;
    
    const devices = await IoTDevice.find(query).sort({ zone: 1, deviceName: 1 });
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get device by ID
router.get('/:deviceId', verifyToken, async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const device = await IoTDevice.findById(deviceId).populate('farmId', 'farmName');
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// Create new device
router.post('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user || !user.hasPermission('devices', 'write')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const device = new IoTDevice(req.body);
    await device.save();
    
    res.status(201).json(device);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// Update device
router.put('/:deviceId', verifyToken, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user || !user.hasPermission('devices', 'write')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const device = await IoTDevice.findByIdAndUpdate(deviceId, req.body, { new: true });
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Control device (turn on/off, set state)
router.post('/:deviceId/control', verifyToken, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { command, state, speed } = req.body;
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user || !user.hasPermission('devices', 'control')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const device = await IoTDevice.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    if (device.status !== 'Online') {
      return res.status(400).json({ error: 'Device is not online' });
    }
    
    // Update device state
    if (state) {
      device.currentState = state;
    }
    
    await device.sendCommand(command || `SET_STATE:${state}`, user._id);
    
    // Publish MQTT command
    const commandPayload = {
      deviceId: device.deviceId,
      command: command || 'SET_STATE',
      state,
      speed,
      timestamp: new Date().toISOString(),
    };
    
    await publishControlCommand(device.mqttTopic, commandPayload);
    
    res.json({
      message: 'Control command sent successfully',
      device,
    });
  } catch (error) {
    console.error('Error controlling device:', error);
    res.status(500).json({ error: 'Failed to control device' });
  }
});

// Toggle automation
router.post('/:deviceId/automation', verifyToken, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { enabled } = req.body;
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user || !user.hasPermission('devices', 'control')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const device = await IoTDevice.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    device.automationEnabled = enabled;
    
    // If enabling automation, disable manual override
    if (enabled) {
      device.manualOverride.enabled = false;
    }
    
    await device.save();
    
    res.json({
      message: `Automation ${enabled ? 'enabled' : 'disabled'} successfully`,
      device,
    });
  } catch (error) {
    console.error('Error toggling automation:', error);
    res.status(500).json({ error: 'Failed to toggle automation' });
  }
});

// Enable/disable manual override
router.post('/:deviceId/override', verifyToken, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { enabled, reason, durationMinutes } = req.body;
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user || !user.hasPermission('devices', 'control')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const device = await IoTDevice.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    if (enabled) {
      await device.enableManualOverride(user._id, reason || 'Manual override', durationMinutes || 60);
    } else {
      await device.disableManualOverride();
    }
    
    res.json({
      message: `Manual override ${enabled ? 'enabled' : 'disabled'} successfully`,
      device,
    });
  } catch (error) {
    console.error('Error toggling manual override:', error);
    res.status(500).json({ error: 'Failed to toggle manual override' });
  }
});

// Add automation rule
router.post('/:deviceId/rules', verifyToken, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { condition, action, speed, enabled } = req.body;
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user || !user.hasPermission('devices', 'write')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const device = await IoTDevice.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    const ruleId = `rule_${Date.now()}`;
    const newRule = {
      ruleId,
      condition,
      action,
      speed,
      enabled: enabled !== false,
    };
    
    device.automationRules.push(newRule);
    await device.save();
    
    res.json({
      message: 'Automation rule added successfully',
      rule: newRule,
      device,
    });
  } catch (error) {
    console.error('Error adding automation rule:', error);
    res.status(500).json({ error: 'Failed to add automation rule' });
  }
});

// Delete automation rule
router.delete('/:deviceId/rules/:ruleId', verifyToken, async (req, res) => {
  try {
    const { deviceId, ruleId } = req.params;
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user || !user.hasPermission('devices', 'write')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const device = await IoTDevice.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    device.automationRules = device.automationRules.filter(rule => rule.ruleId !== ruleId);
    await device.save();
    
    res.json({
      message: 'Automation rule deleted successfully',
      device,
    });
  } catch (error) {
    console.error('Error deleting automation rule:', error);
    res.status(500).json({ error: 'Failed to delete automation rule' });
  }
});

// Get device statistics
router.get('/farm/:farmId/stats', verifyToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    
    const devices = await IoTDevice.find({ farmId, isActive: true });
    
    const stats = {
      total: devices.length,
      online: devices.filter(d => d.status === 'Online').length,
      offline: devices.filter(d => d.status === 'Offline').length,
      error: devices.filter(d => d.status === 'Error').length,
      active: devices.filter(d => d.currentState === 'On').length,
      automated: devices.filter(d => d.automationEnabled).length,
      manualOverride: devices.filter(d => d.manualOverride.enabled).length,
      byType: {},
      byZone: {},
    };
    
    devices.forEach(device => {
      stats.byType[device.deviceType] = (stats.byType[device.deviceType] || 0) + 1;
      if (device.zone) {
        stats.byZone[device.zone] = (stats.byZone[device.zone] || 0) + 1;
      }
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching device statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
