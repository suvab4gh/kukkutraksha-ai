# GitHub Repository Setup Guide

## Step 1: Create a New GitHub Repository

1. Go to https://github.com/new
2. Fill in the repository details:
   - **Repository name**: `poultry-iot-monitoring` (or your choice)
   - **Description**: "IoT-based Poultry Disease Monitoring System with Next.js, Node.js, MongoDB, and MQTT"
   - **Visibility**: Choose Public or Private
   - **Important**: Do NOT initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"

## Step 2: Update Remote and Push

After creating the repository, replace `YOUR_USERNAME` and `REPO_NAME` with your actual values:

```powershell
# Remove the existing remote
git remote remove origin

# Add your new remote (replace with your actual repository URL)
git remote add origin https://github.com/YOUR_USERNAME/poultry-iot-monitoring.git

# Push your code
git push -u origin main
```

## Alternative: If you want to use SSH

```powershell
# Add remote with SSH
git remote add origin git@github.com:YOUR_USERNAME/poultry-iot-monitoring.git

# Push your code
git push -u origin main
```

## Step 3: Verify

After pushing, go to your GitHub repository URL to see your code online!

## Project Information

### Tech Stack
- **Frontend**: Next.js 16.0.0, React 19.2.0, TypeScript 5.9.3, TailwindCSS 4.1.16
- **Backend**: Node.js 25.0.0 (ES Modules), Express 4.21.1, Mongoose 8.8.4
- **Database**: MongoDB Atlas
- **Real-time**: MQTT 5.10.1, WebSocket (ws 8.18.0)
- **Authentication**: Firebase 11.0.1
- **State Management**: Zustand 5.0.2
- **Charts**: Recharts 2.15.0
- **Maps**: Leaflet 1.9.4

### Features
- Real-time IoT sensor monitoring (Temperature, Humidity, Ammonia, CO2, TDS)
- Disease outbreak detection with 15-zone heatmap visualization
- Sensor health monitoring (iPhone-style battery health display)
- MQTT automation rules engine for device control
- Role-based access control (Farm Owner, Field Worker, Admin, Veterinarian)
- Farmer profile with compliance tracking (Aadhaar, PAN, licenses)
- Incident reporting with geofencing (5km radius alerts)
- Interactive Leaflet maps with farm locations
- WebSocket real-time data broadcasting

### Repository Structure
```
poultry/
├── app/                    # Next.js 16 app directory
│   ├── farmer/            # Farmer dashboard pages
│   ├── admin/             # Admin dashboard pages
│   ├── auth/              # Authentication pages
│   └── test/              # Test/demo pages
├── backend/               # Node.js 25 Express API server
│   ├── models/           # Mongoose models (Farm, User, Task, Incident, IoTDevice)
│   ├── routes/           # API routes (farms, sensors, users, tasks, incidents, control)
│   ├── services/         # MQTT, WebSocket, Firebase services
│   └── server.js         # Main server file (ES modules)
├── components/           # React components
│   ├── SensorHealthMonitor.tsx    # Sensor health status display
│   ├── SensorHealthPanel.tsx      # iPhone-style health dashboard
│   ├── FarmerProfileDetails.tsx   # 4-tab farmer profile
│   └── ... (20+ other components)
├── lib/                  # Utilities and stores
└── public/               # Static assets

### Environment Variables Required

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_MQTT_BROKER=wss://your-mqtt-broker:8084/mqtt
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

**Backend (.env)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/poultry_monitoring
JWT_SECRET=your-jwt-secret
MQTT_BROKER_URL=mqtt://your-mqtt-broker:1883
MQTT_USERNAME=your-username
MQTT_PASSWORD=your-password
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### Getting Started

1. **Install Dependencies**
   ```powershell
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   ```

2. **Set Up Environment Variables**
   - Create `.env.local` in root directory
   - Create `.env` in backend directory
   - Fill in the values from the templates above

3. **Run Development Servers**
   ```powershell
   # Terminal 1: Frontend (http://localhost:3000)
   npm run dev
   
   # Terminal 2: Backend (http://localhost:5000)
   cd backend
   npm run dev
   ```

4. **Access the Application**
   - Main app: http://localhost:3000
   - Test dashboard: http://localhost:3000/test (auto-login as farmer)
   - Admin dashboard: http://localhost:3000/admin/dashboard
   - API endpoints: http://localhost:5000/api/*

### Important Notes

- The `.env` and `.env.local` files are gitignored for security
- Update MongoDB connection string before running
- Configure MQTT broker credentials
- Set up Firebase project for authentication
- The test route bypasses authentication for development

---

**Need Help?** Check the README.md file or review the code comments for detailed implementation notes.
