import React, { createContext, useContext, useState, useEffect } from 'react';

// Short MP3 Base64 Data URIs for immediate usage without external assets
const CLICK_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//oeZAADAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAAAZwAFCxUVFxcXGRkZGxsbHR0dHh4eICAgIiIiJCQkJSUlJycnKSkpKysrLS0tLy8vMTExMzMzOTk5Ozs7PT09Pz8/QUFBQ0NDRUVFR0dHSUlJS0tLTU1NT09PUVFRU1NTVVVVV1dXWVlZXFxcXV1dX19fYWFhY2NlTEFNRTMuMTAwWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//oeZAAABQAAYAAAAAAAEAAJAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EBIQAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//oeZAAABQAAYAAAAAAAEAAJAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EBIQAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//oeZAAABQAAYAAAAAAAEAAJAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EBIQAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//oeZAAABQAAYAAAAAAAEAAJAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EBIQAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//oeZAAABQAAYAAAAAAAEAAJAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EBIQAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//oeZAAABQAAYAAAAAAAEAAJAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EBIQAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
// A placeholder for success sound. In a real app, user should replace with a nice asset.
const SUCCESS_SOUND = 'data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
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
        // Real implementation would play audio here
        // const audio = new Audio(CLICK_SOUND);
        // audio.volume = 0.5;
        // audio.play().catch(e => console.log(e));
    };

    const playSuccess = () => {
        if (!isSoundEnabled) return;
        // const audio = new Audio(SUCCESS_SOUND);
        // audio.play().catch(e => console.log(e));
    };

    return (
        <SoundContext.Provider value={{ isSoundEnabled, toggleSound, playClick, playSuccess }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => useContext(SoundContext);
