import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AnimatedButton } from './ui/AnimatedButtons';

const ThemeSettings = ({ isOpen, onClose }) => {
    const { themes, currentTheme, setCurrentTheme } = useTheme();
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="w-full md:max-w-md bg-white dark:bg-slate-900 rounded-t-[2rem] md:rounded-3xl overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">App Theme</h2>
                            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                                <X size={20} className="text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {Object.values(themes).map((theme) => {
                                const isSelected = currentTheme === theme.id;
                                const primaryColor = `rgb(${theme.colors.primary.split(' ').join(',')})`;
                                const secondaryColor = `rgb(${theme.colors.secondary.split(' ').join(',')})`;

                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => setCurrentTheme(theme.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isSelected
                                                ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10'
                                                : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Preview Circle */}
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center p-1" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                                                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                                                    <div className="w-6 h-6 rounded-full" style={{ background: primaryColor }} />
                                                </div>
                                            </div>

                                            <div className="text-left">
                                                <div className="font-bold text-slate-900 dark:text-white">{theme.name}</div>
                                                <div className="text-xs text-slate-500">
                                                    {isSelected ? 'Active' : 'Tap to apply'}
                                                </div>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6">
                            <AnimatedButton onClick={onClose} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                                Close
                            </AnimatedButton>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ThemeSettings;
