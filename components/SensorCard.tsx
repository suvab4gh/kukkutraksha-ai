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

  // Calculate gradient based on risk level
  const getGradientBackground = () => {
    if (risk.status.toLowerCase().includes('critical') || risk.status.toLowerCase().includes('danger')) {
      return 'from-red-50 via-red-100 to-red-200';
    } else if (risk.status.toLowerCase().includes('warning') || risk.status.toLowerCase().includes('moderate')) {
      return 'from-yellow-50 via-yellow-100 to-yellow-200';
    } else {
      return 'from-green-50 via-green-100 to-green-200';
    }
  };

  // Calculate numeric gradient percentage (0-100, where 0 is green/good, 100 is red/critical)
  const getGradientPercentage = () => {
    if (risk.status.toLowerCase().includes('critical') || risk.status.toLowerCase().includes('danger')) {
      return 90;
    } else if (risk.status.toLowerCase().includes('warning') || risk.status.toLowerCase().includes('moderate')) {
      return 50;
    } else {
      return 10;
    }
  };

  const gradientPercentage = getGradientPercentage();

  return (
    <div 
      className={`bg-gradient-to-br ${getGradientBackground()} rounded-xl shadow-lg p-6 border-l-4 transition-all hover:shadow-xl relative overflow-hidden`} 
      style={{ borderLeftColor: risk.color.replace('text-', '#') }}
    >
      {/* Gradient Bar Indicator */}
      <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-green-500 via-yellow-500 to-red-500 opacity-30"></div>
      <div 
        className="absolute top-0 right-0 w-2 bg-white transition-all duration-500"
        style={{ height: `${100 - gradientPercentage}%` }}
      ></div>

      <div className="flex items-start justify-between mb-2 relative z-10">
        <div>
          <p className="text-sm text-gray-700 font-semibold">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-gray-900">{value.toFixed(1)}</span>
            <span className="text-sm text-gray-600 font-medium">{unit}</span>
          </div>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
      
      <div className="mt-4 flex items-center justify-between relative z-10">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${risk.bgColor} ${risk.color} shadow-sm`}>
          {risk.status}
        </div>
        
        {/* Gradient Percentage Display */}
        <div className="text-right">
          <div className="text-xs text-gray-600 font-medium">Health</div>
          <div className={`text-lg font-bold ${
            gradientPercentage < 30 ? 'text-green-700' : 
            gradientPercentage < 60 ? 'text-yellow-700' : 
            'text-red-700'
          }`}>
            {100 - gradientPercentage}%
          </div>
        </div>
      </div>
    </div>
  );
}
