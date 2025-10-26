import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import MetricCard from '../components/MetricCard';
import LastUpdatedBadge from '../components/LastUpdatedBadge';
import type { DistrictMetric } from '../types';

export default function DashboardPage() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [metric, setMetric] = useState<DistrictMetric | null>(null);
  const [meta, setMeta] = useState<{ last_updated: string; stale: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Year and month selection
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const yearFromUrl = searchParams.get('year');
  const [selectedYear, setSelectedYear] = useState<number>(yearFromUrl ? parseInt(yearFromUrl) : currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  // Generate financial year options (current FY and 2 years back)
  // Financial year format: YYYY-YY (e.g., 2024-25 for April 2024 - March 2025)
  const getFinancialYearLabel = (year: number) => {
    const nextYear = year + 1;
    return `${year}-${nextYear.toString().slice(-2)}`;
  };
  
  const financialYearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);
  
  // Month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    if (!code) return;

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const { metric: data, meta: metaData } = await apiService.getMetrics(
          code,
          selectedYear,
          selectedMonth
        );
        setMetric(data);
        setMeta(metaData);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
        setError(t('error_fetching_metrics'));
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [code, selectedYear, selectedMonth, t]);

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

  if (error || !metric) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error || t('no_data_available')}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('district_dashboard')}
        </h1>
        <p className="text-gray-600">
          {metric.state} - District Code: {code}
        </p>
        {meta && (
          <div className="mt-2">
            <LastUpdatedBadge timestamp={meta.last_updated} stale={meta.stale} />
          </div>
        )}
      </div>

      {/* Year and Month Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 border-2 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Select Month</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
              {t('select_year')}
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {financialYearOptions.map((year) => (
                <option key={year} value={year}>
                  {getFinancialYearLabel(year)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
              {t('select_month')}
            </label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Financial year: {getFinancialYearLabel(selectedYear)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title={t('total_households_worked')}
          value={metric.total_households_worked}
          icon="🏠"
          format="number"
        />
        <MetricCard
          title={t('total_persondays_generated')}
          value={metric.total_persondays_generated}
          icon="👷"
          format="number"
        />
        <MetricCard
          title={t('total_wage_disbursed')}
          value={metric.total_wage_disbursed}
          icon="💰"
          format="currency"
        />
        <MetricCard
          title={t('pending_payments')}
          value={metric.pending_payments}
          icon="⏳"
          format="currency"
        />
      </div>

      <div className="flex space-x-4">
        <Link
          to={`/district/${code}/trends`}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {t('trends_title')}
        </Link>
        <Link
          to={`/district/${code}/compare`}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          {t('comparison_title')}
        </Link>
      </div>
    </div>
  );
}
