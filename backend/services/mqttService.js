import mqtt from 'mqtt';
import { db } from '../config/firebase.js';
import Alert from '../models/Alert.js';

class MQTTService {
  constructor() {
    this.client = null;
    this.brokerUrl = process.env.MQTT_BROKER_URL;
    this.options = {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
    };
  }

  connect() {
    // Check if MQTT credentials are configured
    if (
      !this.brokerUrl || 
      !this.options.username || 
      !this.options.password ||
      this.brokerUrl === '56406e42c9674164ae68d36ac6812a11.s1.eu.hivemq.cloud' && this.options.password === 'YOUR_MQTT_PASSWORD_HERE'
    ) {
      console.warn('⚠️  MQTT broker credentials not configured. MQTT service will be disabled.');
      console.warn('   Update MQTT_BROKER_URL, MQTT_USERNAME, and MQTT_PASSWORD in backend/.env');
      console.warn('   Get credentials from HiveMQ Cloud Console: https://www.hivemq.com/cloud/console');
      return;
    }

    // Add protocol prefix if missing
    let brokerUrl = this.brokerUrl;
    if (!brokerUrl.startsWith('mqtt://') && !brokerUrl.startsWith('wss://')) {
      brokerUrl = `mqtts://${brokerUrl}`;
    }

    console.log('🔗 Connecting to HiveMQ broker...');
    console.log(`   Broker: ${brokerUrl}`);
    
    this.client = mqtt.connect(brokerUrl, this.options);

    this.client.on('connect', () => {
      console.log('✅ Connected to HiveMQ broker');
      this.subscribe();
    });

    this.client.on('message', async (topic, message) => {
      await this.handleMessage(topic, message);
    });

    this.client.on('error', (error) => {
      console.error('❌ MQTT Error:', error);
    });

    this.client.on('close', () => {
      console.log('🔌 MQTT connection closed');
    });

    this.client.on('reconnect', () => {
      console.log('🔄 Reconnecting to MQTT broker...');
    });
  }

  subscribe() {
    const topic = process.env.MQTT_TOPIC || 'poultry/sensors/#';
    this.client.subscribe(topic, (err) => {
      if (err) {
        console.error('❌ Subscription error:', err);
      } else {
        console.log(`📡 Subscribed to topic: ${topic}`);
      }
    });
  }

  async handleMessage(topic, message) {
    try {
      const payload = JSON.parse(message.toString());
      console.log(`📥 Received data from ${topic}:`, payload);

      // Extract device ID from topic (e.g., poultry/sensors/ESP32_001)
      const deviceId = topic.split('/').pop();

      // Find farm by device ID in Firestore
      const farmsRef = db.collection('farms');
      const farmSnapshot = await farmsRef.where('deviceId', '==', deviceId).where('isActive', '==', true).limit(1).get();
      
      if (farmSnapshot.empty) {
        console.warn(`⚠️ No farm found for device: ${deviceId}`);
        return;
      }

      const farmDoc = farmSnapshot.docs[0];
      const farm = { id: farmDoc.id, ...farmDoc.data() };

      // Calculate risk levels
      const riskLevel = this.calculateRiskLevel(payload);
      const overallStatus = this.calculateOverallStatus(payload);

      // Store sensor data in Firestore
      const sensorDataRef = await db.collection('sensor_data').add({
        farmId: farm.id,
        farmName: farm.farmName,
        deviceId,
        ammonia: payload.ammonia,
        co2: payload.co2,
        temperature: payload.temperature,
        tds: payload.tds,
        humidity: payload.humidity,
        riskLevel,
        overallStatus,
        timestamp: new Date().toISOString(),
      });

      // Update farm status in Firestore
      await farmsRef.doc(farm.id).update({
        currentStatus: overallStatus,
        lastDataReceived: new Date().toISOString(),
      });

      // Check for alerts
      await this.checkAndCreateAlerts(farm, payload, overallStatus);

      // Check proximity alerts
      await this.checkProximityAlerts(farm, overallStatus);

      // Broadcast to WebSocket clients
      if (global.broadcastSensorData) {
        global.broadcastSensorData({
          type: 'sensor_update',
          farmId: farm.id,
          farmName: farm.farmName,
          data: {
            ...payload,
            riskLevel,
            overallStatus,
            timestamp: new Date().toISOString(),
          },
        });
      }

      console.log(`✅ Sensor data saved for farm: ${farm.farmName}`);
    } catch (error) {
      console.error('❌ Error handling MQTT message:', error);
    }
  }

  calculateRiskLevel(data) {
    const thresholds = {
      ammonia: { safe: 25, moderate: 40 },
      co2: { safe: 3000, moderate: 5000 },
      temperature: { min: 18, max: 27 },
      tds: { safe: 500, moderate: 800 },
      humidity: { min: 50, max: 70 },
    };

    let dangerCount = 0;
    let moderateCount = 0;

    if (data.ammonia > thresholds.ammonia.moderate) dangerCount++;
    else if (data.ammonia > thresholds.ammonia.safe) moderateCount++;

    if (data.co2 > thresholds.co2.moderate) dangerCount++;
    else if (data.co2 > thresholds.co2.safe) moderateCount++;

    if (data.temperature < thresholds.temperature.min || data.temperature > thresholds.temperature.max + 5) dangerCount++;
    else if (data.temperature < thresholds.temperature.min + 3 || data.temperature > thresholds.temperature.max + 3) moderateCount++;

    if (data.tds > thresholds.tds.moderate) dangerCount++;
    else if (data.tds > thresholds.tds.safe) moderateCount++;

    if (data.humidity < thresholds.humidity.min - 10 || data.humidity > thresholds.humidity.max + 10) dangerCount++;
    else if (data.humidity < thresholds.humidity.min || data.humidity > thresholds.humidity.max) moderateCount++;

    if (dangerCount >= 2) return 'danger';
    if (dangerCount >= 1 || moderateCount >= 3) return 'moderate';
    return 'safe';
  }

  calculateOverallStatus(data) {
    const riskLevel = this.calculateRiskLevel(data);
    if (riskLevel === 'danger') return 'critical';
    if (riskLevel === 'moderate') return 'warning';
    return 'safe';
  }

  async checkAndCreateAlerts(farm, sensorData, overallStatus) {
    // Check if alert already exists for this farm today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAlert = await Alert.findOne({
      farmId: farm.id,
      alertType: 'disease_detected',
      isResolved: false,
      createdAt: { $gte: today },
    });

    if (overallStatus === 'critical' && !existingAlert) {
      const alert = await Alert.create({
        farmId: farm.id,
        farmName: farm.farmName,
        alertType: 'disease_detected',
        severity: 'critical',
        title: '🚨 Disease Detected - Immediate Action Required',
        message: `Critical conditions detected at ${farm.farmName}. Multiple sensor readings indicate high disease risk.`,
        sensorData: {
          ammonia: sensorData.ammonia,
          co2: sensorData.co2,
          temperature: sensorData.temperature,
          tds: sensorData.tds,
          humidity: sensorData.humidity,
        },
        isResolved: false,
      });

      console.log(`🚨 Critical alert created for farm: ${farm.farmName}`);

      // Broadcast alert
      if (global.broadcastSensorData) {
        global.broadcastSensorData({
          type: 'alert',
          alert: alert.toObject(),
          farmId: farm.id,
          farmName: farm.farmName,
        });
      }
    } else if (overallStatus === 'warning' && !existingAlert) {
      const alert = await Alert.create({
        farmId: farm.id,
        farmName: farm.farmName,
        alertType: 'high_risk',
        severity: 'high',
        title: '⚠️ High Risk Conditions Detected',
        message: `Warning: ${farm.farmName} is showing elevated risk levels. Monitor closely.`,
        sensorData: {
          ammonia: sensorData.ammonia,
          co2: sensorData.co2,
          temperature: sensorData.temperature,
          tds: sensorData.tds,
          humidity: sensorData.humidity,
        },
        isResolved: false,
      });

      console.log(`⚠️ Warning alert created for farm: ${farm.farmName}`);
    }
  }

  async checkProximityAlerts(farm, overallStatus) {
    // Simplified proximity check for Firestore (no geospatial queries)
    // This would require storing all farms and calculating distances manually
    // For now, we'll skip this feature or implement it differently
    console.log('ℹ️ Proximity alerts require geospatial indexing - skipped for Firestore');
  }

  publish(topic, message) {
    if (this.client && this.client.connected) {
      this.client.publish(topic, JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
    }
  }

  // Publish control command to device
  publishControlCommand(topic, payload) {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        console.warn('⚠️  MQTT client not connected. Cannot send control command.');
        return resolve(false);
      }

      const message = JSON.stringify(payload);
      this.client.publish(topic, message, { qos: 1 }, (error) => {
        if (error) {
          console.error('❌ Failed to publish control command:', error);
          reject(error);
        } else {
          console.log(`✅ Control command published to ${topic}:`, payload);
          resolve(true);
        }
      });
    });
  }

  // Check automation rules and trigger devices
  async checkAutomationRules(sensorData, farmId) {
    try {
      const IoTDevice = (await import('../models/IoTDevice.js')).default;
      const devices = await IoTDevice.find({
        farmId,
        automationEnabled: true,
        status: 'Online',
        'manualOverride.enabled': false,
      });

      for (const device of devices) {
        const action = device.checkAutomationRule(sensorData);
        
        if (action) {
          const commandPayload = {
            deviceId: device.deviceId,
            command: action.type === 'Turn On' ? 'ON' : action.type === 'Turn Off' ? 'OFF' : 'SET_SPEED',
            state: action.type === 'Turn On' ? 'On' : action.type === 'Turn Off' ? 'Off' : device.currentState,
            speed: action.speed,
            timestamp: new Date().toISOString(),
            triggeredBy: 'automation',
            reason: `${sensorData.parameter || 'Sensor'} threshold exceeded`,
          };

          // Update device state
          device.currentState = commandPayload.state;
          device.lastCommandSent = {
            command: commandPayload.command,
            sentAt: new Date(),
            sentBy: null, // Automated
          };
          device.lastStatusUpdate = new Date();
          await device.save();

          // Publish MQTT command
          await this.publishControlCommand(device.mqttTopic, commandPayload);

          console.log(`🤖 Automation triggered for ${device.deviceName}:`, action.type);
        }
      }
    } catch (error) {
      console.error('Error checking automation rules:', error);
    }
  }
}

const mqttService = new MQTTService();

// Export individual functions for use in routes
export const publishControlCommand = (topic, payload) => {
  return mqttService.publishControlCommand(topic, payload);
};

export default mqttService;
