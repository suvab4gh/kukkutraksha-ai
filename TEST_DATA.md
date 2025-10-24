# Sample Test Data & API Examples

## Test Farmer Registration

```json
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "uid": "test-farmer-123",
  "email": "farmer1@test.com",
  "realId": "1234-5678-9012",
  "farmName": "Green Valley Poultry Farm",
  "address": "Village Ramnagar, PO Sonarpur",
  "district": "South 24 Parganas",
  "location": {
    "type": "Point",
    "coordinates": [88.3639, 22.5726]
  },
  "userType": "farmer",
  "idToken": "YOUR_FIREBASE_ID_TOKEN"
}
```

## Sample Sensor Data (MQTT Payload)

### Normal Conditions (Safe)
```json
{
  "ammonia": 20.5,
  "co2": 2800,
  "temperature": 24.5,
  "tds": 450,
  "humidity": 62.3
}
```

### Moderate Risk Conditions
```json
{
  "ammonia": 35.0,
  "co2": 4500,
  "temperature": 29.0,
  "tds": 750,
  "humidity": 48.0
}
```

### Critical Conditions (Disease Risk)
```json
{
  "ammonia": 55.0,
  "co2": 6500,
  "temperature": 34.0,
  "tds": 950,
  "humidity": 35.0
}
```

## Sample Farms in West Bengal

### Farm 1 - Kolkata Area
```json
{
  "farmName": "Sunrise Poultry Farm",
  "location": {
    "type": "Point",
    "coordinates": [88.3639, 22.5726]
  },
  "district": "Kolkata"
}
```

### Farm 2 - North 24 Parganas
```json
{
  "farmName": "Barasat Chicken Farm",
  "location": {
    "type": "Point",
    "coordinates": [88.4838, 22.7192]
  },
  "district": "North 24 Parganas"
}
```

### Farm 3 - Howrah
```json
{
  "farmName": "Howrah Poultry Enterprise",
  "location": {
    "type": "Point",
    "coordinates": [88.3426, 22.5958]
  },
  "district": "Howrah"
}
```

### Farm 4 - Nadia
```json
{
  "farmName": "Krishnanagar Farm House",
  "location": {
    "type": "Point",
    "coordinates": [88.5060, 23.4054]
  },
  "district": "Nadia"
}
```

### Farm 5 - Hooghly
```json
{
  "farmName": "Chinsurah Poultry Center",
  "location": {
    "type": "Point",
    "coordinates": [88.3974, 22.9018]
  },
  "district": "Hooghly"
}
```

## Test API Endpoints

### Get All Farms (Admin)
```bash
curl -X GET http://localhost:5000/api/farms \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Get Latest Sensor Data
```bash
curl -X GET http://localhost:5000/api/sensors/farm/FARM_ID/latest \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Get Historical Data (24 hours)
```bash
curl -X GET "http://localhost:5000/api/sensors/farm/FARM_ID/history?hours=24&limit=50" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Get Nearby Farms
```bash
curl -X POST http://localhost:5000/api/farms/nearby \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 22.5726,
    "longitude": 88.3639,
    "radiusKm": 10
  }'
```

### Get Farm Alerts
```bash
curl -X GET "http://localhost:5000/api/alerts/farm/FARM_ID?limit=10" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Mark Alert as Read
```bash
curl -X PATCH http://localhost:5000/api/alerts/ALERT_ID/read \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

## Test with Postman

### Collection Variables
```
baseUrl: http://localhost:5000
farmId: <your-farm-id>
authToken: <your-firebase-token>
```

### Import this Postman Collection:
```json
{
  "info": {
    "name": "Poultry Monitoring API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Farms",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": "{{baseUrl}}/api/farms"
      }
    },
    {
      "name": "Get Latest Sensor Data",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": "{{baseUrl}}/api/sensors/farm/{{farmId}}/latest"
      }
    }
  ]
}
```

## Test with curl (PowerShell)

### Windows PowerShell
```powershell
# Get all farms
Invoke-RestMethod -Uri "http://localhost:5000/api/farms" `
  -Headers @{"Authorization"="Bearer YOUR_TOKEN"} `
  -Method GET

# Get sensor data
Invoke-RestMethod -Uri "http://localhost:5000/api/sensors/farm/FARM_ID/latest" `
  -Headers @{"Authorization"="Bearer YOUR_TOKEN"} `
  -Method GET
```

## MQTT Test Commands

### Using mosquitto_pub (Install MQTT clients)
```bash
# Publish test data
mosquitto_pub -h your-broker.com -p 1883 \
  -u your_username -P your_password \
  -t "poultry/sensors/ESP32_TEST" \
  -m '{"ammonia":25,"co2":3500,"temperature":24,"tds":500,"humidity":60}'
```

### Using MQTT.fx or MQTT Explorer
1. Connect to your HiveMQ broker
2. Subscribe to: `poultry/sensors/#`
3. Publish to: `poultry/sensors/ESP32_TEST`
4. Payload: Use sample JSON above

## Database Test Queries

### MongoDB Compass Queries

**Find all farms:**
```javascript
db.farms.find({})
```

**Find recent sensor data:**
```javascript
db.sensordatas.find({}).sort({timestamp: -1}).limit(10)
```

**Find critical alerts:**
```javascript
db.alerts.find({severity: "critical", isResolved: false})
```

**Find farms in specific district:**
```javascript
db.farms.find({district: "Kolkata"})
```

**Find nearby farms (geospatial query):**
```javascript
db.farms.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [88.3639, 22.5726]
      },
      $maxDistance: 10000
    }
  }
})
```

## WebSocket Testing

### JavaScript Console Test
```javascript
const ws = new WebSocket('ws://localhost:5000');

ws.onopen = () => {
  console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

### Browser Extension
Use "Simple WebSocket Client" Chrome extension:
- URL: `ws://localhost:5000`
- Listen for real-time sensor updates

## Load Testing

### Artillery (Install: npm install -g artillery)
```yaml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Get farms"
    flow:
      - get:
          url: "/api/farms"
          headers:
            Authorization: "Bearer YOUR_TOKEN"
```

Run: `artillery run loadtest.yml`

## Seed Database Script

Create `backend/scripts/seedDatabase.js`:
```javascript
const mongoose = require('mongoose');
const Farm = require('../models/Farm');

const seedFarms = [
  {
    userId: 'seed-1',
    email: 'farm1@test.com',
    realId: '1111-1111-1111',
    farmName: 'Test Farm 1',
    district: 'Kolkata',
    location: { type: 'Point', coordinates: [88.3639, 22.5726] }
  },
  // Add more farms...
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await Farm.insertMany(seedFarms);
    console.log('Database seeded!');
    process.exit(0);
  });
```

Run: `node backend/scripts/seedDatabase.js`
