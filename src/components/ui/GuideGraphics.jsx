import React from 'react';
import { motion } from 'framer-motion';

export const WelcomeGraphic = () => (
    <motion.svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.circle
            cx="75" cy="75" r="50" fill="url(#welcome-grad)"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <motion.path
            d="M75 35L82 60L107 68L82 75L75 100L68 75L43 68L68 60L75 35Z"
            fill="white"
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        />
        <motion.path
            d="M40 40L43 50L53 53L43 56L40 66L37 56L27 53L37 50L40 40Z"
            fill="white" opacity="0.8"
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
        />
        <motion.path
            d="M110 30L112 36L118 38L112 40L110 46L108 40L102 38L108 36L110 30Z"
            fill="white" opacity="0.6"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
        />
        <defs>
            <linearGradient id="welcome-grad" x1="25" y1="25" x2="125" y2="125" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#c084fc" />
            </linearGradient>
        </defs>
    </motion.svg>
);

export const CreateGraphic = () => (
    <motion.svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.rect
            x="35" y="35" width="80" height="80" rx="20" fill="url(#create-bg)" opacity="0.5"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        />
        <motion.path
            d="M90 35L55 85H80L70 115L105 65H80L90 35Z"
            fill="url(#create-zap)"
            animate={{ scale: [1, 1.1, 1], filter: ['drop-shadow(0 0 0px rgba(255,255,255,0))', 'drop-shadow(0 0 10px rgba(255,255,255,0.8))', 'drop-shadow(0 0 0px rgba(255,255,255,0))'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
        <defs>
            <linearGradient id="create-bg" x1="35" y1="35" x2="115" y2="115" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="create-zap" x1="55" y1="35" x2="105" y2="115" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fde047" />
                <stop offset="1" stopColor="#eab308" />
            </linearGradient>
        </defs>
    </motion.svg>
);

export const TemplatesGraphic = () => (
    <motion.svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.rect x="30" y="40" width="40" height="40" rx="8" fill="#f472b6"
            animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0 }} />
        <motion.rect x="80" y="40" width="40" height="70" rx="8" fill="#fb7185"
            animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 0.2 }} />
        <motion.rect x="30" y="90" width="40" height="20" rx="8" fill="#fbcfe8"
            animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.4 }} />
    </motion.svg>
);

export const ChatsGraphic = () => (
    <motion.svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
            d="M30 60C30 43.4315 43.4315 30 60 30H90C106.569 30 120 43.4315 120 60C120 76.5685 106.569 90 90 90H80L50 110V90C38.6256 90 30 81.3744 30 70V60Z"
            fill="url(#chats-grad)"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <motion.circle cx="60" cy="60" r="6" fill="white" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} />
        <motion.circle cx="75" cy="60" r="6" fill="white" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} />
        <motion.circle cx="90" cy="60" r="6" fill="white" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} />
        <defs>
            <linearGradient id="chats-grad" x1="30" y1="30" x2="120" y2="110" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fbbf24" />
                <stop offset="1" stopColor="#f59e0b" />
            </linearGradient>
        </defs>
    </motion.svg>
);

export const ExpertsGraphic = () => (
    <motion.svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
            d="M20 60L75 35L130 60L75 85L20 60Z"
            fill="#a78bfa"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
        <motion.path
            d="M40 70V100C40 100 60 115 75 115C90 115 110 100 110 100V70L75 85L40 70Z"
            fill="#8b5cf6"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
        <motion.path
            d="M115 65V105"
            stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
        <motion.circle cx="115" cy="115" r="5" fill="#c4b5fd" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} />
    </motion.svg>
);

export const ProfileGraphic = () => (
    <motion.svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.circle
            cx="75" cy="55" r="25" fill="#34d399"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <motion.path
            d="M30 130C30 105 50 90 75 90C100 90 120 105 120 130H30Z"
            fill="#10b981"
            animate={{ y: [0, 2, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
        <motion.circle
            cx="110" cy="50" r="10" fill="#fde047"
            animate={{ rotate: [0, 360], scale: [0.8, 1.2, 0.8] }}
            transition={{ rotate: { repeat: Infinity, duration: 8, ease: "linear" }, scale: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
        />
        <motion.path d="M110 40V35" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
        <motion.path d="M110 65V60" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
        <motion.path d="M120 50H125" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
        <motion.path d="M95 50H100" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
    </motion.svg>
);

export const HistoryGraphic = () => (
    <motion.svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.circle
            cx="75" cy="75" r="45" fill="url(#history-bg)" opacity="0.3"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <motion.circle
            cx="75" cy="75" r="35" stroke="url(#history-stroke)" strokeWidth="8" strokeLinecap="round" strokeDasharray="180"
            animate={{ rotate: 360, strokeDashoffset: [0, 50, 0] }}
            transition={{ rotate: { repeat: Infinity, duration: 10, ease: "linear" }, strokeDashoffset: { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
        />
        <motion.path
            d="M75 55V75L90 90" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
            animate={{ rotate: [0, 360] }}
            style={{ transformOrigin: '75px 75px' }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        />
        <motion.path
            d="M75 50V75" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round"
            animate={{ rotate: [0, 360] }}
            style={{ transformOrigin: '75px 75px' }}
            transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        />
        <motion.rect x="30" y="30" width="30" height="40" rx="4" fill="white" opacity="0.2" transform="rotate(-15 45 50)"
            animate={{ y: [0, -5, 0], rotate: [-15, -10, -15] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} />
        <motion.rect x="95" y="40" width="35" height="35" rx="4" fill="white" opacity="0.2" transform="rotate(10 110 55)"
            animate={{ y: [0, -8, 0], rotate: [10, 15, 10] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }} />
        <defs>
            <linearGradient id="history-bg" x1="30" y1="30" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="history-stroke" x1="40" y1="40" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#c084fc" />
            </linearGradient>
        </defs>
    </motion.svg>
);
