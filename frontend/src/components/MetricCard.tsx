import { useTranslation } from 'react-i18next';

interface MetricCardProps {
  title: string;
  value?: number;
  icon: string;
  unit?: string;
  delta?: number;
  deltaType?: 'increase' | 'decrease';
  format?: 'number' | 'currency';
}

export default function MetricCard({
  title,
  value,
  icon,
  unit,
  delta,
  deltaType,
  format = 'number',
}: MetricCardProps) {
  const { t } = useTranslation();

  const formatValue = (val: number | undefined) => {
    if (val === undefined || val === null) {
      return 'N/A';
    }
    if (format === 'currency') {
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return val.toLocaleString('en-IN');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        </div>
        <div className="text-3xl" role="img" aria-label={title}>
          {icon}
        </div>
      </div>

      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">
          {formatValue(value)}
          {unit && <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>}
        </p>
      </div>

      {delta !== undefined && (
        <div className="flex items-center text-sm">
          {deltaType === 'increase' ? (
            <span className="text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              +{Math.abs(delta).toFixed(1)}%
            </span>
          ) : deltaType === 'decrease' ? (
            <span className="text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {Math.abs(delta).toFixed(1)}%
            </span>
          ) : (
            <span className="text-gray-600">No change</span>
          )}
          <span className="text-gray-500 ml-2">{t('vs_last_month')}</span>
        </div>
      )}
    </div>
  );
}
