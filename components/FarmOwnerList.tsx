'use client';

import { useState } from 'react';
import { 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  User,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FarmOwner {
  _id: string;
  farmName: string;
  ownerName?: string;
  email: string;
  phone?: string;
  district?: string;
  farmType?: string;
  poultryFarmId?: string;
  currentStatus?: string;
  aadhaarNumber?: string;
  panCard?: string;
  licenseStatus?: string;
  location?: {
    coordinates: [number, number];
  };
  registeredDate?: string;
}

interface FarmOwnerListProps {
  farms: FarmOwner[];
  onEmergencyAlert?: (farmId: string) => void;
  onViewDetails?: (farmId: string) => void;
}

export default function FarmOwnerList({ farms, onEmergencyAlert, onViewDetails }: FarmOwnerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'district'>('name');
  const [expandedFarm, setExpandedFarm] = useState<string | null>(null);

  // Filter and sort farms
  const filteredFarms = farms
    .filter((farm) => {
      const matchesSearch =
        farm.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (farm.ownerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (farm.district?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        farm.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || farm.currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.farmName.localeCompare(b.farmName);
      } else if (sortBy === 'status') {
        const statusOrder = { critical: 0, warning: 1, safe: 2 };
        return (statusOrder[a.currentStatus as keyof typeof statusOrder] || 3) - 
               (statusOrder[b.currentStatus as keyof typeof statusOrder] || 3);
      } else {
        return (a.district || '').localeCompare(b.district || '');
      }
    });

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'critical':
        return {
          color: 'text-red-700',
          bg: 'bg-red-100',
          border: 'border-red-300',
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Critical',
        };
      case 'warning':
        return {
          color: 'text-yellow-700',
          bg: 'bg-yellow-100',
          border: 'border-yellow-300',
          icon: <Clock className="w-4 h-4" />,
          label: 'Warning',
        };
      case 'safe':
        return {
          color: 'text-green-700',
          bg: 'bg-green-100',
          border: 'border-green-300',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Safe',
        };
      default:
        return {
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Unknown',
        };
    }
  };

  const maskAadhaar = (aadhaar?: string) => {
    if (!aadhaar) return 'N/A';
    return `XXXX XXXX ${aadhaar.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Farm Owners Directory
        </h2>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, district, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="safe">Safe</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'status' | 'district')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
            <option value="district">Sort by District</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredFarms.length} of {farms.length} farms
        </div>
      </div>

      {/* Farm Owner Cards */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {filteredFarms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No farms found matching your criteria</p>
          </div>
        ) : (
          filteredFarms.map((farm) => {
            const status = getStatusConfig(farm.currentStatus);
            const isExpanded = expandedFarm === farm._id;

            return (
              <div
                key={farm._id}
                className={`border-2 ${status.border} rounded-lg p-4 transition-all hover:shadow-md ${status.bg} bg-opacity-20`}
              >
                {/* Main Info Row */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{farm.farmName}</h3>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bg} ${status.color} text-xs font-semibold`}>
                        {status.icon}
                        {status.label}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{farm.ownerName || 'Unknown Owner'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4" />
                        <span>{farm.district || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{farm.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4" />
                        <span>{farm.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => farm.phone && window.open(`tel:${farm.phone}`, '_blank')}
                      disabled={!farm.phone}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        farm.phone
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      📞 Call
                    </button>
                    <button
                      onClick={() => onEmergencyAlert && onEmergencyAlert(farm._id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      🚨 Alert
                    </button>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpandedFarm(isExpanded ? null : farm._id)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show More Details
                    </>
                  )}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Farm Details */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Farm Details
                        </h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Farm ID:</strong> {farm.poultryFarmId || farm._id.slice(-8).toUpperCase()}</p>
                          <p><strong>Type:</strong> {farm.farmType || 'Broiler'}</p>
                          <p><strong>Location:</strong> {farm.location ? 
                            `${farm.location.coordinates[1].toFixed(4)}, ${farm.location.coordinates[0].toFixed(4)}` : 
                            'N/A'}</p>
                          <p><strong>Registered:</strong> {farm.registeredDate ? 
                            new Date(farm.registeredDate).toLocaleDateString() : 
                            'N/A'}</p>
                        </div>
                      </div>

                      {/* Verification Details */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Verification Status
                        </h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Aadhaar:</strong> {maskAadhaar(farm.aadhaarNumber)}</p>
                          <p><strong>PAN Card:</strong> {farm.panCard || 'N/A'}</p>
                          <p><strong>License:</strong> 
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                              farm.licenseStatus === 'Active' ? 'bg-green-100 text-green-700' :
                              farm.licenseStatus === 'Expired' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {farm.licenseStatus || 'Pending'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Full Width Actions */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => onViewDetails && onViewDetails(farm._id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        📊 View Full Dashboard
                      </button>
                      <button
                        onClick={() => farm.location && window.open(
                          `https://www.google.com/maps?q=${farm.location.coordinates[1]},${farm.location.coordinates[0]}`,
                          '_blank'
                        )}
                        disabled={!farm.location}
                        className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                          farm.location
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        🗺️ Open in Maps
                      </button>
                    </div>
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
