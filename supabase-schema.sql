-- ============================================
-- COMPLETE SUPABASE SCHEMA FOR POULTRY MONITORING
-- Architecture: Simple, Clean, Efficient
-- Database: Supabase PostgreSQL (replaces MongoDB)
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For location data

-- ============================================
-- 1. PROFILES TABLE (User Authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'bn')), -- English or Bengali
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup with language preference
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, language)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer'),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. FARMS TABLE (Farmer Information)
-- ============================================
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  farm_name TEXT NOT NULL,
  owner_name TEXT,
  phone TEXT,
  district TEXT NOT NULL,
  address TEXT,
  location GEOGRAPHY(POINT, 4326), -- PostGIS for geospatial queries
  farm_type TEXT DEFAULT 'Broiler' CHECK (farm_type IN ('Broiler', 'Layer', 'Mixed')),
  poultry_farm_id TEXT UNIQUE, -- Government issued ID
  aadhaar_number TEXT,
  pan_card TEXT,
  license_status TEXT DEFAULT 'Pending' CHECK (license_status IN ('Pending', 'Approved', 'Rejected')),
  current_status TEXT DEFAULT 'active' CHECK (current_status IN ('active', 'inactive', 'safe', 'warning', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_farms_district ON farms(district);
CREATE INDEX IF NOT EXISTS idx_farms_status ON farms(current_status);

-- ============================================
-- 3. SENSOR_DATA TABLE (IoT Time-Series Data)
-- ============================================
CREATE TABLE IF NOT EXISTS sensor_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
  device_id TEXT NOT NULL,
  zone TEXT, -- A, B, C, D zones
  
  -- Sensor readings
  ammonia NUMERIC(5,2) NOT NULL,
  co2 NUMERIC(6,2) NOT NULL,
  temperature NUMERIC(4,2) NOT NULL,
  tds NUMERIC(6,2) NOT NULL,
  humidity NUMERIC(4,2) NOT NULL,
  
  -- Risk assessment
  risk_level TEXT DEFAULT 'safe' CHECK (risk_level IN ('safe', 'moderate', 'danger')),
  risk_score NUMERIC(5,2) DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  overall_status TEXT DEFAULT 'safe' CHECK (overall_status IN ('safe', 'warning', 'critical')),
  
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for time-series queries
CREATE INDEX IF NOT EXISTS idx_sensor_farm_time ON sensor_data(farm_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_device ON sensor_data(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_timestamp ON sensor_data(timestamp DESC);

-- Auto-delete old data (keep last 90 days)
-- Note: Supabase doesn't support TTL, so we'll use a scheduled function
CREATE OR REPLACE FUNCTION cleanup_old_sensor_data()
RETURNS void AS $$
BEGIN
  DELETE FROM sensor_data WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. ALERTS TABLE (Notifications & Warnings)
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
  
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'disease_detected', 'high_risk', 'nearby_outbreak', 
    'sensor_offline', 'threshold_breach', 'environmental'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Optional sensor context
  sensor_data JSONB, -- {ammonia: 45, co2: 3000, temperature: 35, etc}
  affected_farms JSONB, -- [{farmId, farmName, distance}, ...]
  
  is_read BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for alert queries
CREATE INDEX IF NOT EXISTS idx_alerts_farm_created ON alerts(farm_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_read_severity ON alerts(is_read, severity);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(is_resolved, created_at DESC);

-- ============================================
-- 5. TASKS TABLE (Farm Management Tasks)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('feeding', 'vaccination', 'cleaning', 'inspection', 'medication', 'other')),
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  assigned_to TEXT, -- Name or user ID
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for task queries
CREATE INDEX IF NOT EXISTS idx_tasks_farm_status ON tasks(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- ============================================
-- 6. INCIDENTS TABLE (Disease Outbreak Records)
-- ============================================
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
  
  incident_type TEXT NOT NULL CHECK (incident_type IN (
    'disease_outbreak', 'mortality', 'equipment_failure', 
    'environmental_issue', 'biosecurity_breach', 'other'
  )),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  affected_count INTEGER DEFAULT 0, -- Number of birds affected
  mortality_count INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'closed')),
  
  actions_taken TEXT,
  veterinary_report TEXT,
  
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for incident queries
CREATE INDEX IF NOT EXISTS idx_incidents_farm_status ON incidents(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity, reported_at DESC);

-- ============================================
-- 7. IOT_DEVICES TABLE (Device Registry)
-- ============================================
CREATE TABLE IF NOT EXISTS iot_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
  
  device_id TEXT UNIQUE NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('sensor', 'controller', 'camera', 'actuator')),
  
  zone TEXT, -- Physical zone location
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance', 'error')),
  
  last_seen TIMESTAMPTZ,
  firmware_version TEXT,
  battery_level NUMERIC(3,0) CHECK (battery_level >= 0 AND battery_level <= 100),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for device queries
CREATE INDEX IF NOT EXISTS idx_devices_farm ON iot_devices(farm_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON iot_devices(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Farmers can read own farm" ON farms;
DROP POLICY IF EXISTS "Farmers can update own farm" ON farms;
DROP POLICY IF EXISTS "Admins can read all farms" ON farms;
DROP POLICY IF EXISTS "Farmers can read own sensor data" ON sensor_data;
DROP POLICY IF EXISTS "Admins can read all sensor data" ON sensor_data;
DROP POLICY IF EXISTS "Farmers can read own alerts" ON alerts;
DROP POLICY IF EXISTS "Farmers can update own alerts" ON alerts;
DROP POLICY IF EXISTS "Admins can read all alerts" ON alerts;
DROP POLICY IF EXISTS "Farmers can manage own tasks" ON tasks;
DROP POLICY IF EXISTS "Farmers can manage own incidents" ON incidents;
DROP POLICY IF EXISTS "Admins can read all incidents" ON incidents;
DROP POLICY IF EXISTS "Farmers can read own devices" ON iot_devices;

-- PROFILES
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- FARMS
CREATE POLICY "Farmers can read own farm" ON farms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Farmers can update own farm" ON farms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all farms" ON farms
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- SENSOR DATA
CREATE POLICY "Farmers can read own sensor data" ON sensor_data
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = sensor_data.farm_id AND farms.user_id = auth.uid())
  );

CREATE POLICY "Admins can read all sensor data" ON sensor_data
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Service role can insert sensor data
CREATE POLICY "Service can insert sensor data" ON sensor_data
  FOR INSERT WITH CHECK (true);

-- ALERTS
CREATE POLICY "Farmers can read own alerts" ON alerts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = alerts.farm_id AND farms.user_id = auth.uid())
  );

CREATE POLICY "Farmers can update own alerts" ON alerts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = alerts.farm_id AND farms.user_id = auth.uid())
  );

CREATE POLICY "Admins can read all alerts" ON alerts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- TASKS
CREATE POLICY "Farmers can manage own tasks" ON tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = tasks.farm_id AND farms.user_id = auth.uid())
  );

-- INCIDENTS
CREATE POLICY "Farmers can manage own incidents" ON incidents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = incidents.farm_id AND farms.user_id = auth.uid())
  );

CREATE POLICY "Admins can read all incidents" ON incidents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- IOT DEVICES
CREATE POLICY "Farmers can read own devices" ON iot_devices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = iot_devices.farm_id AND farms.user_id = auth.uid())
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_farms_updated_at ON farms;
CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON farms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents;
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_devices_updated_at ON iot_devices;
CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON iot_devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA / SEED (Optional)
-- ============================================

-- Example: Create a default admin user after first user signs up
-- You can manually create admin by updating the profile role to 'admin'

-- ============================================
-- MAINTENANCE & CLEANUP
-- ============================================

-- Schedule this function to run daily via Supabase SQL Editor or pg_cron
-- CALL cleanup_old_sensor_data();

-- ============================================
-- END OF SCHEMA
-- ============================================
