import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// --- TYPES ---

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
}

export interface Theme {
    id: string;
    name: string;
    colors: ThemeColors;
}

export interface ThemeContextType {
    currentTheme: string;
    setCurrentTheme: (themeId: string) => void;
    themes: Record<string, Theme>;
}

// --- CONFIG ---

export const themes: Record<string, Theme> = {
    default: {
        id: 'default',
        name: 'Cosmic Purple',
        colors: {
            primary: '99 102 241', // Indigo 500
            secondary: '217 70 239', // Fuchsia 500
            accent: '168 85 247' // Purple 500
        }
    },
    toxic: {
        id: 'toxic',
        name: 'Toxic Green',
        colors: {
            primary: '132 204 22', // Lime 500
            secondary: '16 185 129', // Emerald 500
            accent: '34 197 94' // Green 500
        }
    },
    cyberpunk: {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        colors: {
            primary: '234 179 8', // Yellow 500
            secondary: '249 115 22', // Orange 500
            accent: '236 72 153' // Pink 500
        }
    },
    ocean: {
        id: 'ocean',
        name: 'Ocean Depth',
        colors: {
            primary: '6 182 212', // Cyan 500
            secondary: '59 130 246', // Blue 500
            accent: '14 165 233' // Sky 500
        }
    },
    crimson: {
        id: 'crimson',
        name: 'Crimson Fury',
        colors: {
            primary: '239 68 68', // Red 500
            secondary: '244 63 94', // Rose 500
            accent: '220 38 38' // Red 600
        }
    }
};

// --- CONTEXT ---

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState<string>('default');

    useEffect(() => {
        const saved = localStorage.getItem('app-theme');
        if (saved && themes[saved]) {
            setCurrentTheme(saved);
        }
    }, []);

    useEffect(() => {
        const theme = themes[currentTheme];
        const root = document.documentElement;

        root.style.setProperty('--color-primary', theme.colors.primary);
        root.style.setProperty('--color-secondary', theme.colors.secondary);
        root.style.setProperty('--color-accent', theme.colors.accent);

        localStorage.setItem('app-theme', currentTheme);
    }, [currentTheme]);

    const value: ThemeContextType = {
        currentTheme,
        setCurrentTheme,
        themes
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
