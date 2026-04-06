'use client';

import { User, MapPin, Building, CreditCard, Phone, Mail } from 'lucide-react';

interface FarmerProfileProps {
  farmer: {
    name: string;
    email: string;
    phone?: string;
    panCard: string;
    address: string;
    district: string;
    poultryFarmId: string;
    registrationDate?: string;
  };
}

export default function FarmerProfile({ farmer }: FarmerProfileProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-6 border border-green-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Farmer Profile</h2>
          <p className="text-sm text-gray-600">Personal & Farm Information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-green-600" />
            <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{farmer.name}</p>
        </div>

        {/* Poultry Farm ID */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-gray-500 uppercase font-semibold">Poultry Farm ID</p>
          </div>
          <p className="text-lg font-bold text-blue-900 font-mono">{farmer.poultryFarmId}</p>
        </div>

        {/* PAN Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <p className="text-xs text-gray-500 uppercase font-semibold">PAN Card Number</p>
          </div>
          <p className="text-lg font-bold text-gray-900 font-mono">{farmer.panCard}</p>
        </div>

        {/* Email */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-red-600" />
            <p className="text-xs text-gray-500 uppercase font-semibold">Email Address</p>
          </div>
          <p className="text-sm font-semibold text-gray-900">{farmer.email}</p>
        </div>

        {/* Phone */}
        {farmer.phone && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-500 uppercase font-semibold">Phone Number</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{farmer.phone}</p>
          </div>
        )}

        {/* Address */}
        <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-orange-600" />
            <p className="text-xs text-gray-500 uppercase font-semibold">Farm Address</p>
          </div>
          <p className="text-base font-semibold text-gray-900">{farmer.address}</p>
          <p className="text-sm text-gray-600 mt-1">District: {farmer.district}, West Bengal</p>
        </div>
      </div>
    </div>
  );
}
