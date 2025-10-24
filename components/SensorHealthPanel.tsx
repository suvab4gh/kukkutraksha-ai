'use client';

import { useState } from 'react';
import {
  Activity,
  Wifi,
  Battery,
  Signal,
  AlertTriangle,
  CheckCircle,
  Circle,
  TrendingUp,
  TrendingDown,
  Zap,
} from 'lucide-react';

interface SensorHealth {
  _id: string;
  sensorId: string;
  sensorName: string;
  zone: string;
  health: number; // 0-100 like iPhone battery health
  batteryLevel: number;
  signalStrength: number;
  lastUpdate: string;
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  uptime: number; // percentage
  dataAccuracy: number; // percentage
  calibrationStatus: 'Good' | 'Due Soon' | 'Overdue';
  totalReadings: number;
  failedReadings: number;
}

interface SensorHealthPanelProps {
  sensors: SensorHealth[];
}

export default function SensorHealthPanel({ sensors }: SensorHealthPanelProps) {
  const [selectedZone, setSelectedZone] = useState<string>('all');

  const getHealthStatus = (health: number): SensorHealth['status'] => {
    if (health >= 90) return 'Excellent';
    if (health >= 75) return 'Good';
    if (health >= 50) return 'Fair';
    if (health >= 25) return 'Poor';
    return 'Critical';
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-600';
    if (health >= 75) return 'text-blue-600';
    if (health >= 50) return 'text-yellow-600';
    if (health >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (health: number) => {
    if (health >= 90) return 'bg-green-500';
    if (health >= 75) return 'bg-blue-500';
    if (health >= 50) return 'bg-yellow-500';
    if (health >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getHealthBgLight = (health: number) => {
    if (health >= 90) return 'bg-green-50 border-green-200';
    if (health >= 75) return 'bg-blue-50 border-blue-200';
    if (health >= 50) return 'bg-yellow-50 border-yellow-200';
    if (health >= 25) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = (health: number) => {
    if (health >= 75) return <CheckCircle className={`w-5 h-5 ${getHealthColor(health)}`} />;
    if (health >= 50) return <AlertTriangle className={`w-5 h-5 ${getHealthColor(health)}`} />;
    return <Circle className={`w-5 h-5 ${getHealthColor(health)}`} />;
  };

  const zones = ['all', ...new Set(sensors.map(s => s.zone))];
  const filteredSensors = selectedZone === 'all' 
    ? sensors 
    : sensors.filter(s => s.zone === selectedZone);

  const stats = {
    total: sensors.length,
    excellent: sensors.filter(s => s.health >= 90).length,
    good: sensors.filter(s => s.health >= 75 && s.health < 90).length,
    needsAttention: sensors.filter(s => s.health < 75).length,
    averageHealth: Math.round(sensors.reduce((sum, s) => sum + s.health, 0) / sensors.length),
    averageBattery: Math.round(sensors.reduce((sum, s) => sum + s.batteryLevel, 0) / sensors.length),
    averageSignal: Math.round(sensors.reduce((sum, s) => sum + s.signalStrength, 0) / sensors.length),
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sensor Health Dashboard</h2>
              <p className="text-gray-600">Monitor sensor performance like iPhone battery health</p>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-xs text-blue-600">Sensors</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Excellent</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.excellent}</p>
            <p className="text-xs text-green-600">≥90% Health</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Good</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{stats.good}</p>
            <p className="text-xs text-blue-600">75-89% Health</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Attention</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">{stats.needsAttention}</p>
            <p className="text-xs text-orange-600">&lt;75% Health</p>
          </div>

          <div className={`p-4 rounded-xl border ${getHealthBgLight(stats.averageHealth)}`}>
            <div className="flex items-center gap-2 mb-1">
              <Battery className={`w-5 h-5 ${getHealthColor(stats.averageHealth)}`} />
              <span className="text-sm text-gray-600">Avg Health</span>
            </div>
            <p className={`text-2xl font-bold ${getHealthColor(stats.averageHealth)}`}>
              {stats.averageHealth}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Battery className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Avg Battery</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">{stats.averageBattery}%</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-gray-600">Avg Signal</span>
            </div>
            <p className="text-2xl font-bold text-indigo-700">{stats.averageSignal}%</p>
          </div>
        </div>
      </div>

      {/* Zone Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {zones.map((zone) => (
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedZone === zone
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {zone === 'all' ? 'All Zones' : `Zone ${zone}`}
          </button>
        ))}
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSensors.map((sensor) => {
          const status = getHealthStatus(sensor.health);
          const successRate = ((sensor.totalReadings - sensor.failedReadings) / sensor.totalReadings * 100).toFixed(1);

          return (
            <div
              key={sensor._id}
              className={`border-2 rounded-xl p-5 hover:shadow-lg transition-all ${getHealthBgLight(sensor.health)}`}
            >
              {/* Sensor Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(sensor.health)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{sensor.sensorName}</h3>
                    <p className="text-sm text-gray-600">Zone {sensor.zone}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  sensor.health >= 90 ? 'bg-green-500 text-white' :
                  sensor.health >= 75 ? 'bg-blue-500 text-white' :
                  sensor.health >= 50 ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {status}
                </span>
              </div>

              {/* Health Score - iPhone Style */}
              <div className="mb-4">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-600">Sensor Health</p>
                    <div className="flex items-baseline gap-1">
                      <p className={`text-4xl font-bold ${getHealthColor(sensor.health)}`}>
                        {sensor.health}
                      </p>
                      <span className={`text-xl ${getHealthColor(sensor.health)}`}>%</span>
                    </div>
                  </div>
                  <Battery className={`w-12 h-12 ${getHealthColor(sensor.health)}`} />
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getHealthBgColor(sensor.health)} transition-all duration-500`}
                    style={{ width: `${sensor.health}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {sensor.health >= 90 ? 'Your sensor is performing at peak efficiency' :
                   sensor.health >= 75 ? 'Your sensor is in good condition' :
                   sensor.health >= 50 ? 'Consider maintenance to improve performance' :
                   'Immediate attention required'}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Battery className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Battery</span>
                  </div>
                  <p className={`text-lg font-bold ${
                    sensor.batteryLevel >= 50 ? 'text-green-600' : 
                    sensor.batteryLevel >= 20 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {sensor.batteryLevel}%
                  </p>
                </div>

                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Wifi className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Signal</span>
                  </div>
                  <p className={`text-lg font-bold ${
                    sensor.signalStrength >= 70 ? 'text-green-600' : 
                    sensor.signalStrength >= 40 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {sensor.signalStrength}%
                  </p>
                </div>

                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Uptime</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{sensor.uptime}%</p>
                </div>

                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Accuracy</span>
                  </div>
                  <p className="text-lg font-bold text-purple-600">{sensor.dataAccuracy}%</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 border-t border-gray-200 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-semibold text-gray-900">{successRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Readings:</span>
                  <span className="font-semibold text-gray-900">{sensor.totalReadings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Failed:</span>
                  <span className={`font-semibold ${sensor.failedReadings > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {sensor.failedReadings}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Calibration:</span>
                  <span className={`font-semibold ${
                    sensor.calibrationStatus === 'Good' ? 'text-green-600' :
                    sensor.calibrationStatus === 'Due Soon' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {sensor.calibrationStatus}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Update:</span>
                  <span className="font-semibold text-gray-900 text-xs">
                    {new Date(sensor.lastUpdate).toLocaleString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSensors.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No sensors in this zone</p>
        </div>
      )}
    </div>
  );
}
