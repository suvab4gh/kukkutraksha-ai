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
}

interface AdminMapProps {
  farms: Farm[];
}

export default function AdminMap({ farms }: AdminMapProps) {
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

    // Add farm markers
    farms.forEach((farm) => {
      let iconColor = '#22c55e'; // Green (safe)
      let statusText = '🟩 Safe';
      let statusLabel = 'Safe';

      if (farm.currentStatus === 'critical') {
        iconColor = '#ef4444'; // Red
        statusText = '🟥 Critical';
        statusLabel = 'Critical';
      } else if (farm.currentStatus === 'warning') {
        iconColor = '#f59e0b'; // Orange/Yellow
        statusText = '🟨 Warning';
        statusLabel = 'Warning';
      }

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${iconColor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([farm.location.coordinates[1], farm.location.coordinates[0]], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 220px; padding: 4px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${farm.farmName}</h3>
            <p style="margin: 4px 0;"><strong>District:</strong> ${farm.district || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: ${iconColor}; font-weight: bold;">${statusText}</span></p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              <strong>Owner:</strong> ${farm.email || 'N/A'}
            </p>
            <p style="margin: 4px 0; font-size: 11px; color: #999;">
              ${farm.location.coordinates[1].toFixed(4)}, ${farm.location.coordinates[0].toFixed(4)}
            </p>
          </div>
        `);
    });

    // Add legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = `
        <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
          <h4 style="margin: 0 0 8px 0; font-weight: bold;">Farm Status</h4>
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <div style="width: 16px; height: 16px; background: #22c55e; border-radius: 50%; margin-right: 8px;"></div>
            <span style="font-size: 14px;">Safe</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <div style="width: 16px; height: 16px; background: #f59e0b; border-radius: 50%; margin-right: 8px;"></div>
            <span style="font-size: 14px;">Warning</span>
          </div>
          <div style="display: flex; align-items: center;">
            <div style="width: 16px; height: 16px; background: #ef4444; border-radius: 50%; margin-right: 8px;"></div>
            <span style="font-size: 14px;">Critical</span>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [farms]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg" />;
}
