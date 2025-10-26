import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        {t('about_title')}
      </h1>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {t('about_project_heading')}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {t('about_project_description')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {t('about_data_heading')}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t('about_data_description')}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>{t('data_source')}:</strong> data.gov.in MGNREGA API
            </p>
            <p className="text-sm text-blue-800 mt-2">
              <strong>{t('update_frequency')}:</strong> {t('daily_hourly_sync')}
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {t('about_features_heading')}
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t('feature_auto_detect')}</li>
            <li>{t('feature_dashboard')}</li>
            <li>{t('feature_trends')}</li>
            <li>{t('feature_comparison')}</li>
            <li>{t('feature_bilingual')}</li>
            <li>{t('feature_offline')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {t('about_contact_heading')}
          </h2>
          <p className="text-gray-700">
            {t('about_contact_description')}
          </p>
        </section>
      </div>
    </div>
  );
}
