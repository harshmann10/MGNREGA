import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import SimpleTrendChart from '../components/SimpleTrendChart';
import type { TrendDataPoint } from '../types';

export default function TrendsPage() {
  const { code } = useParams<{ code: string }>();
  const { t } = useTranslation();
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    const fetchTrends = async () => {
      try {
        setLoading(true);
        const data = await apiService.getTrends(code, 12);
        setTrends(data);
      } catch (err) {
        console.error('Failed to fetch trends:', err);
        setError(t('error_fetching_trends'));
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [code, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || trends.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          {error || t('no_trend_data')}
        </div>
        <Link
          to={`/district/${code}`}
          className="mt-4 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          ← {t('district_dashboard')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to={`/district/${code}`}
          className="text-primary-600 hover:text-primary-700 font-medium mb-2 inline-block"
        >
          ← {t('district_dashboard')}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('trends_title')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('last_12_months')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleTrendChart
          data={trends}
          metricKey="total_persondays_generated"
          title={t('total_persondays_generated')}
          color="#0ea5e9"
        />
        <SimpleTrendChart
          data={trends}
          metricKey="total_wage_disbursed"
          title={t('total_wage_disbursed')}
          color="#10b981"
        />
        <SimpleTrendChart
          data={trends}
          metricKey="total_households_worked"
          title={t('total_households_worked')}
          color="#f59e0b"
        />
        <SimpleTrendChart
          data={trends}
          metricKey="pending_payments"
          title={t('pending_payments')}
          color="#ef4444"
        />
      </div>
    </div>
  );
}
