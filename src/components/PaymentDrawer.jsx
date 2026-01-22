// PaymentDrawer Updated: 2026-01-22 22:00
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Zap, ShieldCheck, X, TicketPercent, Wallet, Coins, Calendar, ArrowRight } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { useUser } from '../context/UserContext';
import { TBankLogo, VisaLogo, MastercardLogo, MIRLogo, SBPLogo } from './PaymentLogos';
import TBankWidget from './TBankWidget';

// 1. One-Time Packs
const PACKS = [
    {
        id: 'pack_100',
        name: 'Starter',
        price: 99,
        originalPrice: 199,
        credits: 100,
        isSubscription: false,
        description: 'Для пробы',
        color: 'from-blue-500 to-cyan-500',
        features: ['100 кредитов навсегда', 'Доступ ко всем моделям'],
        icon: Coins
    },
    {
        id: 'pack_500',
        name: 'Medium',
        price: 390,
        originalPrice: 499,
        credits: 500,
        isSubscription: false,
        bestValue: true,
        description: 'Самый популярный',
        color: 'from-violet-500 to-purple-500',
        features: ['500 кредитов навсегда', 'Хватит на ~100 фото', 'Без сгорания'],
        icon: Coins
    },
    {
        id: 'pack_1500',
        name: 'Large',
        price: 990,
        originalPrice: 1499,
        credits: 1500,
        isSubscription: false,
        description: 'Максимум выгоды',
        color: 'from-amber-400 to-orange-500',
        features: ['1500 кредитов навсегда', 'Лучшая цена за 1 кредит', 'Приоритет в очереди'],
        icon: Coins
    }
];

// 2. Subscriptions
const SUBSCRIPTIONS = [
    {
        id: 'sub_standard',
        name: 'Standard',
        price: 199,
        credits: 300,
        isSubscription: true,
        period: '/мес',
        description: 'Ежемесячный бонус',
        color: 'from-green-500 to-emerald-500',
        features: ['300 кредитов каждый месяц', 'Цена кредита: 0.6₽', 'Доступ к PRO моделям'],
        icon: Calendar
    },
    {
        id: 'sub_pro',
        name: 'Pro Club',
        price: 399,
        credits: 800,
        isSubscription: true,
        period: '/мес',
        bestValue: true,
        description: 'Для активных криэйторов',
        color: 'from-rose-500 to-pink-500',
        features: ['800 кредитов каждый месяц', 'Цена кредита: 0.5₽', 'Генерация видео без очереди', 'Приватный чат авторов'],
        icon: Zap
    }
];

const PaymentDrawer = ({ isOpen, onClose }) => {
    const { playClick, playSuccess } = useSound();
    const { user, refreshUser } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    // State
    const [activeTab, setActiveTab] = useState('packs'); // 'packs' | 'subs'
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [subscriptionAccepted, setSubscriptionAccepted] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [isPromoApplied, setIsPromoApplied] = useState(false);

    const handleSelectPlan = (plan) => {
        playClick();
        setSelectedPlan(plan);
        setTermsAccepted(false);
        setSubscriptionAccepted(false);
        setIsPromoApplied(false);
        setPromoCode('');
    };

    const handleBack = () => {
        playClick();
        setSelectedPlan(null);
    };

    const handlePromoCheck = () => {
        if (promoCode.toLowerCase() === 'pixel2026') {
            setIsPromoApplied(true);
            playSuccess();
        } else {
            alert('Неверный промокод');
        }
    };

    const getPrice = (plan) => plan.price;
    const getFinalPrice = (plan) => isPromoApplied ? Math.round(plan.price * 0.9) : plan.price;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80]"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 w-full h-[90%] bg-[#F8F9FC] dark:bg-[#0f1014] rounded-t-[2.5rem] z-[90] shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-4 pb-2" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>

                        {!selectedPlan ? (
                            // --- MAIN SELECTOR VIEW ---
                            <div className="flex-1 flex flex-col p-6 pt-2">
                                <header className="mb-6 px-2">
                                    <h2 className="font-display font-black text-2xl mb-1">Магазин Pixel</h2>
                                    <p className="text-slate-500 text-sm">Пополните баланс для генераций</p>
                                </header>

                                {/* Tabs */}
                                <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl flex mb-6 shadow-inner">
                                    <button
                                        onClick={() => setActiveTab('packs')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'packs' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}
                                    >
                                        <Coins size={16} className={activeTab === 'packs' ? 'text-amber-500' : ''} />
                                        Пакеты
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('subs')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'subs' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}
                                    >
                                        <Calendar size={16} className={activeTab === 'subs' ? 'text-indigo-500' : ''} />
                                        Подписки
                                    </button>
                                </div>

                                {/* Content Grid */}
                                <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar overscroll-contain">
                                    <div className="space-y-3 min-h-[300px]">
                                        {(activeTab === 'packs' ? PACKS : SUBSCRIPTIONS).map((plan, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={plan.id}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSelectPlan(plan)}
                                                className={`relative group bg-white dark:bg-slate-800 p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${plan.bestValue ? 'border-indigo-500 dark:border-indigo-500 shadow-lg shadow-indigo-500/10' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
                                            >
                                                {plan.bestValue && (
                                                    <div className="absolute -top-3 left-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-md">
                                                        Выгодно
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg text-white`}>
                                                            <plan.icon size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg leading-tight">{plan.name}</h3>
                                                            <div className="text-xs text-slate-400 font-medium">
                                                                {plan.isSubscription ? 'Ежемесячно' : 'Навсегда'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-black text-xl">{plan.price}₽</div>
                                                        {plan.originalPrice && (
                                                            <div className="text-xs text-slate-400 line-through decoration-red-400">{plan.originalPrice}₽</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {plan.features.slice(0, 2).map((feat, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                            <Check size={12} className="text-green-500" strokeWidth={3} />
                                                            {feat}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.credits} CR</span>
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                                        <ArrowRight size={16} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Info Banner */}
                                    {activeTab === 'subs' && (
                                        <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl flex gap-3 text-xs text-indigo-800 dark:text-indigo-200">
                                            <Zap size={20} className="flex-shrink-0" />
                                            <p>Подписки продлеваются автоматически. Вы можете отменить их в любой момент в настройках профиля.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // --- DETAIL/PAYMENT VIEW ---
                            <div className="flex-1 flex flex-col relative h-full">
                                <div className="px-6 pt-2 pb-0">
                                    <button onClick={handleBack} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-2 hover:bg-slate-200 transition-colors">
                                        <ChevronRight className="rotate-180" size={20} />
                                    </button>
                                </div>

                                <div className="px-6 flex-1 overflow-y-auto pb-40 custom-scrollbar">
                                    <div className="text-center mb-8">
                                        <div className={`w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20`}>
                                            <selectedPlan.icon size={40} className="text-white" />
                                        </div>
                                        <h2 className="font-display font-black text-3xl mb-2">{selectedPlan.name}</h2>
                                        <p className="text-slate-500 mb-4 text-sm">{selectedPlan.description}</p>

                                        <div className="inline-flex items-baseline gap-1">
                                            <span className="font-black text-4xl">{getFinalPrice(selectedPlan)}₽</span>
                                            {selectedPlan.isSubscription && <span className="text-slate-400 font-bold">/мес</span>}
                                        </div>
                                    </div>

                                    {/* Features Box */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 mb-6 space-y-4 border border-slate-100 dark:border-slate-700">
                                        <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-2">Входит в пакет</h4>
                                        {selectedPlan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center flex-shrink-0 text-white shadow-sm`}>
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                                <span className="font-medium text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Promo Code Input */}
                                    <div className="mb-6">
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Промокод</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                                                    <TicketPercent size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={promoCode}
                                                    onChange={(e) => setPromoCode(e.target.value)}
                                                    placeholder="CODE"
                                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold uppercase text-sm"
                                                />
                                            </div>
                                            <button
                                                onClick={handlePromoCheck}
                                                disabled={isPromoApplied || !promoCode}
                                                className={`px-4 rounded-xl font-bold font-display text-sm transition-all active:scale-95 ${isPromoApplied ? 'bg-green-500 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
                                            >
                                                {isPromoApplied ? <Check size={20} /> : 'Apply'}
                                            </button>
                                        </div>
                                        {isPromoApplied && <p className="text-green-500 text-xs font-bold mt-2 ml-1">Скидка 10% применена!</p>}
                                    </div>

                                    {/* Policies */}
                                    <div className="space-y-4 mb-8">
                                        <label className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 cursor-pointer transition-colors hover:border-indigo-200 dark:hover:border-indigo-900">
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${termsAccepted ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                                {termsAccepted && <Check size={12} className="text-white" strokeWidth={4} />}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
                                            <p className="text-xs text-slate-500 leading-snug">
                                                Я принимаю <a href="#" className="text-indigo-500 font-bold hover:underline">Условия использования</a> и <a href="#" className="text-indigo-500 font-bold hover:underline">Политику конфиденциальности</a>.
                                            </p>
                                        </label>

                                        {selectedPlan.isSubscription && (
                                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                                                <label className="flex items-start gap-3 cursor-pointer">
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${subscriptionAccepted ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                                        {subscriptionAccepted && <Check size={12} className="text-white" strokeWidth={4} />}
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={subscriptionAccepted} onChange={() => setSubscriptionAccepted(!subscriptionAccepted)} />
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                                                        <span className="font-bold block mb-1 text-slate-900 dark:text-white">Автосписание</span>
                                                        С карты будет списываться <b>{getFinalPrice(selectedPlan)}₽</b> каждые 30 дней. Отмена в 1 клик.
                                                    </div>
                                                </label>
                                            </div>
                                        )}

                                        {/* T-Bank Widget */}
                                        {termsAccepted && (!selectedPlan.isSubscription || subscriptionAccepted) && (
                                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <TBankWidget
                                                    amount={getFinalPrice(selectedPlan)}
                                                    description={`Pixel AI: ${selectedPlan.name}`}
                                                    userId={user?.id}
                                                    telegramId={window.Telegram?.WebApp?.initDataUnsafe?.user?.id}
                                                    userEmail={user?.email || 'no-email@telegram.org'}
                                                    recurrent={selectedPlan.isSubscription && subscriptionAccepted}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Trust Badges */}
                                    <div className="flex flex-col items-center gap-4 mb-32 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                        <div className="flex flex-wrap justify-center gap-3">
                                            <div className="bg-white dark:bg-slate-800 rounded-lg p-1.5 border border-slate-200 dark:border-slate-700"><MIRLogo className="w-10 h-5" /></div>
                                            <div className="bg-white dark:bg-slate-800 rounded-lg p-1.5 border border-slate-200 dark:border-slate-700"><TBankLogo className="w-10 h-5" /></div>
                                            <div className="bg-white dark:bg-slate-800 rounded-lg p-1.5 border border-slate-200 dark:border-slate-700"><SBPLogo className="w-10 h-5" /></div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400">
                                            <ShieldCheck size={14} /> 100% SECURE PAYMENT
                                        </div>
                                    </div>
                                </div>

                                {/* Placeholder for non-accepted state */}
                                {!termsAccepted && (
                                    <div className="absolute bottom-0 left-0 w-full p-6 bg-white/80 dark:bg-[#0f1014]/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-50">
                                        <div className="w-full py-4 rounded-2xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 text-center">
                                            Подтвердите условия выше
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PaymentDrawer;
