import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid })
      .populate('farmId', 'farmName location')
      .populate('ownedFarms', 'farmName location');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Create or update user
router.post('/', verifyToken, async (req, res) => {
  try {
    const { uid, email, name, phone, role, farmId, ...otherData } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ uid });
    
    if (user) {
      // Update existing user
      Object.assign(user, { name, phone, ...otherData });
      await user.save();
    } else {
      // Create new user with default permissions
      const permissions = User.getDefaultPermissions(role || 'farm_owner');
      user = new User({
        uid,
        email,
        name,
        phone,
        role: role || 'farm_owner',
        farmId,
        permissions,
        ...otherData,
      });
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Failed to create/update user' });
  }
});

// Get all field workers for a farm
router.get('/farm/:farmId/workers', verifyToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    
    // Check if user has permission
    const requester = await User.findOne({ uid: req.user.uid });
    if (!requester || !requester.hasPermission('workers', 'read')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const workers = await User.find({
      farmId,
      role: 'field_worker',
      isActive: true,
    }).select('-mfaSecret -phoneVerificationCode');
    
    res.json(workers);
  } catch (error) {
    console.error('Error fetching field workers:', error);
    res.status(500).json({ error: 'Failed to fetch field workers' });
  }
});

// Update field worker location
router.put('/location', verifyToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
    
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude],
      lastUpdated: new Date(),
    };
    await user.save();
    
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get field workers with their locations
router.get('/farm/:farmId/workers/locations', verifyToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    
    const workers = await User.find({
      farmId,
      role: 'field_worker',
      isActive: true,
      'currentLocation.coordinates': { $exists: true },
    }).select('name phone currentLocation assignedZones');
    
    res.json(workers);
  } catch (error) {
    console.error('Error fetching worker locations:', error);
    res.status(500).json({ error: 'Failed to fetch worker locations' });
  }
});

// Check user permissions
router.post('/check-permission', verifyToken, async (req, res) => {
  try {
    const { resource, action } = req.body;
    
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const hasPermission = user.hasPermission(resource, action);
    res.json({ hasPermission });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({ error: 'Failed to check permission' });
  }
});

// Update user role and permissions (admin only)
router.put('/:userId/role', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, permissions } = req.body;
    
    // Check if requester is admin
    const requester = await User.findOne({ uid: req.user.uid });
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (role) {
      user.role = role;
      user.permissions = User.getDefaultPermissions(role);
    }
    
    if (permissions && Array.isArray(permissions)) {
      user.permissions = permissions;
    }
    
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;
