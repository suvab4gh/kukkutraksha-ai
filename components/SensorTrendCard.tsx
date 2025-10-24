'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface SensorTrendCardProps {
  title: string;
  icon: string;
  currentValue: number;
  unit: string;
  data: any[];
  dataKey: string;
  normalRange: {
    min: number;
    max: number;
    optimal?: number;
  };
  thresholds: {
    safe: [number, number];
    moderate: [number, number];
    danger: { min?: number; max?: number };
  };
}

export default function SensorTrendCard({
  title,
  icon,
  currentValue,
  unit,
  data,
  dataKey,
  normalRange,
  thresholds,
}: SensorTrendCardProps) {
  // Determine status based on current value
  const getStatus = () => {
    if (
      currentValue >= thresholds.safe[0] &&
      currentValue <= thresholds.safe[1]
    ) {
      return {
        label: 'Safe',
        color: '#10b981',
        bgColor: '#d1fae5',
        icon: '🟢',
      };
    }
    
    if (
      currentValue >= thresholds.moderate[0] &&
      currentValue <= thresholds.moderate[1]
    ) {
      return {
        label: 'Moderate',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        icon: '🟡',
      };
    }
    
    return {
      label: 'Danger',
      color: '#ef4444',
      bgColor: '#fee2e2',
      icon: '🔴',
    };
  };

  const status = getStatus();

  // Format data for chart
  const chartData = data.map((item) => ({
    time: format(new Date(item.timestamp), 'HH:mm'),
    value: item[dataKey],
    timestamp: item.timestamp,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{payload[0].payload.time}</p>
          <p className="text-sm text-gray-600">
            Value: <span className="font-bold">{payload[0].value.toFixed(1)}</span> {unit}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Normal: {normalRange.min}-{normalRange.max} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">Normal: {normalRange.min}-{normalRange.max} {unit}</p>
          </div>
        </div>
        <div
          className="px-3 py-1 rounded-full text-sm font-semibold"
          style={{
            backgroundColor: status.bgColor,
            color: status.color,
          }}
        >
          {status.icon} {status.label}
        </div>
      </div>

      {/* Current Value */}
      <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: status.bgColor }}>
        <p className="text-sm text-gray-600 mb-1">Current Reading</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold" style={{ color: status.color }}>
            {currentValue.toFixed(1)}
          </span>
          <span className="text-xl text-gray-600">{unit}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((currentValue / (normalRange.max * 1.5)) * 100, 100)}%`,
                backgroundColor: status.color,
              }}
            />
          </div>
        </div>
      </div>

      {/* Comparison Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-600">Min Safe</p>
          <p className="text-sm font-bold text-green-700">{thresholds.safe[0]}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-600">Optimal</p>
          <p className="text-sm font-bold text-blue-700">
            {normalRange.optimal || Math.round((normalRange.min + normalRange.max) / 2)}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-600">Max Safe</p>
          <p className="text-sm font-bold text-green-700">{thresholds.safe[1]}</p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">24-Hour Trend</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              domain={[0, normalRange.max * 1.5]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference lines for safe range */}
            <ReferenceLine
              y={normalRange.min}
              stroke="#10b981"
              strokeDasharray="3 3"
              label={{ value: 'Min', position: 'right', fontSize: 10 }}
            />
            <ReferenceLine
              y={normalRange.max}
              stroke="#10b981"
              strokeDasharray="3 3"
              label={{ value: 'Max', position: 'right', fontSize: 10 }}
            />
            
            {/* Optimal line */}
            {normalRange.optimal && (
              <ReferenceLine
                y={normalRange.optimal}
                stroke="#3b82f6"
                strokeDasharray="5 5"
                label={{ value: 'Optimal', position: 'right', fontSize: 10 }}
              />
            )}
            
            {/* Actual data line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={status.color}
              strokeWidth={3}
              dot={{ fill: status.color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status Message */}
      <div className="mt-4 p-3 rounded-lg bg-gray-50">
        <p className="text-xs text-gray-600">
          {status.label === 'Safe' && '✅ Values are within safe range. Continue monitoring.'}
          {status.label === 'Moderate' && '⚠️ Values are in moderate range. Increase ventilation and monitor closely.'}
          {status.label === 'Danger' && '🚨 Critical values detected! Take immediate corrective action.'}
        </p>
      </div>
    </div>
  );
}
