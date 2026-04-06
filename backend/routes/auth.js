import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';
import { verifyToken } from '../middleware/auth.js';

// Register new user (farmer or admin)
router.post('/register', async (req, res) => {
  try {
    const { uid, email, realId, farmName, address, district, location, userType } = req.body;

    console.log('📝 Registration request:', { uid, email, userType, farmName });

    if (userType === 'farmer') {
      // Check if farm with this poultry_farm_id already exists
      if (realId) {
        const { data: existingFarm } = await supabase
          .from('farms')
          .select('id')
          .eq('poultry_farm_id', realId)
          .single();

        if (existingFarm) {
          return res.status(400).json({ error: 'Real ID already registered' });
        }
      }

      // Create farm in Supabase
      const { data: farm, error: farmError } = await supabase
        .from('farms')
        .insert({
          user_id: uid,
          farm_name: farmName,
          owner_name: farmName, // Can be updated later
          district: district,
          poultry_farm_id: realId,
          farm_type: 'Broiler',
          current_status: 'safe',
        })
        .select()
        .single();

      if (farmError) {
        console.error('❌ Supabase farm creation error:', farmError);
        throw farmError;
      }

      console.log('✅ Farm created:', farm.id);

      res.status(201).json({
        message: 'Farmer registered successfully',
        farmId: farm.id,
        name: farmName,
      });
    } else if (userType === 'admin') {
      // Update profile role to admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', uid);

      if (profileError) {
        console.error('❌ Supabase profile update error:', profileError);
        throw profileError;
      }

      console.log('✅ Admin profile updated');

      res.status(201).json({
        message: 'Admin registered successfully',
        adminId: uid,
        name: req.body.name || 'Admin',
      });
    } else {
      res.status(400).json({ error: 'Invalid user type' });
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});

// Verify user and get details
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { userType } = req.body;
    const uid = req.user.uid;

    console.log('🔍 Verifying user:', { uid, userType });

    if (userType === 'farmer') {
      const { data: farm, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', uid)
        .single();
      
      if (error || !farm) {
        console.error('❌ Farm not found:', error);
        return res.status(404).json({ error: 'Farm not found' });
      }

      console.log('✅ Farm verified:', farm.id);

      res.json({
        farmId: farm.id,
        name: farm.farm_name,
        email: req.user.email,
        district: farm.district,
        farmType: farm.farm_type,
        status: farm.current_status,
      });
    } else if (userType === 'admin') {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      
      if (error || !profile) {
        console.error('❌ Admin profile not found:', error);
        return res.status(404).json({ error: 'Admin not found' });
      }

      if (profile.role !== 'admin') {
        return res.status(403).json({ error: 'User is not an admin' });
      }

      console.log('✅ Admin verified:', uid);

      res.json({
        adminId: uid,
        name: req.user.email.split('@')[0],
        email: req.user.email,
        role: profile.role,
      });
    } else {
      res.status(400).json({ error: 'Invalid user type' });
    }
  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      details: error.message 
    });
  }
});

export default router;
