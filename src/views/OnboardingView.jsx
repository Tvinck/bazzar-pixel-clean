import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Sparkles, User, MapPin, Briefcase, Heart, MessageCircle, Globe, Zap, Image } from 'lucide-react';

const SHOWCASE = [
    { prompt: '"Кот в космосе, стиль Pixar"', emoji: '🐱', result: 'Фотореалистичный кот в скафандре', category: 'Фото' },
    { prompt: '"Портрет девушки, аниме стиль"', emoji: '🎨', result: 'Детализированный аниме-портрет', category: 'Арт' },
    { prompt: '"Логотип кофейни, минимализм"', emoji: '☕', result: 'Профессиональный лого за 10 сек', category: 'Дизайн' },
    { prompt: '"Превращу фото в мультик"', emoji: '🎬', result: 'Мультяшная версия вашего фото', category: 'Видео' },
    { prompt: '"Стикер-пак с корги"', emoji: '🐕', result: 'Набор стикеров для Telegram', category: 'Стикеры' },
];

/**
 * OnboardingView - 10 Questions quiz to collect user profile data
 * Saves to user_profiles table and applies to all chats
 */

const STEPS = [
    {
        id: 'name',
        title: 'Как тебя зовут?',
        subtitle: 'Это имя будет использоваться в чатах',
        type: 'text',
        icon: User,
        placeholder: 'Введи имя',
        field: 'display_name'
    },
    {
        id: 'gender',
        title: 'Укажи пол',
        subtitle: 'Для персонализации общения',
        type: 'choice',
        icon: User,
        field: 'gender',
        options: [
            { value: 'male', label: 'Мужской', emoji: '👨' },
            { value: 'female', label: 'Женский', emoji: '👩' },
            { value: 'other', label: 'Другой', emoji: '🧑' }
        ]
    },
    {
        id: 'age',
        title: 'Твой возраст?',
        subtitle: 'Возрастная группа',
        type: 'choice',
        icon: User,
        field: 'age_range',
        options: [
            { value: '13-17', label: '13-17', emoji: '🧒' },
            { value: '18-24', label: '18-24', emoji: '🧑' },
            { value: '25-34', label: '25-34', emoji: '👨' },
            { value: '35-44', label: '35-44', emoji: '🧔' },
            { value: '45+', label: '45+', emoji: '👴' }
        ]
    },
    {
        id: 'location',
        title: 'Где ты живёшь?',
        subtitle: 'Город или страна',
        type: 'text',
        icon: MapPin,
        placeholder: 'Например: Москва',
        field: 'location'
    },
    {
        id: 'occupation',
        title: 'Чем занимаешься?',
        subtitle: 'Род деятельности',
        type: 'choice',
        icon: Briefcase,
        field: 'occupation',
        options: [
            { value: 'student', label: 'Учусь', emoji: '📚' },
            { value: 'employee', label: 'Работаю', emoji: '💼' },
            { value: 'freelancer', label: 'Фриланс', emoji: '💻' },
            { value: 'entrepreneur', label: 'Бизнес', emoji: '🚀' },
            { value: 'creator', label: 'Креатор', emoji: '🎨' },
            { value: 'other', label: 'Другое', emoji: '✨' }
        ]
    },
    {
        id: 'interests',
        title: 'Твои интересы?',
        subtitle: 'Выбери несколько (до 5)',
        type: 'multi',
        icon: Heart,
        field: 'interests',
        options: [
            { value: 'tech', label: 'Технологии', emoji: '💻' },
            { value: 'business', label: 'Бизнес', emoji: '📈' },
            { value: 'art', label: 'Искусство', emoji: '🎨' },
            { value: 'music', label: 'Музыка', emoji: '🎵' },
            { value: 'sports', label: 'Спорт', emoji: '⚽' },
            { value: 'travel', label: 'Путешествия', emoji: '✈️' },
            { value: 'gaming', label: 'Игры', emoji: '🎮' },
            { value: 'food', label: 'Еда', emoji: '🍕' },
            { value: 'health', label: 'Здоровье', emoji: '💪' },
            { value: 'science', label: 'Наука', emoji: '🔬' }
        ]
    },
    {
        id: 'style',
        title: 'Стиль общения',
        subtitle: 'Как тебе комфортнее?',
        type: 'choice',
        icon: MessageCircle,
        field: 'communication_style',
        options: [
            { value: 'formal', label: 'Официальный', emoji: '👔', desc: 'На "Вы", деловой' },
            { value: 'friendly', label: 'Дружелюбный', emoji: '😊', desc: 'На "ты", тёплый' },
            { value: 'playful', label: 'Игривый', emoji: '🎉', desc: 'Шутки, эмодзи' }
        ]
    },
    {
        id: 'language',
        title: 'Язык общения',
        subtitle: 'На каком языке общаться?',
        type: 'choice',
        icon: Globe,
        field: 'language',
        options: [
            { value: 'ru', label: 'Русский', emoji: '🇷🇺' },
            { value: 'en', label: 'English', emoji: '🇬🇧' },
            { value: 'uk', label: 'Українська', emoji: '🇺🇦' }
        ]
    }
];

export default function OnboardingView() {
    const navigate = useNavigate();
    const [showShowcase, setShowShowcase] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [textInput, setTextInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const step = STEPS[currentStep];
    const progress = ((currentStep + 1) / STEPS.length) * 100;

    const handleNext = async () => {
        // Save current answer
        if (step.type === 'text' && textInput.trim()) {
            setAnswers(prev => ({ ...prev, [step.field]: textInput.trim() }));
        }

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
            setTextInput('');
        } else {
            // Final step - save to database
            await saveProfile();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            setTextInput(answers[STEPS[currentStep - 1].field] || '');
        }
    };

    const handleChoice = (value) => {
        setAnswers(prev => ({ ...prev, [step.field]: value }));
        // Auto-advance after choice
        setTimeout(() => {
            if (currentStep < STEPS.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                saveProfile();
            }
        }, 300);
    };

    const handleMultiChoice = (value) => {
        const current = answers[step.field] || [];
        let updated;
        if (current.includes(value)) {
            updated = current.filter(v => v !== value);
        } else if (current.length < 5) {
            updated = [...current, value];
        } else {
            return; // Max 5
        }
        setAnswers(prev => ({ ...prev, [step.field]: updated }));
    };

    const saveProfile = async () => {
        setIsSaving(true);
        try {
            // Include last text input if applicable
            const finalAnswers = { ...answers };
            if (step.type === 'text' && textInput.trim()) {
                finalAnswers[step.field] = textInput.trim();
            }

            // Mark onboarding as completed
            finalAnswers.onboarding_completed = true;

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalAnswers)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save profile');
            }

            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
            navigate('/');
        } catch (error) {
            console.error('Failed to save profile:', error);
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
            // Show error to user
            alert('Не удалось сохранить профиль. Попробуйте снова.');
        } finally {
            setIsSaving(false);
        }
    };

    const canProceed = () => {
        if (step.type === 'text') return textInput.trim().length > 0;
        if (step.type === 'choice') return answers[step.field];
        if (step.type === 'multi') return (answers[step.field] || []).length > 0;
        return false;
    };

    const StepIcon = step.icon;

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">

            {/* ===== SHOWCASE STEP ===== */}
            {showShowcase ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col px-4 py-8"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-blue-500/30"
                        >
                            <Sparkles size={40} className="text-white" />
                        </motion.div>
                        <h1 className="text-[28px] font-[900] text-white tracking-tight mb-2">Pixel AI</h1>
                        <p className="text-[15px] text-white/50 max-w-[280px] mx-auto leading-snug">
                            Вот что можно создать с помощью нейросетей
                        </p>
                    </div>

                    <div className="space-y-3 max-w-sm mx-auto w-full mb-8">
                        {SHOWCASE.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="bg-white/5 rounded-card p-3.5 border border-white/5 flex items-center gap-3"
                            >
                                <div className="w-11 h-11 rounded-input bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl shrink-0">
                                    {item.emoji}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] text-blue-400 font-mono truncate">{item.prompt}</p>
                                    <p className="text-[12px] text-white/40 mt-0.5">→ {item.result}</p>
                                </div>
                                <span className="text-[10px] text-white/20 font-bold uppercase shrink-0">{item.category}</span>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-auto pb-4">
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowShowcase(false)}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-[17px] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 max-w-sm mx-auto"
                        >
                            Начать <ChevronRight size={20} />
                        </motion.button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full text-center text-[13px] text-white/30 mt-3 max-w-sm mx-auto"
                        >
                            Пропустить
                        </button>
                    </div>
                </motion.div>
            ) : (
                <>
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
                        <div className="flex items-center gap-3 mb-3">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className={`p-2 -ml-2 rounded-full transition-colors ${currentStep === 0 ? 'opacity-30' : 'hover:bg-white/10'
                                    }`}
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <div className="flex-1 text-center">
                                <span className="text-sm text-gray-400">
                                    Шаг {currentStep + 1} из {STEPS.length}
                                </span>
                            </div>
                            <button
                                onClick={() => navigate('/')}
                                className="text-sm text-blue-400 hover:text-blue-300"
                            >
                                Пропустить
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-4 py-8 flex flex-col">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 flex flex-col"
                            >
                                {/* Icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                        <StepIcon className="w-8 h-8 text-blue-400" />
                                    </div>
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl font-bold text-white text-center mb-2">
                                    {step.title}
                                </h1>
                                <p className="text-gray-400 text-center mb-8">
                                    {step.subtitle}
                                </p>

                                {/* Input Area */}
                                {step.type === 'text' && (
                                    <div className="max-w-sm mx-auto w-full">
                                        <input
                                            type="text"
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            placeholder={step.placeholder}
                                            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-400 text-center text-lg focus:outline-none focus:border-blue-500"
                                            autoFocus
                                        />
                                    </div>
                                )}

                                {step.type === 'choice' && (
                                    <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto w-full">
                                        {step.options.map((option) => (
                                            <motion.button
                                                key={option.value}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleChoice(option.value)}
                                                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${answers[step.field] === option.value
                                                    ? 'bg-blue-500/20 border-blue-500'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                    }`}
                                            >
                                                <span className="text-2xl">{option.emoji}</span>
                                                <div className="flex-1 text-left">
                                                    <p className="text-white font-medium">{option.label}</p>
                                                    {option.desc && (
                                                        <p className="text-xs text-gray-400">{option.desc}</p>
                                                    )}
                                                </div>
                                                {answers[step.field] === option.value && (
                                                    <Check className="w-5 h-5 text-blue-400" />
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {step.type === 'multi' && (
                                    <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                                        {step.options.map((option) => {
                                            const selected = (answers[step.field] || []).includes(option.value);
                                            return (
                                                <motion.button
                                                    key={option.value}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleMultiChoice(option.value)}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-colors ${selected
                                                        ? 'bg-blue-500/20 border-blue-500'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <span className="text-lg">{option.emoji}</span>
                                                    <span className="text-white text-sm">{option.label}</span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/5 p-4 pb-safe">
                        {(step.type === 'text' || step.type === 'multi') && (
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleNext}
                                disabled={!canProceed() || isSaving}
                                className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${canProceed()
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/10 text-gray-400'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Sparkles className="w-5 h-5" />
                                        </motion.div>
                                        Сохраняем...
                                    </>
                                ) : currentStep === STEPS.length - 1 ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Завершить
                                    </>
                                ) : (
                                    <>
                                        Далее
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
