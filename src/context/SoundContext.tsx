import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Short MP3 Base64 Data URIs
const CLICK_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//oeZAADAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAAAZwAFCxUVFxcXGRkZGxsbHR0dHh4eICAgIiIiJCQkJSUlJycnKSkpKysrLS0tLy8vMTExMzMzOTk5Ozs7PT09Pz8/QUFBQ0NDRUVFR0dHSUlJS0tLTU1NT09PUVFRU1NTVVVVV1dXWVlZXFxcXV1dX19fYWFhY2NlTEFNRTMuMTAwWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//oeZAAABQAAYAAAAAAAEAAJAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EBIQAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//oeZAAABQAAYAAAAAAAEAAJAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EBIQAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//oeZAAABQAAYAAAAAAAEAAJAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EBIQAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//oeZAAABQAAYAAAAAAAEAAJAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EBIQAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//oeZAAABQAAYAAAAAAAEAAJAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EBIQAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//oeZAAABQAAYAAAAAAAEAAJAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EBIQAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
const SUCCESS_SOUND = 'data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

// --- TYPES ---

export interface SoundContextType {
    isSoundEnabled: boolean;
    toggleSound: () => void;
    playClick: () => void;
    playSuccess: () => void;
}

// --- CONTEXT ---

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('pixel_sound_enabled');
        if (stored !== null) {
            setIsSoundEnabled(JSON.parse(stored));
        }
    }, []);

    const toggleSound = () => {
        const newState = !isSoundEnabled;
        setIsSoundEnabled(newState);
        localStorage.setItem('pixel_sound_enabled', JSON.stringify(newState));
    };

    const playClick = () => {
        if (!isSoundEnabled) return;
        const audio = new Audio(CLICK_SOUND);
        audio.volume = 0.5;
        audio.play().catch(e => console.log(e));
    };

    const playSuccess = () => {
        if (!isSoundEnabled) return;
        const audio = new Audio(SUCCESS_SOUND);
        audio.play().catch(e => console.log(e));
    };

    const value: SoundContextType = {
        isSoundEnabled,
        toggleSound,
        playClick,
        playSuccess
    };

    return (
        <SoundContext.Provider value={value}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = (): SoundContextType => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within SoundProvider');
    }
    return context;
};
