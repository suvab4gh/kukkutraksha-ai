// DEPRECATED: This file was for MongoDB seeding
// The project now uses Supabase PostgreSQL
// For test data, use Supabase SQL Editor or create a new seeding script
// that uses the Supabase client

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Farm from './models/Farm.js';
import SensorData from './models/SensorData.js';
import Alert from './models/Alert.js';
import Admin from './models/Admin.js';

dotenv.config();

// Test farm data
const testFarms = [
  {
    userId: 'test-farmer-1',
    email: 'farmer1@test.com',
    realId: 'TEST123456789',
    farmName: 'Green Valley Poultry Farm',
    address: 'Barasat, North 24 Parganas',
    district: 'North 24 Parganas',
    location: {
      type: 'Point',
      coordinates: [88.4847, 22.7236], // Barasat coordinates
    },
    currentStatus: 'safe',
    isActive: true,
    lastDataReceived: new Date(),
  },
  {
    userId: 'test-farmer-2',
    email: 'farmer2@test.com',
    realId: 'TEST987654321',
    farmName: 'Sunrise Poultry Farm',
    address: 'Howrah, West Bengal',
    district: 'Howrah',
    location: {
      type: 'Point',
      coordinates: [88.2636, 22.5958], // Howrah coordinates
    },
    currentStatus: 'warning',
    isActive: true,
    lastDataReceived: new Date(),
  },
  {
    userId: 'test-farmer-3',
    email: 'farmer3@test.com',
    realId: 'TEST555666777',
    farmName: 'Golden Egg Farm',
    address: 'Kolkata, West Bengal',
    district: 'Kolkata',
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5726], // Kolkata coordinates
    },
    currentStatus: 'safe',
    isActive: true,
    lastDataReceived: new Date(),
  },
];

// Test sensor data
function generateSensorData(farmId, status = 'safe') {
  const baseData = {
    farmId,
    deviceId: `ESP32_${farmId.toString().slice(-6)}`,
    timestamp: new Date(),
  };

  if (status === 'safe') {
    return {
      ...baseData,
      ammonia: 20, // Safe: < 25 ppm
      co2: 2500, // Safe: < 3000 ppm
      temperature: 24, // Safe: 18-27°C
      tds: 400, // Safe: < 500 ppm
      humidity: 60, // Safe: 50-70%
      riskLevel: 'safe',
    };
  } else if (status === 'warning') {
    return {
      ...baseData,
      ammonia: 35, // Moderate: 25-40 ppm
      co2: 4000, // Moderate: 3000-5000 ppm
      temperature: 28, // Moderate
      tds: 600, // Moderate: 500-800 ppm
      humidity: 75, // Moderate
      riskLevel: 'moderate',
    };
  } else {
    return {
      ...baseData,
      ammonia: 45, // Danger: > 40 ppm
      co2: 5500, // Danger: > 5000 ppm
      temperature: 32, // Danger
      tds: 900, // Danger: > 800 ppm
      humidity: 85, // Danger
      riskLevel: 'danger',
    };
  }
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/poultry-monitoring';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing test data
    console.log('🧹 Clearing existing test data...');
    await Farm.deleteMany({ email: /test\.com/ });
    await SensorData.deleteMany({});
    await Alert.deleteMany({});
    await Admin.deleteMany({ email: /test\.com/ });
    console.log('✅ Cleared existing test data');

    // Insert test admin
    console.log('👤 Creating test admin...');
    const testAdmin = {
      userId: 'test-admin-1',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin',
      permissions: ['view_all_farms', 'manage_alerts', 'view_analytics'],
    };
    const createdAdmin = await Admin.create(testAdmin);
    console.log(`✅ Created admin: ${createdAdmin.name}`);

    // Insert test farms
    console.log('📝 Creating test farms...');
    const createdFarms = await Farm.insertMany(testFarms);
    console.log(`✅ Created ${createdFarms.length} test farms`);

    // Insert sensor data for each farm
    console.log('📊 Creating sensor data...');
    for (let i = 0; i < createdFarms.length; i++) {
      const farm = createdFarms[i];
      const status = farm.currentStatus;
      
      // Create current sensor data
      const currentData = generateSensorData(farm._id, status);
      await SensorData.create(currentData);

      // Create historical data (last 24 hours)
      const historicalData = [];
      for (let hour = 23; hour >= 0; hour--) {
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - hour);
        
        const data = generateSensorData(farm._id, status);
        data.timestamp = timestamp;
        
        // Add some variation
        data.temperature += Math.random() * 2 - 1;
        data.humidity += Math.random() * 5 - 2.5;
        data.ammonia += Math.random() * 3 - 1.5;
        
        historicalData.push(data);
      }
      
      await SensorData.insertMany(historicalData);
      console.log(`  ✓ Created sensor data for ${farm.farmName}`);
    }
    console.log('✅ Created sensor data for all farms');

    // Create test alerts for warning farm
    console.log('🚨 Creating test alerts...');
    const warningFarm = createdFarms.find(f => f.currentStatus === 'warning');
    if (warningFarm) {
      const testAlerts = [
        {
          farmId: warningFarm._id,
          alertType: 'high_ammonia',
          severity: 'high',
          title: '⚠️ High Ammonia Levels',
          message: 'Ammonia level (35 ppm) exceeds safe threshold. Immediate ventilation required.',
          isRead: false,
          isResolved: false,
        },
        {
          farmId: warningFarm._id,
          alertType: 'high_co2',
          severity: 'medium',
          title: '⚠️ Elevated CO₂ Levels',
          message: 'CO₂ level (4000 ppm) is in moderate range. Monitor closely.',
          isRead: false,
          isResolved: false,
        },
      ];
      
      await Alert.insertMany(testAlerts);
      console.log(`✅ Created ${testAlerts.length} test alerts`);
    }

    // Print summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 TEST DATA SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('👤 ADMIN ACCOUNT');
    console.log(`   Name: ${createdAdmin.name}`);
    console.log(`   Email: ${createdAdmin.email}`);
    console.log(`   User ID: ${createdAdmin.userId}`);
    console.log(`   Role: ${createdAdmin.role}`);
    console.log(`   Admin ID: ${createdAdmin._id}`);
    console.log('\n');
    
    for (const farm of createdFarms) {
      console.log(`🏠 ${farm.farmName}`);
      console.log(`   Email: ${farm.email}`);
      console.log(`   User ID: ${farm.userId}`);
      console.log(`   Real ID: ${farm.realId}`);
      console.log(`   District: ${farm.district}`);
      console.log(`   Status: ${farm.currentStatus}`);
      console.log(`   Farm ID: ${farm._id}`);
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Test data seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 To access the dashboards:');
    console.log('\n👨‍🌾 FARMER ACCESS:');
    console.log('   1. Go to http://localhost:3000/test');
    console.log('   2. Auto-login as farmer and view dashboard');
    console.log('   3. Or use any email (e.g., farmer1@test.com) at login page\n');
    console.log('👨‍💼 ADMIN ACCESS:');
    console.log('   1. Go to http://localhost:3000/test-admin');
    console.log('   2. Auto-login as admin and view all farms');
    console.log('   3. Or use admin@test.com at login page\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
