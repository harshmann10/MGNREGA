import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import type { ComparisonData } from '../types';

export default function ComparePage() {
  const { code } = useParams<{ code: string }>();
  const { t } = useTranslation();
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    const fetchComparison = async () => {
      try {
        setLoading(true);
        const data = await apiService.getComparison(code);
        setComparison(data);
      } catch (err) {
        console.error('Failed to fetch comparison:', err);
        setError(t('error_fetching_comparison'));
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
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

  if (error || !comparison) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error || t('no_comparison_data')}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('comparison_title')}
        </h1>
        <p className="text-gray-600 mt-2">
          {comparison.district.state}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            {t('your_district')}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">{t('person_days')}</span>
              <span className="font-medium">
                {comparison.district.total_persondays_generated.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">{t('wages')}</span>
              <span className="font-medium">
                ₹{comparison.district.total_wage_disbursed.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {comparison.state_avg ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('state_average')}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{t('person_days')}</span>
                <span className="font-medium">
                  {comparison.state_avg.total_persondays_generated.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('wages')}</span>
                <span className="font-medium">
                  ₹{comparison.state_avg.total_wage_disbursed.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('state_average')}
            </h3>
            <p className="text-sm text-gray-500">{t('no_data_available')}</p>
          </div>
        )}

        {comparison.top_district ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              {t('top_district')}
            </h3>
            <p className="text-sm text-green-700 mb-3">
              {comparison.top_district.district_name}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{t('person_days')}</span>
                <span className="font-medium">
                  {comparison.top_district.total_persondays_generated.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('wages')}</span>
                <span className="font-medium">
                  ₹{comparison.top_district.total_wage_disbursed.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              {t('top_district')}
            </h3>
            <p className="text-sm text-green-500">{t('no_data_available')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
