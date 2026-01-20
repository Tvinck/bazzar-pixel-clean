import React from 'react';

// T-Bank Logo
export const TBankLogo = ({ className = "w-12 h-6" }) => (
    <svg className={className} viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="24" rx="4" fill="#FFDD2D" />
        <text x="24" y="17" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="900" fill="#000" textAnchor="middle">T</text>
    </svg>
);

// Visa Logo
export const VisaLogo = ({ className = "w-12 h-6" }) => (
    <svg className={className} viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="24" rx="4" fill="#1A1F71" />
        <path d="M18 7L15 17H12L15 7H18ZM25 7L22 17H19L22 7H25ZM32 7L29 17H26L29 7H32ZM38 7L35 17H32L35 7H38Z" fill="white" />
        <path d="M12 10L10 14H14L12 10Z" fill="#F7B600" />
    </svg>
);

// Mastercard Logo
export const MastercardLogo = ({ className = "w-12 h-6" }) => (
    <svg className={className} viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="12" r="8" fill="#EB001B" />
        <circle cx="32" cy="12" r="8" fill="#F79E1B" />
        <path d="M24 6C21.5 8 20 10.8 20 14C20 17.2 21.5 20 24 22C26.5 20 28 17.2 28 14C28 10.8 26.5 8 24 6Z" fill="#FF5F00" />
    </svg>
);

// MIR Logo
export const MIRLogo = ({ className = "w-12 h-6" }) => (
    <svg className={className} viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="24" rx="4" fill="#4DB45E" />
        <path d="M10 8H13L16 14L19 8H22V16H20V10L17 16H15L12 10V16H10V8Z" fill="white" />
        <rect x="25" y="8" width="2" height="8" fill="white" />
        <path d="M30 8H33C35 8 36 9 36 11C36 13 35 14 33 14H32V16H30V8ZM32 10V12H33C33.5 12 34 11.5 34 11C34 10.5 33.5 10 33 10H32Z" fill="white" />
    </svg>
);

// SBP (Fast Payment System) Logo
export const SBPLogo = ({ className = "w-12 h-6" }) => (
    <svg className={className} viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="sbp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
        </defs>
        <rect width="48" height="24" rx="4" fill="url(#sbp-gradient)" />
        <circle cx="12" cy="12" r="3" fill="white" />
        <circle cx="24" cy="12" r="3" fill="white" />
        <circle cx="36" cy="12" r="3" fill="white" />
        <path d="M12 12L24 12M24 12L36 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default {
    TBankLogo,
    VisaLogo,
    MastercardLogo,
    MIRLogo,
    SBPLogo
};
