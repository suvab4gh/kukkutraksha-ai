import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskLevel(value: number, type: string): {
  color: string;
  status: string;
  bgColor: string;
} {
  // Sensor threshold values for disease detection
  const thresholds = {
    ammonia: { safe: 25, moderate: 40, danger: 50 }, // ppm
    co2: { safe: 3000, moderate: 5000, danger: 7000 }, // ppm
    temperature: { safeMin: 18, safeMax: 27, dangerMin: 15, dangerMax: 32 }, // °C
    tds: { safe: 500, moderate: 800, danger: 1000 }, // ppm
    humidity: { safeMin: 50, safeMax: 70, dangerMin: 40, dangerMax: 80 }, // %
  };

  switch (type) {
    case 'ammonia':
      if (value <= thresholds.ammonia.safe) {
        return { color: 'text-green-600', status: 'Safe', bgColor: 'bg-green-100' };
      } else if (value <= thresholds.ammonia.moderate) {
        return { color: 'text-yellow-600', status: 'Moderate', bgColor: 'bg-yellow-100' };
      } else {
        return { color: 'text-red-600', status: 'Danger', bgColor: 'bg-red-100' };
      }

    case 'co2':
      if (value <= thresholds.co2.safe) {
        return { color: 'text-green-600', status: 'Safe', bgColor: 'bg-green-100' };
      } else if (value <= thresholds.co2.moderate) {
        return { color: 'text-yellow-600', status: 'Moderate', bgColor: 'bg-yellow-100' };
      } else {
        return { color: 'text-red-600', status: 'Danger', bgColor: 'bg-red-100' };
      }

    case 'temperature':
      if (value >= thresholds.temperature.safeMin && value <= thresholds.temperature.safeMax) {
        return { color: 'text-green-600', status: 'Safe', bgColor: 'bg-green-100' };
      } else if (value >= thresholds.temperature.dangerMin && value <= thresholds.temperature.dangerMax) {
        return { color: 'text-yellow-600', status: 'Moderate', bgColor: 'bg-yellow-100' };
      } else {
        return { color: 'text-red-600', status: 'Danger', bgColor: 'bg-red-100' };
      }

    case 'tds':
      if (value <= thresholds.tds.safe) {
        return { color: 'text-green-600', status: 'Safe', bgColor: 'bg-green-100' };
      } else if (value <= thresholds.tds.moderate) {
        return { color: 'text-yellow-600', status: 'Moderate', bgColor: 'bg-yellow-100' };
      } else {
        return { color: 'text-red-600', status: 'Danger', bgColor: 'bg-red-100' };
      }

    case 'humidity':
      if (value >= thresholds.humidity.safeMin && value <= thresholds.humidity.safeMax) {
        return { color: 'text-green-600', status: 'Safe', bgColor: 'bg-green-100' };
      } else if (value >= thresholds.humidity.dangerMin && value <= thresholds.humidity.dangerMax) {
        return { color: 'text-yellow-600', status: 'Moderate', bgColor: 'bg-yellow-100' };
      } else {
        return { color: 'text-red-600', status: 'Danger', bgColor: 'bg-red-100' };
      }

    default:
      return { color: 'text-gray-600', status: 'Unknown', bgColor: 'bg-gray-100' };
  }
}

export function getOverallFarmStatus(sensorData: {
  ammonia: number;
  co2: number;
  temperature: number;
  tds: number;
  humidity: number;
}): { status: string; color: string; icon: string } {
  const risks = [
    getRiskLevel(sensorData.ammonia, 'ammonia'),
    getRiskLevel(sensorData.co2, 'co2'),
    getRiskLevel(sensorData.temperature, 'temperature'),
    getRiskLevel(sensorData.tds, 'tds'),
    getRiskLevel(sensorData.humidity, 'humidity'),
  ];

  const dangerCount = risks.filter((r) => r.status === 'Danger').length;
  const moderateCount = risks.filter((r) => r.status === 'Moderate').length;

  if (dangerCount >= 2) {
    return { status: 'Critical - Disease Detected', color: '#ef4444', icon: '🟥' };
  } else if (dangerCount >= 1 || moderateCount >= 3) {
    return { status: 'Warning - Risky Condition', color: '#f59e0b', icon: '🟨' };
  } else if (moderateCount >= 1) {
    return { status: 'Caution - Monitor Closely', color: '#eab308', icon: '🟨' };
  } else {
    return { status: 'Healthy - All Systems Normal', color: '#22c55e', icon: '🟩' };
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula to calculate distance between two coordinates
  const R = 6371; // Radius of Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}
