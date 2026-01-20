import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Zap, TrendingUp, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const NotificationsPanel = ({ isOpen, onClose }) => {
    const { t } = useLanguage();

    const notifications = [
        {
            id: 1,
            type: 'bonus',
            icon: Gift,
            color: 'from-pink-500 to-rose-500',
            title: 'Бонус за вход!',
            desc: 'Получи +10 кредитов за ежедневный вход',
            time: '5 мин назад',
            action: 'Забрать',
            new: true
        },
        {
            id: 2,
            type: 'achievement',
            icon: TrendingUp,
            color: 'from-amber-500 to-orange-500',
            title: 'Новое достижение!',
            desc: 'Ты достиг уровня 5 - Визионер',
            time: '1 час назад',
            new: true
        },
        {
            id: 3,
            type: 'promo',
            icon: Zap,
            color: 'from-indigo-500 to-purple-500',
            title: 'Специальное предложение',
            desc: '+50% бонус при покупке кредитов до конца дня',
            time: '2 часа назад',
            action: 'Купить',
            new: false
        }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end md:items-start md:justify-end"
                onClick={onClose}
            >
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="w-full md:max-w-md h-[80vh] md:h-auto md:m-4 md:mt-20 bg-white dark:bg-slate-900 md:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Bell size={16} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Уведомления</h2>
                                <p className="text-xs text-slate-500">3 новых</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:scale-105 transition-transform"
                        >
                            <X size={18} className="text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-[calc(80vh-80px)] md:max-h-[600px] p-4 space-y-3">
                        {notifications.map((notif) => {
                            const Icon = notif.icon;
                            return (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 border ${notif.new ? 'border-indigo-200 dark:border-indigo-800' : 'border-slate-200 dark:border-slate-700'} shadow-sm`}
                                >
                                    {notif.new && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse" />
                                    )}

                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${notif.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                                            <Icon size={20} className="text-white" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                                                {notif.title}
                                            </h3>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                                {notif.desc}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-slate-500 dark:text-slate-500">
                                                    {notif.time}
                                                </span>
                                                {notif.action && (
                                                    <button className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-lg hover:scale-105 transition-transform">
                                                        {notif.action}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 py-3">
                        <button className="w-full py-2.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
                            Отметить все как прочитанные
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NotificationsPanel;
