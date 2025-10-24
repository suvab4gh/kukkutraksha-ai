# 🐔 Poultry Disease Monitoring System

A full-stack IoT-based web application for real-time poultry disease monitoring using ESP32 sensors, MQTT, and machine learning algorithms.

## 🌟 Features

- **Real-time Sensor Monitoring**: Ammonia, CO₂, Temperature, TDS, Humidity
- **Disease Detection**: Automated algorithms with color-coded risk indicators
- **Interactive Maps**: OpenStreetMap integration for farm locations
- **Admin Dashboard**: District-level monitoring for West Bengal farms
- **Emergency Alerts**: Direct communication system for critical situations
- **Health Analytics**: iPhone-style sensor health monitoring

## 🛠️ Tech Stack

### Frontend
- Next.js 16 + React 19 + TypeScript
- TailwindCSS 4.1.16
- Supabase (Auth + PostgreSQL)
- Leaflet.js (Maps)
- Recharts (Data Visualization)

### Backend
- Node.js 25 + Express
- MongoDB Atlas (Sensor Time-series Data)
- Supabase PostgreSQL (User/Farm Data)
- HiveMQ (MQTT Broker)
- WebSocket (Real-time Updates)

## 📁 Project Structure

```
poultry/
├── app/                          # Next.js app directory
│   ├── auth/
│   │   └── login/page.tsx       # Login/Registration page
│   ├── farmer/
│   │   └── dashboard/page.tsx   # Farmer dashboard
│   ├── admin/
│   │   └── dashboard/page.tsx   # Admin dashboard
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable UI components
│   ├── SensorCard.tsx
│   ├── FarmMap.tsx
│   ├── SensorChart.tsx
│   └── AlertsPanel.tsx
├── lib/                          # Utilities and configurations
│   ├── firebase.ts              # Firebase config
│   ├── store.ts                 # Zustand stores
│   └── utils.ts                 # Utility functions
├── backend/                      # Express backend
│   ├── models/                  # Mongoose models
│   │   ├── Farm.js
│   │   ├── SensorData.js
│   │   ├── Alert.js
│   │   └── Admin.js
│   ├── routes/                  # API routes
│   │   ├── auth.js
│   │   ├── farms.js
│   │   ├── sensors.js
│   │   └── alerts.js
│   ├── services/                # Background services
│   │   ├── mqttService.js
│   │   └── cronJobs.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js                # Main server file
│   └── package.json
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 25+
- Supabase Account
- MongoDB Atlas Account
- HiveMQ Cloud Account

### 1. Clone & Install
```bash
git clone https://github.com/suvab4gh/poultry-iot-monitoring.git
cd poultry
npm install
cd backend && npm install && cd ..
```

### 2. Environment Setup

**Frontend (.env.local)**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_MQTT_BROKER_URL=wss://your-hivemq-broker.com:8884/mqtt
```

**Backend (backend/.env)**
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
MQTT_BROKER_URL=mqtt://your-hivemq-broker.com:1883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
MQTT_TOPIC=poultry/sensors/#
CORS_ORIGIN=http://localhost:3000
```

### 3. Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Run this SQL in SQL Editor:

```sql
-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'farmer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farms table
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  farm_name TEXT NOT NULL,
  owner_name TEXT,
  phone TEXT,
  district TEXT,
  location GEOGRAPHY(POINT, 4326),
  farm_type TEXT DEFAULT 'Broiler',
  aadhaar_number TEXT,
  pan_card TEXT,
  license_status TEXT DEFAULT 'Pending',
  poultry_farm_id TEXT UNIQUE,
  current_status TEXT DEFAULT 'safe',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'farmer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can read own farm" ON farms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all" ON farms FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

3. Get API keys from Project Settings → API

### 4. Run Application

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev
```

Access at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📱 ESP32 Sensor Setup

### MQTT Payload Format
```json
{
  "farmId": "your_farm_id",
  "zone": "A",
  "ammonia": 30.5,
  "co2": 4200,
  "temperature": 24.5,
  "tds": 650,
  "humidity": 62.3
}
```

### Disease Detection Thresholds

| Parameter | Safe | Warning | Critical |
|-----------|------|---------|----------|
| Ammonia | ≤25 ppm | 25-40 ppm | >40 ppm |
| CO₂ | ≤3000 ppm | 3000-5000 ppm | >5000 ppm |
| Temperature | 18-27°C | 15-30°C | <15°C or >30°C |
| TDS | ≤500 ppm | 500-800 ppm | >800 ppm |
| Humidity | 50-70% | 40-80% | <40% or >80% |

## � Project Structure

```
poultry/
├── app/                    # Next.js pages
│   ├── auth/login/        # Authentication
│   ├── farmer/dashboard/  # Farmer interface
│   └── admin/dashboard/   # Admin interface
├── components/            # React components
├── lib/                   # Utilities
│   ├── supabase.ts       # Supabase client
│   ├── store.ts          # State management
│   └── utils.ts          # Helper functions
├── backend/              # Express server
│   ├── config/          # Supabase config
│   ├── models/          # MongoDB models
│   ├── routes/          # API endpoints
│   ├── services/        # MQTT & background jobs
│   └── middleware/      # Authentication
└── esp32/               # ESP32 firmware
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Railway)
1. Push to GitHub
2. Connect Railway to repository
3. Add environment variables
4. Deploy

## 📖 Documentation

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development history and technical decisions.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License - See LICENSE file

## 👥 Support

- **Issues**: [GitHub Issues](https://github.com/suvab4gh/poultry-iot-monitoring/issues)
- **Email**: support@poultry-monitoring.com

---

Built with ❤️ for poultry farmers in West Bengal
