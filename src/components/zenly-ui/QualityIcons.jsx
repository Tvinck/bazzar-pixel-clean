import React from 'react';

// Common Gloss Overlay for all icons
const IconGloss = () => (
    <div className="absolute inset-0 rounded-card bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
);

// --- GENERIC CATEGORY ICONS ---

// 1. Image Generation (Filled Landscape)
export const IconImageGen = ({ size = 28 }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <rect x="2" y="2" width="20" height="20" rx="5" fill="white" fillOpacity="0.2" />
            <path d="M2.5 18C2.5 18 6 12.5 9 12.5C12 12.5 14 16 14 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 16C11 16 13.5 10 16.5 10C19.5 10 21.5 14 21.5 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="7" r="2" fill="white" />
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" />
        </svg>
    </div>
);

// 2. Text Work (Big 'Aa')
export const IconTextWork = ({ size = 28 }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <path d="M4 20L9.5 5H13.5L19 20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 15H16" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
    </div>
);

// 3. Smart Search (Thick Glass)
export const IconSmartSearch = ({ size = 28 }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <circle cx="10.5" cy="10.5" r="7.5" stroke="white" strokeWidth="3.5" />
            <path d="M16 16L21 21" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="10.5" cy="10.5" r="3" fill="white" fillOpacity="0.3" />
        </svg>
    </div>
);

// 4. Photo Animation (Play Bubble)
export const IconPhotoAnim = ({ size = 28 }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2.5" />
            <path d="M9.5 8L16.5 12L9.5 16V8Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    </div>
);

// 5. Video Gen (Movie Camera)
export const IconVideoGen = ({ size = 28 }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <rect x="2" y="4" width="20" height="16" rx="4" stroke="white" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2.5" />
            <path d="M12 12L12.01 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <path d="M18 4V8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 4V8" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
    </div>
);

// 6. Music (Filled Note)
export const IconMusic = ({ size = 28 }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <path d="M9 17V5L20 3V15" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="17" r="4" fill="white" />
            <circle cx="19" cy="15" r="4" fill="white" />
        </svg>
    </div>
);

// 7. Magic Eraser (Sparkle Wand)
export const IconEraser = ({ size = 26 }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <path d="M20 12L12 20L4 12L12 4L20 12Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M15.5 8.5L20 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="10" y="10" width="4" height="4" fill="white" transform="rotate(45 12 12)" />
            <path d="M18 4L21 1M18 1L21 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
    </div>
);

// --- BRAND LOGOS (REAL) ---

// 8. Midjourney (The Boat)
export const LogoMidjourney = ({ size = 28 }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <path d="M4 19C4 19 6 12 12 4C18 12 20 19 20 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 4V19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M6 16.5H18" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
        </svg>
    </div>
);

// 9. Flux (Stylized Wave/F)
export const LogoFlux = ({ size = 28 }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <path d="M4 12C4 7.58172 7.58172 4 12 4V4C16.4183 4 20 7.58172 20 12V20" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <path d="M4 12H20" stroke="white" strokeWidth="3" />
            <path d="M12 4V20" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
    </div>
);

// 10. Kling (Sharp K / Video Abstract)
export const LogoKling = ({ size = 28 }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <path d="M6 4V20" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M20 4L12 12L20 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 12H12" stroke="white" strokeWidth="3.5" />
        </svg>
    </div>
);

// 11. Luma (Dream Machine - Spark/Cloud)
export const LogoLuma = ({ size = 28 }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <path d="M12 2C8 2 4 6 4 10C4 15 10 18 12 22C14 18 20 15 20 10C20 6 16 2 12 2Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="3" fill="white" />
        </svg>
    </div>
);

// 12. Gemini (The Sparkle Star)
export const LogoGemini = ({ size = 30 }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" stroke="white" strokeWidth="1" />
        </svg>
    </div>
);
