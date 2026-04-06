'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface SensorData {
  ammonia: number;
  co2: number;
  temperature: number;
  tds: number;
  humidity: number;
  timestamp: string;
}

interface SensorChartProps {
  data: SensorData[];
}

export default function SensorChart({ data }: SensorChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No sensor data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    time: format(new Date(item.timestamp), 'HH:mm'),
    ammonia: item.ammonia,
    co2: item.co2 / 100, // Scale down for visibility
    temperature: item.temperature,
    tds: item.tds / 10, // Scale down for visibility
    humidity: item.humidity,
  }));

  return (
    <div className="space-y-6">
      {/* Temperature & Humidity Chart */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Temperature & Humidity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} name="Temperature (°C)" />
            <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="Humidity (%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Ammonia & CO2 Chart */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Ammonia & CO₂ Levels</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ammonia" stroke="#ef4444" strokeWidth={2} name="Ammonia (ppm)" />
            <Line type="monotone" dataKey="co2" stroke="#8b5cf6" strokeWidth={2} name="CO₂ (×100 ppm)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* TDS Chart */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">TDS (Water Quality)</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="tds" stroke="#06b6d4" strokeWidth={2} name="TDS (×10 ppm)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
