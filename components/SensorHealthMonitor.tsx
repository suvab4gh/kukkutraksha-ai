'use client';

import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Circle,
  Signal,
  Battery,
  Wifi,
  ThermometerSun,
  Droplets,
  Wind,
  Zap,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface Sensor {
  _id: string;
  sensorName: string;
  sensorType: 'Temperature' | 'Humidity' | 'Ammonia' | 'CO2' | 'TDS';
  zone: string;
  status: 'Working' | 'Pending Update' | 'Not Working';
  health: number; // 0-100 percentage
  lastReading: number;
  lastUpdate: string;
  batteryLevel?: number;
  signalStrength?: number;
  readings24h?: number;
  errorCount?: number;
  calibrationDate?: string;
  notes?: string;
}

interface SensorHealthMonitorProps {
  sensors: Sensor[];
  onUpdateSensor?: (sensorId: string, updates: Partial<Sensor>) => void;
  onAddNote?: (sensorId: string, note: string) => void;
}

export default function SensorHealthMonitor({
  sensors,
  onUpdateSensor,
  onAddNote,
}: SensorHealthMonitorProps) {
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'working' | 'pending' | 'not-working'>('all');
  const [noteText, setNoteText] = useState('');

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'Temperature':
        return ThermometerSun;
      case 'Humidity':
        return Droplets;
      case 'Ammonia':
        return Wind;
      case 'CO2':
        return Wind;
      case 'TDS':
        return Droplets;
      default:
        return Activity;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (health: number) => {
    if (health >= 80) return 'bg-green-500';
    if (health >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Working':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending Update':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Not Working':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Working':
        return <Activity className="w-5 h-5 text-green-600" />;
      case 'Pending Update':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 animate-pulse" />;
      case 'Not Working':
        return <Circle className="w-5 h-5 text-red-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredSensors = sensors.filter((sensor) => {
    if (filter === 'all') return true;
    if (filter === 'working') return sensor.status === 'Working';
    if (filter === 'pending') return sensor.status === 'Pending Update';
    if (filter === 'not-working') return sensor.status === 'Not Working';
    return true;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddNote = (sensorId: string) => {
    if (noteText.trim() && onAddNote) {
      onAddNote(sensorId, noteText);
      setNoteText('');
    }
  };

  const sensorCounts = {
    all: sensors.length,
    working: sensors.filter(s => s.status === 'Working').length,
    pending: sensors.filter(s => s.status === 'Pending Update').length,
    'not-working': sensors.filter(s => s.status === 'Not Working').length,
  };

  const averageHealth = sensors.reduce((sum, s) => sum + s.health, 0) / sensors.length;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sensor Health Monitor</h2>
              <p className="text-gray-600">Real-time sensor status and performance tracking</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Average Health</p>
            <div className="flex items-center gap-2">
              <Battery className={`w-5 h-5 ${getHealthColor(averageHealth)}`} />
              <p className={`text-2xl font-bold ${getHealthColor(averageHealth)}`}>
                {Math.round(averageHealth)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">All Sensors</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{sensorCounts.all}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Working</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{sensorCounts.working}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-gray-600">Pending Update</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{sensorCounts.pending}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <Circle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-gray-600">Not Working</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{sensorCounts['not-working']}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Sensors' },
          { key: 'working', label: 'Working' },
          { key: 'pending', label: 'Pending Update' },
          { key: 'not-working', label: 'Not Working' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              filter === key
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
            <span className="ml-2 text-xs opacity-75">({sensorCounts[key as keyof typeof sensorCounts]})</span>
          </button>
        ))}
      </div>

      {/* Sensor List */}
      <div className="space-y-4">
        {filteredSensors.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No sensors found</p>
            <p className="text-gray-400 text-sm mt-1">All sensors are functioning properly!</p>
          </div>
        ) : (
          filteredSensors.map((sensor) => {
            const SensorIcon = getSensorIcon(sensor.sensorType);
            const isExpanded = selectedSensor === sensor._id;

            return (
              <div
                key={sensor._id}
                className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
              >
                {/* Sensor Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      sensor.status === 'Working' ? 'bg-green-100' : 
                      sensor.status === 'Pending Update' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <SensorIcon className={`w-6 h-6 ${
                        sensor.status === 'Working' ? 'text-green-600' : 
                        sensor.status === 'Pending Update' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        {getStatusIcon(sensor.status)}
                        <h3 className="text-lg font-semibold text-gray-900">{sensor.sensorName}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(sensor.status)}`}>
                          {sensor.status}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {sensor.sensorType}
                        </span>
                        <span className="text-xs text-gray-500">
                          Zone: {sensor.zone}
                        </span>
                        <span className="text-xs text-gray-500">
                          Last Reading: {sensor.lastReading} {sensor.sensorType === 'Temperature' ? '°C' : sensor.sensorType === 'Humidity' ? '%' : 'ppm'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Health Score */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Battery className={`w-5 h-5 ${getHealthColor(sensor.health)}`} />
                      <span className={`text-2xl font-bold ${getHealthColor(sensor.health)}`}>
                        {sensor.health}%
                      </span>
                    </div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getHealthBgColor(sensor.health)} transition-all duration-300`}
                        style={{ width: `${sensor.health}%` }}
                      />
                    </div>
                    <button
                      onClick={() => setSelectedSensor(isExpanded ? null : sensor._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {/* Sensor Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {sensor.batteryLevel !== undefined && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Battery className="w-4 h-4 text-gray-600" />
                            <span className="text-xs text-gray-600">Battery</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{sensor.batteryLevel}%</p>
                        </div>
                      )}

                      {sensor.signalStrength !== undefined && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Wifi className="w-4 h-4 text-gray-600" />
                            <span className="text-xs text-gray-600">Signal</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{sensor.signalStrength}%</p>
                        </div>
                      )}

                      {sensor.readings24h !== undefined && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-gray-600" />
                            <span className="text-xs text-gray-600">Readings (24h)</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{sensor.readings24h}</p>
                        </div>
                      )}

                      {sensor.errorCount !== undefined && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-xs text-gray-600">Errors</span>
                          </div>
                          <p className="text-lg font-semibold text-red-600">{sensor.errorCount}</p>
                        </div>
                      )}
                    </div>

                    {/* Last Update & Calibration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700 font-medium mb-1">Last Update</p>
                        <p className="text-sm text-blue-900">{formatDate(sensor.lastUpdate)}</p>
                      </div>
                      {sensor.calibrationDate && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-xs text-purple-700 font-medium mb-1">Last Calibration</p>
                          <p className="text-sm text-purple-900">{formatDate(sensor.calibrationDate)}</p>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {sensor.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-700 font-medium mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{sensor.notes}</p>
                      </div>
                    )}

                    {/* Add Note (if handler provided) */}
                    {onAddNote && sensor.status !== 'Working' && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add maintenance note..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={() => handleAddNote(sensor._id)}
                          disabled={!noteText.trim()}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          Add Note
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
