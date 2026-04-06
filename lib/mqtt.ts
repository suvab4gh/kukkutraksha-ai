import mqtt, { MqttClient } from 'mqtt';

export type SensorPayload = {
  ammonia: number;
  co2: number;
  temperature: number;
  tds: number;
  humidity: number;
  timestamp?: string;
};

export type MqttMessageHandler = (deviceId: string, data: SensorPayload) => void;

let client: MqttClient | null = null;
const handlers: Set<MqttMessageHandler> = new Set();

function buildBrokerUrl(): string {
  const host = process.env.NEXT_PUBLIC_MQTT_HOST;
  const port = process.env.NEXT_PUBLIC_MQTT_PORT || '8884';

  if (!host) {
    throw new Error('NEXT_PUBLIC_MQTT_HOST is not configured');
  }

  // Port 8884 = WebSocket Secure (WSS) on HiveMQ Cloud
  return `wss://${host}:${port}/mqtt`;
}

export function getMqttClient(): MqttClient {
  if (client) return client;

  const brokerUrl = buildBrokerUrl();
  const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
  const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;

  client = mqtt.connect(brokerUrl, {
    username,
    password,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
  });

  client.on('connect', () => {
    console.log('✅ MQTT connected to HiveMQ broker');
    client!.subscribe('poultry/sensors/#', (err) => {
      if (err) {
        console.error('❌ MQTT subscription error:', err);
      } else {
        console.log('📡 MQTT subscribed to poultry/sensors/#');
      }
    });
  });

  client.on('message', (topic, message) => {
    try {
      const data: SensorPayload = JSON.parse(message.toString());
      // Extract device ID from topic: poultry/sensors/{deviceId}
      const parts = topic.split('/');
      const deviceId = parts[parts.length - 1];
      handlers.forEach((handler) => handler(deviceId, data));
    } catch (err) {
      console.error('❌ MQTT message parse error:', err);
    }
  });

  client.on('error', (err) => {
    console.error('❌ MQTT error:', err);
  });

  client.on('reconnect', () => {
    console.log('🔄 MQTT reconnecting...');
  });

  client.on('close', () => {
    console.log('🔌 MQTT connection closed');
  });

  return client;
}

export function subscribeSensorData(handler: MqttMessageHandler): () => void {
  handlers.add(handler);
  // Ensure client is initialised
  getMqttClient();
  return () => {
    handlers.delete(handler);
  };
}

export function disconnectMqtt(): void {
  if (client) {
    client.end();
    client = null;
  }
}
