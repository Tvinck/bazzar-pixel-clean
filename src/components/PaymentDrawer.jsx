// PaymentDrawer Updated: 2026-01-22 22:00
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Zap, ShieldCheck, X, TicketPercent, Wallet, Coins, Calendar, ArrowRight } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { useUser } from '../context/UserContext';
import { TBankLogo, VisaLogo, MastercardLogo, MIRLogo, SBPLogo } from './PaymentLogos';
import TBankWidget from './TBankWidget';
import TBankPaymentWidget from './TBankPaymentWidget';

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
        icon: Calendar,
        comingSoon: true
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
        icon: Zap,
        comingSoon: true
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
                        className="fixed bottom-0 left-0 w-full h-[85%] max-h-dvh bg-[#0f0f10] rounded-t-[2.5rem] z-[90] shadow-2xl flex flex-col overflow-hidden text-white border-t border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Ambient Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />

                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-5 pb-3 flex-shrink-0 relative z-10" onClick={onClose}>
                            <div className="w-12 h-1 bg-white/20 rounded-full" />
                        </div>

                        {!selectedPlan ? (
                            // --- MAIN SELECTOR VIEW ---
                            <div className="flex-1 flex flex-col p-6 pt-2 min-h-0 relative z-10">
                                <header className="mb-6 px-2 flex-shrink-0">
                                    <h2 className="font-black text-3xl mb-1 tracking-tight">Магазин Pixel</h2>
                                    <p className="text-white/40 text-sm font-medium">Пополните баланс для генераций</p>
                                </header>

                                {/* Tabs */}
                                <div className="bg-white/5 p-1.5 rounded-2xl flex mb-6 border border-white/5 flex-shrink-0">
                                    <button
                                        onClick={() => setActiveTab('packs')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'packs' ? 'bg-[#1c1c1e] shadow-lg text-white ring-1 ring-white/10' : 'text-white/40 hover:text-white/60'}`}
                                    >
                                        <Coins size={16} className={activeTab === 'packs' ? 'text-amber-400' : 'text-current'} />
                                        Пакеты
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('subs')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'subs' ? 'bg-[#1c1c1e] shadow-lg text-white ring-1 ring-white/10' : 'text-white/40 hover:text-white/60'}`}
                                    >
                                        <Calendar size={16} className={activeTab === 'subs' ? 'text-indigo-400' : 'text-current'} />
                                        Подписки
                                    </button>
                                </div>

                                {/* Content Grid */}
                                <div
                                    className="flex-1 overflow-y-scroll pb-40 min-h-0"
                                    style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                                >
                                    <div className="space-y-3">
                                        {(activeTab === 'packs' ? PACKS : SUBSCRIPTIONS).map((plan, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={plan.id}
                                                whileTap={!plan.comingSoon ? { scale: 0.98 } : {}}
                                                onClick={() => !plan.comingSoon && handleSelectPlan(plan)}
                                                className={`relative group p-5 rounded-[2rem] border transition-all ${plan.comingSoon ? 'opacity-50 cursor-not-allowed grayscale-[0.8] bg-white/5 border-white/5' : 'cursor-pointer bg-[#1c1c1e]'} ${plan.bestValue && !plan.comingSoon ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)] bg-gradient-to-b from-[#1c1c1e] to-[#252528]' : 'border-white/5 hover:border-white/20'}`}
                                            >
                                                {plan.bestValue && (
                                                    <div className="absolute -top-3 left-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] uppercase font-black px-3 py-1 rounded-full shadow-lg shadow-indigo-500/30 tracking-widest">
                                                        Best Choice
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center mb-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg text-white relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
                                                            <div className="absolute inset-0 bg-black/10" />
                                                            <plan.icon size={28} className="relative z-10" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg leading-tight text-white mb-0.5">{plan.name}</h3>
                                                            <div className="text-xs text-white/40 font-medium">
                                                                {plan.isSubscription ? 'Ежемесячно' : 'Навсегда'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-black text-2xl text-white tracking-tight">{plan.price}₽</div>
                                                        {plan.originalPrice && (
                                                            <div className="text-xs text-white/30 line-through decoration-white/30">{plan.originalPrice}₽</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    {plan.features.slice(0, 2).map((feat, i) => (
                                                        <div key={i} className="flex items-center gap-2.5 text-xs font-medium text-white/60">
                                                            <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                                                <Check size={10} className="text-white" strokeWidth={3} />
                                                            </div>
                                                            {feat}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                                    <span className={`text-xs font-black uppercase tracking-widest ${plan.bestValue ? 'text-indigo-400' : 'text-white/40'}`}>{plan.credits} CR</span>
                                                    {plan.comingSoon ? (
                                                        <span className="text-[9px] font-black uppercase text-white/20 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">Soon</span>
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${plan.bestValue ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/10 text-white/50 group-hover:bg-white group-hover:text-black'}`}>
                                                            <ArrowRight size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Info Banner */}
                                    {activeTab === 'subs' && (
                                        <div className="mt-6 bg-indigo-500/10 p-4 rounded-2xl flex gap-3 text-xs text-indigo-300 border border-indigo-500/20">
                                            <Zap size={20} className="flex-shrink-0 text-indigo-400" />
                                            <p className="font-medium">Подписки продлеваются автоматически. Вы можете отменить их в любой момент в настройках профиля.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // --- DETAIL/PAYMENT VIEW ---
                            <div className="flex-1 flex flex-col relative h-full relative z-10">
                                <div className="px-6 pt-2 pb-0">
                                    <button onClick={handleBack} className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/50 mb-2 hover:bg-white/10 hover:text-white transition-colors">
                                        <ChevronRight className="rotate-180" size={20} />
                                    </button>
                                </div>

                                <div
                                    className="px-6 flex-1 overflow-y-scroll pb-40 custom-scrollbar"
                                    style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                                >
                                    <div className="text-center mb-8">
                                        <div className={`w-28 h-28 mx-auto rounded-[2.5rem] bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20 relative overflow-hidden`}>
                                            <div className="absolute inset-0 bg-black/10" />
                                            <selectedPlan.icon size={48} className="text-white relative z-10" />
                                        </div>
                                        <h2 className="font-black text-3xl mb-2 text-white tracking-tight">{selectedPlan.name}</h2>
                                        <p className="text-white/50 mb-6 text-sm font-medium">{selectedPlan.description}</p>

                                        <div className="inline-flex items-baseline gap-1 bg-white/5 px-6 py-2 rounded-2xl border border-white/5">
                                            <span className="font-black text-4xl text-white">{getFinalPrice(selectedPlan)}₽</span>
                                            {selectedPlan.isSubscription && <span className="text-white/40 font-bold text-sm">/мес</span>}
                                        </div>
                                    </div>

                                    {/* Features Box */}
                                    <div className="bg-[#1c1c1e] rounded-[1.5rem] p-6 mb-6 space-y-4 border border-white/5">
                                        <h4 className="font-bold text-[10px] text-white/30 uppercase tracking-widest mb-2">Входит в пакет</h4>
                                        {selectedPlan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center flex-shrink-0 text-white shadow-lg`}>
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                                <span className="font-bold text-sm text-white/80">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Promo Code Input */}
                                    <div className="mb-6 bg-white/5 p-1 rounded-2xl border border-white/5">
                                        <div className="flex relative">
                                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/30">
                                                <TicketPercent size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                                placeholder="PROMO CODE"
                                                className="w-full bg-transparent text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none font-bold uppercase text-sm placeholder:text-white/20"
                                            />
                                            <button
                                                onClick={handlePromoCheck}
                                                disabled={isPromoApplied || !promoCode}
                                                className={`mx-1 my-1 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center ${isPromoApplied ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-slate-200'}`}
                                            >
                                                {isPromoApplied ? <Check size={16} /> : 'APPLY'}
                                            </button>
                                        </div>
                                        {isPromoApplied && <p className="text-green-500 text-[10px] font-bold px-4 pb-2">Скидка 10% применена!</p>}
                                    </div>

                                    {/* Policies */}
                                    <div className="space-y-4 mb-8">
                                        <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer transition-colors hover:bg-white/10">
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${termsAccepted ? 'bg-indigo-500 border-indigo-500' : 'border-white/20'}`}>
                                                {termsAccepted && <Check size={12} className="text-white" strokeWidth={4} />}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
                                            <p className="text-xs text-white/40 leading-snug">
                                                Я принимаю <a href="#" className="text-indigo-400 font-bold hover:underline">Условия использования</a> и <a href="#" className="text-indigo-400 font-bold hover:underline">Политику конфиденциальности</a>.
                                            </p>
                                        </label>

                                        {selectedPlan.isSubscription && (
                                            <div className="bg-indigo-500/10 rounded-2xl p-4 border border-indigo-500/20">
                                                <label className="flex items-start gap-3 cursor-pointer">
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${subscriptionAccepted ? 'bg-indigo-500 border-indigo-500' : 'border-indigo-300/30'}`}>
                                                        {subscriptionAccepted && <Check size={12} className="text-white" strokeWidth={4} />}
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={subscriptionAccepted} onChange={() => setSubscriptionAccepted(!subscriptionAccepted)} />
                                                    <div className="text-xs text-indigo-200/60 leading-snug">
                                                        <span className="font-bold block mb-1 text-indigo-300">Автосписание</span>
                                                        С карты будет списываться <b className="text-white">{getFinalPrice(selectedPlan)}₽</b> каждые 30 дней. Отмена в 1 клик.
                                                    </div>
                                                </label>
                                            </div>
                                        )}


                                        {/* T-Bank Payment Widgets (NEW) */}
                                        {termsAccepted && (!selectedPlan.isSubscription || subscriptionAccepted) && (
                                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <TBankPaymentWidget
                                                    amount={getFinalPrice(selectedPlan)}
                                                    description={`Pixel AI: ${selectedPlan.name}`}
                                                    userId={user?.id}
                                                    telegramId={window.Telegram?.WebApp?.initDataUnsafe?.user?.id}
                                                    userEmail={user?.email || 'no-email@telegram.org'}
                                                    terminalKey="1768938209983"
                                                    widgetTypes={['tpay', 'sbp', 'mirpay']}
                                                    displayParams={{
                                                        gap: 0.5,
                                                        height: 3.5,
                                                        radius: 0.75,
                                                        theme: {
                                                            default: 'accent'
                                                        }
                                                    }}
                                                    onSuccess={() => {
                                                        // Refresh balance after successful payment
                                                        window.location.reload();
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Divider */}
                                        {termsAccepted && (!selectedPlan.isSubscription || subscriptionAccepted) && (
                                            <div className="relative my-4 animate-in fade-in duration-500">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-white/10"></div>
                                                </div>
                                                <div className="relative flex justify-center text-xs">
                                                    <span className="bg-gradient-to-b from-indigo-950 to-purple-950 px-3 text-white/40 font-medium">или</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* T-Bank Widget (Classic) */}
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
                                    <div className="flex flex-col items-center gap-4 mb-32 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                                        <div className="flex flex-wrap justify-center gap-3">
                                            <div className="bg-white/10 rounded-lg p-1.5 border border-white/5"><MIRLogo className="w-10 h-5" /></div>
                                            <div className="bg-white/10 rounded-lg p-1.5 border border-white/5"><TBankLogo className="w-10 h-5" /></div>
                                            <div className="bg-white/10 rounded-lg p-1.5 border border-white/5"><SBPLogo className="w-10 h-5" /></div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/40">
                                            <ShieldCheck size={14} /> 100% SECURE PAYMENT
                                        </div>
                                    </div>
                                </div>

                                {/* Placeholder for non-accepted state */}
                                {!termsAccepted && (
                                    <div className="absolute bottom-0 left-0 w-full p-6 bg-[#0f0f10]/80 backdrop-blur-xl border-t border-white/5 z-50">
                                        <div className="w-full py-4 rounded-xl font-bold text-sm bg-white/5 text-white/30 text-center border border-white/5">
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
