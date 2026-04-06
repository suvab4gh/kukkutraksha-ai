import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import http from 'http';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store active WebSocket clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast sensor data to all connected clients
function broadcastSensorData(data) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN state
      client.send(message);
    }
  });
}

// Make broadcast function available globally
global.broadcastSensorData = broadcastSensorData;

// Import routes
import authRoutes from './routes/auth.js';
import farmRoutes from './routes/farms.js';
import sensorRoutes from './routes/sensors.js';
import alertRoutes from './routes/alerts.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import incidentRoutes from './routes/incidents.js';
import controlRoutes from './routes/control.js';
import predictionRoutes from './routes/predictions.js';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/control', controlRoutes);
app.use('/api/predictions', predictionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Poultry Disease Monitoring API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Initialize Supabase Connection (Primary Database - PostgreSQL)
import { supabase } from './config/supabase.js';

// Initialize MQTT Client
import mqttClient from './services/mqttService.js';
mqttClient.connect();

// Initialize Cron Jobs
import './services/cronJobs.js';

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔮 Disease Prediction Service enabled (Open-Meteo API)`);
  console.log(`💾 Database: Supabase (PostgreSQL)`);
  console.log(`🔐 Authentication: Supabase Auth`);
});

export { app, wss };
