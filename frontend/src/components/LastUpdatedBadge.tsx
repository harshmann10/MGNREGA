import { useTranslation } from 'react-i18next';

interface LastUpdatedBadgeProps {
  timestamp: string;
  stale?: boolean;
}

export default function LastUpdatedBadge({ timestamp, stale }: LastUpdatedBadgeProps) {
  const { t } = useTranslation();

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString();
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className="text-gray-600">{t('last_updated')}:</span>
      <span className="font-medium text-gray-900">{formatTimestamp(timestamp)}</span>
      {stale && (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
          {t('stale_data_warning')}
        </span>
      )}
    </div>
  );
}
