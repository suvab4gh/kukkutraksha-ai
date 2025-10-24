# 🚀 Quick Start Guide

## Installation Steps

### 1. Install Dependencies

```powershell
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Create Environment Files

Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Create `backend/.env`:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key_with_newlines"
MQTT_BROKER_URL=mqtt://your-hivemq-broker.com:1883
MQTT_USERNAME=your_hivemq_username
MQTT_PASSWORD=your_hivemq_password
MQTT_TOPIC=poultry/sensors/#
CORS_ORIGIN=http://localhost:3000
ALERT_RADIUS_KM=5
```

### 3. Run the Application

Open two terminals:

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

Access the application at: http://localhost:3000

## 📝 First Time Setup Checklist

- [ ] Firebase project created and Auth enabled
- [ ] MongoDB Atlas cluster created and connection string obtained
- [ ] HiveMQ Cloud account created and credentials noted
- [ ] Environment variables configured in both frontend and backend
- [ ] Dependencies installed for both frontend and backend
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] ESP32 device configured with WiFi and MQTT credentials

## 🧪 Testing the System

1. **Register a Farmer:**
   - Go to http://localhost:3000
   - Click "Login as Farmer"
   - Register with email, password, farm details, and coordinates
   - Use sample coordinates: Latitude: 22.5726, Longitude: 88.3639 (Kolkata)

2. **Send Test Data from ESP32:**
   - Upload the ESP32 code from `/esp32/esp32_poultry_sensor.ino`
   - Monitor Serial output to verify data transmission
   - Check backend logs for incoming MQTT messages

3. **View Dashboard:**
   - Login to farmer dashboard
   - Verify real-time sensor data displays
   - Check that map shows farm location
   - Verify charts update with new data

4. **Test Admin Dashboard:**
   - Register/login as admin
   - View district-level map with all farms
   - Check farm status indicators
   - Review alerts panel

## 🐛 Troubleshooting

### Frontend not connecting to backend
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### MQTT not receiving data
- Verify HiveMQ credentials in `backend/.env`
- Check ESP32 serial monitor for connection status
- Verify MQTT topic matches: `poultry/sensors/<DEVICE_ID>`

### Database connection failed
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

### Firebase authentication errors
- Verify all Firebase environment variables
- Check Firebase console for enabled auth methods
- Ensure Firebase Admin SDK credentials are correct

## 📚 Next Steps

1. Customize sensor thresholds in `lib/utils.ts`
2. Add more ESP32 devices with unique device IDs
3. Configure proximity alert radius in backend `.env`
4. Deploy to production (see README.md for deployment guides)
5. Set up monitoring and logging

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints in backend routes
- Inspect browser console and backend logs for errors
- Verify all environment variables are set correctly
