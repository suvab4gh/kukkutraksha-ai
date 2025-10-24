import express from 'express';
const router = express.Router();
import Farm from '../models/Farm.js';
import Admin from '../models/Admin.js';
import { verifyToken } from '../middleware/auth.js';

// Register new user (farmer or admin)
router.post('/register', async (req, res) => {
  try {
    const { uid, email, realId, farmName, address, district, location, userType, idToken } = req.body;

    if (userType === 'farmer') {
      // Check if real ID already exists
      const existingFarm = await Farm.findOne({ realId });
      if (existingFarm) {
        return res.status(400).json({ error: 'Real ID already registered' });
      }

      // Create new farm
      const farm = new Farm({
        userId: uid,
        email,
        realId,
        farmName,
        address,
        district,
        location,
      });

      await farm.save();

      res.status(201).json({
        message: 'Farmer registered successfully',
        farmId: farm._id,
        name: farmName,
      });
    } else if (userType === 'admin') {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ error: 'Admin already registered' });
      }

      // Create new admin
      const admin = new Admin({
        userId: uid,
        email,
        name: req.body.name || 'Admin',
      });

      await admin.save();

      res.status(201).json({
        message: 'Admin registered successfully',
        adminId: admin._id,
        name: admin.name,
      });
    } else {
      res.status(400).json({ error: 'Invalid user type' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify user and get details
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { userType } = req.body;
    const uid = req.user.uid;

    if (userType === 'farmer') {
      const farm = await Farm.findOne({ userId: uid });
      
      if (!farm) {
        return res.status(404).json({ error: 'Farm not found' });
      }

      res.json({
        farmId: farm._id,
        name: farm.farmName,
        email: farm.email,
        location: farm.location,
        district: farm.district,
      });
    } else if (userType === 'admin') {
      const admin = await Admin.findOne({ userId: uid });
      
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      res.json({
        adminId: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      });
    } else {
      res.status(400).json({ error: 'Invalid user type' });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
