import Link from "next/link";
import { AlertTriangle, Activity, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Activity className="w-20 h-20 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Poultry Disease Monitoring System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time IoT-based early detection and monitoring of poultry diseases
            using advanced sensor technology and AI analytics
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            href="/auth/login?type=farmer"
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Farmer Dashboard
              </h2>
              <p className="text-gray-600 mb-4">
                Monitor your farm's sensor data, receive real-time alerts, and track
                disease indicators
              </p>
              <div className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg group-hover:bg-green-700 transition-colors">
                Login as Farmer →
              </div>
              <Link 
                href="/test"
                className="mt-3 text-sm text-green-600 hover:text-green-700 underline"
              >
                Quick Test Login (No Auth)
              </Link>
            </div>
          </Link>

          <Link
            href="/auth/login?type=admin"
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <AlertTriangle className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h2>
              <p className="text-gray-600 mb-4">
                Monitor all registered farms, analyze district-level data, and track
                disease spread
              </p>
              <div className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 transition-colors">
                Login as Admin →
              </div>
              <Link 
                href="/test-admin"
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Quick Test Login (No Auth)
              </Link>
            </div>
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-2 text-gray-900">🌡️ Real-time Monitoring</h3>
            <p className="text-gray-600 text-sm">
              Track ammonia, CO₂, TDS, temperature, and humidity levels in real-time
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-2 text-gray-900">🚨 Early Detection</h3>
            <p className="text-gray-600 text-sm">
              AI-powered disease detection with color-coded risk indicators
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-2 text-gray-900">🗺️ Geographic Tracking</h3>
            <p className="text-gray-600 text-sm">
              Track disease spread across farms with interactive maps
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
