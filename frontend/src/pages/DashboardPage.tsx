import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import type { DistrictMetric, ComparisonData } from '../types';

export default function DashboardPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [metric, setMetric] = useState<DistrictMetric | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [meta, setMeta] = useState<{ last_updated: string; stale: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Fetch metrics and comparison in parallel
        // Trends removed - not available for most districts and not displayed on dashboard
        const [metricsResult, comparisonResult] = await Promise.allSettled([
          apiService.getMetrics(code),
          apiService.getComparison(code),
        ]);

        if (metricsResult.status === 'fulfilled') {
          setMetric(metricsResult.value.metric);
          setMeta(metricsResult.value.meta);
        }

        if (comparisonResult.status === 'fulfilled') {
          setComparison(comparisonResult.value);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(t('error_fetching_metrics'));
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [code, t]);

  const formatValue = (val: number | undefined) => {
    if (val === undefined || val === null) return 'N/A';
    return val.toLocaleString('en-IN');
  };

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || val === null) return 'N/A';
    return `₹${val.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-r from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !metric) {
    return (
      <div className="min-h-screen bg-linear-to-r from-blue-50 to-green-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('back_home')}
          </button>
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-red-800 text-lg">
            {error || t('no_data_available')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-r from-blue-50 to-green-50 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg touch-target"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('back_home')}
        </button>

        {/* District Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {metric.district_name}
          </h1>
          <p className="text-xl text-gray-600">
            {metric.state}
          </p>
          {meta && (
            <div className="mt-3 inline-block">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                meta.stale ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {t('last_updated')}: {new Date(meta.last_updated).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Main Metrics - Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Households Worked */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-700">
                {t('total_households_worked')}
              </h3>
              <span className="text-5xl">🏠</span>
            </div>
            <p className="text-4xl md:text-5xl font-bold text-blue-600">
              {formatValue(metric.total_households_worked)}
            </p>
          </div>

          {/* Person Days */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-700">
                {t('total_persondays_generated')}
              </h3>
              <span className="text-5xl">👷</span>
            </div>
            <p className="text-4xl md:text-5xl font-bold text-green-600">
              {formatValue(metric.total_persondays_generated)}
            </p>
          </div>

          {/* Wages Disbursed */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-700">
                {t('total_wage_disbursed')}
              </h3>
              <span className="text-5xl">💰</span>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-yellow-600">
              {formatCurrency(metric.total_wage_disbursed)}
            </p>
          </div>

          {/* Pending Payments */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-700">
                {t('pending_payments')}
              </h3>
              <span className="text-5xl">⏳</span>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-red-600">
              {formatCurrency(metric.pending_payments)}
            </p>
          </div>
        </div>

        {/* Comparison Section */}
        {comparison && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📊 {t('comparison_title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Your District */}
              <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  {t('your_district')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">{t('person_days')}</span>
                    <span className="font-bold text-blue-900">
                      {formatValue(comparison.district.total_persondays_generated)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">{t('wages')}</span>
                    <span className="font-bold text-blue-900">
                      {formatCurrency(comparison.district.total_wage_disbursed)}
                    </span>
                  </div>
                </div>
              </div>

              {/* State Average */}
              {comparison.state_avg ? (
                <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {t('state_average')}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{t('person_days')}</span>
                      <span className="font-bold text-gray-900">
                        {formatValue(comparison.state_avg.total_persondays_generated)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{t('wages')}</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(comparison.state_avg.total_wage_disbursed)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {t('state_average')}
                  </h3>
                  <p className="text-sm text-gray-500">{t('no_data_available')}</p>
                </div>
              )}

              {/* Top District */}
              {comparison.top_district ? (
                <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                  <h3 className="text-lg font-bold text-green-900 mb-1">
                    {t('top_district')}
                  </h3>
                  <p className="text-xs text-green-700 mb-3">
                    {comparison.top_district.district_name}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{t('person_days')}</span>
                      <span className="font-bold text-green-900">
                        {formatValue(comparison.top_district.total_persondays_generated)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{t('wages')}</span>
                      <span className="font-bold text-green-900">
                        {formatCurrency(comparison.top_district.total_wage_disbursed)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                  <h3 className="text-lg font-bold text-green-900 mb-3">
                    {t('top_district')}
                  </h3>
                  <p className="text-sm text-green-700">{t('no_data_available')}</p>
                </div>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
