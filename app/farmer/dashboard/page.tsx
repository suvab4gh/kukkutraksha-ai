'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { LogOut, Bell, Activity, MapPin, TrendingUp, AlertCircle } from 'lucide-react';
import SensorCard from '@/components/SensorCard';
import SensorChart from '@/components/SensorChart';
import SensorTrendCard from '@/components/SensorTrendCard';
import SensorZoneHeatmap from '@/components/SensorZoneHeatmap';
import FarmerProfile from '@/components/FarmerProfile';
import FarmerBioCard from '@/components/FarmerBioCard';
import SensorHealthMonitor from '@/components/SensorHealthMonitor';
import SensorHealthPanel from '@/components/SensorHealthPanel';
import AlertsPanel from '@/components/AlertsPanel';
import { getOverallFarmStatus } from '@/lib/utils';

// Dynamic import for FarmMap to avoid SSR issues with Leaflet
const FarmMap = dynamic(() => import('@/components/FarmMap'), { ssr: false });

// Helper function to generate mock zone data (will be replaced with real API data)
function generateMockZoneData() {
  const zones = 'ABCDEFGHIJKLMNO'.split('');
  const positions = [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 },
    { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 },
    { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 },
  ];

  return zones.map((zone, index) => {
    const baseAmmonia = 15 + Math.random() * 30;
    const baseCO2 = 2000 + Math.random() * 3000;
    const baseTemp = 20 + Math.random() * 10;
    const baseTDS = 300 + Math.random() * 500;
    const baseHumidity = 50 + Math.random() * 30;

    // Calculate risk score based on all parameters
    const ammoniaRisk = baseAmmonia > 40 ? 100 : baseAmmonia > 25 ? 50 : 20;
    const co2Risk = baseCO2 > 5000 ? 100 : baseCO2 > 3000 ? 50 : 20;
    const tempRisk = baseTemp < 18 || baseTemp > 27 ? (baseTemp < 15 || baseTemp > 30 ? 100 : 50) : 20;
    const tdsRisk = baseTDS > 800 ? 100 : baseTDS > 500 ? 50 : 20;
    const humidityRisk = baseHumidity < 50 || baseHumidity > 70 ? (baseHumidity < 40 || baseHumidity > 80 ? 100 : 50) : 20;
    
    const riskScore = Math.round((ammoniaRisk + co2Risk + tempRisk + tdsRisk + humidityRisk) / 5);
    
    let status: 'safe' | 'moderate' | 'danger';
    if (riskScore <= 30) status = 'safe';
    else if (riskScore <= 60) status = 'moderate';
    else status = 'danger';

    return {
      id: `zone-${zone}`,
      zone,
      position: positions[index],
      data: {
        ammonia: Math.round(baseAmmonia * 10) / 10,
        co2: Math.round(baseCO2),
        temperature: Math.round(baseTemp * 10) / 10,
        tds: Math.round(baseTDS),
        humidity: Math.round(baseHumidity * 10) / 10,
        timestamp: new Date().toISOString(),
      },
      status,
      riskScore,
    };
  });
}

interface SensorData {
  ammonia: number;
  co2: number;
  temperature: number;
  tds: number;
  humidity: number;
  timestamp: string;
}

interface Farm {
  _id: string;
  farmName: string;
  location: {
    coordinates: [number, number];
  };
  district: string;
  currentStatus: string;
  address?: string;
  panCard?: string;
  phone?: string;
  poultryFarmId?: string;
}

export default function FarmerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const [nearbyFarms, setNearbyFarms] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [sensorHealthData, setSensorHealthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?type=farmer');
      return;
    }

    fetchFarmData();
    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [isAuthenticated]);

  const fetchFarmData = async () => {
    try {
      // Get Supabase session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Get farm details
      const farmResponse = await axios.get(`${API_URL}/api/farms/user/${user?.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFarm(farmResponse.data);

      // Get latest sensor data
      const sensorResponse = await axios.get(
        `${API_URL}/api/sensors/farm/${farmResponse.data._id}/latest`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentData(sensorResponse.data);

      // Get historical data (last 24 hours)
      const historyResponse = await axios.get(
        `${API_URL}/api/sensors/farm/${farmResponse.data._id}/history?hours=24&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistoricalData(historyResponse.data);

      // Get nearby farms
      const nearbyResponse = await axios.post(
        `${API_URL}/api/farms/nearby`,
        {
          latitude: farmResponse.data.location.coordinates[1],
          longitude: farmResponse.data.location.coordinates[0],
          radiusKm: 10,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNearbyFarms(nearbyResponse.data);

      // Get alerts
      const alertsResponse = await axios.get(
        `${API_URL}/api/alerts/farm/${farmResponse.data._id}?limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlerts(alertsResponse.data);

      // Initialize mock data for new features (will be replaced with real API calls)
      initializeMockSensorData();

      setLoading(false);
    } catch (error) {
      console.error('Error fetching farm data:', error);
      setLoading(false);
    }
  };

  // Mock sensor health data initialization
  const initializeMockSensorData = () => {
    // Mock Sensors for SensorHealthMonitor
    const mockSensors = [
      {
        _id: 'sensor1',
        sensorName: 'Temperature Sensor - Zone A',
        sensorType: 'Temperature' as const,
        zone: 'A',
        status: 'Working' as const,
        health: 95,
        lastReading: 24.5,
        lastUpdate: new Date().toISOString(),
        batteryLevel: 92,
        signalStrength: 88,
        readings24h: 1440,
        errorCount: 0,
        calibrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'sensor2',
        sensorName: 'Humidity Sensor - Zone A',
        sensorType: 'Humidity' as const,
        zone: 'A',
        status: 'Working' as const,
        health: 88,
        lastReading: 65,
        lastUpdate: new Date().toISOString(),
        batteryLevel: 78,
        signalStrength: 92,
        readings24h: 1438,
        errorCount: 2,
        calibrationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'sensor3',
        sensorName: 'Ammonia Sensor - Zone B',
        sensorType: 'Ammonia' as const,
        zone: 'B',
        status: 'Pending Update' as const,
        health: 68,
        lastReading: 28,
        lastUpdate: new Date(Date.now() - 7200000).toISOString(),
        batteryLevel: 45,
        signalStrength: 75,
        readings24h: 1320,
        errorCount: 12,
        calibrationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Battery running low. Scheduled for replacement.',
      },
      {
        _id: 'sensor4',
        sensorName: 'CO2 Sensor - Zone C',
        sensorType: 'CO2' as const,
        zone: 'C',
        status: 'Working' as const,
        health: 92,
        lastReading: 3200,
        lastUpdate: new Date().toISOString(),
        batteryLevel: 85,
        signalStrength: 90,
        readings24h: 1440,
        errorCount: 1,
        calibrationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'sensor5',
        sensorName: 'TDS Sensor - Zone D',
        sensorType: 'TDS' as const,
        zone: 'D',
        status: 'Not Working' as const,
        health: 25,
        lastReading: 0,
        lastUpdate: new Date(Date.now() - 86400000).toISOString(),
        batteryLevel: 12,
        signalStrength: 0,
        readings24h: 0,
        errorCount: 1440,
        calibrationDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Critical failure. No signal detected. Immediate replacement required.',
      },
      {
        _id: 'sensor6',
        sensorName: 'Temperature Sensor - Zone E',
        sensorType: 'Temperature' as const,
        zone: 'E',
        status: 'Working' as const,
        health: 94,
        lastReading: 23.8,
        lastUpdate: new Date().toISOString(),
        batteryLevel: 89,
        signalStrength: 95,
        readings24h: 1440,
        errorCount: 0,
        calibrationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    setSensors(mockSensors);

    // Mock Sensor Health Panel Data (iPhone-style health)
    const mockHealthData = [
      {
        _id: 'health1',
        sensorId: 'ESP32_TEMP_A01',
        sensorName: 'Temperature Sensor A',
        zone: 'A',
        health: 95,
        batteryLevel: 92,
        signalStrength: 88,
        lastUpdate: new Date().toISOString(),
        status: 'Excellent' as const,
        uptime: 99.8,
        dataAccuracy: 99.5,
        calibrationStatus: 'Good' as const,
        totalReadings: 145230,
        failedReadings: 45,
      },
      {
        _id: 'health2',
        sensorId: 'ESP32_HUM_A01',
        sensorName: 'Humidity Sensor A',
        zone: 'A',
        health: 88,
        batteryLevel: 78,
        signalStrength: 92,
        lastUpdate: new Date().toISOString(),
        status: 'Good' as const,
        uptime: 99.2,
        dataAccuracy: 98.8,
        calibrationStatus: 'Good' as const,
        totalReadings: 144890,
        failedReadings: 120,
      },
      {
        _id: 'health3',
        sensorId: 'ESP32_AMM_B01',
        sensorName: 'Ammonia Sensor B',
        zone: 'B',
        health: 68,
        batteryLevel: 45,
        signalStrength: 75,
        lastUpdate: new Date(Date.now() - 7200000).toISOString(),
        status: 'Fair' as const,
        uptime: 95.5,
        dataAccuracy: 96.2,
        calibrationStatus: 'Due Soon' as const,
        totalReadings: 138450,
        failedReadings: 890,
      },
      {
        _id: 'health4',
        sensorId: 'ESP32_CO2_C01',
        sensorName: 'CO2 Sensor C',
        zone: 'C',
        health: 92,
        batteryLevel: 85,
        signalStrength: 90,
        lastUpdate: new Date().toISOString(),
        status: 'Excellent' as const,
        uptime: 99.5,
        dataAccuracy: 99.1,
        calibrationStatus: 'Good' as const,
        totalReadings: 146780,
        failedReadings: 67,
      },
      {
        _id: 'health5',
        sensorId: 'ESP32_TDS_D01',
        sensorName: 'TDS Sensor D',
        zone: 'D',
        health: 25,
        batteryLevel: 12,
        signalStrength: 0,
        lastUpdate: new Date(Date.now() - 86400000).toISOString(),
        status: 'Critical' as const,
        uptime: 0,
        dataAccuracy: 0,
        calibrationStatus: 'Overdue' as const,
        totalReadings: 125000,
        failedReadings: 1440,
      },
      {
        _id: 'health6',
        sensorId: 'ESP32_TEMP_E01',
        sensorName: 'Temperature Sensor E',
        zone: 'E',
        health: 94,
        batteryLevel: 89,
        signalStrength: 95,
        lastUpdate: new Date().toISOString(),
        status: 'Excellent' as const,
        uptime: 99.9,
        dataAccuracy: 99.7,
        calibrationStatus: 'Good' as const,
        totalReadings: 147560,
        failedReadings: 12,
      },
      {
        _id: 'health7',
        sensorId: 'ESP32_HUM_B01',
        sensorName: 'Humidity Sensor B',
        zone: 'B',
        health: 82,
        batteryLevel: 72,
        signalStrength: 85,
        lastUpdate: new Date().toISOString(),
        status: 'Good' as const,
        uptime: 98.8,
        dataAccuracy: 98.5,
        calibrationStatus: 'Good' as const,
        totalReadings: 143220,
        failedReadings: 234,
      },
      {
        _id: 'health8',
        sensorId: 'ESP32_AMM_C01',
        sensorName: 'Ammonia Sensor C',
        zone: 'C',
        health: 55,
        batteryLevel: 38,
        signalStrength: 68,
        lastUpdate: new Date(Date.now() - 3600000).toISOString(),
        status: 'Fair' as const,
        uptime: 92.3,
        dataAccuracy: 94.8,
        calibrationStatus: 'Due Soon' as const,
        totalReadings: 135670,
        failedReadings: 1245,
      },
    ];
    setSensorHealthData(mockHealthData);
  };

  // Sensor handlers
  const handleUpdateSensor = (sensorId: string, updates: any) => {
    setSensors(sensors.map(sensor => 
      sensor._id === sensorId ? { ...sensor, ...updates } : sensor
    ));
  };

  const handleAddSensorNote = (sensorId: string, note: string) => {
    setSensors(sensors.map(sensor =>
      sensor._id === sensorId
        ? { 
            ...sensor, 
            notes: sensor.notes 
              ? `${sensor.notes}\n\n[${new Date().toLocaleString()}] ${note}`
              : note 
          }
        : sensor
    ));
  };

  const connectWebSocket = () => {
    const wsUrl = API_URL.replace('http', 'ws');
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'sensor_update' && data.farmId === farm?._id) {
        setCurrentData(data.data);
        setHistoricalData((prev) => [...prev.slice(-49), data.data]);
      } else if (data.type === 'alert' && data.farmId === farm?._id) {
        setAlerts((prev) => [data.alert, ...prev]);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const overallStatus = currentData
    ? getOverallFarmStatus(currentData)
    : { status: 'No Data', color: '#6b7280', icon: '⚪' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Activity className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{farm?.farmName}</h1>
              <p className="text-sm text-gray-600">{farm?.district} District</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Farm Status</p>
              <p className="text-lg font-semibold" style={{ color: overallStatus.color }}>
                {overallStatus.icon} {overallStatus.status}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Alert Banner */}
        {overallStatus.status.includes('Critical') && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">⚠️ Critical Alert!</p>
              <p className="text-red-800">
                Disease conditions detected. Take immediate preventive action.
              </p>
            </div>
          </div>
        )}

        {/* PRIORITY 1: SENSOR DATA FROM HIVEMQ - REAL-TIME METRICS WITH GRADIENT */}
        
        {/* Sensor Health Dashboard Section - iPhone Style */}
        <div className="mb-8">
          <SensorHealthPanel
            sensors={sensorHealthData}
          />
        </div>

        {/* Sensor Cards with Gradient Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {currentData && (
            <>
              <SensorCard
                title="Ammonia"
                value={currentData.ammonia}
                unit="ppm"
                type="ammonia"
                icon="💨"
              />
              <SensorCard
                title="CO₂"
                value={currentData.co2}
                unit="ppm"
                type="co2"
                icon="🌫️"
              />
              <SensorCard
                title="Temperature"
                value={currentData.temperature}
                unit="°C"
                type="temperature"
                icon="🌡️"
              />
              <SensorCard
                title="TDS"
                value={currentData.tds}
                unit="ppm"
                type="tds"
                icon="💧"
              />
              <SensorCard
                title="Humidity"
                value={currentData.humidity}
                unit="%"
                type="humidity"
                icon="💦"
              />
            </>
          )}
        </div>

        {/* Sensor Health Monitoring Section */}
        <div className="mb-8">
          <SensorHealthMonitor
            sensors={sensors}
            onUpdateSensor={handleUpdateSensor}
            onAddNote={handleAddSensorNote}
          />
        </div>

        {/* Disease Spread Heatmap */}
        {farm && (
          <div className="mb-8">
            <SensorZoneHeatmap
              zones={generateMockZoneData()}
              gridLayout={{ rows: 3, cols: 5 }}
              farmName={farm.farmName}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sensor Trends - Individual Cards with Gradient Graphs */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Live Sensor Trends (24 Hours)</h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  HiveMQ Connected
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ammonia Trend Card */}
                {currentData && historicalData.length > 0 && (
                  <SensorTrendCard
                    title="Ammonia Level"
                    icon="💨"
                    currentValue={currentData.ammonia}
                    unit="ppm"
                    data={historicalData}
                    dataKey="ammonia"
                    normalRange={{ min: 0, max: 25, optimal: 15 }}
                    thresholds={{
                      safe: [0, 25],
                      moderate: [25, 40],
                      danger: { max: 40 },
                    }}
                  />
                )}

                {/* CO₂ Trend Card */}
                {currentData && historicalData.length > 0 && (
                  <SensorTrendCard
                    title="CO₂ Level"
                    icon="🌫️"
                    currentValue={currentData.co2}
                    unit="ppm"
                    data={historicalData}
                    dataKey="co2"
                    normalRange={{ min: 0, max: 3000, optimal: 1500 }}
                    thresholds={{
                      safe: [0, 3000],
                      moderate: [3000, 5000],
                      danger: { max: 5000 },
                    }}
                  />
                )}

                {/* Temperature Trend Card */}
                {currentData && historicalData.length > 0 && (
                  <SensorTrendCard
                    title="Temperature"
                    icon="🌡️"
                    currentValue={currentData.temperature}
                    unit="°C"
                    data={historicalData}
                    dataKey="temperature"
                    normalRange={{ min: 18, max: 27, optimal: 22 }}
                    thresholds={{
                      safe: [18, 27],
                      moderate: [15, 30],
                      danger: { min: 15, max: 30 },
                    }}
                  />
                )}

                {/* TDS Trend Card */}
                {currentData && historicalData.length > 0 && (
                  <SensorTrendCard
                    title="TDS (Water Quality)"
                    icon="💧"
                    currentValue={currentData.tds}
                    unit="ppm"
                    data={historicalData}
                    dataKey="tds"
                    normalRange={{ min: 0, max: 500, optimal: 250 }}
                    thresholds={{
                      safe: [0, 500],
                      moderate: [500, 800],
                      danger: { max: 800 },
                    }}
                  />
                )}

                {/* Humidity Trend Card */}
                {currentData && historicalData.length > 0 && (
                  <SensorTrendCard
                    title="Humidity"
                    icon="💦"
                    currentValue={currentData.humidity}
                    unit="%"
                    data={historicalData}
                    dataKey="humidity"
                    normalRange={{ min: 50, max: 70, optimal: 60 }}
                    thresholds={{
                      safe: [50, 70],
                      moderate: [40, 80],
                      danger: { min: 40, max: 80 },
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Farmer Bio & Alerts */}
          <div className="lg:col-span-1 space-y-6">
            {/* Farmer Bio Card */}
            {farm && (
              <FarmerBioCard
                farmer={{
                  ownerName: 'Rajesh Kumar',
                  email: user?.email || 'farmer@test.com',
                  phone: '+91 98765 43210',
                  aadhaarNumber: '123456789012',
                  panCard: 'ABCDE1234F',
                  farmName: farm.farmName,
                  poultryFarmId: `WB-PF-${farm._id.slice(-8).toUpperCase()}`,
                  farmType: 'Broiler',
                  district: farm.district || 'North 24 Parganas',
                  licenseNumber: 'WB-ARD-2024-1234',
                  licenseStatus: 'Active',
                }}
              />
            )}

            {/* Alerts Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900">Recent Alerts</h2>
              </div>
              <AlertsPanel alerts={alerts} />
            </div>
          </div>
        </div>

        {/* MOVED TO BOTTOM: Nearby Farms & Location Map */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Farm Location & Nearby Farms</h2>
            <span className="ml-auto text-sm text-gray-600">{nearbyFarms.length} farms within 10km</span>
          </div>
          <div className="h-96">
            {farm && <FarmMap farm={farm} nearbyFarms={nearbyFarms} />}
          </div>
        </div>
      </main>
    </div>
  );
}
