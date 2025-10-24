import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  // Farmer Personal Details
  ownerName: {
    type: String,
    required: true,
  },
  aadhaarNumber: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        return !v || /^\d{12}$/.test(v.replace(/\s/g, ''));
      },
      message: 'Aadhaar must be 12 digits'
    }
  },
  panCard: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        return !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
      },
      message: 'Invalid PAN card format'
    }
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{9,14}$/.test(v);
      },
      message: 'Invalid phone number'
    }
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    street: String,
    city: String,
    district: String,
    state: { type: String, default: 'West Bengal' },
    pincode: String,
    gpsCoordinates: {
      latitude: Number,
      longitude: Number,
    }
  },
  
  // Farm Information
  farmName: {
    type: String,
    required: true,
  },
  poultryFarmId: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  farmType: {
    type: String,
    enum: ['Broiler', 'Layer', 'Breeder', 'Mixed'],
    default: 'Broiler',
  },
  farmSize: {
    value: Number,
    unit: {
      type: String,
      enum: ['sq_feet', 'acres', 'hectares'],
      default: 'sq_feet',
    }
  },
  numberOfBirds: {
    type: Number,
    default: 0,
  },
  shedLayout: {
    numberOfSheds: { type: Number, default: 1 },
    shedCapacity: Number,
    description: String,
  },
  equipment: [{
    name: String, // e.g., "Auto Feeders", "Nipple Drinkers"
    type: {
      type: String,
      enum: ['Feeder', 'Drinker', 'Ventilation', 'Heating', 'Cooling', 'Lighting', 'Other'],
    },
    quantity: Number,
    brand: String,
    installationDate: Date,
    lastMaintenanceDate: Date,
    status: {
      type: String,
      enum: ['Operational', 'Maintenance Required', 'Faulty', 'Inactive'],
      default: 'Operational',
    }
  }],
  
  // Compliance & Documentation
  governmentLicense: {
    licenseNumber: String,
    issuingAuthority: String, // e.g., "West Bengal Animal Resources Development Department"
    issueDate: Date,
    expiryDate: Date,
    documentUrl: String,
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Pending Renewal', 'Suspended'],
      default: 'Pending Renewal',
    }
  },
  environmentalCompliance: {
    nocNumber: String, // NOC from Pollution Control Board
    issuingAuthority: String,
    issueDate: Date,
    expiryDate: Date,
    documentUrl: String,
  },
  insurance: {
    policyNumber: String,
    provider: String,
    policyType: String, // e.g., "Livestock Insurance", "Farm Insurance"
    coverageAmount: Number,
    startDate: Date,
    expiryDate: Date,
    documentUrl: String,
  },
  veterinaryCare: [{
    doctorName: String,
    licenseNumber: String,
    phone: String,
    visitDate: Date,
    purpose: String, // e.g., "Routine Checkup", "Disease Treatment", "Vaccination"
    findings: String,
    prescriptions: String,
    nextVisitDate: Date,
  }],
  
  district: {
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  // Multiple Sensors Configuration
  sensorZones: [{
    zone: String, // A, B, C, D, etc.
    deviceId: String, // Unique ESP32 device ID for this zone
    position: {
      row: Number,
      col: Number,
    },
    description: String, // e.g., "North-West Corner", "Feeding Area"
    isActive: Boolean,
  }],
  gridLayout: {
    rows: { type: Number, default: 3 },
    cols: { type: Number, default: 5 },
  },
  deviceId: {
    type: String,
    unique: true,
    sparse: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  currentStatus: {
    type: String,
    enum: ['safe', 'warning', 'critical'],
    default: 'safe',
  },
  lastDataReceived: {
    type: Date,
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

// Create geospatial index for location-based queries
farmSchema.index({ location: '2dsphere' });

farmSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Farm', farmSchema);
