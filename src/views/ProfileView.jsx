import { ProfileSkeleton } from '../components/ui/Skeletons';
import React, { Suspense, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, Globe, Volume2, VolumeX, Users, MessageCircle, Share2, Image, Heart, Gift, Zap, Settings, Sparkles, Video, Crown, Wallet, Moon, Copy, CreditCard, ChevronRight, ChevronLeft, Mail, Receipt, Percent, Check, Palette, ShieldAlert } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import Medal3D from '../components/3d/Medal3D';
import ThemeSettings from '../components/ThemeSettings';
import { useLanguage } from '../context/LanguageContext';
import { useSound } from '../context/SoundContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { CircularProgress } from '../components/ui/Progress';
import { StatsCard } from '../components/ui/AnimatedCards';
import { AnimatedButton } from '../components/ui/AnimatedButtons';
import { analytics } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { useUserPublicCreations } from '../hooks/useGallery';
import { useToast } from '../context/ToastContext';
import TBankWidget from '../components/TBankWidget';

const ProfileView = ({ isDark, onOpenPayment }) => {
    const navigate = useNavigate();
    const { t, lang, setLang } = useLanguage();
    const { isSoundEnabled, toggleSound, playClick } = useSound();
    const toast = useToast();

    // User Context
    const { user: userData, stats: userStats, isLoading: isStatsLoading, addBalance } = useUser();

    // Fetch user creations
    const { data: userCreations } = useUserPublicCreations(userData?.id);

    // Stub for addCreditsMutation using context
    const addCreditsMutation = {
        mutate: ({ userId, amount }) => addBalance(amount)
    };

    const [activeSection, setActiveSection] = useState('main'); // main, account, partnership, achievements, settings
    const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [isTxLoading, setIsTxLoading] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState(null);

    const [email, setEmail] = useState(() => {
        try { return localStorage.getItem('pixel_user_email') || ''; } catch { return ''; }
    });
    const [completedTasks, setCompletedTasks] = useState(() => {
        try { return JSON.parse(localStorage.getItem('pixel_completed_tasks') || '[]'); } catch { return []; }
    });

    useEffect(() => {
        if (activeSection === 'account' && window.Telegram?.WebApp?.initData) {
            setIsTxLoading(true);

            // 1. Fetch Transactions
            fetch(`/api/transactions?initData=${encodeURIComponent(window.Telegram.WebApp.initData)}`)
                .then(res => res.json())
                .then(data => { if (data.success) setTransactions(data.transactions); })
                .catch(console.error)
                .finally(() => setIsTxLoading(false));

            // 2. Fetch Subscription
            if (userData?.id) {
                fetch(`/api/subscription?userId=${userData.id}`)
                    .then(res => res.json())
                    .then(data => setSubscription(data.subscription))
                    .catch(console.error);
            }
        }
    }, [activeSection, userData]);

    const handleCancelSubscription = async () => {
        if (!window.confirm('Вы уверены, что хотите отменить подписку?')) return;
        try {
            await fetch('/api/subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel', userId: userData?.id })
            });
            setSubscription(null);
            alert('Подписка отменена');
        } catch (e) {
            alert('Ошибка отмены');
        }
    };

    const handleTaskComplete = (taskId, reward, link, action) => {
        playClick();

        // 1. ALWAYS Execute action (Open Link / Copy)
        // This ensures the link works even if the task is already "Done"
        if (link) {
            try {
                if (window.Telegram?.WebApp?.openTelegramLink) {
                    window.Telegram.WebApp.openTelegramLink(link);
                } else {
                    window.open(link, '_blank');
                }
            } catch (e) {
                window.open(link, '_blank');
            }
        } else if (action === 'copy') {
            handleCopyReflink();
        }

        // 2. Check if already rewarded
        if (completedTasks.includes(taskId)) return;

        // 3. Optimistically complete & Award
        const newCompleted = [...completedTasks, taskId];
        setCompletedTasks(newCompleted);
        localStorage.setItem('pixel_completed_tasks', JSON.stringify(newCompleted));

        if (userData?.id) {
            addCreditsMutation.mutate({ userId: userData.id, amount: reward });
            analytics.trackEvent(userData.id, 'loyalty_task_completed', { task_id: taskId, reward });
        }
    };

    // ... inside render ...
    {
        [
            { id: 'sub_channel', title: 'Подпишись на канал', reward: 9, link: 'https://t.me/pixel_imagess', icon: <Volume2 size={18} className="text-blue-500" />, color: 'text-blue-500 bg-blue-500/10' },
            { id: 'join_chat', title: 'Вступай в чат', reward: 9, link: 'https://t.me/pixel_communityy', icon: <Users size={18} className="text-violet-500" />, color: 'text-violet-500 bg-violet-500/10' },
            { id: 'invite_friend', title: 'Пригласи друга', reward: 50, action: 'copy', icon: <Share2 size={18} className="text-pink-500" />, color: 'text-pink-500 bg-pink-500/10' },
        ].map((task) => {
            const isCompleted = completedTasks.includes(task.id);
            return (
                <div
                    key={task.id}
                    onClick={() => handleTaskComplete(task.id, task.reward, task.link, task.action)}
                    className={`bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all active:scale-98 cursor-pointer ${isCompleted ? 'opacity-90' : 'opacity-100 hover:shadow-md'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${task.color}`}>
                            {isCompleted ? <Check size={18} /> : task.icon}
                        </div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {task.title}
                            {isCompleted && <span className="ml-2 text-[10px] text-green-500 font-bold uppercase">Done</span>}
                        </div>
                    </div>
                    <button
                        className={`${isCompleted ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'} px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors pointer-events-none`}
                    >
                        {isCompleted ? 'Claimed' : `+${task.reward}`}
                        {!isCompleted && <Zap size={10} className="text-amber-500 fill-amber-500" />}
                    </button>
                </div>
            );
        })
    }

    const toggleLang = () => {
        setLang(prev => prev === 'ru' ? 'en' : 'ru');
        playClick();
        if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    };

    const handleToggleSound = () => {
        toggleSound();
        if (!isSoundEnabled) playClick();
        if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    };

    const handleCopyReflink = () => {
        playClick();
        navigator.clipboard.writeText(`https://t.me/Pixel_ai_bot?start=${userData?.id || 'ref'}`);
        if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    };

    const navigateTo = (section) => {
        playClick();
        setActiveSection(section);
    };

    const handleSaveEmail = () => {
        playClick();
        try {
            localStorage.setItem('pixel_user_email', email);
            toast.success('Email сохранён!');
        } catch (err) {
            toast.error('Ошибка сохранения');
        }
    };

    const handleBack = () => {
        playClick();
        setActiveSection('main');
    };

    if (isStatsLoading && userData) return <ProfileSkeleton />; // Only show skeleton if we have user but loading stats. If no user yet (init), we might wait or render placeholder.

    // Get Telegram user data if available
    let telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    // Fallback: Create mock Telegram user if not in Telegram
    if (!telegramUser) {
        console.warn('⚠️ No Telegram data available, using fallback');
        // In production, this would mean user is not in Telegram
        // Try to get from userData first
        if (userData?.telegram_id) {
            telegramUser = {
                id: userData.telegram_id,
                first_name: userData.first_name || 'Пользователь',
                username: userData.username || 'pixel_user'
            };
        }
    }

    // Debug logging
    console.log('🔍 Telegram WebApp:', window.Telegram?.WebApp);
    console.log('👤 Telegram User:', telegramUser);
    console.log('💾 UserData from context:', userData);

    // Try multiple sources for user data
    const displayName = telegramUser?.first_name
        || userData?.first_name
        || 'Пользователь';

    const username = telegramUser?.username
        || userData?.username
        || userData?.telegram_username
        || 'pixel_user';

    console.log('✅ Final display name:', displayName);
    console.log('✅ Final username:', username);
    const totalCreations = userStats?.total_generations || 0;
    const totalLikes = userStats?.total_likes_received || 0;
    const userLevel = Math.floor((userStats?.total_generations || 0) / 10) + 1;

    // --- SUB-VIEWS ---

    // 1. ACCOUNT VIEW (Premium Glassy)
    const renderAccountView = () => (
        <div className="space-y-6">
            <h3 className="font-black text-2xl mb-4 text-white tracking-tight">Аккаунт и подписка</h3>

            {/* Active Subscription Card */}
            <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 rounded-[2rem] p-6 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors duration-700" />
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold flex items-center gap-2 text-lg"><Sparkles size={20} className="text-amber-300" /> Моя подписка</h4>
                        {subscription ? (
                            <span className="bg-white/20 backdrop-blur-md text-[10px] font-black px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">ACTIVE</span>
                        ) : (
                            <span className="bg-black/20 backdrop-blur-md text-[10px] font-black px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest">FREE</span>
                        )}
                    </div>

                    {subscription ? (
                        <div>
                            <div className="text-4xl font-black mb-1">{subscription.amount} ₽ <span className="text-sm font-medium opacity-60">/мес</span></div>
                            <div className="text-xs opacity-60 mb-6 font-medium">Следующее списание: {new Date(subscription.current_period_end || Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                            <button
                                onClick={handleCancelSubscription}
                                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold py-3 px-4 rounded-xl w-full transition-colors backdrop-blur-md"
                            >
                                Отменить подписку
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm opacity-90 mb-6 leading-relaxed font-light">У вас нет активной подписки. <br />Оформите <span className="font-bold text-amber-300">Pro тариф</span> для максимальной выгоды.</p>
                            <button
                                onClick={() => { playClick(); setPaymentAmount(499); }}
                                className="bg-white text-indigo-600 font-bold py-3.5 px-4 rounded-xl w-full text-sm shadow-xl shadow-indigo-900/20 active:scale-95 transition-transform"
                            >
                                Оформить подписку
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Email Input */}
            <div className="bg-white/5 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/5">
                <label className="text-[10px] font-bold text-white/40 uppercase mb-3 block flex items-center gap-1.5 tracking-wider"><Mail size={12} /> Email для чеков</label>
                <form
                    className="flex gap-2"
                    onSubmit={(e) => { e.preventDefault(); handleSaveEmail(); }}
                >
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="flex-1 bg-black/20 border border-white/5 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none transition-colors placeholder:text-white/20"
                        enterKeyHint="done"
                    />
                    <button type="submit" className="bg-white text-black px-5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-50 transition-colors active:scale-95">OK</button>
                </form>
            </div>

            {/* Payment Section */}
            <div className="bg-[#151517]/80 backdrop-blur-xl p-5 rounded-[2rem] border border-white/5">
                <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-white/90">
                    <Wallet size={18} className="text-indigo-400" />
                    Баланс и пополнение
                </h4>

                <div className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-2xl mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-0.5">Текущий баланс</div>
                        <div className="text-3xl font-black text-white flex items-center gap-1">
                            {userStats?.current_balance || 0}
                            <Zap size={20} className="text-amber-400 fill-amber-400 shadow-amber-400/50" />
                        </div>
                    </div>
                    <button
                        onClick={() => { playClick(); onOpenPayment(); }}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-all text-xs flex items-center gap-2 relative z-10"
                    >
                        <span>Пополнить</span>
                        <ChevronRight size={14} />
                    </button>
                </div>

                <p className="text-[10px] text-center text-white/30">
                    Нажмите пополнить, чтобы увидеть тарифные планы
                </p>
            </div>

            {/* Payment History */}
            <div className="bg-white/5 backdrop-blur-xl p-5 rounded-[2rem] border border-white/5">
                <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-white/90"><Receipt size={16} className="text-white/40" /> История операций</h4>

                {isTxLoading ? (
                    <div className="py-8 text-center text-xs opacity-50 animate-pulse font-mono">Loading history...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-white/30 text-xs font-medium">История пуста</div>
                ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                <div>
                                    <div className="font-bold text-white/90 line-clamp-1 max-w-[180px]">{tx.description || tx.type}</div>
                                    <div className="text-[10px] text-white/40 mt-0.5 font-mono">{new Date(tx.created_at).toLocaleDateString()}</div>
                                </div>
                                <div className={`font-bold whitespace-nowrap bg-white/5 px-2 py-1 rounded-lg border border-white/5 ${tx.amount > 0 ? 'text-green-400' : 'text-white/70'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount} ⚡
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // 2. PARTNERSHIP VIEW (Premium Glassy)
    const renderPartnershipView = () => (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 rounded-[2.5rem] p-6 shadow-2xl shadow-purple-500/20 text-white relative overflow-hidden ring-1 ring-white/10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-[60px] translate-x-10 -translate-y-10" />
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-black text-xl flex items-center gap-2 tracking-tight"><Users size={22} className="text-white" /> Пригласи и заработай</h3>
                            <p className="text-white/80 text-xs font-medium mt-1">Получи 50 кредитов за каждого друга</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 shadow-lg"><Gift size={24} className="text-white" /></div>
                    </div>
                    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between gap-3 border border-white/10 shadow-inner">
                        <div className="font-mono text-xs truncate text-white/90">https://t.me/Pixel_ai_bot?start={userData?.id}</div>
                        <button onClick={handleCopyReflink} className="bg-white text-indigo-600 p-2.5 rounded-xl flex-shrink-0 active:scale-95 transition-transform hover:bg-indigo-50 shadow-md">
                            <Copy size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <h3 className="font-black text-xl px-2 text-white">Задания лояльности</h3>
            <div className="space-y-3">
                {[
                    { id: 'sub_channel', title: 'Подпишись на канал', reward: 9, link: 'https://t.me/pixel_imagess', icon: <Volume2 size={18} className="text-blue-400" />, color: 'text-blue-400 bg-blue-500/10' },
                    { id: 'join_chat', title: 'Вступай в чат', reward: 9, link: 'https://t.me/pixel_communityy', icon: <Users size={18} className="text-violet-400" />, color: 'text-violet-400 bg-violet-500/10' },
                    { id: 'invite_friend', title: 'Пригласи друга', reward: 50, action: 'copy', icon: <Share2 size={18} className="text-pink-400" />, color: 'text-pink-400 bg-pink-500/10' },
                ].map((task) => {
                    const isCompleted = completedTasks.includes(task.id);
                    return (
                        <div key={task.id} className={`bg-white/5 backdrop-blur-xl border border-white/5 p-4 rounded-[1.5rem] flex items-center justify-between transition-all ${isCompleted ? 'opacity-50 grayscale' : 'hover:bg-white/10'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${task.color} border border-white/5 shadow-inner`}>
                                    {isCompleted ? <Check size={20} /> : task.icon}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-white">
                                        {task.title}
                                    </div>
                                    {isCompleted && <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Выполнено</span>}
                                </div>
                            </div>
                            <button
                                onClick={() => handleTaskComplete(task.id, task.reward, task.link, task.action)}
                                disabled={isCompleted}
                                className={`${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white hover:bg-white/20'} px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/5`}
                            >
                                {isCompleted ? 'Claimed' : `+${task.reward}`}
                                {!isCompleted && <Zap size={10} className="text-amber-400 fill-amber-400" />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // 3. ACHIEVEMENTS VIEW (Premium Glassy)
    const renderAchievementsView = () => (
        <div className="space-y-6">
            <h3 className="font-black text-2xl px-2 text-white">Достижения</h3>
            <div className="grid grid-cols-2 gap-3">
                {[
                    { id: 'first_step', icon: Sparkles, color: 'from-blue-400 to-cyan-400', title: 'Первый шаг', desc: 'Сгенерируй 1 изображение', reward: 5, target: 1, current: totalCreations },
                    { id: 'creator', icon: Image, color: 'from-violet-400 to-purple-400', title: 'Творец', desc: 'Сгенерируй 50 изображений', reward: 15, target: 50, current: totalCreations },
                    { id: 'videographer', icon: Video, color: 'from-pink-400 to-rose-400', title: 'Режиссер', desc: 'Сгенерируй 10 видео', reward: 20, target: 10, current: Math.floor(totalCreations / 3) },
                    { id: 'pro', icon: Zap, color: 'from-amber-400 to-orange-400', title: 'PRO User', desc: 'Купи любую подписку', reward: 50, target: 1, current: 0 },
                    { id: 'social', icon: Users, color: 'from-emerald-400 to-teal-400', title: 'Душа компании', desc: 'Пригласи 5 друзей', reward: 25, target: 5, current: 1 },
                    { id: 'night', icon: Moon, color: 'from-indigo-400 to-blue-600', title: 'Ночной житель', desc: 'Зайди в приложение ночью', reward: 10, target: 1, current: 1 },
                    { id: 'rich', icon: Wallet, color: 'from-yellow-400 to-amber-600', title: 'Богач', desc: 'Накопи 1000 кредитов', reward: 30, target: 1000, current: 100 },
                    { id: 'master', icon: Crown, color: 'from-red-500 to-rose-600', title: 'Легенда', desc: 'Достигни 10 уровня', reward: 100, target: 10, current: userLevel },
                ].map((ach) => {
                    const progress = Math.min((ach.current / ach.target) * 100, 100);
                    const isUnlocked = progress >= 100;
                    const Icon = ach.icon;

                    return (
                        <div key={ach.id} className={`relative p-5 rounded-[1.8rem] overflow-hidden border transition-all ${isUnlocked ? 'bg-[#151517] border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-white/5 border-white/5 opacity-70 grayscale-[0.8]'}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                            {isUnlocked && <div className="absolute -right-5 -top-5 w-20 h-20 bg-indigo-500/20 blur-[40px] rounded-full" />}

                            <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full" />
                            <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${ach.color} shadow-[0_0_10px_currentColor]`} style={{ width: `${progress}%` }} />

                            <div className="flex flex-col h-full relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ach.color} flex items-center justify-center text-white shadow-lg`}> <Icon size={22} /> </div>
                                    {isUnlocked ? (
                                        <button className="bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-lg shadow-green-500/20 animate-pulse">DONE</button>
                                    ) : (
                                        <span className="text-[10px] font-bold text-white/30 font-mono">{Math.floor(progress)}%</span>
                                    )}
                                </div>
                                <h4 className="font-bold text-sm leading-tight mb-1 text-white">{ach.title}</h4>
                                <p className="text-[10px] text-white/50 leading-snug mb-4 font-medium">{ach.desc}</p>
                                <div className="mt-auto flex items-center gap-1.5 self-start bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                    <span className="text-[10px] font-black text-white/80">+{ach.reward}</span>
                                    <Zap size={10} className="fill-amber-400 text-amber-400" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // 4. SETTINGS VIEW (Premium Glassy)
    const renderSettingsView = () => (
        <div className="space-y-4">
            <h3 className="font-black text-2xl px-2 text-white">Настройки</h3>
            <button onClick={toggleLang} className="w-full bg-white/5 border border-white/5 backdrop-blur-xl p-5 rounded-[1.5rem] flex items-center justify-between group active:scale-98 transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20"><Globe size={20} /></div>
                    <span className="font-bold text-white text-sm">Language / Язык</span>
                </div>
                <span className="uppercase font-black text-white/50 text-xs bg-white/5 px-2 py-1 rounded-lg">{lang}</span>
            </button>

            <button onClick={handleToggleSound} className="w-full bg-white/5 border border-white/5 backdrop-blur-xl p-5 rounded-[1.5rem] flex items-center justify-between group active:scale-98 transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center border border-pink-500/20">{isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}</div>
                    <span className="font-bold text-white text-sm">Звуковые эффекты</span>
                </div>
                <div className={`w-12 h-7 rounded-full relative transition-colors ${isSoundEnabled ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${isSoundEnabled ? 'left-6' : 'left-1'}`} />
                </div>
            </button>
        </div>
    );

    // 5. GENERATIONS VIEW (Premium Grid)
    const renderGenerationsView = () => (
        <div className="space-y-4">
            <h3 className="font-black text-2xl px-2 text-white">Мои работы</h3>
            <div className="grid grid-cols-2 gap-3">
                {!userCreations ? (
                    <div className="col-span-2 text-center py-10 opacity-50 text-white/50 font-mono text-xs">Загрузка...</div>
                ) : userCreations.length === 0 ? (
                    <div className="col-span-2 text-center py-20 opacity-50 text-white/50 flex flex-col items-center">
                        <Image size={40} className="mb-4 opacity-50" />
                        <p className="font-bold">Нет публичных работ</p>
                        <p className="text-xs mt-2 max-w-[200px]">Сделайте свои генерации публичными в истории, чтобы они появились здесь</p>
                    </div>
                ) : (
                    userCreations.map((item) => (
                        <div key={item.id} className="relative aspect-square rounded-[1.2rem] overflow-hidden bg-white/5 border border-white/10 group shadow-md" onClick={() => navigate('/gallery')}>
                            <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full backdrop-blur-md border border-white/10">
                                <Heart size={12} className="text-white fill-white/50" />
                                <span className="text-[10px] font-bold text-white">{item.likes_count || 0}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <>
            <AnimatePresence mode="wait">
                {activeSection === 'main' ? (
                    <motion.div
                        key="main"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8 pt-4 pb-24 bg-[#0f0f10] min-h-screen relative overflow-hidden text-white"
                    >
                        {/* Background Blobs */}
                        <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
                        <div className="fixed top-20 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

                        {/* Header Profile Info */}
                        <div className="flex items-center gap-5 px-4 relative z-10">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-[2rem] blur opacity-60"></div>
                                <div className="w-20 h-20 rounded-[2rem] bg-[#1a1a1c] flex items-center justify-center text-white text-3xl font-black shadow-2xl border border-white/10 relative z-10">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black font-display tracking-tight text-white mb-0.5">{displayName}</h2>
                                <p className="text-white/40 text-[11px] font-medium tracking-wide">@{username}</p>

                                {/* Level Progress */}
                                <div className="mt-3 w-full max-w-[140px]">
                                    {(() => {
                                        // Calc Level & XP
                                        const xp = (totalCreations * 50) + (totalLikes * 10);
                                        const level = Math.floor(xp / 500) + 1;
                                        const progress = ((xp % 500) / 500) * 100;

                                        let rank = 'Новичок';
                                        if (level >= 5) rank = 'Создатель';
                                        if (level >= 10) rank = 'Мастер';
                                        if (level >= 20) rank = 'Легенда';

                                        return (
                                            <div>
                                                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider mb-1.5">
                                                    <span className="text-indigo-400 drop-shadow-sm">{rank}</span>
                                                    <span className="text-white/30">Lvl {level}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_10px_currentColor]"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                            <button className="ml-auto w-10 h-10 bg-white/5 border border-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/50 transition-colors" onClick={() => navigateTo('settings')}><Settings size={20} /></button>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 px-2">
                            <div className="bg-[#151517] border border-white/10 p-5 rounded-[2rem] relative overflow-hidden shadow-lg">
                                <div className="relative z-10">
                                    <div className="text-[10px] text-white/40 font-bold uppercase mb-1 tracking-wider">Баланс</div>
                                    <div className="text-3xl font-black text-white">{userStats?.current_balance || 0}</div>
                                </div>
                                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none"><Wallet size={70} className="text-white" /></div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] shadow-lg backdrop-blur-sm">
                                <div className="text-[10px] text-white/40 font-bold uppercase mb-1 tracking-wider">Всего лайков</div>
                                <div className="text-3xl font-black text-white flex items-center gap-2">{totalLikes} <Heart size={20} className="text-pink-500 fill-pink-500 drop-shadow-lg" /></div>
                            </div>
                        </div>

                        {/* --- MENU LIST (Premium Glassy Style) --- */}
                        <div className="space-y-3 px-2">
                            {(userData?.role === 'admin' || userData?.id === '13658f8b-3f48-4394-a320-dd8e2277d079' || window.location.hostname === 'localhost') && (
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/admin')}
                                    className="w-full bg-red-500/10 backdrop-blur-md border border-red-500/20 p-4 rounded-2xl flex items-center justify-between group relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                                            <ShieldAlert size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-red-500 text-[15px]">Панель персонала</div>
                                            <div className="text-[11px] text-red-400/80 font-medium">Доступ для администраторов</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-red-500/50" />
                                </motion.button>
                            )}

                            {[
                                {
                                    id: 'account',
                                    title: 'Аккаунт',
                                    desc: 'Подписка и история',
                                    icon: CreditCard,
                                    color: 'text-indigo-400',
                                    bg: 'bg-indigo-500/10',
                                    border: 'border-indigo-500/10',
                                    shadow: 'shadow-indigo-500/10'
                                },
                                {
                                    id: 'partnership',
                                    title: 'Партнёрство',
                                    desc: 'Рефералы и задания',
                                    icon: Users,
                                    color: 'text-purple-400',
                                    bg: 'bg-purple-500/10',
                                    border: 'border-purple-500/10',
                                    shadow: 'shadow-purple-500/10'
                                },
                                {
                                    id: 'achievements',
                                    title: 'Достижения',
                                    desc: 'Награды и значки',
                                    icon: Trophy,
                                    color: 'text-amber-400',
                                    bg: 'bg-amber-500/10',
                                    border: 'border-amber-500/10',
                                    shadow: 'shadow-amber-500/10'
                                },
                                {
                                    id: 'generations',
                                    title: 'Мои работы',
                                    desc: 'Публичные генерации',
                                    icon: Image,
                                    color: 'text-pink-400',
                                    bg: 'bg-pink-500/10',
                                    border: 'border-pink-500/10',
                                    shadow: 'shadow-pink-500/10'
                                },
                                {
                                    id: 'settings',
                                    title: 'Настройки',
                                    desc: 'Язык и уведомления',
                                    icon: Settings,
                                    color: 'text-white/50',
                                    bg: 'bg-white/5',
                                    border: 'border-white/5',
                                    shadow: 'shadow-white/5'
                                }
                            ].map((item, i) => (
                                <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigateTo(item.id)}
                                    className="w-full relative p-4 rounded-[1.5rem] flex items-center justify-between group overflow-hidden bg-white/5 backdrop-blur-md border border-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center border ${item.border} ${item.shadow} shadow-lg transition-transform group-hover:scale-105 duration-300`}>
                                            <item.icon size={22} className={`${item.color} drop-shadow-sm`} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-[15px] text-white leading-tight mb-0.5 group-hover:text-indigo-400 transition-colors">
                                                {item.title}
                                            </div>
                                            <div className="text-[11px] font-medium text-white/40">
                                                {item.desc}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                                        <ChevronRight size={16} className="text-white/30" />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="pt-4 pb-20 px-2"
                    >
                        <div className="flex items-center gap-4 mb-6 sticky top-0 bg-[#0f0f10]/80 backdrop-blur-xl -mx-2 px-4 py-3 z-30" onClick={handleBack}>
                            <button className="w-10 h-10 bg-white/5 border border-white/5 rounded-full flex items-center justify-center shadow-sm text-white/70 hover:bg-white/10 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <h2 className="font-black text-xl capitalize text-white">
                                {activeSection === 'account' ? 'Аккаунт' :
                                    activeSection === 'partnership' ? 'Партнёрство' :
                                        activeSection === 'achievements' ? 'Достижения' :
                                            activeSection === 'generations' ? 'Мои работы' :
                                                activeSection === 'settings' ? 'Настройки' : activeSection}
                            </h2>
                        </div>

                        {activeSection === 'account' && renderAccountView()}
                        {activeSection === 'partnership' && renderPartnershipView()}
                        {activeSection === 'achievements' && renderAchievementsView()}
                        {activeSection === 'generations' && renderGenerationsView()}
                        {activeSection === 'settings' && renderSettingsView()}
                    </motion.div>
                )}
            </AnimatePresence >
            <ThemeSettings isOpen={isThemeSettingsOpen} onClose={() => setIsThemeSettingsOpen(false)} />
        </>
    );
};

export default ProfileView;
