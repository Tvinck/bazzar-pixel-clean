import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

// Linear Progress Bar
export const LinearProgress = ({ value = 0, max = 100, className = '', showLabel = false }) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    <span>Прогресс</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            )}
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-full relative overflow-hidden"
                >
                    {/* Shine effect */}
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                </motion.div>
            </div>
        </div>
    );
};

// Circular Progress
export const CircularProgress = ({ value = 0, max = 100, size = 64, strokeWidth = 4 }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-slate-200 dark:text-slate-800"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{
                        strokeDasharray: circumference
                    }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="50%" stopColor="#A855F7" />
                        <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {Math.round(percentage)}%
                </span>
            </div>
        </div>
    );
};

// Generation Progress with Steps
export const GenerationProgress = ({ currentStep = 0, steps = [], message = '' }) => {
    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl">
            {/* Animated Icon */}
            <motion.div
                animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 1, repeat: Infinity }
                }}
                className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
                <Sparkles size={32} className="text-white" />
            </motion.div>

            {/* Message */}
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">
                {message || 'Генерация...'}
            </h3>

            {/* Steps */}
            {steps.length > 0 && (
                <div className="space-y-2 mb-4">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-2 text-sm ${index === currentStep
                                    ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                                    : index < currentStep
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-slate-400 dark:text-slate-600'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${index === currentStep
                                    ? 'bg-indigo-500 animate-pulse'
                                    : index < currentStep
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-300 dark:bg-slate-700'
                                }`} />
                            {step}
                        </div>
                    ))}
                </div>
            )}

            {/* Progress Bar */}
            <LinearProgress
                value={currentStep + 1}
                max={steps.length || 1}
            />
        </div>
    );
};

// Spinner
export const Spinner = ({ size = 24, className = '' }) => (
    <Loader2
        size={size}
        className={`animate-spin ${className}`}
    />
);

// Dots Loader
export const DotsLoader = () => (
    <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                }}
                className="w-2 h-2 bg-indigo-500 rounded-full"
            />
        ))}
    </div>
);

// Pulse Loader
export const PulseLoader = ({ size = 'md' }) => {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`absolute ${sizes[size]} bg-indigo-500 rounded-full`}
            />
            <div className={`${sizes[size]} bg-indigo-500 rounded-full`} />
        </div>
    );
};

export const LoadingSpinner = Spinner;
export const StepProgress = GenerationProgress;
