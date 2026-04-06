'use client';

import { AlertTriangle, Activity, ThermometerSun } from 'lucide-react';
import { useState } from 'react';

interface SensorZone {
  id: string;
  zone: string; // A, B, C, D, etc.
  position: { row: number; col: number };
  data: {
    ammonia: number;
    co2: number;
    temperature: number;
    tds: number;
    humidity: number;
    timestamp: string;
  };
  status: 'safe' | 'moderate' | 'danger';
  riskScore: number; // 0-100
}

interface SensorZoneHeatmapProps {
  zones: SensorZone[];
  gridLayout: { rows: number; cols: number };
  farmName: string;
}

export default function SensorZoneHeatmap({ zones, gridLayout, farmName }: SensorZoneHeatmapProps) {
  const [selectedZone, setSelectedZone] = useState<SensorZone | null>(null);

  // Get color based on risk score (0-100)
  const getZoneColor = (riskScore: number) => {
    if (riskScore <= 30) {
      return {
        bg: 'from-green-400 to-green-500',
        border: 'border-green-600',
        text: 'text-green-900',
        shadow: 'shadow-green-300',
        glow: 'shadow-green-400/50',
      };
    } else if (riskScore <= 60) {
      return {
        bg: 'from-yellow-400 to-orange-400',
        border: 'border-orange-600',
        text: 'text-orange-900',
        shadow: 'shadow-orange-300',
        glow: 'shadow-orange-400/50',
      };
    } else {
      return {
        bg: 'from-red-500 to-red-600',
        border: 'border-red-700',
        text: 'text-red-100',
        shadow: 'shadow-red-300',
        glow: 'shadow-red-400/50',
      };
    }
  };

  // Create grid array
  const grid: (SensorZone | null)[][] = Array(gridLayout.rows)
    .fill(null)
    .map(() => Array(gridLayout.cols).fill(null));

  zones.forEach((zone) => {
    if (zone.position.row < gridLayout.rows && zone.position.col < gridLayout.cols) {
      grid[zone.position.row][zone.position.col] = zone;
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Disease Spread Map</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ThermometerSun className="w-4 h-4" />
            <span>Live Sensor Zones</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Visual representation of {farmName} showing disease risk across {zones.length} sensor zones
        </p>
      </div>

      {/* Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs font-semibold text-gray-700 mb-3">RISK LEVEL INDICATOR</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded border-2 border-green-600" />
            <span className="text-sm text-gray-700">
              <span className="font-bold">Safe</span> (0-30%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded border-2 border-orange-600" />
            <span className="text-sm text-gray-700">
              <span className="font-bold">Moderate</span> (31-60%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded border-2 border-red-700" />
            <span className="text-sm text-gray-700">
              <span className="font-bold">Danger</span> (61-100%)
            </span>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="mb-6">
        <div
          className="grid gap-3 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${gridLayout.cols}, minmax(0, 1fr))`,
            maxWidth: `${gridLayout.cols * 120}px`,
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((zone, colIndex) => {
              if (!zone) {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                  >
                    <span className="text-gray-400 text-xs">Empty</span>
                  </div>
                );
              }

              const colors = getZoneColor(zone.riskScore);
              const isSelected = selectedZone?.id === zone.id;

              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`
                    aspect-square rounded-lg border-4 transition-all duration-300 transform
                    bg-gradient-to-br ${colors.bg} ${colors.border}
                    hover:scale-110 hover:z-10 hover:shadow-2xl ${colors.glow}
                    ${isSelected ? 'scale-110 shadow-2xl ring-4 ring-blue-400 z-20' : 'shadow-lg'}
                  `}
                >
                  <div className="h-full flex flex-col items-center justify-center p-2">
                    <span className={`text-3xl font-black ${colors.text}`}>
                      {zone.zone}
                    </span>
                    <span className={`text-xs font-bold mt-1 ${colors.text}`}>
                      {zone.riskScore}%
                    </span>
                    {zone.status === 'danger' && (
                      <AlertTriangle className={`w-4 h-4 mt-1 ${colors.text} animate-pulse`} />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Zone Details */}
      {selectedZone && (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Zone {selectedZone.zone} - Detailed Readings
            </h3>
            <span
              className="px-4 py-2 rounded-full font-bold text-sm"
              style={{
                backgroundColor: getZoneColor(selectedZone.riskScore).shadow,
                color: getZoneColor(selectedZone.riskScore).text,
              }}
            >
              Risk: {selectedZone.riskScore}% - {selectedZone.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Ammonia */}
            <div className="bg-white rounded-lg p-3 shadow">
              <p className="text-xs text-gray-500 mb-1">💨 Ammonia</p>
              <p className="text-2xl font-bold text-gray-900">{selectedZone.data.ammonia}</p>
              <p className="text-xs text-gray-600">ppm</p>
            </div>

            {/* CO2 */}
            <div className="bg-white rounded-lg p-3 shadow">
              <p className="text-xs text-gray-500 mb-1">🌫️ CO₂</p>
              <p className="text-2xl font-bold text-gray-900">{selectedZone.data.co2}</p>
              <p className="text-xs text-gray-600">ppm</p>
            </div>

            {/* Temperature */}
            <div className="bg-white rounded-lg p-3 shadow">
              <p className="text-xs text-gray-500 mb-1">🌡️ Temp</p>
              <p className="text-2xl font-bold text-gray-900">{selectedZone.data.temperature}</p>
              <p className="text-xs text-gray-600">°C</p>
            </div>

            {/* TDS */}
            <div className="bg-white rounded-lg p-3 shadow">
              <p className="text-xs text-gray-500 mb-1">💧 TDS</p>
              <p className="text-2xl font-bold text-gray-900">{selectedZone.data.tds}</p>
              <p className="text-xs text-gray-600">ppm</p>
            </div>

            {/* Humidity */}
            <div className="bg-white rounded-lg p-3 shadow">
              <p className="text-xs text-gray-500 mb-1">💦 Humidity</p>
              <p className="text-2xl font-bold text-gray-900">{selectedZone.data.humidity}</p>
              <p className="text-xs text-gray-600">%</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <p className="text-sm font-semibold text-gray-700 mb-2">📋 Recommendations:</p>
            {selectedZone.status === 'safe' && (
              <p className="text-sm text-gray-600">
                ✅ All parameters are within safe range. Continue regular monitoring.
              </p>
            )}
            {selectedZone.status === 'moderate' && (
              <p className="text-sm text-gray-600">
                ⚠️ Some parameters are elevated. Increase ventilation and monitor this zone closely.
                Consider isolating if symptoms appear in birds.
              </p>
            )}
            {selectedZone.status === 'danger' && (
              <p className="text-sm text-red-700 font-semibold">
                🚨 CRITICAL: Disease conditions detected! Take immediate action:
                <br />• Isolate birds in this zone immediately
                <br />• Increase ventilation to maximum
                <br />• Check water quality and replace if needed
                <br />• Contact veterinarian for inspection
              </p>
            )}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-700">
            {zones.filter((z) => z.status === 'safe').length}
          </p>
          <p className="text-sm text-green-600 font-semibold">Safe Zones</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-orange-700">
            {zones.filter((z) => z.status === 'moderate').length}
          </p>
          <p className="text-sm text-orange-600 font-semibold">Moderate Zones</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-700">
            {zones.filter((z) => z.status === 'danger').length}
          </p>
          <p className="text-sm text-red-600 font-semibold">Danger Zones</p>
        </div>
      </div>
    </div>
  );
}
