import { useTranslation } from 'react-i18next';
import LocationDetector from '../components/LocationDetector';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-linear-to-r from-blue-50 to-green-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏗️</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            {t('app_title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-medium">
            {t('app_description')}
          </p>
        </div>
        
        {/* Selection Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">
            {t('select_district')}
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-6 text-center">
            {t('district_selector_placeholder')}
          </p>
          <LocationDetector />
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {t('data_source')}: data.gov.in MGNREGA API
          </p>
        </div>
      </div>
    </div>
  );
}
