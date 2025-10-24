# 📊 New Sensor Trends Dashboard

## ✨ What's New

I've redesigned the **Sensor Trends** section on the Farmer Dashboard with individual sensor cards that show:

### 🎯 Each Sensor Card Includes:

1. **📈 Live Graph (24-Hour Trend)**
   - Real-time line chart showing sensor values over 24 hours
   - Green reference lines showing safe min/max ranges
   - Blue dashed line showing optimal value
   - Comparison between actual values and normal ranges

2. **📊 Current Reading Display**
   - Large, color-coded current value
   - Visual progress bar
   - Color changes based on status (Green/Yellow/Red)

3. **🎯 Normal Range Indicators**
   - Min Safe value (green)
   - Optimal value (blue)
   - Max Safe value (green)
   - All displayed in comparison boxes

4. **🟢🟡🔴 Status Badge**
   - **Safe (Green)**: Values within normal range
   - **Moderate (Yellow)**: Values in caution zone
   - **Danger (Red)**: Critical values requiring action

5. **💡 Actionable Recommendations**
   - Context-specific messages based on current status
   - Immediate action suggestions for critical values

---

## 📱 Individual Sensor Cards Created

### 1. 💨 Ammonia Level Card
- **Normal Range**: 0-25 ppm
- **Optimal**: 15 ppm
- **Safe**: 0-25 ppm (🟢)
- **Moderate**: 25-40 ppm (🟡)
- **Danger**: >40 ppm (🔴)

### 2. 🌫️ CO₂ Level Card
- **Normal Range**: 0-3000 ppm
- **Optimal**: 1500 ppm
- **Safe**: 0-3000 ppm (🟢)
- **Moderate**: 3000-5000 ppm (🟡)
- **Danger**: >5000 ppm (🔴)

### 3. 🌡️ Temperature Card
- **Normal Range**: 18-27°C
- **Optimal**: 22°C
- **Safe**: 18-27°C (🟢)
- **Moderate**: 15-18°C or 27-30°C (🟡)
- **Danger**: <15°C or >30°C (🔴)

### 4. 💧 TDS (Water Quality) Card
- **Normal Range**: 0-500 ppm
- **Optimal**: 250 ppm
- **Safe**: 0-500 ppm (🟢)
- **Moderate**: 500-800 ppm (🟡)
- **Danger**: >800 ppm (🔴)

### 5. 💦 Humidity Card
- **Normal Range**: 50-70%
- **Optimal**: 60%
- **Safe**: 50-70% (🟢)
- **Moderate**: 40-50% or 70-80% (🟡)
- **Danger**: <40% or >80% (🔴)

---

## 🔄 Real-Time Updates

All sensor cards update automatically when:
- ✅ New data comes from HiveMQ MQTT broker
- ✅ ESP32 sensors publish new readings
- ✅ WebSocket connection receives updates

The graph dynamically shows:
- 📈 Current value line in status color (green/yellow/red)
- 📊 Historical trend for past 24 hours
- 🎯 Reference lines for comparison with normal values

---

## 📐 Layout Design

```
┌─────────────────────────────────────────────────────┐
│  Quick Sensor Overview (5 small cards at top)       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────┬───────────────────┐
│  SENSOR TRENDS (2 columns)      │  ALERTS PANEL     │
│  ┌───────────┬───────────────┐  │  - Recent Alerts  │
│  │ Ammonia   │ CO₂           │  │  - Notifications  │
│  │ Card with │ Card with     │  │  - Status Updates │
│  │ Graph     │ Graph         │  │                   │
│  └───────────┴───────────────┘  │                   │
│  ┌───────────┬───────────────┐  │                   │
│  │ Temp      │ TDS           │  │                   │
│  │ Card with │ Card with     │  │                   │
│  │ Graph     │ Graph         │  │                   │
│  └───────────┴───────────────┘  │                   │
│  ┌───────────┬───────────────┐  │                   │
│  │ Humidity  │               │  │                   │
│  │ Card with │               │  │                   │
│  │ Graph     │               │  │                   │
│  └───────────┴───────────────┘  │                   │
│                                  │                   │
│  FARM MAP                        │                   │
│  - Your location                 │                   │
│  - Nearby farms                  │                   │
└─────────────────────────────────┴───────────────────┘
```

---

## 🎨 Visual Features

### Color Coding
- **🟢 Green**: Safe range - Continue monitoring
- **🟡 Yellow**: Moderate range - Increase monitoring
- **🔴 Red**: Danger range - Take immediate action

### Interactive Elements
- Hover over graph points to see exact values
- Tooltip shows time, value, and normal range
- Smooth animations on value changes
- Responsive design for mobile/tablet/desktop

### Graph Features
- **X-Axis**: Time (24-hour format: HH:mm)
- **Y-Axis**: Sensor value with unit
- **Reference Lines**: 
  - Green dashed = Safe min/max
  - Blue dashed = Optimal value
- **Data Line**: Bold colored line based on current status

---

## 🚀 How It Works

1. **Data Flow**:
   ```
   ESP32 Sensors → HiveMQ MQTT → Backend Server → 
   WebSocket → Frontend → Sensor Trend Cards
   ```

2. **Comparison Logic**:
   - Current value from API is compared against thresholds
   - Status determined: Safe/Moderate/Danger
   - Card color and message updated accordingly
   - Graph shows value relative to normal range lines

3. **Real-Time Updates**:
   - WebSocket connection maintains live feed
   - New readings automatically update graphs
   - Historical data sliding window (last 24 hours)

---

## 📝 File Changes

### New Component Created:
- **`components/SensorTrendCard.tsx`**: Individual sensor card with graph

### Modified Files:
- **`app/farmer/dashboard/page.tsx`**: Updated to use new sensor trend cards

### Features:
- ✅ 5 individual sensor cards with graphs
- ✅ Real-time value comparison with normal ranges
- ✅ Color-coded status indicators
- ✅ 24-hour trend visualization
- ✅ Optimal value reference lines
- ✅ Interactive tooltips
- ✅ Responsive grid layout
- ✅ Status-based recommendations

---

## 🎯 Access the New Dashboard

Visit: **http://localhost:3000/test**

The dashboard will auto-login and show:
- 5 quick sensor overview cards at top
- 5 detailed sensor trend cards with graphs below
- Each card comparing live HiveMQ data with normal values
- Color-coded status for instant health assessment

**All data updates in real-time from your ESP32 sensors via HiveMQ!** 🎉
