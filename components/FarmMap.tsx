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
  latestSensorData?: any;
}

interface FarmMapProps {
  farm: Farm;
  nearbyFarms?: Farm[];
}

export default function FarmMap({ farm, nearbyFarms = [] }: FarmMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(
      [farm.location.coordinates[1], farm.location.coordinates[0]],
      12
    );

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create custom icon for main farm
    const greenIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #22c55e; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    // Add main farm marker
    L.marker([farm.location.coordinates[1], farm.location.coordinates[0]], { icon: greenIcon })
      .addTo(map)
      .bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px;">🏠 ${farm.farmName}</h3>
          <p style="margin: 4px 0; color: #059669; font-weight: 600;">Your Farm</p>
        </div>
      `);

    // Add nearby farms
    nearbyFarms.forEach((nearbyFarm) => {
      if (nearbyFarm._id === farm._id) return;

      let iconColor = '#22c55e'; // Green (safe)
      let statusText = '🟩 Safe';

      if (nearbyFarm.currentStatus === 'critical') {
        iconColor = '#ef4444'; // Red
        statusText = '🟥 Critical';
      } else if (nearbyFarm.currentStatus === 'warning') {
        iconColor = '#f59e0b'; // Orange/Yellow
        statusText = '🟨 Warning';
      }

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([nearbyFarm.location.coordinates[1], nearbyFarm.location.coordinates[0]], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${nearbyFarm.farmName}</h3>
            <p style="margin: 4px 0;"><strong>Status:</strong> ${statusText}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              ${(nearbyFarm as any).distance ? `Distance: ${(nearbyFarm as any).distance} km` : ''}
            </p>
          </div>
        `);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [farm, nearbyFarms]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg" />;
}
