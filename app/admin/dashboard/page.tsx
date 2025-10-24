'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import axios from 'axios';
import { LogOut, Map, TrendingUp, AlertTriangle, Activity, Users } from 'lucide-react';
import AdminMap from '@/components/AdminMap';
import StatsCard from '@/components/StatsCard';

interface Farm {
  _id: string;
  farmName: string;
  location: {
    coordinates: [number, number];
  };
  district: string;
  currentStatus: string;
  email: string;
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
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Districts</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Map className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  West Bengal Farms Map
                  {selectedDistrict && ` - ${selectedDistrict}`}
                </h2>
              </div>
              <div className="h-[600px]">
                <AdminMap farms={filteredFarms} />
              </div>
            </div>
          </div>

          {/* Alerts & Farm List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Critical Alerts */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-gray-900">Critical Alerts</h2>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {alerts
                  .filter((a) => a.severity === 'critical')
                  .slice(0, 5)
                  .map((alert) => (
                    <div
                      key={alert._id}
                      className="p-3 bg-red-50 border-l-4 border-red-600 rounded"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {alert.farmId?.farmName || 'Unknown Farm'}
                      </p>
                      <p className="text-xs text-gray-700 mt-1">{alert.message}</p>
                    </div>
                  ))}
                {alerts.filter((a) => a.severity === 'critical').length === 0 && (
                  <p className="text-center text-gray-500 py-4">No critical alerts</p>
                )}
              </div>
            </div>

            {/* Farm Status List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Farm Status</h2>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredFarms.slice(0, 10).map((farm) => (
                  <div
                    key={farm._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{farm.farmName}</p>
                      <p className="text-xs text-gray-600">{farm.district}</p>
                    </div>
                    <div>
                      {farm.currentStatus === 'critical' && (
                        <span className="text-red-600 font-bold">🟥</span>
                      )}
                      {farm.currentStatus === 'warning' && (
                        <span className="text-yellow-600 font-bold">🟨</span>
                      )}
                      {farm.currentStatus === 'safe' && (
                        <span className="text-green-600 font-bold">🟩</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
