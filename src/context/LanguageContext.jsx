import React, { createContext, useContext } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Всегда используем русский язык
    const lang = 'ru';

    // Карта переводов для обратной совместимости
    const translations = {
        'creation.newCreation': 'Создать',
        'home.seeAll': 'Все',
        'home.discover': 'Популярно',
        'gallery.all': 'Все',
        'gallery.subtitle': 'Популярные шаблоны',
        'categories.dances': 'Танцы',
        'categories.trends': 'Тренды',
        'categories.christmas': 'Рождество',
        'categories.angels': 'Ангелы',
        'categories.oldTrends': 'Старые тренды',
        'toolsCard.image': 'Изображение',
        'toolsCard.video': 'Видео',
        'toolsCard.nanoBanana': 'Nano Banana',
        'toolsCard.audio': 'Аудио',
        'toolsCard.animate': 'Анимация',
        'toolsCard.sora': 'Sora Turbo',
        'toolsCard.tools': 'Инструменты',
        'toolsCard.utils': 'Утилиты',
        'profile.on': 'Вкл',
        'profile.off': 'Выкл',
        'header.buy': 'КУПИТЬ',
        // Profile
        'profile.account': 'Аккаунт',
        'profile.settings': 'Настройки',
        'profile.logout': 'Выйти',
        // Common
        'common.save': 'Сохранить',
        'common.cancel': 'Отмена',
        'common.delete': 'Удалить',
        'common.edit': 'Редактировать',
        'common.share': 'Поделиться',
        'common.download': 'Скачать',
        // History
        'home.history': 'История',
        'home.historyEmpty': 'История пуста',
        'home.historyInfo': 'Начните создавать контент, и он появится здесь',
        'creation.describe': 'Описание',
        'creation.placeholder': 'Опишите то, что хотите увидеть...',
        'toolsCard.proModel': 'Pro Модель',
        'toolsCard.hqVideo': 'HQ Видео',
        'toolsCard.cinematic': 'Кинематографично',
        'toolsCard.video3': 'Luma Dream',
        'toolsCard.musicGen': 'Генерация музыки',
        'toolsCard.live': 'Живое фото'
    };

    // Функция t теперь возвращает перевод из карты или сам ключ
    const t = (key) => translations[key] || key;

    return (
        <LanguageContext.Provider value={{ lang, setLang: () => { }, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
