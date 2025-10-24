# 🚀 Supabase Setup Guide

Complete guide to set up Supabase for the Poultry IoT Monitoring System.

## Why Supabase?

✅ **Open Source** - Can self-host if needed  
✅ **PostgreSQL** - More powerful than MongoDB for relational data  
✅ **Built-in Auth** - Simpler than Firebase  
✅ **Real-time** - Perfect for sensor data subscriptions  
✅ **Free Tier** - Generous limits (500MB database, 50MB file storage)  
✅ **No Firebase Complexity** - Easier setup and deployment

---

## Step 1: Create Supabase Project

1. Go to https://supabase.com/
2. Click **"Start your project"** or **"Sign in"**
3. Sign in with GitHub (recommended)
4. Click **"New project"**
5. Fill in:
   - **Organization**: Create new or select existing
   - **Project name**: `poultry-monitoring`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `ap-south-1` for India)
   - **Pricing Plan**: Free
6. Click **"Create new project"**
7. Wait ~2 minutes for project to be provisioned

---

## Step 2: Get API Keys

1. In your Supabase project dashboard
2. Click **"Settings"** (gear icon) in left sidebar
3. Click **"API"**
4. You'll see:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...(long string)`
   - **service_role key**: `eyJhbGc...(long string)` (keep this secret!)

---

## Step 3: Update Frontend Environment Variables

Edit `.env.local` in the **root directory**:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYWd3eGt6ZWV4cHFtanVlZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUwNzYwNTksImV4cCI6MjAxMDY1MjA1OX0.XXXXX

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# MQTT Configuration (optional for now)
NEXT_PUBLIC_MQTT_BROKER_URL=wss://your-hivemq-broker.com:8884/mqtt
NEXT_PUBLIC_MQTT_USERNAME=your_username
NEXT_PUBLIC_MQTT_PASSWORD=your_password
```

---

## Step 4: Update Backend Environment Variables

Edit `backend/.env`:

```env
# MongoDB Configuration (keeping for sensor data for now)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/poultry-monitoring?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYWd3eGt6ZWV4cHFtanVlZmlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NTA3NjA1OSwiZXhwIjoyMDEwNjUyMDU5fQ.XXXXX

# MQTT Configuration
MQTT_BROKER_URL=mqtt://your-hivemq-broker.com:1883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
MQTT_TOPIC=poultry/sensors/#

# CORS Origin
CORS_ORIGIN=http://localhost:3000

# Proximity Alert Distance (km)
ALERT_RADIUS_KM=5
```

---

## Step 5: Enable Email Authentication

1. In Supabase Dashboard → **Authentication** (left sidebar)
2. Should already be on **"Providers"** tab
3. **Email** provider is enabled by default ✅
4. Scroll down to **"Email Auth"** section
5. **Disable** "Confirm email" for testing (you can enable later for production)
6. Click **"Save"**

---

## Step 6: Create Database Schema

### Option A: Using SQL Editor (Recommended)

1. In Supabase Dashboard → **SQL Editor** (left sidebar)
2. Click **"+ New query"**
3. Paste the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'admin', 'field_worker', 'veterinarian')),
  display_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create farms table
CREATE TABLE public.farms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  real_id TEXT NOT NULL,
  farm_name TEXT NOT NULL,
  address TEXT,
  district TEXT NOT NULL,
  location GEOGRAPHY(POINT) NOT NULL,
  current_status TEXT CHECK (current_status IN ('safe', 'warning', 'critical')) DEFAULT 'safe',
  is_active BOOLEAN DEFAULT TRUE,
  last_data_received TIMESTAMP WITH TIME ZONE,
  
  -- Farmer details
  owner_name TEXT,
  aadhaar_number TEXT,
  pan_card TEXT,
  farm_type TEXT CHECK (farm_type IN ('Broiler', 'Layer', 'Breeder', 'Mixed')),
  farm_size NUMERIC,
  number_of_birds INTEGER,
  license_number TEXT,
  license_status TEXT CHECK (license_status IN ('Active', 'Expired', 'Pending')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sensor_data table
CREATE TABLE public.sensor_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  zone TEXT NOT NULL,
  ammonia NUMERIC NOT NULL,
  co2 NUMERIC NOT NULL,
  temperature NUMERIC NOT NULL,
  tds NUMERIC NOT NULL,
  humidity NUMERIC NOT NULL,
  risk_score NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  message TEXT NOT NULL,
  zone TEXT,
  value NUMERIC,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_farms_user_id ON public.farms(user_id);
CREATE INDEX idx_farms_location ON public.farms USING GIST(location);
CREATE INDEX idx_sensor_data_farm_id ON public.sensor_data(farm_id);
CREATE INDEX idx_sensor_data_timestamp ON public.sensor_data(timestamp DESC);
CREATE INDEX idx_alerts_farm_id ON public.alerts(farm_id);
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Farms policies
CREATE POLICY "Users can view own farms" ON public.farms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own farms" ON public.farms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farms" ON public.farms
  FOR UPDATE USING (auth.uid() = user_id);

-- Sensor data policies
CREATE POLICY "Users can view own farm sensor data" ON public.sensor_data
  FOR SELECT USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

-- Alerts policies
CREATE POLICY "Users can view own farm alerts" ON public.alerts
  FOR SELECT USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, display_name)
  VALUES (NEW.id, NEW.email, 'farmer', COALESCE(NEW.raw_user_meta_data->>'display_name', 'New Farmer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Click **"Run"** or press `Ctrl+Enter`
5. You should see "Success. No rows returned"

---

## Step 7: Test Authentication

### Start the servers:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Should see:
```
✓ MongoDB connected
✓ Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Should see:
```
✓ Ready on http://localhost:3000
```

### Test Registration:

1. Go to: http://localhost:3000/auth/login?type=farmer
2. Click **"Don't have an account? Register"**
3. Fill in:
   - Email: `test@farm.com`
   - Password: `Test@1234` (use show/hide button to verify)
   - Real ID: `123456789012`
   - Farm Name: `My Test Farm`
   - District: Select any
   - Latitude: `22.5726`
   - Longitude: `88.3639`
4. Click **"Create Account"**

If successful, you'll be redirected to the dashboard!

### Verify in Supabase:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. You should see your test user listed
3. Go to **Table Editor** → **profiles** → Should see profile created
4. Go to **farms** → Should see farm created

---

## Step 8: Quick Test (No Setup Required)

Want to test immediately without any setup?

Go to: http://localhost:3000/test

This bypasses all authentication and shows you the full dashboard with mock data!

---

## Migration Notes

### What Changed:

1. ✅ **Removed Firebase** (firebase, firebase-admin packages)
2. ✅ **Added Supabase** (@supabase/supabase-js)
3. ✅ **Updated Login/Register** - Now uses Supabase auth
4. ✅ **Updated Dashboard** - Uses Supabase session tokens
5. ✅ **Simpler Setup** - No Firebase config JSON needed

### What Stayed the Same:

- ✅ **MongoDB** - Still used for sensor data (you can migrate to Supabase later)
- ✅ **MQTT** - Still used for IoT communication
- ✅ **UI/UX** - All components work exactly the same
- ✅ **Features** - All features preserved (sensor health, farmer bio, etc.)

---

## Next Steps

### 1. Production Setup:

- Enable email confirmation in Supabase
- Add custom email templates
- Set up email provider (SMTP/SendGrid)

### 2. Migrate Everything to Supabase (Optional):

Replace MongoDB with Supabase for:
- Sensor data (use Supabase real-time for live updates)
- Alerts (with Supabase subscriptions)
- Task management
- Incident tracking

### 3. Deploy:

- **Backend**: Railway, Render, or Fly.io
- **Frontend**: Vercel (easiest - automatic Supabase integration)

---

## Troubleshooting

### Error: "Invalid API key"
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the **anon public** key (not service_role)
- No extra spaces or quotes in .env.local

### Error: "User already registered"
- Go to Supabase → Authentication → Users
- Delete the test user and try again

### Error: "Cannot read typed text"
- Fixed! Input fields now have visible black text
- Password field has show/hide toggle (eye icon)

### Error: "Network error"
- Backend not running - start with `cd backend && npm run dev`
- Check `NEXT_PUBLIC_API_URL=http://localhost:5000` in .env.local

---

## Database Schema Diagram

```
┌─────────────────┐
│  auth.users     │ (Supabase managed)
│  ─────────────  │
│  id (UUID) PK   │
│  email          │
│  created_at     │
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐
│  profiles       │
│  ─────────────  │
│  id (UUID) PK   │
│  email          │
│  role           │
│  display_name   │
│  phone          │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐      1:N     ┌──────────────────┐
│  farms          │◄──────────────│  sensor_data     │
│  ─────────────  │               │  ──────────────  │
│  id (UUID) PK   │               │  id (UUID) PK    │
│  user_id FK     │               │  farm_id FK      │
│  farm_name      │               │  zone            │
│  location       │               │  ammonia         │
│  district       │               │  co2             │
│  farm_type      │               │  temperature     │
│  license_status │               │  tds             │
└────────┬────────┘               │  humidity        │
         │                        │  timestamp       │
         │ 1:N                    └──────────────────┘
         ▼
┌─────────────────┐
│  alerts         │
│  ─────────────  │
│  id (UUID) PK   │
│  farm_id FK     │
│  type           │
│  severity       │
│  message        │
│  zone           │
└─────────────────┘
```

---

## Advantages Over Firebase

| Feature | Firebase | Supabase |
|---------|----------|----------|
| Database | Firestore (NoSQL) | PostgreSQL (SQL) |
| Auth Setup | Complex (3 files) | Simple (1 file) |
| Cost | Expensive at scale | More affordable |
| Data Export | Difficult | SQL dump anytime |
| Self-Hosting | ❌ No | ✅ Yes |
| Real-time | ✅ Yes | ✅ Yes |
| File Storage | ✅ Yes | ✅ Yes |
| Edge Functions | ✅ Yes | ✅ Yes |
| Learning Curve | High | Low (SQL knowledge) |
| Vendor Lock-in | High | Low (open source) |

---

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com/
- Project Issues: GitHub Issues

---

**Setup Complete! 🎉**

You now have a fully functional authentication system with Supabase, no Firebase dependency, and easier deployment!
