import { useTranslation } from 'react-i18next';
import type { Language } from '../types';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang: Language = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="touch-target px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-semibold text-lg border-2 border-blue-500"
      aria-label="Toggle language"
    >
      {i18n.language === 'en' ? 'हिंदी' : 'ENGLISH'}
    </button>
  );
}
