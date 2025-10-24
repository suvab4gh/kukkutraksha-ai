import cron from 'cron';
import Farm from '../models/Farm.js';
import Alert from '../models/Alert.js';

// Check for offline sensors every 30 minutes
const checkOfflineSensors = new cron.CronJob('*/30 * * * *', async () => {
  try {
    console.log('🔍 Checking for offline sensors...');
    
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const offlineFarms = await Farm.find({
      isActive: true,
      lastDataReceived: { $lt: thirtyMinutesAgo },
    });

    for (const farm of offlineFarms) {
      // Check if alert already exists
      const existingAlert = await Alert.findOne({
        farmId: farm._id,
        alertType: 'sensor_offline',
        isResolved: false,
      });

      if (!existingAlert) {
        const alert = new Alert({
          farmId: farm._id,
          alertType: 'sensor_offline',
          severity: 'medium',
          title: '🔌 Sensor Offline',
          message: `No data received from ${farm.farmName} for more than 30 minutes. Please check sensor connectivity.`,
        });

        await alert.save();
        console.log(`🔌 Offline alert created for farm: ${farm.farmName}`);

        // Broadcast alert
        if (global.broadcastSensorData) {
          global.broadcastSensorData({
            type: 'sensor_offline',
            alert: alert.toObject(),
            farmId: farm._id,
            farmName: farm.farmName,
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking offline sensors:', error);
  }
});

// Clean up old resolved alerts every day at 2 AM
const cleanupOldAlerts = new cron.CronJob('0 2 * * *', async () => {
  try {
    console.log('🧹 Cleaning up old alerts...');
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await Alert.deleteMany({
      isResolved: true,
      resolvedAt: { $lt: thirtyDaysAgo },
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} old alerts`);
  } catch (error) {
    console.error('❌ Error cleaning up alerts:', error);
  }
});

// Start cron jobs
checkOfflineSensors.start();
cleanupOldAlerts.start();

console.log('⏰ Cron jobs initialized');

export { checkOfflineSensors, cleanupOldAlerts };
