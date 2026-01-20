import React from 'react';
import { motion } from 'framer-motion';
import {
    ImageOff,
    History,
    Bell,
    Search,
    Inbox,
    Sparkles,
    Heart,
    Trophy
} from 'lucide-react';

const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    actionLabel,
    illustration
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
            {/* Icon or Illustration */}
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                {illustration ? (
                    <div className="w-48 h-48 relative">
                        {illustration}
                    </div>
                ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl flex items-center justify-center">
                        <Icon size={40} className="text-slate-400 dark:text-slate-600" />
                    </div>
                )}
            </motion.div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                {description}
            </p>

            {/* Action Button */}
            {action && actionLabel && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    {actionLabel}
                </motion.button>
            )}
        </motion.div>
    );
};

// Predefined Empty States
export const EmptyHistory = ({ onCreateClick }) => (
    <EmptyState
        icon={History}
        title="История пуста"
        description="Вы еще не создали ни одного изображения. Начните творить прямо сейчас!"
        action={onCreateClick}
        actionLabel="Создать первое изображение"
    />
);

export const EmptyGallery = ({ onExploreClick }) => (
    <EmptyState
        icon={ImageOff}
        title="Галерея пуста"
        description="Здесь пока нет творений. Будьте первым, кто поделится своим шедевром!"
        action={onExploreClick}
        actionLabel="Исследовать"
    />
);

export const EmptyNotifications = () => (
    <EmptyState
        icon={Bell}
        title="Нет уведомлений"
        description="У вас пока нет новых уведомлений. Мы сообщим, когда появится что-то интересное!"
    />
);

export const EmptySearch = ({ query }) => (
    <EmptyState
        icon={Search}
        title="Ничего не найдено"
        description={`По запросу "${query}" ничего не найдено. Попробуйте изменить поисковый запрос.`}
    />
);

export const EmptyInbox = () => (
    <EmptyState
        icon={Inbox}
        title="Все прочитано"
        description="Отличная работа! Вы прочитали все сообщения."
    />
);

export const EmptyFavorites = ({ onBrowseClick }) => (
    <EmptyState
        icon={Heart}
        title="Нет избранного"
        description="Вы еще не добавили ни одного творения в избранное. Найдите что-то вдохновляющее!"
        action={onBrowseClick}
        actionLabel="Обзор галереи"
    />
);

export const EmptyAchievements = () => (
    <EmptyState
        icon={Trophy}
        title="Пока нет достижений"
        description="Создавайте, делитесь и взаимодействуйте, чтобы открывать новые достижения!"
    />
);

export const EmptyCreations = ({ onStartClick }) => (
    <EmptyState
        icon={Sparkles}
        title="Начните творить"
        description="Превратите свои идеи в потрясающие изображения с помощью AI. Это просто и быстро!"
        action={onStartClick}
        actionLabel="Создать сейчас"
    />
);

export default EmptyState;
