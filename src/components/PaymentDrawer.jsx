// PaymentDrawer Updated: 2026-01-21 14:00
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Zap, ShieldCheck, X, CreditCard, TicketPercent, Wallet, Gift, Star } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { useUser } from '../context/UserContext';
import { TBankLogo, VisaLogo, MastercardLogo, MIRLogo, SBPLogo } from './PaymentLogos';
import TBankWidget from './TBankWidget';

const PLANS = [
    {
        id: 'trial',
        name: '100 кредитов',
        price: 99,
        originalPrice: 199,
        credits: 100,
        isSubscription: false,
        period: 'Единоразово',
        description: 'Пробная покупка кредитов для новых пользователей',
        color: 'from-slate-500 to-slate-700',
        features: ['Всего 100 кредитов', 'Доступ ко всем функциям'],
        oneTime: true
    },
    {
        id: 'basic',
        name: 'Basic',
        price: 499,
        credits: 525,
        isSubscription: true,
        period: '/месяц',
        description: 'Отличный старт для создателей контента',
        color: 'from-blue-500 to-indigo-500',
        features: ['Всего 525 кредитов', 'До 105 фото генераций', 'До 35 видео генераций']
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 999,
        credits: 1150,
        isSubscription: true,
        period: '/месяц',
        description: 'Продвинутый уровень',
        color: 'from-violet-500 to-fuchsia-500',
        popular: true,
        features: ['Всего 1150 кредитов', 'До 230 фото генераций', 'До 75 видео генераций', 'Приоритетная очередь']
    },
    {
        id: 'ultimate',
        name: 'Ultimate',
        price: 1999,
        credits: 2400,
        isSubscription: true,
        period: '/месяц',
        description: 'Максимальные возможности',
        color: 'from-amber-500 to-orange-500',
        features: ['Всего 2400 кредитов', 'До 480 фото генераций', 'До 160 видео генераций', 'VIP поддержка', 'Коммерческая лицензия']
    },
    {
        id: 'creator',
        name: 'Creator',
        price: 4999,
        credits: 6500,
        isSubscription: true,
        period: '/месяц',
        description: 'Для профессионалов и студий',
        color: 'from-emerald-500 to-teal-500',
        features: ['Всего 6500 кредитов', 'До 1300 фото генераций', 'До 430 видео генераций', 'Коммерческая лицензия', 'Персональный менеджер', 'API Доступ']
    }
];

const PaymentDrawer = ({ isOpen, onClose }) => {
    const { playClick, playSuccess } = useSound();
    const { user, refreshUser } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [billingCycle, setBillingCycle] = useState('monthly'); // monthly | yearly
    const [subscriptionAccepted, setSubscriptionAccepted] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [isPromoApplied, setIsPromoApplied] = useState(false);

    // Calculate Price Logic
    const getPrice = (plan) => {
        if (plan.oneTime) return plan.price;
        if (billingCycle === 'yearly') return Math.round(plan.price * 12 * 0.8); // 20% discount
        return plan.price;
    };

    const getDisplayPrice = (plan) => {
        const amount = getPrice(plan);
        return `${amount}₽`;
    };

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

    const handlePurchase = async () => {
        if (!termsAccepted) return;
        if (selectedPlan.isSubscription && !subscriptionAccepted) return;
        if (!user?.id) {
            alert('Ошибка: Пользователь не найден. Попробуйте перезайти.');
            return;
        }

        setIsLoading(true);
        playSuccess(); // Feedback sound

        const finalPrice = isPromoApplied ? Math.round(getPrice(selectedPlan) * 0.9) : getPrice(selectedPlan);

        try {
            const res = await fetch('/api/payment-init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    telegramId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id,
                    amount: finalPrice,
                    description: `Pixel AI: ${selectedPlan.name}`,
                    userEmail: user.email || 'no-email@telegram.org'
                })
            });

            const data = await res.json();

            if (data.paymentUrl) {
                // Open Payment Link
                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.openLink(data.paymentUrl);
                    window.Telegram.WebApp.close();
                } else {
                    window.location.href = data.paymentUrl;
                }
                onClose();
            } else {
                console.error('Payment Init Failed:', data);
                // Enhanced Error Alert
                const details = data.details ? JSON.stringify(data.details) : '';
                alert(`Ошибка платежа: ${data.error}\n${details}`);
            }
        } catch (error) {
            console.error('Network Error:', error);
            alert('Ошибка сети. Проверьте соединение.');
        } finally {
            setIsLoading(false);
            // Re-fetch user stats in background to see new balance
            if (typeof refreshUser === 'function') {
                setTimeout(() => refreshUser(), 5000);
            }
        }
    };

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
                        className="fixed bottom-0 left-0 w-full h-[95%] bg-[#F8F9FC] dark:bg-pixel-dark rounded-t-[2.5rem] z-[90] shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full flex justify-center pt-4 pb-2" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>

                        {!selectedPlan ? (
                            // LIST VIEW
                            <div className="flex-1 p-6 relative overflow-y-auto">
                                <div className="text-center mb-6">
                                    <h2 className="font-display font-bold text-2xl mb-2">Выбери свой план</h2>
                                    <p className="text-slate-500 text-sm mb-6">Раскройте полный потенциал нейросетей</p>

                                    {/* Billing Toggle */}
                                    <div className="flex items-center justify-center p-1 bg-white dark:bg-slate-800 rounded-2xl w-max mx-auto border border-slate-200 dark:border-slate-700 mb-2">
                                        <button
                                            onClick={() => setBillingCycle('monthly')}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500'}`}
                                        >
                                            Месяц
                                        </button>
                                        <button
                                            onClick={() => setBillingCycle('yearly')}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1 ${billingCycle === 'yearly' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500'}`}
                                        >
                                            Год <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-full">-20%</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 pb-20">
                                    {PLANS.map((plan) => (
                                        <motion.div
                                            key={plan.id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSelectPlan(plan)}
                                            className={`relative overflow-hidden rounded-[2rem] p-0.5 bg-gradient-to-br ${plan.popular ? 'from-amber-400 via-orange-500 to-purple-600 shadow-xl shadow-orange-500/20' : 'from-slate-200 to-slate-200 dark:from-slate-800 dark:to-slate-800'}`}
                                        >
                                            <div className="bg-white dark:bg-slate-900 rounded-[1.9rem] p-5 h-full relative z-10">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-display font-bold text-xl flex items-center gap-2">
                                                            {plan.id === 'pro' && <Zap size={18} className="text-amber-500 fill-amber-500" />}
                                                            {plan.name}
                                                        </h3>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.credits} Credits</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-xl">{getDisplayPrice(plan)}</div>
                                                        <div className="text-[10px] text-slate-400">{plan.oneTime ? plan.period : (billingCycle === 'yearly' ? '/год' : '/месяц')}</div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-2">
                                                    {plan.features.slice(0, 2).map((feat, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                            <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                                                                <Check size={10} className="text-white" strokeWidth={3} />
                                                            </div>
                                                            {feat}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {plan.popular && (
                                                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-2xl z-20">
                                                    POPULAR
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // DETAIL/CONFIRM VIEW
                            <div className="flex-1 flex flex-col relative h-full">
                                <div className="p-6 pb-0">
                                    <button onClick={handleBack} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-2">
                                        <ChevronRight className="rotate-180" size={20} />
                                    </button>
                                </div>

                                <div className="px-6 flex-1 overflow-y-auto pb-40">
                                    <div className="text-center mb-6">
                                        <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center mb-4 shadow-xl`}>
                                            <Zap size={32} className="text-white fill-white" />
                                        </div>
                                        <h2 className="font-display font-bold text-3xl mb-1">{selectedPlan.name}</h2>
                                        <div className="flex items-center justify-center gap-2 text-slate-500">
                                            {selectedPlan.oneTime && selectedPlan.originalPrice && (
                                                <span className="line-through text-slate-400 text-lg">{selectedPlan.originalPrice}₽</span>
                                            )}
                                            <span className="font-bold text-2xl text-slate-900 dark:text-white">
                                                {isPromoApplied ? Math.round(getPrice(selectedPlan) * 0.9) : getDisplayPrice(selectedPlan)}
                                            </span>
                                            {!selectedPlan.oneTime && <span>{billingCycle === 'yearly' ? '/год' : '/мес'}</span>}
                                        </div>
                                    </div>

                                    {/* Features Box */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 mb-6 space-y-4">
                                        <h4 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-2">Что внутри</h4>
                                        {selectedPlan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                                                    <Check size={14} strokeWidth={3} />
                                                </div>
                                                <span className="font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Promo Code Input */}
                                    <div className="mb-6">
                                        <label className="text-sm font-bold text-slate-500 ml-1 mb-2 block">Есть промокод?</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                                                    <TicketPercent size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={promoCode}
                                                    onChange={(e) => setPromoCode(e.target.value)}
                                                    placeholder="Промокод"
                                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold uppercase"
                                                />
                                            </div>
                                            <button
                                                onClick={handlePromoCheck}
                                                disabled={isPromoApplied || !promoCode}
                                                className={`px-4 rounded-xl font-bold font-display text-sm ${isPromoApplied ? 'bg-green-500 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
                                            >
                                                {isPromoApplied ? <Check size={20} /> : 'Применить'}
                                            </button>
                                        </div>
                                        {isPromoApplied && <p className="text-green-500 text-xs font-bold mt-2 ml-1">Промокод применен! Скидка 10%</p>}
                                    </div>

                                    {/* Policies */}
                                    <div className="space-y-4 mb-8">
                                        <label className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 cursor-pointer">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors flex-shrink-0 ${termsAccepted ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                                {termsAccepted && <Check size={14} className="text-white" strokeWidth={3} />}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
                                            <p className="text-xs text-slate-500 leading-snug">
                                                Я принимаю <a href="#" onClick={(e) => { e.stopPropagation(); window.Telegram?.WebApp?.openLink('https://telegra.ph/Soglasie-na-obrabotku-personalnyh-dannyh-01-13-22'); }} className="text-indigo-500 font-bold hover:underline relative z-10">Условия</a>, <a href="#" onClick={(e) => { e.stopPropagation(); window.Telegram?.WebApp?.openLink('https://telegra.ph/POLITIKA-KONFIDENCIALNOSTI-01-13-41'); }} className="text-indigo-500 font-bold hover:underline relative z-10">Политику</a> и <a href="#" onClick={(e) => { e.stopPropagation(); window.Telegram?.WebApp?.openLink('https://telegra.ph/POLZOVATELSKOE-SOGLASHENIE-PUBLICHNAYA-OFERTA-01-13-4'); }} className="text-indigo-500 font-bold hover:underline relative z-10">Пользовательское соглашение</a>.
                                            </p>
                                        </label>

                                        {selectedPlan.isSubscription && (
                                            <label className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 cursor-pointer">
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors flex-shrink-0 ${subscriptionAccepted ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                                    {subscriptionAccepted && <Check size={14} className="text-white" strokeWidth={3} />}
                                                </div>
                                                <input type="checkbox" className="hidden" checked={subscriptionAccepted} onChange={() => setSubscriptionAccepted(!subscriptionAccepted)} />
                                                <p className="text-xs text-slate-500 leading-snug">
                                                    Автосписание {billingCycle === 'yearly' ? 'раз в год' : 'каждые 30 дней'}.
                                                </p>
                                            </label>
                                        )}

                                        {/* Official T-Bank Widget Integration */}
                                        {termsAccepted && (!selectedPlan.isSubscription || subscriptionAccepted) && (
                                            <TBankWidget
                                                amount={isPromoApplied ? Math.round(getPrice(selectedPlan) * 0.9) : getPrice(selectedPlan)}
                                                description={`Pixel AI: ${selectedPlan.name}`}
                                                userId={user?.id}
                                                telegramId={window.Telegram?.WebApp?.initDataUnsafe?.user?.id}
                                                userEmail={user?.email || 'no-email@telegram.org'}
                                            />
                                        )}
                                    </div>

                                    {/* Trust Badges */}
                                    {/* Trust Badges & Payment Icons */}
                                    <div className="flex flex-col items-center gap-4 mb-32">
                                        {/* Payment Methods */}
                                        <div className="flex flex-wrap justify-center gap-3">
                                            <div className="bg-white dark:bg-slate-800 rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <MIRLogo className="w-14 h-7" />
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <TBankLogo className="w-14 h-7" />
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <VisaLogo className="w-14 h-7" />
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <MastercardLogo className="w-14 h-7" />
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <SBPLogo className="w-14 h-7" />
                                            </div>
                                        </div>

                                        {/* Security Badges */}
                                        <div className="flex items-center justify-center gap-4 opacity-40 grayscale">
                                            <ShieldCheck size={20} />
                                            <div className="text-[10px] font-bold">SECURE SSL</div>
                                            <Wallet size={20} />
                                        </div>
                                    </div>
                                </div>

                                {/* Fallback button or loading state */}
                                {!termsAccepted && (
                                    <div className="absolute bottom-0 left-0 w-full p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-50">
                                        <div className="w-full py-4 rounded-2xl font-bold text-lg bg-slate-200 dark:bg-slate-800 text-slate-400 text-center opacity-80">
                                            Примите условия для оплаты
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
