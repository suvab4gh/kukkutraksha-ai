# KukkutRaksha AI - API Integration Guide

## ✅ Configured APIs

### 1. **MQTT Broker - HiveMQ Cloud** (Real-time IoT Data)
- **Broker URL**: `56406e42c9674164ae68d36ac6812a11.s1.eu.hivemq.cloud`
- **TLS Port**: `8883` (for ESP32)
- **WebSocket Port**: `8884` (for web dashboard)
- **Topic**: `poultry/sensors/#`
- **Authentication**: Username/Password required

**Configuration Files Updated:**
- `/workspace/backend/.env` - Backend MQTT connection
- `/workspace/.env.local` - Frontend WebSocket connection
- `/workspace/esp32/esp32_poultry_sensor.ino` - ESP32 firmware

**Next Steps:**
1. Create MQTT credentials in HiveMQ Cloud Console
2. Replace `kukkutraksha_user` and `your_secure_password_here` with actual credentials
3. Upload ESP32 code to your device

---

### 2. **Weather Forecast - Open-Meteo API** (10-Day Predictions)
- **URL**: `https://api.open-meteo.com/v1/forecast`
- **Cost**: Free, no API key required
- **Features**: Temperature, humidity, precipitation, wind speed
- **Already Integrated**: ✅ Disease prediction service

**Usage Example:**
```javascript
// Already implemented in diseasePredictionService.js
const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,humidity_mean,precipitation_sum&forecast_days=10`;
```

---

### 3. **Maps & Geolocation - OpenStreetMap + Leaflet** (Farm Location)
- **Provider**: OpenStreetMap (Free)
- **Library**: Leaflet.js (Open Source)
- **No API Key Required**: ✅
- **Already Integrated**: ✅ FarmMap and AdminMap components

---

## 🔧 Optional APIs (Not Yet Configured)

### 4. **Database - MongoDB Atlas** (Sensor Data Storage)
- **Free Tier**: 512MB storage
- **Setup Required**: Create account at https://www.mongodb.com/cloud/atlas
- **Update**: `MONGODB_URI` in `/workspace/backend/.env`

**Current Status**: Using local MongoDB (`mongodb://localhost:27017/kukkutraksha`)

---

### 5. **Authentication - Supabase** (User Management)
- **Free Tier**: Available
- **Setup Required**: Create project at https://supabase.com
- **Update**: `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env` files

**Current Status**: Basic auth implemented, Supabase optional

---

### 6. **Push Notifications - Firebase Cloud Messaging** (Mobile Alerts)
- **Free Tier**: Generous limits
- **Setup Required**: Create Firebase project
- **Update**: Firebase config in `/workspace/.env.local`

**Current Status**: Placeholder configured, not yet active

---

### 7. **SMS Alerts - Twilio** (Critical Notifications)
- **Free Trial**: $15 credit
- **Setup Required**: Account at https://twilio.com
- **Integration**: Add to alert service

**Current Status**: Not configured

---

### 8. **Email Alerts - SendGrid** (Daily Reports)
- **Free Tier**: 100 emails/day
- **Setup Required**: Account at https://sendgrid.com
- **Integration**: Add to alert service

**Current Status**: Not configured

---

## 📋 Configuration Checklist

### Immediate Actions Required:
- [ ] **Create HiveMQ Cloud credentials** and update all `.env` files
- [ ] **Set up MongoDB Atlas** (or use local MongoDB)
- [ ] **Test MQTT connection** between ESP32 and backend
- [ ] **Verify weather API** is working for your farm location

### Optional Enhancements:
- [ ] Configure Firebase for push notifications
- [ ] Set up Twilio for SMS alerts
- [ ] Add SendGrid for email reports
- [ ] Enable Supabase for advanced user management

---

## 🔐 Security Notes

1. **Never commit `.env` files** to Git (already in `.gitignore`)
2. **Use strong passwords** for MQTT broker
3. **Enable TLS/SSL** for all connections (already configured)
4. **Rotate credentials** regularly
5. **Restrict MQTT topics** to specific device IDs

---

## 🧪 Testing MQTT Connection

### Backend Test:
```bash
cd /workspace/backend
npm install
node server.js
```

Look for: `✅ Connected to HiveMQ broker`

### ESP32 Test:
1. Update WiFi credentials in `esp32_poultry_sensor.ino`
2. Upload code to ESP32
3. Open Serial Monitor (115200 baud)
4. Look for: `✓ Data sent successfully`

### Dashboard Test:
1. Start frontend: `npm run dev`
2. Navigate to Farmer Dashboard
3. Check real-time sensor updates

---

## 📊 Data Flow

```
ESP32 Sensors → HiveMQ (TLS) → Backend → MongoDB
                                      ↓
                              WebSocket → Dashboard
                                      ↓
                            Open-Meteo → Predictions
```

---

## 🆘 Troubleshooting

### MQTT Connection Failed:
- Check HiveMQ credentials in `.env`
- Verify firewall allows port 8883/8884
- Ensure ESP32 has internet access

### Weather Data Missing:
- Check farm coordinates in database
- Verify Open-Meteo API accessibility
- Check backend logs for errors

### No Real-time Updates:
- Verify WebSocket connection in browser console
- Check MQTT topic matches between ESP32 and backend
- Ensure backend is broadcasting to WebSocket clients

---

## 📚 Documentation Links

- **HiveMQ Cloud**: https://www.hivemq.com/docs/
- **Open-Meteo API**: https://open-meteo.com/en/docs
- **Leaflet.js**: https://leafletjs.com/
- **MongoDB**: https://www.mongodb.com/docs/
- **ESP32 MQTT**: https://randomnerdtutorials.com/esp32-mqtt-publish-subscribe-arduino-ide/
