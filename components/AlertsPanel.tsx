import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Info, AlertCircle, XCircle } from 'lucide-react';

interface Alert {
  _id: string;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No alerts at this time</p>
        <p className="text-sm mt-1">All systems operating normally</p>
      </div>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {alerts.map((alert) => (
        <div
          key={alert._id}
          className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} ${
            !alert.isRead ? 'font-semibold' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            {getSeverityIcon(alert.severity)}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-1">{alert.title}</p>
              <p className="text-xs text-gray-700 mb-2">{alert.message}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
