import React from 'react';
import { motion } from 'framer-motion';

// Animated Card
export const AnimatedCard = ({
    children,
    hover = true,
    gradient = false,
    glass = false,
    className = '',
    onClick
}) => {
    const baseClasses = glass
        ? 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/20'
        : gradient
            ? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900'
            : 'bg-white dark:bg-slate-800';

    return (
        <motion.div
            whileHover={hover ? { y: -4, scale: 1.02 } : {}}
            whileTap={onClick ? { scale: 0.98 } : {}}
            onClick={onClick}
            className={`
                ${baseClasses}
                rounded-[2rem] p-6 shadow-xl
                transition-shadow duration-300
                ${hover ? 'hover:shadow-2xl' : ''}
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
        >
            {children}
        </motion.div>
    );
};

// Feature Card
export const FeatureCard = ({ icon, title, description, color = 'violet' }) => {
    const colors = {
        violet: 'from-violet-500 to-purple-500',
        blue: 'from-blue-500 to-cyan-500',
        pink: 'from-pink-500 to-rose-500',
        green: 'from-green-500 to-emerald-500',
        amber: 'from-amber-500 to-orange-500'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group"
        >
            <div className={`
                w-16 h-16 rounded-2xl bg-gradient-to-br ${colors[color]}
                flex items-center justify-center mb-4
                group-hover:scale-110 transition-transform duration-300
                shadow-lg
            `}>
                <div className="text-white text-2xl">
                    {icon}
                </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
};

// Stats Card
export const StatsCard = ({ label, value, icon, trend, color = 'violet' }) => {
    const colors = {
        violet: 'text-violet-500',
        blue: 'text-blue-500',
        pink: 'text-pink-500',
        green: 'text-green-500',
        amber: 'text-amber-500'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {label}
                </span>
                <div className={colors[color]}>
                    {icon}
                </div>
            </div>
            <div className="flex items-end justify-between">
                <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-slate-900 dark:text-white"
                >
                    {value}
                </motion.h3>
                {trend && (
                    <span className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </motion.div>
    );
};

// Image Card
export const ImageCard = ({ image, title, subtitle, onClick, badge }) => {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                {(image?.match(/\.(mp4|webm|mov)$/i) || image?.includes('video')) ? (
                    <motion.video
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        src={image}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                ) : (
                    <motion.img
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                )}
                {badge && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full text-xs font-bold text-violet-500">
                        {badge}
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {subtitle}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

// Notification Card
export const NotificationCard = ({ type = 'info', title, message, onClose }) => {
    const types = {
        success: {
            bg: 'from-green-500 to-emerald-500',
            icon: '✓'
        },
        error: {
            bg: 'from-red-500 to-rose-500',
            icon: '✕'
        },
        warning: {
            bg: 'from-amber-500 to-orange-500',
            icon: '⚠'
        },
        info: {
            bg: 'from-blue-500 to-cyan-500',
            icon: 'ℹ'
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-2xl flex items-start gap-3 max-w-sm"
        >
            <div className={`
                w-10 h-10 rounded-xl bg-gradient-to-br ${types[type].bg}
                flex items-center justify-center text-white font-bold flex-shrink-0
            `}>
                {types[type].icon}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    {title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {message}
                </p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    ✕
                </button>
            )}
        </motion.div>
    );
};

export default {
    AnimatedCard,
    FeatureCard,
    StatsCard,
    ImageCard,
    NotificationCard
};
