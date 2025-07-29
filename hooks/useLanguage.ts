import { useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from '../i18n/translations';

const LS_LANGUAGE_KEY = 'capturelearn-language';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(LS_LANGUAGE_KEY);
    if (saved && (saved === 'ja' || saved === 'en')) {
      return saved as Language;
    }
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('ja') ? 'ja' : 'en';
  });

  useEffect(() => {
    localStorage.setItem(LS_LANGUAGE_KEY, language);
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(current => current === 'ja' ? 'en' : 'ja');
  };

  return {
    language,
    setLanguage,
    t,
    toggleLanguage
  };
};