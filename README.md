# 🐔 Poultry Disease Monitoring System

A full-stack IoT-based web application for early detection and monitoring of poultry diseases using real-time sensor data from ESP32 devices.

## 🌟 Features

### Farmer Dashboard
- ✅ Secure authentication with Firebase Auth (Real ID/Aadhar registration)
- 📊 Real-time sensor monitoring (Ammonia, CO₂, TDS, Temperature, Humidity)
- 🚦 Color-coded risk indicators (🟩 Green = Safe, 🟨 Yellow = Warning, 🟥 Red = Critical)
- 🗺️ Interactive map showing farm location and nearby affected farms
- 📈 Historical data visualization with trend charts
- 🔔 Real-time alerts and notifications
- 📍 Proximity alerts for nearby disease outbreaks

### Admin Dashboard
- 🗺️ District-level map of West Bengal showing all registered farms
- 📊 Comprehensive analytics and disease spread tracking
- 🎯 Farm status monitoring with color-coded markers
- 📈 Statistical insights and reports
- 🔍 Farm search and filtering capabilities

### Backend Features
- 🔗 MQTT integration with HiveMQ broker
- 💾 MongoDB Atlas for data storage
- 🤖 Automated disease detection algorithms
- 📡 WebSocket support for real-time updates
- ⏰ Cron jobs for sensor health monitoring
- 🔒 Secure API with Firebase Admin SDK

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 with TypeScript
- **Styling**: TailwindCSS 4.1.16
- **State Management**: Zustand
- **Maps**: Leaflet.js with OpenStreetMap
- **Charts**: Recharts
- **Authentication**: Firebase Auth
- **Real-time**: WebSocket & MQTT over WebSocket

### Backend
- **Runtime**: Node.js with Express
- **Database**: MongoDB Atlas
- **MQTT Broker**: HiveMQ Cloud
- **Authentication**: Firebase Admin SDK
- **Real-time**: WebSocket (ws)
- **Task Scheduling**: node-cron

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

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- HiveMQ Cloud account
- Firebase project

### 1. Clone the Repository
```bash
git clone <repository-url>
cd poultry
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment Variables

#### Frontend (.env.local)
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# MQTT Configuration (for client-side MQTT if needed)
NEXT_PUBLIC_MQTT_BROKER_URL=wss://your-hivemq-broker.com:8884/mqtt
```

#### Backend (backend/.env)
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/poultry-monitoring?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"

# HiveMQ MQTT Broker
MQTT_BROKER_URL=mqtt://your-hivemq-broker.com:1883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
MQTT_TOPIC=poultry/sensors/#

# CORS Origin
CORS_ORIGIN=http://localhost:3000

# Proximity Alert Distance (km)
ALERT_RADIUS_KM=5
```

### 5. Set Up Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Authentication** → **Email/Password** sign-in method
3. Download Firebase Admin SDK private key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Copy the values to your backend `.env` file

### 6. Set Up MongoDB Atlas

1. Create a cluster at https://cloud.mongodb.com
2. Create a database user
3. Whitelist your IP address (or use 0.0.0.0/0 for development)
4. Get the connection string and add it to backend `.env`

### 7. Set Up HiveMQ Cloud

1. Sign up at https://www.hivemq.com/mqtt-cloud-broker/
2. Create a cluster
3. Note the broker URL, username, and password
4. Add credentials to backend `.env`

### 8. Run the Application

#### Start Backend (Terminal 1)
```bash
cd backend
npm start
```

#### Start Frontend (Terminal 2)
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📱 ESP32 Setup

### MQTT Topic Structure
```
poultry/sensors/<DEVICE_ID>
```

### Example Payload
```json
{
  "ammonia": 30.5,
  "co2": 4200,
  "temperature": 24.5,
  "tds": 650,
  "humidity": 62.3
}
```

### Sample ESP32 Code
```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "your-hivemq-broker.com";
const int mqtt_port = 1883;
const char* mqtt_user = "your_username";
const char* mqtt_password = "your_password";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Read sensors
  float ammonia = readAmmoniaSensor();
  float co2 = readCO2Sensor();
  float temperature = readTemperatureSensor();
  float tds = readTDSSensor();
  float humidity = readHumiditySensor();
  
  // Create JSON payload
  String payload = "{\"ammonia\":" + String(ammonia) + 
                   ",\"co2\":" + String(co2) + 
                   ",\"temperature\":" + String(temperature) + 
                   ",\"tds\":" + String(tds) + 
                   ",\"humidity\":" + String(humidity) + "}";
  
  // Publish to MQTT
  client.publish("poultry/sensors/ESP32_001", payload.c_str());
  
  delay(60000); // Send data every minute
}
```

## 🎯 Disease Detection Thresholds

| Sensor | Safe | Moderate | Danger |
|--------|------|----------|---------|
| Ammonia | ≤ 25 ppm | 25-40 ppm | > 40 ppm |
| CO₂ | ≤ 3000 ppm | 3000-5000 ppm | > 5000 ppm |
| Temperature | 18-27°C | 15-18°C or 27-32°C | < 15°C or > 32°C |
| TDS | ≤ 500 ppm | 500-800 ppm | > 800 ppm |
| Humidity | 50-70% | 40-50% or 70-80% | < 40% or > 80% |

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add all environment variables

### Backend (Google Cloud Run)
```bash
# Build Docker image
docker build -t poultry-backend ./backend

# Push to Google Container Registry
docker tag poultry-backend gcr.io/YOUR_PROJECT/poultry-backend
docker push gcr.io/YOUR_PROJECT/poultry-backend

# Deploy to Cloud Run
gcloud run deploy poultry-backend \
  --image gcr.io/YOUR_PROJECT/poultry-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify` - Verify user token

### Farms
- `GET /api/farms` - Get all farms (admin)
- `GET /api/farms/:id` - Get farm by ID
- `GET /api/farms/user/:userId` - Get farm by user ID
- `POST /api/farms/nearby` - Get nearby farms

### Sensors
- `GET /api/sensors/farm/:farmId/latest` - Get latest sensor data
- `GET /api/sensors/farm/:farmId/history` - Get historical data
- `GET /api/sensors/farm/:farmId/stats` - Get statistics

### Alerts
- `GET /api/alerts/farm/:farmId` - Get farm alerts
- `GET /api/alerts` - Get all alerts (admin)
- `PATCH /api/alerts/:id/read` - Mark alert as read
- `PATCH /api/alerts/:id/resolve` - Resolve alert

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ for poultry farmers in West Bengal.

## 📞 Support

For support, email support@poultry-monitoring.com or open an issue in the repository.
