import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IconWrapper = ({ active, children, size = 28 }) => {
    return (
        <div style={{ width: size, height: size, position: 'relative' }}>
            <AnimatePresence>
                {active ? (
                    <motion.div
                        key="active"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute inset-0 flex items-center justify-center text-[#3390ec]"
                    >
                        {children[1]}
                    </motion.div>
                ) : (
                    <motion.div
                        key="inactive"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 flex items-center justify-center text-white/50"
                    >
                        {children[0]}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const TelegramHome = ({ active, size = 28 }) => (
    <IconWrapper active={active} size={size}>
        {/* Inactive outline */}
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" width="100%" height="100%">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9m-13 4v-4h8v4m-10-8v10h12V10" />
        </svg>
        {/* Active filled */}
        <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
            <path d="M12 3l-9 9h3v8h12v-8h3l-9-9zm-2 15v-5h4v5h-4z" />
        </svg>
    </IconWrapper>
);

export const TelegramGallery = ({ active, size = 28 }) => (
    <IconWrapper active={active} size={size}>
        {/* Inactive */}
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" width="100%" height="100%">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5l-2.5 7-7 2.5 2.5-7z" />
        </svg>
        {/* Active */}
        <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6.5l-2.5 7-7 2.5 2.5-7 7-2.5z" />
            <circle cx="12" cy="12" r="1.5" fill="white" />
        </svg>
    </IconWrapper>
);

export const TelegramHistory = ({ active, size = 28 }) => (
    <IconWrapper active={active} size={size}>
        {/* Inactive */}
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" width="100%" height="100%">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {/* Active */}
        <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4-2.37V7z" />
        </svg>
    </IconWrapper>
);

export const TelegramProfile = ({ active, size = 28 }) => (
    <IconWrapper active={active} size={size}>
        {/* Inactive */}
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" width="100%" height="100%">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
        </svg>
        {/* Active */}
        <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
            <path d="M12 14c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5zm0-3a5 5 0 100-10 5 5 0 000 10z" />
        </svg>
    </IconWrapper>
);
