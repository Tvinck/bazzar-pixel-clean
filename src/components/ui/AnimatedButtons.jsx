import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Primary Button with animations
export const AnimatedButton = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon = null,
    fullWidth = false,
    className = ''
}) => {
    const variants = {
        primary: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30',
        secondary: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl',
        outline: 'border-2 border-violet-500 text-violet-500 dark:text-violet-400 bg-transparent',
        ghost: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30',
        danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? 'w-full' : ''}
                rounded-2xl font-bold
                flex items-center justify-center gap-2
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
        >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {icon}
                    {children}
                </>
            )}
        </motion.button>
    );
};

// Floating Action Button
export const FloatingButton = ({ icon, onClick, color = 'violet', position = 'bottom-right' }) => {
    const colors = {
        violet: 'from-violet-500 to-purple-500 shadow-violet-500/50',
        blue: 'from-blue-500 to-cyan-500 shadow-blue-500/50',
        pink: 'from-pink-500 to-rose-500 shadow-pink-500/50',
        green: 'from-green-500 to-emerald-500 shadow-green-500/50'
    };

    const positions = {
        'bottom-right': 'bottom-24 right-6',
        'bottom-left': 'bottom-24 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6'
    };

    return (
        <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={`
                fixed ${positions[position]} z-50
                w-14 h-14 rounded-full
                bg-gradient-to-br ${colors[color]}
                text-white shadow-2xl
                flex items-center justify-center
            `}
        >
            {icon}
        </motion.button>
    );
};

// Icon Button
export const IconButton = ({ icon, onClick, variant = 'ghost', size = 'md', className = '' }) => {
    const variants = {
        ghost: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        primary: 'bg-gradient-to-br from-violet-500 to-purple-500 text-white',
        outline: 'border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
    };

    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={`
                ${variants[variant]}
                ${sizes[size]}
                rounded-xl
                flex items-center justify-center
                transition-all duration-200
                ${className}
            `}
        >
            {icon}
        </motion.button>
    );
};

// Toggle Button
export const ToggleButton = ({ checked, onChange, label }) => {
    return (
        <button
            onClick={() => onChange(!checked)}
            className="flex items-center gap-3 cursor-pointer"
        >
            <div className={`
                relative w-14 h-8 rounded-full transition-colors duration-300
                ${checked ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-slate-300 dark:bg-slate-600'}
            `}>
                <motion.div
                    animate={{ x: checked ? 26 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                />
            </div>
            {label && (
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </span>
            )}
        </button>
    );
};

// Button Group
export const ButtonGroup = ({ buttons, selected, onChange }) => {
    return (
        <div className="inline-flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
            {buttons.map((button, index) => (
                <motion.button
                    key={index}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onChange(button.value)}
                    className={`
                        px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
                        ${selected === button.value
                            ? 'bg-white dark:bg-slate-700 text-violet-500 shadow-lg'
                            : 'text-slate-600 dark:text-slate-400'
                        }
                    `}
                >
                    {button.icon && <span className="mr-2">{button.icon}</span>}
                    {button.label}
                </motion.button>
            ))}
        </div>
    );
};

export default {
    AnimatedButton,
    FloatingButton,
    IconButton,
    ToggleButton,
    ButtonGroup
};
