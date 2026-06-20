import { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import pa from '../locales/pa.json';

const I18nContext = createContext();

const translations = { en, hi, pa };

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState('en');
  
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && translations[savedLocale]) {
      setLocale(savedLocale);
    }
  }, []);

  const t = (key) => {
    const keys = key.split('.');
    let result = translations[locale];
    for (const k of keys) {
      result = result?.[k];
      if (!result) break;
    }
    return result || key;
  };

  const changeLocale = (newLocale) => {
    localStorage.setItem('locale', newLocale);
    setLocale(newLocale);
  };

  return (
    <I18nContext.Provider value={{ t, locale, setLocale: changeLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useTranslation = () => useContext(I18nContext);
