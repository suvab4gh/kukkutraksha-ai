import mongoose from 'mongoose';

const iotDeviceSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
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
    enum: [
      'Fan',
      'Exhaust Fan',
      'Ventilation System',
      'Heater',
      'Cooler',
      'Alarm',
      'Buzzer',
      'Light',
      'Feeder Motor',
      'Water Pump',
      'Misting System',
      'Temperature Controller',
      'Humidity Controller',
      'Other'
    ],
    required: true,
  },
  zone: {
    type: String, // e.g., "A", "B", "C" or "All"
  },
  location: {
    description: String, // e.g., "North Wall", "Center Ceiling"
  },
  status: {
    type: String,
    enum: ['Online', 'Offline', 'Error', 'Maintenance'],
    default: 'Offline',
  },
  currentState: {
    type: String,
    enum: ['On', 'Off', 'Auto'],
    default: 'Off',
  },
  // Automation Rules
  automationEnabled: {
    type: Boolean,
    default: false,
  },
  automationRules: [{
    ruleId: String,
    condition: {
      parameter: String, // e.g., "temperature", "ammonia", "co2"
      operator: String, // e.g., ">", "<", ">=", "<=", "=="
      threshold: Number,
    },
    action: {
      type: String,
      enum: ['Turn On', 'Turn Off', 'Set Speed', 'Send Alert'],
    },
    speed: Number, // For variable speed devices (0-100)
    enabled: { type: Boolean, default: true },
  }],
  // Manual Override
  manualOverride: {
    enabled: { type: Boolean, default: false },
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    overriddenAt: Date,
    expiresAt: Date, // Auto-reset to automation after this time
    reason: String,
  },
  // Device Specifications
  specs: {
    powerRating: String, // e.g., "500W"
    voltage: String, // e.g., "220V AC"
    speedLevels: Number, // For fans/motors
    manufacturer: String,
    model: String,
    installationDate: Date,
  },
  // Operation Logs
  lastCommandSent: {
    command: String,
    sentAt: Date,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  lastStatusUpdate: {
    type: Date,
  },
  operationHours: {
    type: Number,
    default: 0,
  },
  // Maintenance
  maintenanceSchedule: {
    frequency: String, // e.g., "Monthly", "Quarterly"
    lastMaintenance: Date,
    nextMaintenance: Date,
  },
  // MQTT Topic for control
  mqttTopic: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
iotDeviceSchema.index({ farmId: 1, deviceType: 1 });
iotDeviceSchema.index({ deviceId: 1 });
iotDeviceSchema.index({ status: 1 });

// Methods
iotDeviceSchema.methods.sendCommand = async function(command, userId) {
  this.lastCommandSent = {
    command,
    sentAt: new Date(),
    sentBy: userId,
  };
  this.lastStatusUpdate = new Date();
  return this.save();
};

iotDeviceSchema.methods.enableManualOverride = function(userId, reason, durationMinutes = 60) {
  this.manualOverride = {
    enabled: true,
    overriddenBy: userId,
    overriddenAt: new Date(),
    expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000),
    reason,
  };
  this.automationEnabled = false;
  return this.save();
};

iotDeviceSchema.methods.disableManualOverride = function() {
  this.manualOverride = {
    enabled: false,
  };
  this.automationEnabled = true;
  return this.save();
};

iotDeviceSchema.methods.checkAutomationRule = function(sensorData) {
  if (!this.automationEnabled || !this.automationRules.length) {
    return null;
  }

  for (const rule of this.automationRules) {
    if (!rule.enabled) continue;

    const { parameter, operator, threshold } = rule.condition;
    const value = sensorData[parameter];

    if (value === undefined) continue;

    let conditionMet = false;
    switch (operator) {
      case '>':
        conditionMet = value > threshold;
        break;
      case '<':
        conditionMet = value < threshold;
        break;
      case '>=':
        conditionMet = value >= threshold;
        break;
      case '<=':
        conditionMet = value <= threshold;
        break;
      case '==':
        conditionMet = value === threshold;
        break;
    }

    if (conditionMet) {
      return rule.action;
    }
  }

  return null;
};

iotDeviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-disable manual override if expired
  if (this.manualOverride.enabled && this.manualOverride.expiresAt && this.manualOverride.expiresAt < Date.now()) {
    this.manualOverride.enabled = false;
    this.automationEnabled = true;
  }
  
  next();
});

export default mongoose.model('IoTDevice', iotDeviceSchema);
