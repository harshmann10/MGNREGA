import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="bg-white shadow-sm border-b-2 border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-bold text-primary-600">
              {t('app_title')}
            </h1>
          </Link>

          <nav className="flex items-center space-x-4">
            <Link
              to="/about"
              className="text-gray-700 hover:text-primary-600 font-medium px-3 py-2 rounded hover:bg-gray-100"
            >
              {t('about_title')}
            </Link>
            <div className="border-l-2 border-gray-300 pl-4">
              <LanguageToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
