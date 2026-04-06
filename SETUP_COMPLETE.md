# 🚀 KukkutRaksha AI - Setup Complete

## ✅ Successfully Integrated APIs & Services

### 1. **Database: Supabase (PostgreSQL)**
- **URL**: `https://knkzfsmdjdybbdxmmipo.supabase.co`
- **Status**: ✅ Connected
- **Features**:
  - PostgreSQL database with TimescaleDB capabilities
  - Built-in Authentication
  - Real-time subscriptions
  - 500MB free tier storage

### 2. **MQTT Broker: HiveMQ Cloud**
- **Broker**: `56406e42c9674164ae68d36ac6812a11.s1.eu.hivemq.cloud`
- **TLS Port**: 8883 (ESP32 devices)
- **WebSocket Port**: 8884 (Web dashboard)
- **Status**: ⚠️ Waiting for credentials
- **Action Required**: Create username/password in [HiveMQ Console](https://www.hivemq.com/cloud/console)

### 3. **Weather Forecast: Open-Meteo API**
- **Status**: ✅ Integrated (No API key required)
- **Features**: 10-day weather forecasts for disease prediction

### 4. **Maps: OpenStreetMap + Leaflet**
- **Status**: ✅ Integrated (Free & open-source)

---

## 📁 Configuration Files Updated

### Backend (`/workspace/backend/.env`)
```env
SUPABASE_URL=https://knkzfsmdjdybbdxmmipo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

MQTT_BROKER_URL=56406e42c9674164ae68d36ac6812a11.s1.eu.hivemq.cloud
MQTT_PORT=8883
MQTT_USERNAME=kukkutraksha_user
MQTT_PASSWORD=YOUR_MQTT_PASSWORD_HERE
```

### Frontend (`/workspace/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://knkzfsmdjdybbdxmmipo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

MQTT_BROKER_URL=56406e42c9674164ae68d36ac6812a11.s1.eu.hivemq.cloud
MQTT_WS_PORT=8884
```

---

## 🔧 Next Steps

### 1. Set Up MQTT Credentials (Required)
1. Go to [HiveMQ Cloud Console](https://www.hivemq.com/cloud/console)
2. Log in to your account
3. Navigate to your cluster: `56406e42c9674164ae68d36ac6812a11`
4. Click on "Authentication" → "Create User"
5. Create a user (e.g., `kukkutraksha_user`) with a strong password
6. Update both `.env` files with the actual password

### 2. Set Up Supabase Database Schema
Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable TimescaleDB extension (if available)
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Create farms table
CREATE TABLE farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  farm_name TEXT NOT NULL,
  location_lat DECIMAL,
  location_lng DECIMAL,
  device_id TEXT UNIQUE,
  current_status TEXT DEFAULT 'safe',
  last_data_received TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sensor_data table (optimized for time-series)
CREATE TABLE sensor_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  ammonia DECIMAL,
  co2 DECIMAL,
  temperature DECIMAL,
  humidity DECIMAL,
  tds DECIMAL,
  risk_level TEXT,
  overall_status TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast time-series queries
CREATE INDEX idx_sensor_data_farm_timestamp ON sensor_data(farm_id, timestamp DESC);

-- Create alerts table
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sensor_data JSONB,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create predictions table
CREATE TABLE predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  risk_level TEXT NOT NULL,
  confidence DECIMAL,
  factors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint for daily predictions
CREATE UNIQUE INDEX idx_predictions_farm_date ON predictions(farm_id, prediction_date);
```

### 3. Update ESP32 Firmware
Update WiFi credentials in `/workspace/esp32/esp32_poultry_sensor.ino`:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

Update MQTT credentials:
```cpp
const char* mqttUser = "kukkutraksha_user";
const char* mqttPassword = "YOUR_MQTT_PASSWORD";
```

### 4. Test the System
```bash
# Start backend server
cd /workspace/backend
npm start

# In another terminal, test the API
curl http://localhost:5000/health

# Test prediction endpoint
curl http://localhost:5000/api/predictions?lat=22.5726&lng=88.3639
```

---

## 🏗️ Architecture Overview

```
┌─────────────┐      TLS:8883       ┌──────────────────┐
│  ESP32 IoT  │ ──────────────────► │  HiveMQ Cloud    │
│   Sensors   │                     │   MQTT Broker    │
└─────────────┘                     └────────┬─────────┘
                                             │
                                             │ WebSocket:8884
                                             ▼
                                    ┌──────────────────┐
                                    │   Node.js Backend│
                                    │   (Port 5000)    │
                                    └────────┬─────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
          ┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
          │    Supabase     │     │  Open-Meteo API  │     │   WebSocket     │
          │  (PostgreSQL)   │     │ (Weather Data)   │     │   Dashboard     │
          │  - Auth         │     │  10-day Forecast │     │  (Real-time)    │
          │  - Database     │     └──────────────────┘     └─────────────────┘
          │  - Real-time    │
          └─────────────────┘
```

---

## 📊 Data Flow

1. **ESP32 sensors** collect data (ammonia, CO2, temperature, humidity, TDS)
2. Data published to **HiveMQ MQTT broker** via TLS
3. **Backend** subscribes to MQTT topics and receives real-time data
4. Data stored in **Supabase PostgreSQL** database
5. **Open-Meteo API** provides 10-day weather forecasts
6. **Disease prediction algorithm** calculates risk levels
7. **WebSocket** broadcasts updates to connected dashboards
8. **Alerts** generated automatically for critical conditions

---

## 🔐 Security Notes

- ✅ MQTT uses TLS encryption (port 8883)
- ✅ Supabase uses JWT authentication
- ✅ Service role key kept secure in backend only
- ⚠️ Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- ⚠️ Use strong passwords for MQTT and Supabase

---

## 🆘 Troubleshooting

### MQTT Connection Failed
```
⚠️ MQTT broker credentials not configured
```
**Solution**: Add MQTT username/password from HiveMQ Console to `.env` files

### Supabase Connection Failed
```
❌ Supabase not properly configured
```
**Solution**: Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in `backend/.env`

### Firebase Warning
```
⚠️ Firebase not configured properly
```
**Note**: Firebase is optional. Supabase is now the primary database. Ignore this warning or remove Firebase dependencies if not needed.

---

## 📈 Monitoring & Maintenance

- Check server logs: `tail -f /tmp/server.log`
- Monitor Supabase usage: [Dashboard](https://app.supabase.com)
- Monitor HiveMQ usage: [Console](https://www.hivemq.com/cloud/console)
- Set up automated backups for Supabase data

---

**Status**: 🟢 Backend server running on port 5000  
**Next Action**: Configure MQTT credentials in HiveMQ Console
