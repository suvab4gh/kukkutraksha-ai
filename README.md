# KukkutRaksha AI 🐔🤖

**Intelligent Poultry Monitoring & Disease Prediction Platform**

KukkutRaksha AI is an intelligent monitoring and prediction platform designed to protect poultry farms using the power of Artificial Intelligence and the Internet of Things (IoT). 

## 🌟 Overview

The system continuously monitors critical farm conditions such as:
- 🌡️ Temperature & Humidity
- 💨 Ammonia (NH3) & Carbon Dioxide (CO2) levels
- 💧 Water Quality

Using smart sensors installed inside the poultry environment, data is analyzed in real-time and displayed through an intuitive mobile and web dashboard, allowing farmers to monitor their farms from anywhere.

## 🚀 Key Features

### 📊 Real-Time Environmental Monitoring
Continuous tracking of vital farm parameters with instant alerts for abnormal conditions.

### 📹 AI-Powered Computer Vision
Smart cameras observe poultry behavior to detect early signs of stress or illness automatically.

### 🔮 10-Day Disease Risk Prediction
Our innovative prediction engine combines environmental data with weather forecasts to predict possible disease outbreaks. Risks are displayed using simple color tags:
- 🟢 **Green**: Safe
- 🟡 **Yellow**: Warning
- 🟠 **Orange**: High Risk
- 🔴 **Red**: Critical Alert

### 📱 Unified Dashboard
Easy-to-use interface for mobile and web, providing actionable insights at a glance.

### ⚡ Automated Alerts
Instant notifications to farmers when abnormal conditions are detected, enabling quick action before serious health problems occur.

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, MQTT (WebSocket)
- **Database**: Supabase (PostgreSQL + PostGIS)
- **AI/ML**: Disease prediction models, Computer Vision integration
- **IoT**: ESP32 Sensor Integration, Real-time telemetry

## 🏗️ Architecture

```
ESP32 Sensors → MQTT Broker → Node.js Backend → Supabase DB
                                      ↓
Smart Cameras → AI Engine ────────────┘
                                      ↓
                              Next.js Dashboard
                                      ↓
                            Farmers (Mobile/Web)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account
- MQTT Broker (HiveMQ Cloud or similar)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   MQTT_WS_URL=wss://your-mqtt-broker.com/mqtt
   JWT_SECRET=your_jwt_secret
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

## 📄 License
MIT License - Empowering sustainable smart farming for all.
