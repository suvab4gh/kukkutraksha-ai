'use client';

import { useState } from 'react';
import {
  User,
  Building2,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  Heart,
  Package,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface FarmerProfileDetailsProps {
  farmer: {
    ownerName: string;
    email: string;
    phone: string;
    aadhaarNumber?: string;
    panCard?: string;
    address?: {
      street?: string;
      city?: string;
      district?: string;
      state?: string;
      pincode?: string;
      gpsCoordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    farmName: string;
    poultryFarmId?: string;
    farmType?: string;
    farmSize?: {
      value: number;
      unit: string;
    };
    numberOfBirds?: number;
    shedLayout?: {
      numberOfSheds: number;
      shedCapacity?: number;
      description?: string;
    };
    equipment?: Array<{
      name: string;
      type: string;
      quantity: number;
      brand?: string;
      status: string;
      installationDate?: string;
      lastMaintenanceDate?: string;
    }>;
    governmentLicense?: {
      licenseNumber?: string;
      issuingAuthority?: string;
      issueDate?: string;
      expiryDate?: string;
      status: string;
    };
    environmentalCompliance?: {
      nocNumber?: string;
      issuingAuthority?: string;
      issueDate?: string;
      expiryDate?: string;
    };
    insurance?: {
      policyNumber?: string;
      provider?: string;
      policyType?: string;
      coverageAmount?: number;
      startDate?: string;
      expiryDate?: string;
    };
    veterinaryCare?: Array<{
      doctorName: string;
      licenseNumber?: string;
      phone?: string;
      visitDate: string;
      purpose: string;
      findings?: string;
      nextVisitDate?: string;
    }>;
  };
}

export default function FarmerProfileDetails({ farmer }: FarmerProfileDetailsProps) {
  const [activeTab, setActiveTab] = useState<'owner' | 'farm' | 'compliance' | 'equipment'>('owner');

  const tabs = [
    { id: 'owner', label: 'Owner Details', icon: User },
    { id: 'farm', label: 'Farm Information', icon: Building2 },
    { id: 'compliance', label: 'Compliance & Docs', icon: Shield },
    { id: 'equipment', label: 'Equipment & Care', icon: Package },
  ];

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('operational')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (statusLower.includes('expired') || statusLower.includes('faulty')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (statusLower.includes('pending') || statusLower.includes('maintenance')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const maskAadhaar = (aadhaar?: string) => {
    if (!aadhaar) return 'Not Provided';
    return `XXXX XXXX ${aadhaar.slice(-4)}`;
  };

  return (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border-4 border-white/30">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">{farmer.ownerName}</h2>
            <p className="text-green-100 text-lg mt-1">{farmer.farmName}</p>
            <p className="text-green-100 text-sm mt-1">Farm ID: {farmer.poultryFarmId || 'Pending'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Owner Details Tab */}
        {activeTab === 'owner' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-500 font-medium">Full Name</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{farmer.ownerName}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-500 font-medium">Aadhaar Number</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 font-mono">{maskAadhaar(farmer.aadhaarNumber)}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-500 font-medium">PAN Card</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 font-mono">
                  {farmer.panCard || 'Not Provided'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-gray-500 font-medium">Email Address</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 break-all">{farmer.email}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-500 font-medium">Phone Number</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 font-mono">{farmer.phone}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-500 font-medium">Address</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {farmer.address?.street && `${farmer.address.street}, `}
                  {farmer.address?.city && `${farmer.address.city}, `}
                  {farmer.address?.district && `${farmer.address.district}, `}
                  {farmer.address?.state || 'West Bengal'}
                  {farmer.address?.pincode && ` - ${farmer.address.pincode}`}
                </p>
                {farmer.address?.gpsCoordinates && (
                  <p className="text-sm text-gray-500 mt-2">
                    GPS: {farmer.address.gpsCoordinates.latitude.toFixed(6)}, {farmer.address.gpsCoordinates.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Farm Information Tab */}
        {activeTab === 'farm' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-500 font-medium">Farm Type</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{farmer.farmType || 'Not Specified'}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-500 font-medium">Farm Size</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {farmer.farmSize ? `${farmer.farmSize.value} ${farmer.farmSize.unit.replace('_', ' ')}` : 'Not Specified'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-gray-500 font-medium">Number of Birds</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{farmer.numberOfBirds?.toLocaleString() || '0'}</p>
              </div>
            </div>

            {/* Shed Layout */}
            {farmer.shedLayout && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-green-600" />
                  Shed Layout
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Number of Sheds</p>
                    <p className="text-2xl font-bold text-gray-900">{farmer.shedLayout.numberOfSheds}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shed Capacity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {farmer.shedLayout.shedCapacity?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-sm text-gray-500 mb-2">Description</p>
                    <p className="text-gray-700">{farmer.shedLayout.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compliance & Documents Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            {/* Government License */}
            {farmer.governmentLicense && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-green-600" />
                    Government License
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(farmer.governmentLicense.status)}`}>
                    {farmer.governmentLicense.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">License Number</p>
                    <p className="text-lg font-semibold text-gray-900 font-mono">
                      {farmer.governmentLicense.licenseNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Issuing Authority</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {farmer.governmentLicense.issuingAuthority || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(farmer.governmentLicense.issueDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(farmer.governmentLicense.expiryDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Environmental Compliance */}
            {farmer.environmentalCompliance && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Environmental Compliance (NOC)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">NOC Number</p>
                    <p className="text-lg font-semibold text-gray-900 font-mono">
                      {farmer.environmentalCompliance.nocNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Issuing Authority</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {farmer.environmentalCompliance.issuingAuthority || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(farmer.environmentalCompliance.issueDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(farmer.environmentalCompliance.expiryDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Insurance */}
            {farmer.insurance && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-purple-600" />
                  Insurance Policy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Policy Number</p>
                    <p className="text-lg font-semibold text-gray-900 font-mono">
                      {farmer.insurance.policyNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Provider</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {farmer.insurance.provider || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Policy Type</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {farmer.insurance.policyType || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Coverage Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {farmer.insurance.coverageAmount 
                        ? `₹${farmer.insurance.coverageAmount.toLocaleString('en-IN')}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(farmer.insurance.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(farmer.insurance.expiryDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Equipment & Veterinary Care Tab */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            {/* Equipment */}
            {farmer.equipment && farmer.equipment.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-green-600" />
                  Equipment Inventory
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farmer.equipment.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.type}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Quantity:</span>
                          <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                        </div>
                        {item.brand && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Brand:</span>
                            <span className="text-sm font-medium text-gray-900">{item.brand}</span>
                          </div>
                        )}
                        {item.installationDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Installed:</span>
                            <span className="text-sm font-medium text-gray-900">{formatDate(item.installationDate)}</span>
                          </div>
                        )}
                        {item.lastMaintenanceDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Last Maintenance:</span>
                            <span className="text-sm font-medium text-gray-900">{formatDate(item.lastMaintenanceDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Veterinary Care */}
            {farmer.veterinaryCare && farmer.veterinaryCare.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-600" />
                  Veterinary Care History
                </h3>
                <div className="space-y-4">
                  {farmer.veterinaryCare.map((visit, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{visit.doctorName}</h4>
                          {visit.licenseNumber && (
                            <p className="text-sm text-gray-500 font-mono">License: {visit.licenseNumber}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatDate(visit.visitDate)}</p>
                          {visit.phone && (
                            <p className="text-sm text-gray-500 font-mono">{visit.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Purpose:</span>
                          <span className="text-sm text-gray-900 ml-2">{visit.purpose}</span>
                        </div>
                        {visit.findings && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Findings:</span>
                            <p className="text-sm text-gray-900 mt-1">{visit.findings}</p>
                          </div>
                        )}
                        {visit.nextVisitDate && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-700">Next Visit:</span>
                            <span className="text-sm font-medium text-blue-600">{formatDate(visit.nextVisitDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
