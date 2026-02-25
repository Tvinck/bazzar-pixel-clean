import React from 'react';
import { User, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { SpringCounter } from '../SpringAnimations';
import { useMagneticButton } from '../../hooks/useGSAPAnimations';
import { useUser } from '../../context/UserContext';
import AnimatedIcon from '../ui/AnimatedIcon';

const Header = ({ onOpenPayment, onOpenProfile }) => {
    const { stats } = useUser();
    const balance = stats?.current_balance || 0;
    const profileBtnRef = useMagneticButton(0.3);
    const balanceBtnRef = useMagneticButton(0.2);

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-[100] pt-2"
            style={{
                // Telegram Blue gradient from top
                background: 'linear-gradient(180deg, rgba(51, 144, 236, 0.98) 0%, rgba(51, 144, 236, 0.9) 85%, transparent 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
            }}
        >
            <div className="relative px-3 py-2 flex items-center justify-between mt-2">
                {/* Left: Profile Icon (Compact) */}
                <motion.button
                    ref={profileBtnRef}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onOpenProfile}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all border border-white/20 shadow-sm relative overflow-hidden"
                >
                    <motion.div
                        className="absolute inset-0 bg-white/30"
                        initial={{ scale: 0, opacity: 0 }}
                        whileTap={{ scale: 2, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    />
                    <AnimatedIcon icon={User} size={20} className="text-white z-10" disableHover disableTap />
                </motion.button>

                {/* Right: Balance (Compact) */}
                <motion.button
                    ref={balanceBtnRef}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onOpenPayment}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all border border-white/20 shadow-sm overflow-hidden relative"
                >
                    <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shadow-inner relative overflow-hidden">
                        {/* Shimmer Effect */}
                        <motion.div
                            className="absolute top-0 -left-[100%] w-[150%] h-[100%] bg-white/50 blur-[2px] rotate-45"
                            animate={{ left: ['-100%', '200%'] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, ease: 'linear' }}
                        />
                        <AnimatedIcon icon={Coins} size={12} className="text-yellow-900 z-10" disableHover disableTap />
                    </div>
                    <span className="text-white font-bold text-[13px] tracking-wide z-10">
                        <SpringCounter value={balance} />
                    </span>
                    <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ scale: 0, opacity: 0 }}
                        whileTap={{ scale: 3, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    />
                </motion.button>
            </div>
        </motion.header>
    );
};

export default Header;
