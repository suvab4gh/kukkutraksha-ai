'use client';

import { useState } from 'react';
import {
  Fan,
  Lightbulb,
  Droplets,
  AlertTriangle,
  Bell,
  Power,
  Settings,
  Zap,
  ThermometerSun,
  Wind,
  Lock,
  Unlock,
  Activity,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface IoTDevice {
  _id: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  zone?: string;
  status: 'Online' | 'Offline' | 'Error' | 'Maintenance';
  currentState: 'On' | 'Off' | 'Auto';
  automationEnabled: boolean;
  automationRules?: Array<{
    ruleId: string;
    condition: {
      parameter: string;
      operator: string;
      threshold: number;
    };
    action: {
      type: string;
    };
    speed?: number;
    enabled: boolean;
  }>;
  manualOverride: {
    enabled: boolean;
    expiresAt?: string;
    reason?: string;
  };
  operationHours?: number;
  lastStatusUpdate?: string;
}

interface IoTControlPanelProps {
  devices: IoTDevice[];
  onControlDevice: (deviceId: string, command: string, params?: any) => void;
  onToggleAutomation: (deviceId: string, enabled: boolean) => void;
  onManualOverride: (deviceId: string, enabled: boolean, reason?: string) => void;
}

export default function IoTControlPanel({
  devices,
  onControlDevice,
  onToggleAutomation,
  onManualOverride,
}: IoTControlPanelProps) {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'Fan':
      case 'Exhaust Fan':
        return Fan;
      case 'Light':
        return Lightbulb;
      case 'Misting System':
      case 'Water Pump':
        return Droplets;
      case 'Alarm':
      case 'Buzzer':
        return Bell;
      case 'Heater':
      case 'Temperature Controller':
        return ThermometerSun;
      case 'Ventilation System':
        return Wind;
      default:
        return Zap;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'On':
        return 'bg-green-500';
      case 'Off':
        return 'bg-gray-400';
      case 'Auto':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  const handlePowerToggle = (device: IoTDevice) => {
    const newState = device.currentState === 'On' ? 'Off' : 'On';
    onControlDevice(device._id, 'setState', { state: newState });
  };

  const handleOverrideToggle = (device: IoTDevice) => {
    if (device.manualOverride.enabled) {
      onManualOverride(device._id, false);
      setOverrideReason('');
    } else {
      if (overrideReason.trim()) {
        onManualOverride(device._id, true, overrideReason);
        setOverrideReason('');
      }
    }
  };

  const devicesByZone = devices.reduce((acc, device) => {
    const zone = device.zone || 'General';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(device);
    return acc;
  }, {} as Record<string, IoTDevice[]>);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Settings className="w-7 h-7 text-green-600" />
          IoT Device Control Panel
        </h2>
        <p className="text-gray-600">Manage and monitor automated farm equipment</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Online</span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {devices.filter(d => d.status === 'Online').length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {devices.filter(d => d.currentState === 'On').length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Automated</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">
            {devices.filter(d => d.automationEnabled).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">Manual</span>
          </div>
          <p className="text-2xl font-bold text-orange-700">
            {devices.filter(d => d.manualOverride.enabled).length}
          </p>
        </div>
      </div>

      {/* Devices by Zone */}
      <div className="space-y-6">
        {Object.entries(devicesByZone).map(([zone, zoneDevices]) => (
          <div key={zone}>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">
                {zone}
              </span>
              Zone {zone} Devices
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zoneDevices.map((device) => {
                const DeviceIcon = getDeviceIcon(device.deviceType);
                const isExpanded = selectedDevice === device._id;

                return (
                  <div
                    key={device._id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
                  >
                    {/* Device Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          device.status === 'Online' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <DeviceIcon className={`w-6 h-6 ${
                            device.status === 'Online' ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{device.deviceName}</h4>
                          <p className="text-xs text-gray-500">{device.deviceType}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(device.status)}`}>
                        {device.status}
                      </span>
                    </div>

                    {/* State Indicator */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStateColor(device.currentState)} ${
                          device.currentState === 'On' ? 'animate-pulse' : ''
                        }`} />
                        <span className="text-sm font-medium text-gray-700">
                          {device.currentState}
                        </span>
                      </div>
                      {device.operationHours !== undefined && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {device.operationHours.toFixed(1)}h
                        </span>
                      )}
                    </div>

                    {/* Automation Status */}
                    {device.automationEnabled && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-blue-800 font-medium">Automation Active</span>
                      </div>
                    )}

                    {/* Manual Override Warning */}
                    {device.manualOverride.enabled && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="w-4 h-4 text-orange-600" />
                          <span className="text-xs text-orange-800 font-medium">Manual Override</span>
                        </div>
                        {device.manualOverride.reason && (
                          <p className="text-xs text-orange-700 mt-1">{device.manualOverride.reason}</p>
                        )}
                        {device.manualOverride.expiresAt && (
                          <p className="text-xs text-orange-600 mt-1">
                            Expires: {new Date(device.manualOverride.expiresAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Control Buttons */}
                    <div className="space-y-2">
                      {device.status === 'Online' && (
                        <>
                          <button
                            onClick={() => handlePowerToggle(device)}
                            disabled={device.manualOverride.enabled && device.automationEnabled}
                            className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                              device.currentState === 'On'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <Power className="w-4 h-4" />
                            {device.currentState === 'On' ? 'Turn Off' : 'Turn On'}
                          </button>

                          <button
                            onClick={() => onToggleAutomation(device._id, !device.automationEnabled)}
                            className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                              device.automationEnabled
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                            }`}
                          >
                            <Settings className="w-4 h-4" />
                            {device.automationEnabled ? 'Disable Auto' : 'Enable Auto'}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setSelectedDevice(isExpanded ? null : device._id)}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                      >
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                        {/* Automation Rules */}
                        {device.automationRules && device.automationRules.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">Automation Rules</h5>
                            <div className="space-y-2">
                              {device.automationRules.map((rule, index) => (
                                <div
                                  key={rule.ruleId}
                                  className={`text-xs p-2 rounded-lg ${
                                    rule.enabled ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                                  }`}
                                >
                                  <p className={rule.enabled ? 'text-green-800' : 'text-gray-600'}>
                                    {rule.condition.parameter} {rule.condition.operator} {rule.condition.threshold}
                                    {' → '} {rule.action.type}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Manual Override Control */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Manual Override</h5>
                          {!device.manualOverride.enabled && (
                            <input
                              type="text"
                              value={overrideReason}
                              onChange={(e) => setOverrideReason(e.target.value)}
                              placeholder="Reason for override..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          )}
                          <button
                            onClick={() => handleOverrideToggle(device)}
                            disabled={!device.manualOverride.enabled && !overrideReason.trim()}
                            className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                              device.manualOverride.enabled
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-orange-600 text-white hover:bg-orange-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {device.manualOverride.enabled ? (
                              <>
                                <Unlock className="w-4 h-4" />
                                Release Override
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4" />
                                Enable Override
                              </>
                            )}
                          </button>
                        </div>

                        {device.lastStatusUpdate && (
                          <p className="text-xs text-gray-500 text-center pt-2">
                            Last updated: {new Date(device.lastStatusUpdate).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No IoT devices found</p>
          <p className="text-gray-400 text-sm mt-1">Configure devices to start automation</p>
        </div>
      )}
    </div>
  );
}
