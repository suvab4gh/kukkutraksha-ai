import { getRiskLevel } from '@/lib/utils';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  type: string;
  icon: string;
}

export default function SensorCard({ title, value, unit, type, icon }: SensorCardProps) {
  const risk = getRiskLevel(value, type);

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 transition-all hover:shadow-xl`} style={{ borderLeftColor: risk.color.replace('text-', '#') }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-gray-900">{value.toFixed(1)}</span>
            <span className="text-sm text-gray-500">{unit}</span>
          </div>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
      
      <div className="mt-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${risk.bgColor} ${risk.color}`}>
          {risk.status}
        </div>
      </div>
    </div>
  );
}
