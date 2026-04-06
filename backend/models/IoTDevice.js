import mongoose from 'mongoose';

const iotDeviceSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
    index: true,
  },
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  deviceName: {
    type: String,
    required: true,
  },
  deviceType: {
    type: String,
    enum: ['fan', 'heater', 'fogger', 'feeder', 'water_pump', 'light', 'ventilation'],
    required: true,
  },
  mqttTopic: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Online', 'Offline', 'Error'],
    default: 'Offline',
  },
  currentState: {
    type: String,
    enum: ['On', 'Off', 'Auto'],
    default: 'Off',
  },
  currentSpeed: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  automationEnabled: {
    type: Boolean,
    default: false,
  },
  automationRules: [{
    parameter: {
      type: String,
      enum: ['ammonia', 'co2', 'temperature', 'humidity', 'tds'],
    },
    operator: {
      type: String,
      enum: ['>', '<', '>=', '<=', '=='],
    },
    threshold: {
      type: Number,
    },
    action: {
      type: String,
      enum: ['Turn On', 'Turn Off', 'Set Speed'],
    },
    speed: {
      type: Number,
      min: 0,
      max: 100,
    },
  }],
  manualOverride: {
    enabled: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
  },
  lastCommandSent: {
    command: String,
    sentAt: Date,
    sentBy: mongoose.Schema.Types.ObjectId, // null if automated
  },
  lastStatusUpdate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Method to check if automation rule is triggered
iotDeviceSchema.methods.checkAutomationRule = function(sensorData) {
  if (!this.automationEnabled || this.manualOverride.enabled) {
    return null;
  }

  for (const rule of this.automationRules) {
    const sensorValue = sensorData[rule.parameter];
    
    if (sensorValue === undefined) continue;

    let conditionMet = false;
    
    switch (rule.operator) {
      case '>':
        conditionMet = sensorValue > rule.threshold;
        break;
      case '<':
        conditionMet = sensorValue < rule.threshold;
        break;
      case '>=':
        conditionMet = sensorValue >= rule.threshold;
        break;
      case '<=':
        conditionMet = sensorValue <= rule.threshold;
        break;
      case '==':
        conditionMet = sensorValue == rule.threshold;
        break;
    }

    if (conditionMet) {
      return {
        type: rule.action,
        speed: rule.speed,
        parameter: rule.parameter,
        value: sensorValue,
        threshold: rule.threshold,
      };
    }
  }

  return null;
};

const IoTDevice = mongoose.model('IoTDevice', iotDeviceSchema);

export default IoTDevice;
