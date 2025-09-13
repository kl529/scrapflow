import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../utils/translations';

const LANGUAGE_STORAGE_KEY = 'scrapflow_language';
const DEFAULT_LANGUAGE = 'ko';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // 로컬스토리지에서 저장된 언어 설정을 가져오기
    try {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return savedLanguage || DEFAULT_LANGUAGE;
    } catch (error) {
      console.error('Failed to load language setting:', error);
      return DEFAULT_LANGUAGE;
    }
  });

  // 언어 변경 함수
  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLanguage(langCode);
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
      } catch (error) {
        console.error('Failed to save language setting:', error);
      }
    }
  };

  // 번역 텍스트 가져오기 함수
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // 키를 찾을 수 없으면 한국어에서 찾기
        value = translations[DEFAULT_LANGUAGE];
        for (const k of keys) {
          if (value && typeof value === 'object') {
            value = value[k];
          } else {
            break;
          }
        }
        break;
      }
    }

    return value || key;
  };

  const contextValue = {
    currentLanguage,
    changeLanguage,
    t,
    isKorean: currentLanguage === 'ko',
    isEnglish: currentLanguage === 'en'
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default useLanguage;