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
      className={`bg-gradient-to-br ${getGradientBackground()} rounded-xl shadow-lg p-4 md:p-6 border-l-4 transition-all hover:shadow-xl relative overflow-hidden cursor-pointer transform hover:scale-105`} 
      style={{ borderLeftColor: risk.color.replace('text-', '#') }}
    >
      {/* Gradient Bar Indicator */}
      <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-green-500 via-yellow-500 to-red-500 opacity-30"></div>
      <div 
        className="absolute top-0 right-0 w-2 bg-white transition-all duration-500"
        style={{ height: `${100 - gradientPercentage}%` }}
      ></div>

      <div className="flex items-start justify-between mb-2 relative z-10">
        <div className="flex-1">
          <p className="text-xs md:text-sm text-gray-700 font-semibold">{title}</p>
          <div className="flex items-baseline gap-1 md:gap-2 mt-1">
            <span className="text-2xl md:text-3xl font-bold text-gray-900">{value.toFixed(1)}</span>
            <span className="text-xs md:text-sm text-gray-600 font-medium">{unit}</span>
          </div>
        </div>
        <span className="text-3xl md:text-4xl">{icon}</span>
      </div>
      
      <div className="mt-3 md:mt-4 flex items-center justify-between relative z-10">
        <div className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${risk.bgColor} ${risk.color} shadow-sm`}>
          {risk.status === 'Safe' ? '✅ सुरक्षित' : risk.status === 'Moderate' ? '⚠️ सावधान' : '🚨 खतरा'}
        </div>
        
        {/* Simple Health Indicator - Easier to Understand */}
        <div className="text-right">
          <div className="flex items-center gap-1">
            <div className="w-8 md:w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  gradientPercentage < 30 ? 'bg-green-500' : 
                  gradientPercentage < 60 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${100 - gradientPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className={`text-xs md:text-sm font-bold mt-1 ${
            gradientPercentage < 30 ? 'text-green-700' : 
            gradientPercentage < 60 ? 'text-yellow-700' : 
            'text-red-700'
          }`}>
            {gradientPercentage < 30 ? 'अच्छा (Good)' : 
             gradientPercentage < 60 ? 'सावधान (Caution)' : 
             'खराब (Bad)'}
          </div>
        </div>
      </div>
    </div>
  );
}
