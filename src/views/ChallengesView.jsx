import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Timer, Users, Sparkles, ChevronLeft,
    Gift, Crown, Star, Flame, Map, Zap,
    Image as ImageIcon, Play, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSound } from '../context/SoundContext';
import { TelegramCard, TelegramButton, TelegramBadge } from '../components/TelegramAnimations';

const CHALLENGES_MOCK = [
    {
        id: 'future-space',
        title: 'Космос будущего',
        description: 'Создайте самый реалистичный или креативный вид на межзвездную станцию будущего.',
        reward: 500,
        participants: 1243,
        timeLeft: '2д 14ч',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000'
    },
    {
        id: 'steampunk-cats',
        title: 'Стимпанк Коты',
        description: 'Коты в мире паровых машин и медных шестеренок.',
        reward: 250,
        participants: 890,
        timeLeft: 'Завершено',
        status: 'ended',
        winners: [
            { name: 'ArtMaster', avatar: 'https://i.pravatar.cc/150?u=1' },
            { name: 'PixelPro', avatar: 'https://i.pravatar.cc/150?u=2' }
        ],
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000'
    }
];

const ChallengesView = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { playClick, playSuccess } = useSound();
    const [activeTab, setActiveTab] = useState('active');

    const activeChallenge = CHALLENGES_MOCK.find(c => c.status === 'active');
    const pastChallenges = CHALLENGES_MOCK.filter(c => c.status === 'ended');

    return (
        <div className="min-h-screen bg-black text-white pb-24 md:max-w-4xl md:mx-auto relative overflow-hidden">
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-blue-600/10 rounded-full blur-[120px] -mr-[40vw] -mt-[40vw]" />
                <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-[100px] -ml-[30vw] -mb-[30vw]" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl px-4 py-4 flex items-center gap-4 border-b border-white/5 pt-[calc(env(safe-area-inset-top)+10px)]">
                <button
                    onClick={() => { playClick(); navigate(-1); }}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full active:scale-95 transition-transform"
                >
                    <ChevronLeft size={24} className="text-[#007aff]" />
                </button>
                <h1 className="text-[20px] font-bold tracking-tight">{t('challenges.title')}</h1>
            </div>

            <div className="relative z-10 px-4 pt-6 space-y-8">
                {/* Active Challenge Banner */}
                {activeChallenge && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative rounded-[28px] overflow-hidden group shadow-2xl border border-white/10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                        <img
                            src={activeChallenge.image}
                            alt={activeChallenge.title}
                            className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                        />

                        <div className="absolute inset-x-0 bottom-0 p-6 z-20 space-y-4">
                            <div className="flex items-center gap-2">
                                <TelegramBadge variant="warning" className="bg-yellow-500 text-black font-black uppercase text-[10px] tracking-widest px-2 py-0.5 rounded-md">
                                    LIVE
                                </TelegramBadge>
                                <div className="flex items-center gap-1 text-white/70 text-[12px] font-bold">
                                    <Timer size={14} /> {activeChallenge.timeLeft}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-[28px] font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                    {activeChallenge.title}
                                </h2>
                                <p className="text-gray-300 text-[14px] leading-relaxed line-clamp-2">
                                    {activeChallenge.description}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?u=${i}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[12px] text-white/50 font-medium">+{activeChallenge.participants} участников</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
                                    <Zap size={16} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-yellow-500 font-black text-[15px]">{activeChallenge.reward}</span>
                                </div>
                            </div>

                            <TelegramButton
                                onClick={() => { playSuccess(); navigate('/generate/image-gen', { state: { prompt: activeChallenge.title } }); }}
                                className="w-full h-14 bg-white text-black text-[16px] font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:bg-gray-200 transition-colors"
                            >
                                <Sparkles size={20} />
                                {t('challenges.participate')}
                            </TelegramButton>
                        </div>
                    </motion.div>
                )}

                {/* Secondary Tabs */}
                <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                    <button
                        onClick={() => { playClick(); setActiveTab('active'); }}
                        className={`flex-1 py-3 text-[14px] font-bold rounded-xl transition-all ${activeTab === 'active' ? 'bg-[#007aff] text-white shadow-lg' : 'text-gray-400'}`}
                    >
                        {t('challenges.active')}
                    </button>
                    <button
                        onClick={() => { playClick(); setActiveTab('past'); }}
                        className={`flex-1 py-3 text-[14px] font-bold rounded-xl transition-all ${activeTab === 'past' ? 'bg-[#007aff] text-white shadow-lg' : 'text-gray-400'}`}
                    >
                        {t('challenges.past')}
                    </button>
                </div>

                {/* Past Challenges List */}
                <div className="grid gap-4">
                    {activeTab === 'active' ? (
                        <div className="bg-[#1c1c1e] rounded-3xl p-6 border border-white/5 text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Trophy size={32} className="text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-[18px] font-bold">{t('challenges.leaderboard')}</h3>
                                <p className="text-gray-500 text-[14px] mt-1">Ожидайте первых результатов</p>
                            </div>
                        </div>
                    ) : (
                        pastChallenges.map(challenge => (
                            <motion.div
                                key={challenge.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-[#1c1c1e] rounded-2xl overflow-hidden flex border border-white/5 shadow-md flex-col"
                            >
                                <div className="p-4 flex gap-4">
                                    <img src={challenge.image} className="w-24 h-24 rounded-xl object-cover" />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-[16px]">{challenge.title}</h4>
                                            <span className="text-[12px] text-gray-500">{challenge.timeLeft}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={12} className="text-gray-500" />
                                            <span className="text-[12px] text-gray-500">{challenge.participants}</span>
                                        </div>
                                        <div className="flex items-center gap-3 pt-1">
                                            <div className="flex -space-x-1.5">
                                                {challenge.winners?.map((w, idx) => (
                                                    <img key={idx} src={w.avatar} className="w-5 h-5 rounded-full border border-black" />
                                                ))}
                                            </div>
                                            <span className="text-[11px] text-[#007aff] font-bold uppercase tracking-wider">{t('challenges.winners')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[12px] text-gray-400">Завершено 2 дня назад</span>
                                    <button className="text-[12px] text-[#007aff] font-bold flex items-center gap-1">
                                        Посмотреть <ArrowRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChallengesView;
