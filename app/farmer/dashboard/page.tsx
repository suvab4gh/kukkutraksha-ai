'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { subscribeSensorData, disconnectMqtt } from '@/lib/mqtt';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { LogOut, Bell, Activity, MapPin, TrendingUp, AlertCircle, Globe } from 'lucide-react';
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
import { westBengalPoultryData, type PoultryData } from '@/data/westBengalPoultry';

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
  const farmRef = useRef<Farm | null>(null);
  
  // Language selection state (English, Hindi, Bengali)
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'bn'>('en');
  
  // West Bengal poultry data integration
  const [poultryData, setPoultryData] = useState<PoultryData | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // For quick test login, skip auth check if user is already set
    if (!isAuthenticated && !user) {
      router.push('/auth/login?type=farmer');
      return;
    }

    fetchFarmData();
    connectWebSocket();

    // Subscribe to direct MQTT updates for real-time sensor data
    const unsubscribe = subscribeSensorData((_deviceId, data) => {
      if (!farmRef.current) return;
      const sensorData: SensorData = { ...data, timestamp: data.timestamp || new Date().toISOString() };
      setCurrentData(sensorData);
      setHistoricalData((prev) => [...prev.slice(-49), sensorData]);
    });

    return () => {
      if (ws) {
        ws.close();
      }
      unsubscribe();
      disconnectMqtt();
    };
  }, [isAuthenticated, user]);

  // Keep farmRef in sync with farm state
  useEffect(() => {
    farmRef.current = farm;
  }, [farm]);

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
      
      // Load West Bengal poultry data for demo (first farm as default)
      if (westBengalPoultryData.length > 0) {
        setPoultryData(westBengalPoultryData[0]);
      }

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-blue-50 to-white">
      {/* Header - Simplified with larger text */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-md">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                  {poultryData ? (selectedLanguage === 'bn' ? poultryData.farmNameBn : poultryData.farmName) : farm?.farmName}
                </h1>
                <p className="text-sm md:text-base text-green-100 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {poultryData ? (
                    <>
                      {selectedLanguage === 'bn' ? poultryData.districtBn : poultryData.district}
                      {selectedLanguage === 'en' && ' District'}
                      {selectedLanguage === 'hi' && ' जिला'}
                      {selectedLanguage === 'bn' && ' জেলা'}
                    </>
                  ) : (
                    <>{farm?.district} जिला (District)</>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white font-semibold">
                  <Globe className="w-4 h-4" />
                  <span className="hidden md:inline">{selectedLanguage === 'en' ? 'English' : selectedLanguage === 'hi' ? 'हिंदी' : 'বাংলা'}</span>
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl overflow-hidden hidden group-hover:block border border-gray-200">
                  <button
                    onClick={() => setSelectedLanguage('en')}
                    className={`w-full text-left px-4 py-2 hover:bg-green-50 transition-colors ${selectedLanguage === 'en' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700'}`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('hi')}
                    className={`w-full text-left px-4 py-2 hover:bg-green-50 transition-colors ${selectedLanguage === 'hi' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700'}`}
                  >
                    🇮🇳 हिंदी
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('bn')}
                    className={`w-full text-left px-4 py-2 hover:bg-green-50 transition-colors ${selectedLanguage === 'bn' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700'}`}
                  >
                    🇮🇳 বাংলা
                  </button>
                </div>
              </div>
              
              {/* Help Button for New Users */}
              <button
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full hover:bg-yellow-300 transition-colors shadow-md font-semibold"
                onClick={() => alert('📞 Need Help? Call: 1800-XXX-XXXX\n💬 WhatsApp Support Available\n🎥 Watch Tutorial Videos')}
              >
                <span className="text-xl">🆘</span>
                <span>{selectedLanguage === 'bn' ? 'সাহায্য' : selectedLanguage === 'hi' ? 'सहायता' : 'Help'}</span>
              </button>
              
              {/* Farm Status - Larger and Clearer */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                <p className="text-xs text-green-100 font-medium">
                  {selectedLanguage === 'bn' ? 'ফার্মের অবস্থা' : selectedLanguage === 'hi' ? 'फार्म स्थिति' : 'Farm Status'}
                </p>
                <p className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
                  {overallStatus.icon} {overallStatus.status === 'Safe' ? (selectedLanguage === 'bn' ? 'নিরাপদ' : selectedLanguage === 'hi' ? 'सुरक्षित' : 'Safe') : overallStatus.status}
                </p>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md font-semibold"
                title={selectedLanguage === 'bn' ? 'লগ আউট' : selectedLanguage === 'hi' ? 'लॉग आउट' : 'Logout'}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">{selectedLanguage === 'bn' ? 'লগ আউট' : selectedLanguage === 'hi' ? 'लॉग आउट' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Welcome Message for New Users */}
        <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="text-5xl">👋</div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">नमस्ते, {user?.displayName || 'किसान भाई'}! (Namaste!)</h2>
              <p className="text-blue-100 text-sm md:text-base">
                Welcome to your Smart Farm Dashboard. Monitor your farm health in real-time.
                <br />
                अपने स्मार्ट फार्म डैशबोर्ड में आपका स्वागत है। अपने फार्म की सेहत को रियल-टाइम में मॉनिटर करें।
              </p>
            </div>
          </div>
        </div>

        {/* Alert Banner - More Prominent */}
        {overallStatus.status.includes('Critical') && (
          <div className="mb-6 p-6 bg-red-50 border-l-8 border-red-600 rounded-xl flex items-center gap-4 shadow-lg animate-pulse">
            <AlertCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-red-900">⚠️ तुरंत ध्यान दें! (Critical Alert!)</p>
              <p className="text-red-800 text-base mt-1">
                बीमारी का खतरा detected. तुरंत कार्रवाई करें! (Disease risk detected. Take immediate action!)
              </p>
              <button className="mt-3 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-semibold shadow-md">
                📞 Call Expert Now
              </button>
            </div>
          </div>
        )}

        {/* Quick Action Buttons - Large and Easy to Tap */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all flex flex-col items-center gap-2 border-2 border-green-200 hover:border-green-400">
            <span className="text-4xl">📊</span>
            <span className="text-sm font-semibold text-gray-700 text-center">View Report<br/>रिपोर्ट देखें</span>
          </button>
          <button className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all flex flex-col items-center gap-2 border-2 border-blue-200 hover:border-blue-400">
            <span className="text-4xl">📹</span>
            <span className="text-sm font-semibold text-gray-700 text-center">Watch Video<br/>वीडियो देखें</span>
          </button>
          <button className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all flex flex-col items-center gap-2 border-2 border-yellow-200 hover:border-yellow-400">
            <span className="text-4xl">💬</span>
            <span className="text-sm font-semibold text-gray-700 text-center">Chat Support<br/>चैट सहायता</span>
          </button>
          <button className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all flex flex-col items-center gap-2 border-2 border-purple-200 hover:border-purple-400">
            <span className="text-4xl">📞</span>
            <span className="text-sm font-semibold text-gray-700 text-center">Call Expert<br/>विशेषज्ञ को कॉल</span>
          </button>
        </div>

        {/* PRIORITY 1: SENSOR DATA FROM HIVEMQ - REAL-TIME METRICS WITH GRADIENT */}
        
        {/* Section Title - Hindi + English */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">📈</span>
            <div>
              <div>Live Sensor Data / लाइव सेंसर डेटा</div>
              <div className="text-sm font-normal text-gray-600 mt-1">Real-time monitoring from your farm</div>
            </div>
          </h2>
        </div>

        {/* Sensor Health Dashboard Section - iPhone Style */}
        <div className="mb-8">
          <SensorHealthPanel sensors={sensorHealthData} />
        </div>

        {/* Sensor Cards with Gradient Indicators - Larger and Clearer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {currentData && (
            <>
              <SensorCard
                title="Ammonia / अमोनिया"
                value={currentData.ammonia}
                unit="ppm"
                type="ammonia"
                icon="💨"
              />
              <SensorCard
                title="CO₂ / कार्बन डाईऑक्साइड"
                value={currentData.co2}
                unit="ppm"
                type="co2"
                icon="🌫️"
              />
              <SensorCard
                title="Temperature / तापमान"
                value={currentData.temperature}
                unit="°C"
                type="temperature"
                icon="🌡️"
              />
              <SensorCard
                title="TDS / पानी की गुणवत्ता"
                value={currentData.tds}
                unit="ppm"
                type="tds"
                icon="💧"
              />
              <SensorCard
                title="Humidity / नमी"
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
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🔧</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Sensor Health / सेंसर स्वास्थ्य
            </h2>
          </div>
          <SensorHealthMonitor
            sensors={sensors}
            onUpdateSensor={handleUpdateSensor}
            onAddNote={handleAddSensorNote}
          />
        </div>

        {/* Disease Spread Heatmap */}
        {farm && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🗺️</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Farm Zone Map / फार्म ज़ोन मैप
              </h2>
            </div>
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
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    24-Hour Trends / 24 घंटे का रुझान
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Real-time data from HiveMQ / HiveMQ से रियल-टाइम डेटा
                  </p>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  Live Connected
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ammonia Trend Card */}
                {currentData && historicalData.length > 0 && (
                  <SensorTrendCard
                    title="Ammonia Level / अमोनिया स्तर"
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
                    title="CO₂ Level / CO₂ स्तर"
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
                    title="Temperature / तापमान"
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
                    title="TDS (Water Quality) / TDS (पानी की गुणवत्ता)"
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
                    title="Humidity / नमी"
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

            {/* Alerts Panel - More Prominent */}
            <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-xl shadow-lg p-6 border-2 border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Alerts / हालिया अलर्ट
                </h2>
                {alerts.length > 0 && (
                  <span className="ml-auto px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                    {alerts.length} New
                  </span>
                )}
              </div>
              <AlertsPanel alerts={alerts} />
              
              {/* Quick Help for Alerts */}
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <p className="text-xs text-gray-600 mb-2">Need help with alerts? / अलर्ट में सहायता चाहिए?</p>
                <button className="w-full py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-300 transition-colors font-semibold text-sm flex items-center justify-center gap-2">
                  <span>📞</span> Call Expert / विशेषज्ञ को कॉल करें
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MOVED TO BOTTOM: Nearby Farms & Location Map */}
        <div className="bg-gradient-to-r from-blue-50 via-green-50 to-blue-50 rounded-xl shadow-lg p-6 border-2 border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Farm Location / फार्म का स्थान
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {nearbyFarms.length} farms nearby / आसपास के खेत
              </p>
            </div>
            <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              {nearbyFarms.length} farms within 10km
            </span>
          </div>
          <div className="h-96 rounded-lg overflow-hidden shadow-inner border-2 border-blue-200">
            {farm && <FarmMap farm={farm} nearbyFarms={nearbyFarms} />}
          </div>
        </div>

        {/* Footer with Support Info */}
        <footer className="mt-8 bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">📞</span>
              <p className="font-semibold text-gray-900">24/7 Helpline</p>
              <p className="text-sm text-gray-600">1800-XXX-XXXX</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">💬</span>
              <p className="font-semibold text-gray-900">WhatsApp Support</p>
              <p className="text-sm text-gray-600">+91 XXXXX XXXXX</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">🎥</span>
              <p className="font-semibold text-gray-900">Video Tutorials</p>
              <button className="text-sm text-blue-600 hover:underline font-medium">Watch Now →</button>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Made with ❤️ for Indian Farmers | भारतीय किसानों के लिए बनाया गया
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Powered by HiveMQ IoT | Real-time Sensor Monitoring
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
