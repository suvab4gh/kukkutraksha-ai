# KukkutRaksha AI - Open Source APIs Integration

## Overview
KukkutRaksha AI uses the following open-source and free APIs to provide intelligent poultry farm monitoring and disease prediction:

---

## 🌤️ Weather Forecast API

### **Open-Meteo Weather API** (Free & Open Source)
- **URL**: `https://api.open-meteo.com/v1/forecast`
- **Documentation**: https://open-meteo.com/en/docs
- **API Key**: Not required (completely free)
- **Usage**: 10-day weather forecasts for disease risk prediction

#### Features Used:
- Temperature forecasts (daily max/min)
- Relative humidity predictions
- Precipitation forecasts
- Weather codes
- Wind speed data

#### Example Request:
```javascript
GET https://api.open-meteo.com/v1/forecast?latitude=22.5726&longitude=88.3639&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,precipitation_sum&forecast_days=10
```

#### Implementation:
Located in `/backend/services/diseasePredictionService.js`

---

## 🗺️ Maps & Geolocation

### **OpenStreetMap** (Free & Open Source)
- **URL**: https://www.openstreetmap.org
- **License**: Open Data Commons Open Database License (ODbL)
- **Usage**: Farm location mapping and proximity alerts

### **Leaflet.js** (JavaScript Library)
- **URL**: https://leafletjs.com
- **License**: BSD 2-Clause
- **Usage**: Interactive map display in frontend

---

## 📡 MQTT Broker (IoT Communication)

### **HiveMQ Cloud** (Free Tier Available)
- **URL**: https://www.hivemq.com/mqtt-cloud-broker/
- **Free Tier**: 100 connections, unlimited messages
- **Usage**: Real-time sensor data transmission from ESP32 devices

#### Alternative Open-Source Options:
- **Mosquitto**: https://mosquitto.org (self-hosted)
- **EMQX**: https://www.emqx.io (open-source version available)

---

## 🗄️ Database Services

### **Supabase** (Free Tier)
- **URL**: https://supabase.com
- **Free Tier**: 500 MB database, unlimited API requests
- **Usage**: User authentication, farm metadata, profiles
- **License**: PostgreSQL (Open Source) + MIT (Client libraries)

---

## 🔐 Authentication

### **Supabase Auth** (Built on GoTrue)
- **URL**: https://supabase.com/auth
- **License**: MIT
- **Features**: 
  - Email/password authentication
  - JWT token management
  - Row-level security (RLS)

---

## 📊 Data Visualization

### **Recharts** (React Library)
- **URL**: https://recharts.org
- **License**: MIT
- **Usage**: Sensor data charts and graphs

### **Chart.js** (Alternative)
- **URL**: https://www.chartjs.org
- **License**: MIT

---

## 🌐 API Endpoints Implemented

### Disease Prediction API
```
GET /api/predictions/farm/:farmId
- Returns 10-day disease risk forecast
- Combines weather data with sensor readings
- Color-coded risk levels: Green, Yellow, Orange, Red

GET /api/predictions/farm/:farmId/summary
- Simplified prediction summary
- Next 3 days outlook
- Trend analysis

GET /api/predictions/test/:latitude/:longitude
- Test endpoint (no authentication)
- Useful for development and testing
```

### Sensor Data API
```
GET /api/sensors/farm/:farmId/latest
GET /api/sensors/farm/:farmId/history
GET /api/sensors/farm/:farmId/stats
GET /api/sensors/farm/:farmId/risk-distribution
```

### Alert Management API
```
GET /api/alerts/farm/:farmId
POST /api/alerts
PUT /api/alerts/:id/resolve
```

---

## 🎯 Disease Prediction Algorithm

The prediction service analyzes multiple factors:

### Environmental Risks:
1. **Newcastle Disease**: Cool (15-25°C) + High Humidity (>70%)
2. **Avian Influenza**: Cold (5-20°C) + Low Humidity (<50%)
3. **Bronchitis**: Temperature fluctuations (>10°C daily variation)
4. **Coccidiosis**: Warm (25-35°C) + High Humidity (>75%)
5. **Heat Stress**: High temperatures (>30°C)
6. **Respiratory Issues**: Combined with high ammonia levels

### Risk Calculation:
- Each disease has a base risk factor (0.25-0.45)
- Multiple conditions compound the risk
- Current sensor data (ammonia, etc.) modifies the score
- Precipitation increases humidity-related risks by 10%

### Output Format:
```json
{
  "overallRisk": {
    "level": "yellow",
    "score": 0.45,
    "description": "Warning: Moderate disease risk..."
  },
  "highestRiskDay": {
    "date": "2024-01-15",
    "score": 0.72,
    "level": "orange"
  },
  "dailyForecasts": [...],
  "summary": {
    "safeDays": 4,
    "warningDays": 3,
    "highRiskDays": 2,
    "criticalDays": 1,
    "trend": "stable"
  }
}
```

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
```

### 2. Environment Variables (`.env`)
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# MQTT (HiveMQ or self-hosted)
MQTT_BROKER_URL=mqtt://broker.hivemq.com:1883
MQTT_USERNAME=your-username
MQTT_PASSWORD=your-password
MQTT_TOPIC=poultry/sensors/#

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Alerts
ALERT_RADIUS_KM=5
```

### 3. Run Backend
```bash
npm run dev
```

### 4. Test Prediction API
```bash
curl http://localhost:5000/api/predictions/test/22.5726/88.3639
```

---

## 📝 Notes

- All APIs used are either open-source or have generous free tiers
- No credit card required for development
- Production deployment may require upgrading to paid tiers based on usage
- Open-Meteo API has no rate limits for non-commercial use
- Consider caching weather data to reduce API calls

---

## 🤝 Contributing

To add new API integrations:
1. Create service file in `/backend/services/`
2. Add route handlers in `/backend/routes/`
3. Update this documentation
4. Include environment variable examples

---

Built with ❤️ using open-source technologies for sustainable smart farming
