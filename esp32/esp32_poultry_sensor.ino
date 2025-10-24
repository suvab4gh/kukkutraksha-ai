#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker Settings
const char* mqtt_server = "your-hivemq-broker.com";
const int mqtt_port = 1883;
const char* mqtt_user = "your_username";
const char* mqtt_password = "your_password";
const char* device_id = "ESP32_001"; // Unique device ID for this farm

// MQTT Topic
char mqtt_topic[50];

// Sensor Pins
#define AMMONIA_PIN 34
#define CO2_RX_PIN 16
#define CO2_TX_PIN 17
#define DHT_PIN 4
#define TDS_PIN 35

// DHT Sensor
#define DHTTYPE DHT22
DHT dht(DHT_PIN, DHTTYPE);

// WiFi and MQTT Clients
WiFiClient espClient;
PubSubClient client(espClient);

// Variables
unsigned long lastMsg = 0;
const long interval = 60000; // Send data every 60 seconds

void setup() {
  Serial.begin(115200);
  
  // Initialize sensors
  dht.begin();
  pinMode(AMMONIA_PIN, INPUT);
  pinMode(TDS_PIN, INPUT);
  
  // Setup MQTT topic
  sprintf(mqtt_topic, "poultry/sensors/%s", device_id);
  
  // Connect to WiFi
  setup_wifi();
  
  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    if (client.connect(device_id, mqtt_user, mqtt_password)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

float readAmmonia() {
  int rawValue = analogRead(AMMONIA_PIN);
  // Convert to ppm (calibration may be needed)
  float voltage = rawValue * (3.3 / 4095.0);
  float ammonia = (voltage / 3.3) * 100; // Simplified conversion
  return ammonia;
}

float readCO2() {
  // Simplified CO2 reading
  // For actual MH-Z19, use appropriate library
  int rawValue = analogRead(CO2_RX_PIN);
  float co2 = map(rawValue, 0, 4095, 400, 5000); // Map to 400-5000 ppm
  return co2;
}

float readTDS() {
  int rawValue = analogRead(TDS_PIN);
  float voltage = rawValue * (3.3 / 4095.0);
  float tds = (133.42 * voltage * voltage * voltage 
               - 255.86 * voltage * voltage 
               + 857.39 * voltage) * 0.5;
  return tds;
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > interval) {
    lastMsg = now;

    // Read all sensors
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    float ammonia = readAmmonia();
    float co2 = readCO2();
    float tds = readTDS();

    // Check if readings are valid
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    // Create JSON payload
    StaticJsonDocument<256> doc;
    doc["ammonia"] = round(ammonia * 10) / 10.0;
    doc["co2"] = round(co2);
    doc["temperature"] = round(temperature * 10) / 10.0;
    doc["tds"] = round(tds);
    doc["humidity"] = round(humidity * 10) / 10.0;

    char jsonBuffer[256];
    serializeJson(doc, jsonBuffer);

    // Publish to MQTT
    Serial.print("Publishing to ");
    Serial.print(mqtt_topic);
    Serial.print(": ");
    Serial.println(jsonBuffer);

    if (client.publish(mqtt_topic, jsonBuffer)) {
      Serial.println("✓ Data sent successfully");
    } else {
      Serial.println("✗ Failed to send data");
    }

    // Print sensor readings
    Serial.println("\n--- Sensor Readings ---");
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" °C");
    
    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");
    
    Serial.print("Ammonia: ");
    Serial.print(ammonia);
    Serial.println(" ppm");
    
    Serial.print("CO2: ");
    Serial.print(co2);
    Serial.println(" ppm");
    
    Serial.print("TDS: ");
    Serial.print(tds);
    Serial.println(" ppm");
    Serial.println("----------------------\n");
  }
}
