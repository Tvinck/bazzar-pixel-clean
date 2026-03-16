import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { ChevronLeft, Zap, Search, Gift, PartyPopper, Flame, Heart, Trophy, User, Wand2, Star, Play, Download, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MODEL_CATALOG } from '../config/models';
import InsufficientCreditsModal from '../components/InsufficientCreditsModal';

const GREETING_COST = MODEL_CATALOG['star_greeting']?.cost || 30;

const OCCASIONS = [
    { id: 'birthday', label: 'День рождения', emoji: '🎂', icon: PartyPopper, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', gradient: 'from-pink-600 to-rose-500' },
    { id: 'roast', label: 'Прожарка', emoji: '🔥', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', gradient: 'from-orange-600 to-amber-500' },
    { id: 'motivation', label: 'Мотивация', emoji: '🏆', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', gradient: 'from-yellow-600 to-amber-400' },
    { id: 'love', label: 'Признание', emoji: '❤️', icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', gradient: 'from-red-600 to-pink-500' },
    { id: 'greeting', label: 'Приветствие', emoji: '🎁', icon: Gift, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', gradient: 'from-green-600 to-emerald-500' }
];

// ─── Animated Star Card ────────────────────────────────────────────────────────

const StarCard = ({ star, isSelected, onSelect, index }) => (
    <motion.button
        initial={{ opacity: 0, scale: 0.85, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 22 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(star)}
        className={`flex flex-col items-center gap-2 flex-shrink-0 w-[80px] transition-all
            ${isSelected ? 'scale-[1.02]' : ''}`}
    >
        <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all
            ${isSelected ? 'border-[#3390ec] shadow-lg shadow-[#3390ec]/30' : 'border-white/10'}`}
        >
            <img src={star.image_url} alt={star.name} className="w-full h-full object-cover" />
            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-0 right-0 w-5 h-5 bg-accent-blue rounded-full flex items-center justify-center border-2 border-[#1c1c1e]"
                >
                    <svg width="8" height="8" viewBox="0 0 12 10" fill="white">
                        <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                </motion.div>
            )}
        </div>
        <span className={`text-[11px] font-semibold text-center leading-tight line-clamp-2
            ${isSelected ? 'text-white' : 'text-gray-400'}`}
        >
            {star.name}
        </span>
    </motion.button>
);

// ─── Animated Occasion Card ────────────────────────────────────────────────────

const OccasionCard = ({ occasion, isSelected, onSelect }) => (
    <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => onSelect(occasion)}
        className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2.5 h-[100px]
            ${isSelected
                ? `bg-gradient-to-br ${occasion.gradient} border-transparent shadow-lg`
                : 'bg-bg-elevated border-white/5 hover:bg-[#353538]'}`}
    >
        <motion.span
            className="text-2xl"
            animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
        >
            {occasion.emoji}
        </motion.span>
        <span className={`text-[13px] font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
            {occasion.label}
        </span>
    </motion.button>
);

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

const StarsSkeleton = () => (
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 w-[80px]">
                <motion.div
                    className="w-16 h-16 rounded-full bg-bg-elevated"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                />
                <div className="w-12 h-3 bg-bg-elevated rounded-md" />
            </div>
        ))}
    </div>
);

// ─── Main View ─────────────────────────────────────────────────────────────────

const StarGreetingsView = () => {
    const navigate = useNavigate();
    const { user, refreshUser, stats, updateStats } = useUser();

    const [stars, setStars] = useState([]);
    const [selectedStar, setSelectedStar] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0]);
    const [targetName, setTargetName] = useState('');
    const [customTextMode, setCustomTextMode] = useState(false);
    const [customText, setCustomText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
    const [resultVideo, setResultVideo] = useState(null);
    const [generatedText, setGeneratedText] = useState('');
    const [isLoadingStars, setIsLoadingStars] = useState(true);
    const [showCreditModal, setShowCreditModal] = useState(false);

    const telegramId = user?.telegram_id || (window.Telegram?.WebApp?.initDataUnsafe?.user?.id);

    React.useEffect(() => {
        const fetchStars = async () => {
            try {
                const res = await fetch('/api/stars');
                if (!res.ok) throw new Error(`Stars API returned ${res.status}`);
                const text = await res.text();
                let data;
                try { data = JSON.parse(text); } catch { throw new Error('Invalid JSON from stars API'); }
                if (data.success && data.stars?.length > 0) {
                    setStars(data.stars);
                    setSelectedStar(data.stars[0]);
                }
            } catch (e) {
                console.warn('Stars API unavailable, using defaults:', e.message);
                // Stars already have default state from initial useState
            }
            finally { setIsLoadingStars(false); }
        };
        fetchStars();
    }, []);

    const filteredStars = stars.filter(star =>
        star.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (star.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleGenerate = async () => {
        if (!telegramId || !selectedStar) return;
        if (!customTextMode && !targetName.trim()) return;
        if (customTextMode && !customText.trim()) return;

        if ((stats?.current_balance || 0) < GREETING_COST) {
            setShowCreditModal(true);
            return;
        }

        setIsGenerating(true);
        setResultVideo(null);
        setGeneratedText('');

        try {
            updateStats({ current_balance: (stats?.current_balance || 0) - GREETING_COST });
            const res = await fetch('/api/generate-greeting-v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': window.Telegram?.WebApp?.initData || localStorage.getItem('bazzar_web_auth') || ''
                },
                body: JSON.stringify({
                    userId: telegramId,
                    starId: selectedStar.id,
                    occasion: customTextMode ? 'custom' : selectedOccasion.id,
                    targetName: targetName || 'Друг',
                    customText: customTextMode ? customText : null
                })
            });
            const data = await res.json();
            if (data.success) {
                setResultVideo(data.videoUrl);
                setGeneratedText(data.greetingText);
                refreshUser();
            }
        } catch (e) { console.error(e); }
        finally { setIsGenerating(false); }
    };

    const handlePreview = async () => {
        if (!targetName.trim() || !selectedStar) return;
        setIsGeneratingPreview(true);
        try {
            const res = await fetch('/api/preview-greeting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': window.Telegram?.WebApp?.initData || localStorage.getItem('bazzar_web_auth') || ''
                },
                body: JSON.stringify({
                    starId: selectedStar.id,
                    occasion: selectedOccasion.id,
                    targetName: targetName
                })
            });
            const data = await res.json();
            if (data.success) {
                setCustomText(data.text);
                setCustomTextMode(true);
            }
        } catch (e) { console.error(e); }
        finally { setIsGeneratingPreview(false); }
    };

    const handleShareVideo = () => {
        if (!resultVideo) return;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(resultVideo)}&text=${encodeURIComponent('Видео поздравление от ' + (selectedStar?.name || 'звезды') + '! ⭐ Сделано в Bazzar Pixel')}`;
        if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(shareUrl);
        } else {
            window.open(shareUrl, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-bg-secondary text-white flex flex-col font-sans md:max-w-3xl md:mx-auto">
            {/* Sticky Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-4 py-3 sticky top-0 bg-bg-secondary/90 backdrop-blur-xl z-30 pt-[calc(env(safe-area-inset-top)+10px)] border-b border-white/5"
            >
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-[#3390ec] font-medium active:opacity-60"
                >
                    <ChevronLeft size={24} />
                    <span className="text-[17px]">Назад</span>
                </button>
                <h1 className="text-[17px] font-semibold flex items-center gap-1.5">
                    <Star size={16} className="text-orange-400 fill-current" />
                    Видео Поздравление
                </h1>
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                    <Zap size={14} className="fill-white text-white" />
                    <span className="text-[13px] font-semibold">{stats?.current_balance || 0}</span>
                </div>
            </motion.div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">

                {/* ── Result Video (priority — shown on top when ready) ──────────── */}
                <AnimatePresence>
                    {resultVideo && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="bg-gradient-to-br from-[#2c2c2e] to-[#1a1a2e] rounded-[24px] p-4 border border-white/10 shadow-2xl"
                        >
                            <div className="flex items-center gap-2.5 mb-3">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center"
                                >
                                    <Gift className="text-[#3390ec]" size={16} />
                                </motion.div>
                                <div>
                                    <h3 className="font-bold text-white text-[15px]">Видео готово! 🎉</h3>
                                    <p className="text-[11px] text-gray-400">от {selectedStar?.name}</p>
                                </div>
                            </div>

                            {generatedText && (
                                <div className="bg-black/30 p-3 rounded-xl border border-white/5 mb-3">
                                    <p className="text-[13px] text-gray-300 italic leading-relaxed">
                                        "{generatedText}"
                                    </p>
                                </div>
                            )}

                            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/50 mb-3">
                                <video src={resultVideo} controls className="w-full h-full object-contain" autoPlay loop playsInline />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => {
                                        const a = document.createElement('a');
                                        a.href = resultVideo;
                                        a.download = 'greeting.mp4';
                                        a.click();
                                    }}
                                    className="py-3 bg-accent-blue text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#3390ec]/20"
                                >
                                    <Download size={16} /> Скачать
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={handleShareVideo}
                                    className="py-3 bg-bg-elevated text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 border border-white/5"
                                >
                                    <Share2 size={16} /> Поделиться
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── 1. Star Selection ──────────────────────────────────────────── */}
                <section>
                    <motion.label
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block ml-1 mb-3"
                    >
                        Выберите звезду
                    </motion.label>

                    {/* Search */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Поиск звезды..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-bg-elevated border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-[14px] text-white focus:outline-none focus:border-[#3390ec]/50 transition-colors placeholder:text-gray-500"
                        />
                        <Search className="absolute left-3.5 top-3 text-gray-500" size={16} />
                    </div>

                    {/* Star Avatar Row */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                        {isLoadingStars ? (
                            <StarsSkeleton />
                        ) : filteredStars.length === 0 ? (
                            <div className="text-gray-500 text-[13px] px-2 py-4">Никого не найдено</div>
                        ) : (
                            filteredStars.map((star, i) => (
                                <StarCard
                                    key={star.id}
                                    star={star}
                                    isSelected={selectedStar?.id === star.id}
                                    onSelect={setSelectedStar}
                                    index={i}
                                />
                            ))
                        )}
                    </div>
                </section>

                {/* ── 2. Occasion / Custom Text ─────────────────────────────────── */}
                <section>
                    <div className="px-1 mb-3 flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block ml-1">Что скажет звезда?</label>
                        <div className="flex bg-bg-elevated p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => { setCustomTextMode(false); setCustomText(''); }}
                                className={`px-3.5 py-1.5 text-[12px] font-bold rounded-lg transition-all ${!customTextMode ? 'bg-accent-blue text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                Повод
                            </button>
                            <button
                                onClick={() => setCustomTextMode(true)}
                                className={`px-3.5 py-1.5 text-[12px] font-bold rounded-lg transition-all ${customTextMode ? 'bg-accent-blue text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                Свой текст
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!customTextMode ? (
                            <motion.div
                                key="occasions"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {OCCASIONS.map(occasion => (
                                        <OccasionCard
                                            key={occasion.id}
                                            occasion={occasion}
                                            isSelected={selectedOccasion.id === occasion.id}
                                            onSelect={setSelectedOccasion}
                                        />
                                    ))}
                                </div>

                                {/* Generate Text Button */}
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handlePreview}
                                    disabled={isGeneratingPreview || !targetName.trim()}
                                    className={`w-full py-3 mt-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border
                                        ${!targetName.trim()
                                            ? 'opacity-40 cursor-not-allowed bg-bg-elevated border-white/5 text-gray-500'
                                            : 'bg-bg-elevated border-[#3390ec]/40 text-[#3390ec] active:bg-accent-blue/10'}`}
                                >
                                    {isGeneratingPreview ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#3390ec] border-t-transparent" />
                                    ) : (
                                        <Wand2 size={16} />
                                    )}
                                    <span className="text-[14px]">{isGeneratingPreview ? 'Пишу текст...' : 'Придумать текст за меня'}</span>
                                </motion.button>
                                {!targetName.trim() && (
                                    <p className="text-[10px] text-center text-gray-500 mt-1.5">Введите имя ниже, чтобы ИИ написал текст</p>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="custom"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="relative"
                            >
                                <textarea
                                    placeholder="Напишите текст поздравления (до 140 символов)..."
                                    value={customText}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 140) setCustomText(e.target.value);
                                    }}
                                    className="w-full h-[120px] bg-bg-elevated border border-white/5 rounded-2xl p-4 text-[14px] text-white focus:outline-none focus:border-[#3390ec]/50 transition-colors placeholder:text-gray-500 resize-none"
                                />
                                <div className={`absolute bottom-3 right-3 text-[11px] font-bold px-2 py-1 rounded-lg
                                    ${customText.length > 120 ? 'text-orange-400 bg-orange-500/10' : 'text-gray-500 bg-bg-secondary/80'}`}
                                >
                                    {customText.length} / 140
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* ── 3. Name Input ──────────────────────────────────────────────── */}
                <section>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block ml-2 mb-3">Кого поздравить?</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Имя (например: Артем)"
                            value={targetName}
                            onChange={(e) => setTargetName(e.target.value)}
                            className="w-full bg-bg-elevated border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] text-white focus:outline-none focus:border-[#3390ec]/50 transition-colors placeholder:text-gray-500"
                        />
                        <User className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
                    </div>
                </section>

                {/* ── How It Works card ─────────────────────────────────────────── */}
                <section className="bg-bg-elevated rounded-2xl p-4 border border-white/5">
                    <h3 className="text-[13px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Как это работает</h3>
                    <div className="space-y-3">
                        {[
                            { step: '1', text: 'Выберите звезду и повод', emoji: '⭐' },
                            { step: '2', text: 'Укажите имя и сгенерируйте текст', emoji: '✍️' },
                            { step: '3', text: 'ИИ создаст реалистичное видео', emoji: '🎬' },
                            { step: '4', text: 'Скачайте и отправьте!', emoji: '🎉' }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <span className="text-lg">{item.emoji}</span>
                                <span className="text-[13px] text-gray-300">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ── Sticky Footer CTA ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 25 }}
                className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-bg-secondary/90 backdrop-blur-xl border-t border-white/5 z-40"
            >
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={isGenerating || !targetName.trim() || !selectedStar}
                    className={`w-full h-[56px] rounded-card flex items-center justify-center gap-2.5 text-[17px] font-bold transition-all shadow-lg
                        ${isGenerating || !targetName.trim() || !selectedStar
                            ? 'bg-bg-elevated text-white/30 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#3390ec] to-blue-600 text-white shadow-[#3390ec]/30 active:scale-[0.99]'
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <motion.div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            <span>Звезда записывает...</span>
                        </>
                    ) : (
                        <>
                            <Star size={18} className="fill-current" />
                            <span>Создать поздравление</span>
                            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[13px] ml-1 flex items-center gap-1">
                                <Zap size={12} fill="currentColor" /> {GREETING_COST}
                            </span>
                        </>
                    )}
                </motion.button>
            </motion.div>

            {showCreditModal && (
                <InsufficientCreditsModal
                    isOpen={showCreditModal}
                    onClose={() => setShowCreditModal(false)}
                    cost={GREETING_COST}
                />
            )}
        </div>
    );
};

export default StarGreetingsView;
