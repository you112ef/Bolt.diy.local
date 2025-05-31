import React from 'react';
import { useStore } from '@nanostores/react';
import { languageCodeStore, setLanguage, LanguageCode, LanguageDirection } from '~/lib/stores/settings'; // Adjust path
import { IconButton } from './IconButton'; // Assuming IconButton can take text or children

export function LanguageSwitcher() {
  const currentLang = useStore(languageCodeStore);

  const toggleLanguage = () => {
    if (currentLang === 'en') {
      setLanguage('ar', 'rtl');
    } else {
      setLanguage('en', 'ltr');
    }
  };

  return (
    <IconButton
      onClick={toggleLanguage}
      title={`Switch to ${currentLang === 'en' ? 'Arabic' : 'English'}`}
      className="p-2" // Add some padding
    >
      {currentLang === 'en' ? 'AR' : 'EN'}
    </IconButton>
  );
}
