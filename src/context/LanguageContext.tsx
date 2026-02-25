import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { ru } from '../locales/ru';
import { en } from '../locales/en';

// --- TYPES ---

export type LanguageCode = 'ru' | 'en';

export interface LanguageContextType {
    lang: LanguageCode;
    setLang: (lang: LanguageCode) => void;
    t: (key: string) => string;
}

const locales = { ru, en };

// --- CONTEXT ---

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { preferences, updatePreference } = useUserPreferences();

    // Use language from preferences, safely cast to LanguageCode
    const lang = (preferences.language as LanguageCode) || 'ru';

    const setLang = (newLang: LanguageCode) => {
        updatePreference('language', newLang);
    };

    /**
     * Get translation by nested key (e.g. 'home.discover')
     */
    const translate = (key: string, language: LanguageCode): string => {
        const parts = key.split('.');
        let current: any = locales[language];

        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            } else {
                return key; // Fallback to key if not found
            }
        }

        return typeof current === 'string' ? current : key;
    };

    // Memoize the translation function for performance
    const t = useMemo(() => (key: string): string => {
        return translate(key, lang);
    }, [lang]);

    const value: LanguageContextType = {
        lang,
        setLang,
        t
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};
