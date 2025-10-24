'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import axios from 'axios';
import { LogOut, Map, TrendingUp, AlertTriangle, Activity, Users, Send } from 'lucide-react';
import dynamic from 'next/dynamic';
import StatsCard from '@/components/StatsCard';
import FarmOwnerList from '@/components/FarmOwnerList';

// Dynamic import for AdminMap to avoid SSR issues with Leaflet
const AdminMap = dynamic(() => import('@/components/AdminMap'), { ssr: false });

interface Farm {
  _id: string;
  farmName: string;
  location: {
    coordinates: [number, number];
  };
  district: string;
  currentStatus: string;
  email: string;
  ownerName?: string;
  phone?: string;
  farmType?: string;
  poultryFarmId?: string;
  aadhaarNumber?: string;
  panCard?: string;
  licenseStatus?: string;
  registeredDate?: string;
  latestSensorData?: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalFarms: 0,
    activeFarms: 0,
    criticalFarms: 0,
    warningFarms: 0,
    safeFarms: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [selectedFarmForAlert, setSelectedFarmForAlert] = useState<string | null>(null);
  const [emergencyMessage, setEmergencyMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login?type=admin');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      // Get Supabase session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Get all farms
      const farmsResponse = await axios.get(`${API_URL}/api/farms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFarms(farmsResponse.data);

      // Calculate stats
      const totalFarms = farmsResponse.data.length;
      const activeFarms = farmsResponse.data.filter(
        (f: Farm) => f.latestSensorData
      ).length;
      const criticalFarms = farmsResponse.data.filter(
        (f: Farm) => f.currentStatus === 'critical'
      ).length;
      const warningFarms = farmsResponse.data.filter(
        (f: Farm) => f.currentStatus === 'warning'
      ).length;
      const safeFarms = farmsResponse.data.filter(
        (f: Farm) => f.currentStatus === 'safe'
      ).length;

      setStats({
        totalFarms,
        activeFarms,
        criticalFarms,
        warningFarms,
        safeFarms,
      });

      // Get recent alerts
      const alertsResponse = await axios.get(`${API_URL}/api/alerts/recent?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(alertsResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push('/');
  };

  const handleEmergencyAlert = async (farmId: string) => {
    setSelectedFarmForAlert(farmId);
    setShowEmergencyDialog(true);
  };

  const sendEmergencyAlert = async () => {
    if (!selectedFarmForAlert || !emergencyMessage.trim()) {
      alert('Please enter an emergency message');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      await axios.post(
        `${API_URL}/api/alerts/emergency`,
        {
          farmId: selectedFarmForAlert,
          message: emergencyMessage,
          severity: 'critical',
          type: 'admin_emergency',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Emergency alert sent successfully!');
      setShowEmergencyDialog(false);
      setEmergencyMessage('');
      setSelectedFarmForAlert(null);
      
      // Refresh alerts
      fetchDashboardData();
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      alert('Failed to send emergency alert. Please try again.');
    }
  };

  const handleViewDetails = (farmId: string) => {
    // Navigate to farm details page (to be implemented)
    console.log('View details for farm:', farmId);
    // router.push(`/admin/farms/${farmId}`);
  };

  const filteredFarms = selectedDistrict
    ? farms.filter((f) => f.district === selectedDistrict)
    : farms;

  const districts = [...new Set(farms.map((f) => f.district))].filter(Boolean).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Activity className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Poultry Disease Monitoring - West Bengal</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard
            title="Total Farms"
            value={stats.totalFarms}
            icon={<Users className="w-6 h-6" />}
            color="bg-blue-100 text-blue-600"
          />
          <StatsCard
            title="Active Farms"
            value={stats.activeFarms}
            icon={<Activity className="w-6 h-6" />}
            color="bg-green-100 text-green-600"
          />
          <StatsCard
            title="Critical Farms"
            value={stats.criticalFarms}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="bg-red-100 text-red-600"
          />
          <StatsCard
            title="Warning Farms"
            value={stats.warningFarms}
            icon={<TrendingUp className="w-6 h-6" />}
            color="bg-yellow-100 text-yellow-600"
          />
          <StatsCard
            title="Safe Farms"
            value={stats.safeFarms}
            icon={<Map className="w-6 h-6" />}
            color="bg-green-100 text-green-600"
          />
        </div>

        {/* District Filter */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by District
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="">All Districts</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        {/* ENHANCED: Interactive Map with Farm Pins - Google Maps Style Pinpointing */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  West Bengal Farms Map - Live Tracking
                  {selectedDistrict && ` - ${selectedDistrict}`}
                </h2>
              </div>
              <div className="text-sm text-gray-600">
                📍 {filteredFarms.length} farms pinpointed
              </div>
            </div>
            <div className="h-[600px]">
              <AdminMap 
                farms={filteredFarms} 
                onEmergencyAlert={handleEmergencyAlert}
                onViewDetails={handleViewDetails}
              />
            </div>
          </div>
        </div>

        {/* NEW: Comprehensive Farm Owners Directory */}
        <div className="mb-8">
          <FarmOwnerList
            farms={filteredFarms}
            onEmergencyAlert={handleEmergencyAlert}
            onViewDetails={handleViewDetails}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Critical Alerts</h2>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {alerts
                .filter((a) => a.severity === 'critical')
                .slice(0, 10)
                .map((alert) => (
                  <div
                    key={alert._id}
                    className="p-3 bg-red-50 border-l-4 border-red-600 rounded hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {alert.farmId?.farmName || 'Unknown Farm'}
                        </p>
                        <p className="text-xs text-gray-700 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.createdAt || Date.now()).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEmergencyAlert(alert.farmId?._id)}
                        className="ml-2 p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Send Emergency Response"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              {alerts.filter((a) => a.severity === 'critical').length === 0 && (
                <p className="text-center text-gray-500 py-8">✅ No critical alerts</p>
              )}
            </div>
          </div>

          {/* Farm Status Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Farm Status Summary</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredFarms.slice(0, 15).map((farm) => (
                <div
                  key={farm._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(farm._id)}
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{farm.farmName}</p>
                    <p className="text-xs text-gray-600">{farm.district}</p>
                    <p className="text-xs text-gray-500">{farm.ownerName || 'Unknown Owner'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div>
                      {farm.currentStatus === 'critical' && (
                        <span className="text-red-600 font-bold text-xl">�</span>
                      )}
                      {farm.currentStatus === 'warning' && (
                        <span className="text-yellow-600 font-bold text-xl">�</span>
                      )}
                      {farm.currentStatus === 'safe' && (
                        <span className="text-green-600 font-bold text-xl">�</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmergencyAlert(farm._id);
                      }}
                      className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Alert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Alert Dialog */}
        {showEmergencyDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Send Emergency Alert</h3>
                  <p className="text-sm text-gray-600">
                    {farms.find(f => f._id === selectedFarmForAlert)?.farmName}
                  </p>
                </div>
              </div>

              <textarea
                value={emergencyMessage}
                onChange={(e) => setEmergencyMessage(e.target.value)}
                placeholder="Enter emergency message to send to the farm owner..."
                className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-gray-900"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={sendEmergencyAlert}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Alert
                </button>
                <button
                  onClick={() => {
                    setShowEmergencyDialog(false);
                    setEmergencyMessage('');
                    setSelectedFarmForAlert(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
