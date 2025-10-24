import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
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
  role: {
    type: String,
    enum: ['farm_owner', 'field_worker', 'admin', 'veterinarian'],
    default: 'farm_owner',
    required: true,
  },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: function() {
      return this.role === 'field_worker' || this.role === 'farm_owner';
    }
  },
  // For farm owners
  ownedFarms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
  }],
  // MFA Settings
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaSecret: {
    type: String,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  phoneVerificationCode: {
    type: String,
  },
  phoneVerificationExpiry: {
    type: Date,
  },
  // Field Worker Specific
  employeeId: {
    type: String,
  },
  dateOfJoining: {
    type: Date,
  },
  designation: {
    type: String, // e.g., "Caretaker", "Supervisor", "Technician"
  },
  assignedZones: [String], // e.g., ["A", "B", "C"]
  skills: [String], // e.g., ["Feeding", "Cleaning", "Basic Maintenance"]
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
  // Access Control
  permissions: [{
    resource: String, // e.g., "sensors", "tasks", "reports"
    actions: [String], // e.g., ["read", "write", "delete"]
  }],
  lastLogin: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  accountLocked: {
    type: Boolean,
    default: false,
  },
  lockUntil: {
    type: Date,
  },
  // Location Tracking (for field workers)
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
    lastUpdated: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  profileImage: {
    type: String,
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
userSchema.index({ uid: 1 });
userSchema.index({ email: 1 });
userSchema.index({ farmId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'currentLocation': '2dsphere' });

// Methods
userSchema.methods.hasPermission = function(resource, action) {
  const permission = this.permissions.find(p => p.resource === resource);
  return permission && permission.actions.includes(action);
};

userSchema.methods.incrementLoginAttempts = function() {
  // Lock account after 5 failed attempts for 30 minutes
  if (this.loginAttempts + 1 >= 5 && !this.accountLocked) {
    this.accountLocked = true;
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
  this.loginAttempts += 1;
  return this.save();
};

userSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.accountLocked = false;
  this.lockUntil = undefined;
  return this.save();
};

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-unlock if lock period has expired
  if (this.accountLocked && this.lockUntil && this.lockUntil < Date.now()) {
    this.accountLocked = false;
    this.lockUntil = undefined;
    this.loginAttempts = 0;
  }
  
  next();
});

// Static method to get default permissions based on role
userSchema.statics.getDefaultPermissions = function(role) {
  const permissionMap = {
    farm_owner: [
      { resource: 'sensors', actions: ['read', 'write', 'control'] },
      { resource: 'tasks', actions: ['read', 'write', 'delete'] },
      { resource: 'reports', actions: ['read', 'write', 'export'] },
      { resource: 'devices', actions: ['read', 'write', 'control'] },
      { resource: 'workers', actions: ['read', 'write', 'delete'] },
      { resource: 'farm', actions: ['read', 'write'] },
    ],
    field_worker: [
      { resource: 'sensors', actions: ['read'] },
      { resource: 'tasks', actions: ['read', 'write'] },
      { resource: 'reports', actions: ['read'] },
      { resource: 'incidents', actions: ['read', 'write'] },
    ],
    veterinarian: [
      { resource: 'sensors', actions: ['read'] },
      { resource: 'reports', actions: ['read', 'write'] },
      { resource: 'health', actions: ['read', 'write'] },
    ],
    admin: [
      { resource: '*', actions: ['*'] },
    ],
  };
  
  return permissionMap[role] || [];
};

export default mongoose.model('User', userSchema);
