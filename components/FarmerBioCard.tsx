'use client';

import { User, Phone, Mail, Shield, FileText, MapPin } from 'lucide-react';
import { useState } from 'react';

interface FarmerBioProps {
  farmer: {
    ownerName: string;
    email: string;
    phone: string;
    profilePicture?: string;
    aadhaarNumber: string;
    panCard: string;
    farmName: string;
    poultryFarmId: string;
    farmType: string;
    district: string;
    licenseNumber?: string;
    licenseStatus?: 'Active' | 'Expired' | 'Pending';
  };
}

export default function FarmerBioCard({ farmer }: FarmerBioProps) {
  const [showFullAadhaar, setShowFullAadhaar] = useState(false);

  // Mask Aadhaar: Show only last 4 digits
  const maskedAadhaar = showFullAadhaar
    ? farmer.aadhaarNumber
    : `XXXX XXXX ${farmer.aadhaarNumber.slice(-4)}`;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl shadow-lg p-6 border border-blue-100">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          {farmer.profilePicture ? (
            <img
              src={farmer.profilePicture}
              alt={farmer.ownerName}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Name & Farm Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-xl font-bold text-gray-900 truncate">{farmer.ownerName}</h3>
            {farmer.licenseStatus && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  farmer.licenseStatus
                )}`}
              >
                {farmer.licenseStatus}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-blue-600 mb-1">{farmer.farmName}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Farm ID: {farmer.poultryFarmId}
          </p>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Contact */}
        <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">Phone</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 truncate">{farmer.phone}</p>
        </div>

        {/* Email */}
        <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">Email</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 truncate">{farmer.email}</p>
        </div>

        {/* Farm Type & Location */}
        <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">Location</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{farmer.district}</p>
        </div>

        {/* Farm Type */}
        <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🐔</span>
            <span className="text-xs font-medium text-gray-600">Type</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{farmer.farmType}</p>
        </div>
      </div>

      {/* Verification Documents - Compact */}
      <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-xs font-semibold text-gray-700">Verified Documents</span>
        </div>
        <div className="space-y-2">
          {/* Aadhaar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">Aadhaar</span>
            </div>
            <button
              onClick={() => setShowFullAadhaar(!showFullAadhaar)}
              className="text-xs font-mono text-gray-900 hover:text-blue-600 transition-colors"
            >
              {maskedAadhaar}
            </button>
          </div>
          {/* PAN */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">PAN Card</span>
            </div>
            <span className="text-xs font-mono text-gray-900">{farmer.panCard}</span>
          </div>
          {/* License */}
          {farmer.licenseNumber && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">License</span>
              </div>
              <span className="text-xs font-mono text-gray-900">{farmer.licenseNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <Shield className="w-3 h-3" />
        <span>All information is encrypted and visible only to you</span>
      </div>
    </div>
  );
}
