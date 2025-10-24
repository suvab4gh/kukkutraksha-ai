'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Farm {
  _id: string;
  farmName: string;
  location: {
    coordinates: [number, number];
  };
  currentStatus?: string;
  district?: string;
  email?: string;
  ownerName?: string;
  phone?: string;
  poultryFarmId?: string;
  farmType?: string;
  panCard?: string;
  aadhaarNumber?: string;
}

interface AdminMapProps {
  farms: Farm[];
  onEmergencyAlert?: (farmId: string) => void;
  onViewDetails?: (farmId: string) => void;
}

export default function AdminMap({ farms, onEmergencyAlert, onViewDetails }: AdminMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clear existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize map centered on West Bengal
    const map = L.map(mapContainerRef.current).setView([23.5, 87.5], 7);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add farm markers with enhanced info
    farms.forEach((farm) => {
      let iconColor = '#22c55e'; // Green (safe)
      let statusText = '🟩 Safe';
      let statusLabel = 'Safe';
      let statusBg = '#dcfce7';

      if (farm.currentStatus === 'critical') {
        iconColor = '#ef4444'; // Red
        statusText = '� Critical';
        statusLabel = 'Critical';
        statusBg = '#fee2e2';
      } else if (farm.currentStatus === 'warning') {
        iconColor = '#f59e0b'; // Orange/Yellow
        statusText = '� Warning';
        statusLabel = 'Warning';
        statusBg = '#fef3c7';
      }

      // Custom pin icon with pulsing animation for critical farms
      const pinSvg = farm.currentStatus === 'critical' 
        ? `<div style="position: relative;">
             <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${iconColor}; opacity: 0.3; animation: pulse 2s infinite; top: -6px; left: -6px;"></div>
             <svg width="24" height="34" viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 0C5.4 0 0 5.4 0 12c0 8.1 12 22 12 22s12-13.9 12-22c0-6.6-5.4-12-12-12z" fill="${iconColor}" stroke="white" stroke-width="2"/>
               <circle cx="12" cy="12" r="5" fill="white"/>
             </svg>
           </div>`
        : `<svg width="24" height="34" viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 0C5.4 0 0 5.4 0 12c0 8.1 12 22 12 22s12-13.9 12-22c0-6.6-5.4-12-12-12z" fill="${iconColor}" stroke="white" stroke-width="2"/>
             <circle cx="12" cy="12" r="5" fill="white"/>
           </svg>`;

      const icon = L.divIcon({
        className: 'custom-farm-pin',
        html: pinSvg,
        iconSize: [24, 34],
        iconAnchor: [12, 34],
        popupAnchor: [0, -34],
      });

      // Create enhanced popup with owner details and action buttons
      const ownerName = farm.ownerName || 'Unknown Owner';
      const phone = farm.phone || 'N/A';
      const farmId = farm.poultryFarmId || farm._id.slice(-8).toUpperCase();
      const farmType = farm.farmType || 'Broiler';
      const maskedAadhaar = farm.aadhaarNumber 
        ? `XXXX XXXX ${farm.aadhaarNumber.slice(-4)}`
        : 'N/A';

      const popupContent = `
        <div style="min-width: 280px; padding: 8px; font-family: system-ui;">
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.3; }
              50% { transform: scale(1.1); opacity: 0.1; }
            }
            .popup-btn {
              padding: 6px 12px;
              border-radius: 6px;
              border: none;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              margin-right: 4px;
              margin-top: 4px;
            }
            .popup-btn:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
          </style>
          
          <!-- Status Badge -->
          <div style="background: ${statusBg}; padding: 8px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${iconColor};">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">${farm.farmName}</div>
            <div style="font-size: 14px; font-weight: 600; color: ${iconColor};">${statusText}</div>
          </div>
          
          <!-- Owner Details -->
          <div style="margin-bottom: 12px;">
            <div style="font-size: 12px; color: #666; margin-bottom: 6px;">FARM OWNER</div>
            <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">👤 ${ownerName}</div>
            <div style="font-size: 13px; margin-bottom: 2px;">📧 ${farm.email || 'N/A'}</div>
            <div style="font-size: 13px; margin-bottom: 2px;">📞 ${phone}</div>
          </div>
          
          <!-- Farm Details -->
          <div style="margin-bottom: 12px; padding: 8px; background: #f9fafb; border-radius: 6px;">
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">FARM DETAILS</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
              <div><strong>ID:</strong> ${farmId}</div>
              <div><strong>Type:</strong> ${farmType}</div>
              <div><strong>District:</strong> ${farm.district || 'N/A'}</div>
              <div><strong>Aadhaar:</strong> ${maskedAadhaar}</div>
            </div>
          </div>
          
          <!-- Location Coordinates -->
          <div style="font-size: 11px; color: #999; margin-bottom: 8px;">
            📍 ${farm.location.coordinates[1].toFixed(5)}, ${farm.location.coordinates[0].toFixed(5)}
          </div>
          
          <!-- Action Buttons -->
          <div style="display: flex; flex-wrap: wrap; gap: 4px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <button 
              class="popup-btn" 
              onclick="window.parent.postMessage({type: 'call', farmId: '${farm._id}', phone: '${phone}'}, '*')"
              style="background: #10b981; color: white; flex: 1;">
              📞 Call
            </button>
            <button 
              class="popup-btn" 
              onclick="window.parent.postMessage({type: 'alert', farmId: '${farm._id}'}, '*')"
              style="background: #ef4444; color: white; flex: 1;">
              🚨 Alert
            </button>
            <button 
              class="popup-btn" 
              onclick="window.parent.postMessage({type: 'view', farmId: '${farm._id}'}, '*')"
              style="background: #3b82f6; color: white; width: 100%;">
              📊 View Details
            </button>
          </div>
        </div>
      `;

      L.marker([farm.location.coordinates[1], farm.location.coordinates[0]], { icon })
        .addTo(map)
        .bindPopup(popupContent, { maxWidth: 300 });
    });

    // Listen for messages from popup buttons
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'call' && event.data.phone !== 'N/A') {
        window.open(`tel:${event.data.phone}`, '_blank');
      } else if (event.data.type === 'alert' && onEmergencyAlert) {
        onEmergencyAlert(event.data.farmId);
      } else if (event.data.type === 'view' && onViewDetails) {
        onViewDetails(event.data.farmId);
      }
    };

    window.addEventListener('message', handleMessage);

    // Add enhanced legend
    const legend = new L.Control({ position: 'bottomright' });
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = `
        <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.15);">
          <h4 style="margin: 0 0 10px 0; font-weight: bold; font-size: 14px;">Farm Status Legend</h4>
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 18px; height: 18px; background: #22c55e; border-radius: 50%; margin-right: 10px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
            <span style="font-size: 13px;">Safe (${farms.filter(f => f.currentStatus === 'safe').length})</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 18px; height: 18px; background: #f59e0b; border-radius: 50%; margin-right: 10px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
            <span style="font-size: 13px;">Warning (${farms.filter(f => f.currentStatus === 'warning').length})</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 18px; height: 18px; background: #ef4444; border-radius: 50%; margin-right: 10px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
            <span style="font-size: 13px;">Critical (${farms.filter(f => f.currentStatus === 'critical').length})</span>
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666;">
            Total Farms: <strong>${farms.length}</strong>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    mapRef.current = map;

    return () => {
      window.removeEventListener('message', handleMessage);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [farms, onEmergencyAlert, onViewDetails]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg" />;
}
