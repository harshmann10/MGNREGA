import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="bg-linear-to-r from-blue-600 to-green-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-3xl">🏗️</span>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {t('app_title')}
            </h1>
          </Link>

          <nav className="flex items-center space-x-2 md:space-x-4">
            <Link
              to="/about"
              className="text-white hover:bg-white hover:bg-opacity-20 font-semibold px-3 py-2 rounded-lg transition-colors text-sm md:text-base"
            >
              ℹ️ {t('about_title')}
            </Link>
            <div className="border-l-2 border-white border-opacity-30 pl-2 md:pl-4">
              <LanguageToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
