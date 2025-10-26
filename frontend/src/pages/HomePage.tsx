import { useTranslation } from 'react-i18next';
import LocationDetector from '../components/LocationDetector';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          {t('app_title')}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {t('app_description')}
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">{t('select_district')}</h2>
          <p className="text-sm text-gray-600 mb-4">
            {t('district_selector_placeholder')}
          </p>
          <LocationDetector />
        </div>
      </div>
    </div>
  );
}
