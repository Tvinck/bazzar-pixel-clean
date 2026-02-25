import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Image, Video, Music, Trophy, Gift, ArrowRight, Check } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import Onboarding from './Onboarding';

const OnboardingOverlay = ({ isVisible, onComplete }) => {
    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200]"
            >
                <Onboarding onComplete={onComplete} />
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingOverlay;
