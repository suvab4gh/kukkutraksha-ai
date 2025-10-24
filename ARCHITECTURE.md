# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ESP32 Devices                           │
│  (Ammonia, CO₂, TDS, Temperature, Humidity Sensors)            │
└────────────────┬────────────────────────────────────────────────┘
                 │ MQTT Protocol
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HiveMQ Cloud Broker                        │
│                    (MQTT Message Broker)                        │
└────────────────┬────────────────────────────────────────────────┘
                 │ Subscribe to Topics
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Backend Server                            │
│                  (Node.js + Express)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MQTT Service    │  Disease Detection  │  Cron Jobs      │  │
│  │  ├─ Subscribe    │  ├─ Threshold Check │  ├─ Health Mon  │  │
│  │  ├─ Parse Data   │  ├─ Risk Calculation│  └─ Cleanup     │  │
│  │  └─ Store Data   │  └─ Alert Creation  │                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             REST API Endpoints                           │  │
│  │  /api/auth  │  /api/farms  │  /api/sensors │ /api/alerts│  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            WebSocket Server (Real-time)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────┬───────────────┘
         │                                        │
         │ HTTP/REST                             │ WebSocket
         ▼                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                │
│                    (Next.js 16 + TypeScript)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Authentication (Firebase)  │  State Management (Zustand)│  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Farmer Dashboard              │  Admin Dashboard        │  │
│  │  ├─ Sensor Cards               │  ├─ District Map        │  │
│  │  ├─ Trend Charts               │  ├─ Farm Analytics      │  │
│  │  ├─ Farm Map (Leaflet)         │  ├─ Alert Management   │  │
│  │  ├─ Alerts Panel               │  └─ Statistics         │  │
│  │  └─ Real-time Updates          │                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                                        │
         ▼                                        ▼
┌──────────────────────┐              ┌──────────────────────────┐
│   Firebase Auth      │              │   MongoDB Atlas          │
│   (Authentication)   │              │   (Data Storage)         │
│  ├─ User Management  │              │  ├─ Farms Collection     │
│  ├─ Email/Password   │              │  ├─ SensorData (TTL)    │
│  └─ Token Validation │              │  ├─ Alerts Collection    │
└──────────────────────┘              │  └─ Admins Collection    │
                                      └──────────────────────────┘
```

## Data Flow

### 1. Sensor Data Collection
```
ESP32 → WiFi → HiveMQ → Backend MQTT Service → MongoDB
                                    ↓
                              WebSocket Broadcast
                                    ↓
                              Frontend Dashboard
```

### 2. Disease Detection Pipeline
```
Sensor Data → Threshold Analysis → Risk Level Calculation
                      ↓
              Disease Detection Algorithm
                      ↓
         Critical? → Create Alert → Proximity Check
                      ↓                    ↓
              Notify Farmer        Notify Nearby Farms
```

### 3. User Authentication
```
User → Firebase Auth → Backend Verification → MongoDB User Lookup
                              ↓
                        JWT Token Generation
                              ↓
                        Authorized API Access
```

## Key Components

### Frontend (Next.js)
- **Pages**: Home, Login, Farmer Dashboard, Admin Dashboard
- **Components**: SensorCard, FarmMap, SensorChart, AlertsPanel, AdminMap
- **State Management**: Zustand stores for auth and sensor data
- **Real-time**: WebSocket client for live updates
- **Maps**: Leaflet.js with OpenStreetMap tiles

### Backend (Express)
- **Routes**: Auth, Farms, Sensors, Alerts
- **Services**: MQTT Service (HiveMQ), Cron Jobs
- **Middleware**: Firebase Admin authentication
- **WebSocket**: Real-time data broadcast
- **Models**: Farm, SensorData, Alert, Admin

### Database (MongoDB)
- **Collections**:
  - `farms`: Farm registration and location data
  - `sensordata`: Time-series sensor readings (90-day TTL)
  - `alerts`: Disease and proximity alerts
  - `admins`: Admin user accounts

### MQTT (HiveMQ)
- **Topics**: `poultry/sensors/<DEVICE_ID>`
- **QoS**: 1 (At least once delivery)
- **Payload**: JSON with sensor readings

## Security

### Authentication
- Firebase Auth for user management
- Firebase Admin SDK for backend token verification
- Role-based access control (farmer/admin)
- Real ID/Aadhar verification for farmer registration

### Data Protection
- HTTPS/TLS for all communications
- Environment variables for sensitive credentials
- CORS configuration for API security
- MongoDB Atlas encryption at rest

### API Security
- JWT token validation on all protected routes
- Rate limiting (recommended for production)
- Input validation and sanitization
- Error handling without exposing internals

## Scalability Considerations

### Horizontal Scaling
- Stateless backend design allows multiple instances
- MongoDB Atlas auto-scaling
- Load balancer for backend services
- CDN for static frontend assets

### Performance Optimization
- MongoDB indexing on frequently queried fields
- Data aggregation for statistics
- WebSocket connection pooling
- Client-side caching with React Query (optional)

### Monitoring & Logging
- Health check endpoint (`/health`)
- Cron jobs for sensor health monitoring
- Error logging and alerting
- Performance metrics tracking

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Production                           │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Vercel)                                          │
│  ├─ CDN Distribution                                        │
│  ├─ Auto-scaling                                           │
│  └─ Environment Variables                                   │
├─────────────────────────────────────────────────────────────┤
│  Backend (Render/Cloud Run)                                 │
│  ├─ Container Deployment                                    │
│  ├─ Auto-restart on failure                                │
│  ├─ Health checks                                          │
│  └─ Environment Variables                                   │
├─────────────────────────────────────────────────────────────┤
│  Database (MongoDB Atlas)                                   │
│  ├─ Replica Set                                            │
│  ├─ Auto-backup                                            │
│  └─ Point-in-time Recovery                                 │
├─────────────────────────────────────────────────────────────┤
│  MQTT Broker (HiveMQ Cloud)                                │
│  ├─ High Availability                                      │
│  ├─ Message Persistence                                    │
│  └─ TLS/SSL Encryption                                     │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 | React framework with SSR |
| UI | TailwindCSS 4.1.16 | Utility-first CSS |
| State | Zustand | Lightweight state management |
| Maps | Leaflet.js | Interactive maps |
| Charts | Recharts | Data visualization |
| Auth | Firebase | Authentication service |
| Backend | Express.js | REST API server |
| Database | MongoDB Atlas | NoSQL database |
| MQTT | HiveMQ Cloud | IoT message broker |
| Real-time | WebSocket | Live data updates |
| IoT | ESP32 | Microcontroller |
| Deployment | Vercel + Render | Cloud hosting |
