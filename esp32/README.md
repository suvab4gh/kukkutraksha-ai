# ESP32 Sample Code for Poultry Monitoring

This folder contains sample Arduino code for ESP32 devices to send sensor data to HiveMQ.

## Hardware Requirements

- ESP32 Development Board
- MQ-135 Ammonia Gas Sensor
- MH-Z19 CO₂ Sensor
- DHT22 Temperature & Humidity Sensor
- TDS Sensor for Water Quality
- Jumper Wires & Breadboard

## Wiring Diagram

```
ESP32          MQ-135 (Ammonia)
GPIO34   <-->  AOUT

ESP32          MH-Z19 (CO₂)
GPIO16   <-->  TX
GPIO17   <-->  RX

ESP32          DHT22 (Temp & Humidity)
GPIO4    <-->  DATA

ESP32          TDS Sensor
GPIO35   <-->  AOUT
```

## Installation

1. Install Arduino IDE
2. Install ESP32 Board Support:
   - File → Preferences → Additional Board Manager URLs
   - Add: `https://dl.espressif.com/dl/package_esp32_index.json`
3. Install Required Libraries:
   - PubSubClient (for MQTT)
   - DHT sensor library
   - WiFi library (included with ESP32)

## Configuration

Update the following in `esp32_poultry_sensor.ino`:

```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "your-hivemq-broker.com";
const char* mqtt_user = "your_username";
const char* mqtt_password = "your_password";
const char* device_id = "ESP32_001"; // Unique device ID
```

## Upload & Test

1. Connect ESP32 to your computer via USB
2. Select Board: ESP32 Dev Module
3. Select Port: (Your ESP32 port)
4. Click Upload
5. Open Serial Monitor (115200 baud) to view logs

## Data Format

The device sends JSON data every 60 seconds:

```json
{
  "ammonia": 32.5,
  "co2": 4150,
  "temperature": 24.8,
  "tds": 640,
  "humidity": 65.2
}
```

## Troubleshooting

- **WiFi not connecting**: Check SSID and password
- **MQTT not connecting**: Verify broker URL and credentials
- **Sensor readings incorrect**: Check wiring and calibration
- **Upload failed**: Press BOOT button on ESP32 during upload
