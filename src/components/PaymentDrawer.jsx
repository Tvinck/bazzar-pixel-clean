import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Zap, Copy, Star, Check, Sparkles, Users, ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSound } from '../context/SoundContext';
import TBankPaymentWidget from './TBankPaymentWidget';

// --- VISUAL ASSETS ---
const StarParticle = ({ delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0, y: 10, x: 0 }}
        animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            y: -40,
            x: Math.random() * 40 - 20,
            rotate: Math.random() * 360
        }}
        transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: delay,
            ease: "easeOut"
        }}
        className="absolute w-3 h-3 text-blue-200"
    >
        <Star size={10} fill="currentColor" stroke="none" />
    </motion.div>
);


// Packages Data
export const PACKS = [
    { id: 'pack_100', credits: 100, price: 99, bonus: 20, gradient: 'from-blue-500 to-cyan-400' },
    { id: 'pack_300', credits: 300, price: 290, bonus: 60, gradient: 'from-violet-500 to-purple-500', tag: 'Выгодно' },
    { id: 'pack_1000', credits: 1000, price: 890, bonus: 200, gradient: 'from-amber-400 to-orange-500', tag: 'Топ выбор' }
];

const PaymentDrawer = ({ isOpen, onClose }) => {
    const { user, stats, refreshUser } = useUser();
    const { playClick, playSuccess } = useSound();
    const dragControls = useDragControls();
    const [viewMode, setViewMode] = useState('topup'); // 'topup' or 'sub'

    // Copy Link Logic
    const [copied, setCopied] = useState(false);
    const inviteLink = `https://t.me/bazzar_pixel_bot?start=ref_${user?.telegram_id || user?.id}`;

    // Promos & Flash Sales
    const [flashSales, setFlashSales] = useState([]);
    const [promoInput, setPromoInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState('');
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchPromos = async () => {
                try {
                    const token = localStorage.getItem('bazzar_web_auth');
                    const res = await fetch('/api/user/active-promotions', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const raw = await res.json();
                    if (raw.success) {
                        setFlashSales(raw.promotions || []);
                    }
                } catch {
                    console.error('Failed to fetch promotions');
                }
            };
            fetchPromos();
        } else {
            setPromoInput('');
            setAppliedPromo(null);
            setPromoError('');
            setSelectedPack(null);
        }
    }, [isOpen]);

    const handleApplyPromo = async () => {
        if (!promoInput.trim()) return;
        setIsApplyingPromo(true);
        setPromoError('');
        try {
            const token = localStorage.getItem('bazzar_web_auth');
            const res = await fetch('/api/user/apply-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ code: promoInput.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setAppliedPromo(data.promo);
                playSuccess();
            } else {
                setPromoError(data.error || 'Ошибка активации');
            }
        } catch {
            setPromoError('Ошибка сети');
        } finally {
            setIsApplyingPromo(false);
        }
    };

    // Calculate max discount
    let maxBaseDiscount = 0;
    if (flashSales.length > 0) {
        maxBaseDiscount = Math.max(...flashSales.map(f => f.discount_percent || 0));
    }
    const promoDiscount = appliedPromo?.discount_percent || 0;
    const totalDiscountPercent = Math.min((maxBaseDiscount + promoDiscount), 90);

    const getCalculatedPrice = (rawPrice) => {
        if (totalDiscountPercent === 0) return rawPrice;
        return Math.floor(rawPrice * (1 - totalDiscountPercent / 100));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        playSuccess();
        setTimeout(() => setCopied(false), 2000);
    };

    // Calculate capabilities
    const balance = stats?.current_balance || 0;
    const videoCount = Math.floor(balance / 100);
    const imageCount = Math.floor(balance / 25);

    const [selectedPack, setSelectedPack] = useState(null); // If null -> List Mode. If set -> Payment Mode.
    const [isProcessingStars, setIsProcessingStars] = useState(false);

    const handleBuy = (pack) => {
        playClick();
        setSelectedPack(pack);
    };

    const handleBack = () => {
        playClick();
        setSelectedPack(null);
    };

    const handleStarsPayment = async () => {
        if (!selectedPack || isProcessingStars) return;
        setIsProcessingStars(true);
        try {
            const token = localStorage.getItem('bazzar_web_auth');
            // Stars conversion (e.g., 2 RUB = 1 XTR). Round up to nearest integer.
            const starsAmount = Math.ceil(selectedPack.price / 2);

            const res = await fetch('/api/user/stars-init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    amount: starsAmount,
                    credits: selectedPack.credits,
                    promoCode: appliedPromo?.code
                })
            });
            const data = await res.json();

            if (data.success && data.invoiceLink) {
                if (window.Telegram?.WebApp?.openInvoice) {
                    window.Telegram.WebApp.openInvoice(data.invoiceLink, (status) => {
                        if (status === 'paid') {
                            playSuccess();
                            refreshUser(); // Update balance instantly
                            setTimeout(() => onClose(), 2000);
                        } else if (status === 'failed') {
                            alert('Ошибка оплаты. Платеж отклонен.');
                        }
                        setIsProcessingStars(false);
                    });
                } else {
                    // Fallback to URL if openInvoice not available
                    window.location.href = data.invoiceLink;
                }
            } else {
                alert(data.error || 'Ошибка инициализации оплаты Stars');
                setIsProcessingStars(false);
            }
        } catch (e) {
            console.error(e);
            alert('Ошибка сети при оплате Stars. Проверьте соединение.');
            setIsProcessingStars(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        drag="y"
                        dragControls={dragControls}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.1}
                        onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
                        className="fixed bottom-0 left-0 right-0 md:left-1/2 md:right-auto md:bottom-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[100] bg-bg-secondary rounded-t-[32px] md:rounded-[32px] overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh] w-full md:w-[480px] shadow-2xl"
                    >
                        {/* Drag Handle */}
                        <div className="w-full h-6 flex items-center justify-center pt-2 cursor-grab active:cursor-grabbing" onPointerDown={(e) => dragControls.start(e)}>
                            <div className="w-10 h-1 rounded-full bg-white/10" />
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto pb-10 px-6">

                            {/* --- HEADER ANIMATION (Always visible or shrink?) Keep visible for style --- */}
                            {!selectedPack && (
                                <div className="flex flex-col items-center pt-4 pb-8 relative animate-in fade-in zoom-in duration-300">
                                    <button onClick={onClose} className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40">
                                        <X size={18} />
                                    </button>

                                    {/* Glowing Circle */}
                                    <div className="relative w-24 h-24 mb-6">
                                        <div className="absolute inset-0 bg-blue-500/30 blur-[40px] rounded-full animate-pulse" />
                                        <motion.div
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                            className="relative w-full h-full rounded-full bg-gradient-to-br from-[#3390ec] to-[#007aff] flex items-center justify-center shadow-2xl shadow-blue-500/40 border border-white/10"
                                        >
                                            <Sparkles size={40} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="white" />
                                        </motion.div>
                                        {[0, 1, 2, 3, 4].map(i => <StarParticle key={i} delay={i * 0.5} />)}
                                    </div>

                                    <h3 className="text-[13px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                        Мой Баланс
                                    </h3>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <h1 className="text-[36px] font-[800] text-white leading-none tracking-tight">
                                            {balance} <span className="text-[20px] font-bold text-white/60">зарядов</span>
                                        </h1>
                                    </div>
                                    <p className="text-[13px] text-white/40 font-medium text-center max-w-[200px] leading-snug">
                                        Этого хватит на <span className="text-white">{videoCount} видео</span> или <span className="text-white">{imageCount} изображений</span>
                                    </p>
                                </div>
                            )}

                            {/* VIEW 1: PACKAGES LIST */}
                            {!selectedPack ? (
                                <div className="animate-in slide-in-from-right-10 duration-300">

                                    {/* Promo Code Input */}
                                    <div className="mb-6 flex flex-col gap-2 relative">
                                        <div className="flex bg-bg-elevated rounded-card border border-white/10 p-1 focus-within:border-blue-500/50 transition-colors shadow-lg shadow-black/20">
                                            <div className="absolute top-[-10px] left-[16px] bg-bg-secondary text-white/50 px-1 text-[11px] font-bold tracking-wider uppercase">Промокод</div>
                                            <input
                                                value={promoInput}
                                                onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                                                placeholder="Введите код"
                                                className="bg-transparent flex-1 outline-none px-4 py-3 text-[15px] font-bold disabled:opacity-50 tracking-widest text-[#f5c53b] placeholder:text-gray-600 uppercase"
                                                disabled={appliedPromo || isApplyingPromo}
                                            />
                                            {appliedPromo ? (
                                                <button onClick={() => { setAppliedPromo(null); setPromoInput(''); }} className="px-4 bg-white/10 text-white rounded-input text-[13px] font-bold hover:bg-white/20 transition-colors">Сброс</button>
                                            ) : (
                                                <button onClick={handleApplyPromo} disabled={isApplyingPromo} className="px-4 bg-accent-blue text-white rounded-input text-[13px] font-bold hover:bg-accent-blue/80 transition-colors shadow-lg shadow-[#007aff]/30 disabled:opacity-50">
                                                    {isApplyingPromo ? '...' : 'Применить'}
                                                </button>
                                            )}
                                        </div>
                                        {promoError && <p className="text-red-400 text-[11px] pl-2">{promoError}</p>}
                                        {appliedPromo && <p className="text-accent-blue text-[11px] pl-2 font-bold flex items-center gap-1"><Check size={12} /> Применена скидка {appliedPromo.discount_percent}%</p>}
                                        {maxBaseDiscount > 0 && !appliedPromo && <p className="text-yellow-400 text-[11px] pl-2 font-bold flex items-center gap-1"><Zap size={12} /> Активна Flash-скидка {maxBaseDiscount}%</p>}
                                    </div>

                                    {/* Packages Mode Toggle */}
                                    <div className="flex bg-bg-secondary rounded-card p-1 mb-6 border border-white/5">
                                        <button
                                            onClick={() => { playClick(); setViewMode('topup'); }}
                                            className={`flex-1 py-2 text-[14px] font-bold rounded-input transition-colors ${viewMode === 'topup' ? 'bg-bg-elevated text-white shadow-md' : 'text-white/50 hover:text-white'}`}
                                        >
                                            Разовое
                                        </button>
                                        <button
                                            onClick={() => { playClick(); setViewMode('sub'); }}
                                            className={`flex-1 py-2 text-[14px] font-bold rounded-input transition-colors relative ${viewMode === 'sub' ? 'bg-bg-elevated text-white shadow-md' : 'text-white/50 hover:text-white'}`}
                                        >
                                            Подписка
                                            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-orange-500 text-[10px] text-white px-1.5 py-0.5 rounded-full shadow-lg">PRO</span>
                                        </button>
                                    </div>

                                    {viewMode === 'topup' ? (
                                        <div className="mb-8">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-[17px] font-semibold text-white flex items-center gap-2">
                                                    Пополнение
                                                </h4>
                                            </div>

                                            {/* Dynamic Bonus Scale */}
                                            <div className="mb-5 bg-bg-secondary rounded-card p-4 border border-white/5 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-2 opacity-5"><Zap size={60} /></div>
                                                <p className="text-[12px] font-bold text-white/50 uppercase tracking-widest mb-3">Сетка бонусов</p>
                                                <div className="flex justify-between relative z-10">
                                                    {PACKS.map((p) => (
                                                        <div key={p.id} className="flex flex-col items-center">
                                                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-1 shadow-lg shadow-black/50 z-10 border-2 border-[#1c1c1e]`}>
                                                                <span className="text-[10px] font-bold">+{p.bonus}</span>
                                                            </div>
                                                            <span className="text-[11px] text-white/60 font-medium">{p.credits} ⚡</span>
                                                        </div>
                                                    ))}
                                                    {/* Connecting line */}
                                                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-bg-elevated -z-0">
                                                        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 opacity-50 w-full" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {PACKS.map(pack => {
                                                    const finalPrice = getCalculatedPrice(pack.price);
                                                    return (
                                                        <motion.div
                                                            key={pack.id}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handleBuy({ ...pack, price: finalPrice })}
                                                            className="bg-bg-elevated rounded-card p-4 flex items-center justify-between cursor-pointer border border-white/5 hover:border-blue-500/30 transition-colors group relative overflow-hidden"
                                                        >
                                                            <div className="flex items-center gap-4 relative z-10">
                                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${pack.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                                                    <Zap size={20} className="text-white fill-white" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-[17px] font-bold text-white flex items-center gap-2">
                                                                        {pack.credits} зарядов
                                                                    </div>
                                                                    {pack.bonus > 0 && (
                                                                        <div className="text-[13px] text-green-400 font-bold flex items-center gap-1">
                                                                            <Check size={12} strokeWidth={3} /> +{pack.bonus} бонусом
                                                                        </div>
                                                                    )}
                                                                    {pack.tag && (
                                                                        <div className="absolute top-[-10px] left-[130px] bg-accent-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-lg shadow-blue-500/20">
                                                                            {pack.tag}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-0.5 text-[#f5c53b]">
                                                                {totalDiscountPercent > 0 && <span className="line-through text-white/40 text-[12px] h-3 font-medium">{pack.price} ₽</span>}
                                                                <span className="text-[17px] font-[800]">{finalPrice} ₽</span>
                                                                <span className="text-[11px] text-white/40 font-bold bg-white/5 px-1.5 py-0.5 rounded mt-0.5">{Math.ceil(pack.price / 2)} ⭐️</span>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-8 animate-in fade-in zoom-in-95 duration-300">
                                            <h4 className="text-[17px] font-semibold text-white mb-4 flex items-center gap-2">
                                                Pixel PRO <Sparkles size={16} className="text-yellow-400" />
                                            </h4>
                                            <motion.div
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleBuy({ id: 'sub_pro', credits: 1500, price: 990, isSub: true })}
                                                className="bg-gradient-to-br from-[#2c2c2e] to-[#1c1c1e] rounded-[24px] p-5 border border-[#3390ec]/30 cursor-pointer relative overflow-hidden group shadow-lg shadow-blue-500/10"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[30px] -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors" />

                                                <div className="flex justify-between items-start mb-4 relative z-10">
                                                    <div>
                                                        <h5 className="text-[20px] font-[900] text-white mb-1">PRO Подписка</h5>
                                                        <p className="text-[14px] text-blue-400 font-bold">1500 зарядов / месяц</p>
                                                    </div>
                                                    <div className="bg-accent-blue text-white text-[12px] font-bold px-2 py-1 rounded-lg">
                                                        Хит
                                                    </div>
                                                </div>

                                                <ul className="space-y-2.5 mb-6 relative z-10">
                                                    <li className="flex items-start gap-2 text-[13px] text-white/80 font-medium">
                                                        <Check size={16} className="text-green-400 shrink-0 mt-0.5" />
                                                        Выгода до 40% по сравнению с разовой
                                                    </li>
                                                    <li className="flex items-start gap-2 text-[13px] text-white/80 font-medium">
                                                        <div className="w-4 h-4 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0 mt-0.5"><Zap size={10} className="text-purple-400" fill="currentColor" /></div>
                                                        <span><strong className="text-purple-400">Перенос остатка:</strong> до 30% неизрасходованных зарядов сохраняются!</span>
                                                    </li>
                                                </ul>

                                                <div className="flex items-center justify-between border-t border-white/5 pt-4 relative z-10">
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] text-white/40 uppercase tracking-widest font-bold">Ежемесячно</span>
                                                        <span className="text-[24px] font-[900] text-white">990 ₽</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    )}

                                    {/* Earn Section */}
                                    <div className="mb-8">
                                        <h4 className="text-[17px] font-semibold text-white mb-4">
                                            Заработать токены
                                        </h4>
                                        <div className="bg-bg-elevated rounded-[24px] p-5 border border-white/5 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Users size={80} />
                                            </div>

                                            <div className="flex items-start gap-4 mb-4 relative z-10">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-[#3390ec]">
                                                    <Users size={20} strokeWidth={2.5} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h5 className="text-[15px] font-bold text-white leading-tight mb-1">
                                                            Отправить ссылку друзьям
                                                        </h5>
                                                        <span className="text-[#3390ec] font-[800] text-[15px] flex items-center gap-1">
                                                            +30 <Zap size={14} fill="currentColor" />
                                                        </span>
                                                    </div>
                                                    <p className="text-[12px] text-white/50 leading-snug">
                                                        Вы получите награду за каждого друга, который запустит приложение по Вашей ссылке.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-bg-secondary rounded-card flex items-center p-1 pl-3 border border-white/5">
                                                <div className="flex-1 truncate text-[13px] text-blue-400 font-medium">
                                                    {inviteLink}
                                                </div>
                                                <button
                                                    onClick={handleCopy}
                                                    className={`w-9 h-8 rounded-input flex items-center justify-center transition-all ${copied ? 'bg-green-500 text-white' : 'bg-accent-blue text-white checked:bg-green-500'}`}
                                                >
                                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // --- VIEW 2: CONFIRMATION / PAYMENT ---
                                <div className="animate-in slide-in-from-right-10 duration-300 relative h-full flex flex-col">
                                    {/* Close Button styling matching design */}
                                    <button
                                        onClick={handleBack}
                                        className="absolute top-0 left-0 z-50 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>

                                    {/* Content Container */}
                                    <div className="flex-1 flex flex-col items-center pt-8 px-4 text-center">

                                        {/* Main Icon with Galaxy Effect */}
                                        <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                                            {/* Galaxy Particles */}
                                            {Array.from({ length: 20 }).map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                                    animate={{
                                                        opacity: [0, 0.8, 0],
                                                        scale: [0.5, 1, 0.5],
                                                        x: (Math.random() - 0.5) * 120,
                                                        y: (Math.random() - 0.5) * 120,
                                                        rotate: Math.random() * 360
                                                    }}
                                                    transition={{
                                                        duration: 2 + Math.random() * 2,
                                                        repeat: Infinity,
                                                        delay: Math.random() * 2
                                                    }}
                                                    className={`absolute w-full h-full flex items-center justify-center pointer-events-none`}
                                                >
                                                    <Star
                                                        size={Math.random() * 10 + 4}
                                                        className={Math.random() > 0.5 ? "text-blue-400" : "text-yellow-400"}
                                                        fill="currentColor"
                                                        stroke="none"
                                                    />
                                                </motion.div>
                                            ))}

                                            {/* Central Glow */}
                                            <div className="absolute inset-0 bg-blue-500/30 blur-[50px] rounded-full animate-pulse" />

                                            {/* Main Icon */}
                                            <motion.div
                                                initial={{ scale: 0.8 }}
                                                animate={{ scale: 1 }}
                                                className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#3390ec] to-[#007aff] flex items-center justify-center shadow-2xl shadow-blue-500/40 border-4 border-[#1c1c1e]"
                                            >
                                                <Zap size={40} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)]" fill="white" />

                                                {/* Price Badge */}
                                                <div className="absolute -bottom-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[12px] font-[900] px-2 py-0.5 rounded-full shadow-lg border-2 border-[#1c1c1e] flex items-center gap-1">
                                                    <span className="text-[10px]">₽</span>
                                                    {selectedPack.price}
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-[20px] font-bold text-white mb-2">
                                            Подтверждение покупки
                                        </h2>

                                        {/* Brand Pill */}
                                        <div className="inline-flex items-center gap-1.5 bg-bg-elevated rounded-full px-3 py-1 mb-4 border border-white/10">
                                            <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <Sparkles size={10} className="text-[#3390ec]" fill="currentColor" />
                                            </div>
                                            <span className="text-[13px] font-semibold text-white">Pixel</span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-[14px] text-white/60 font-medium leading-relaxed max-w-[280px] mx-auto mb-8">
                                            Вы точно хотите {selectedPack.isSub ? 'оформить подписку на' : 'приобрести'} <span className="text-white font-bold">{selectedPack.credits} зарядов</span> у Pixel за <span className="text-white font-bold">{selectedPack.price} ₽</span>{selectedPack.isSub ? '/мес' : ''}?
                                        </p>

                                        {/* Telegram Stars Button */}
                                        <button
                                            onClick={handleStarsPayment}
                                            disabled={isProcessingStars}
                                            className="w-full py-4 rounded-card bg-accent-blue text-white font-bold text-[15px] hover:brightness-105 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
                                        >
                                            <Star size={18} fill="currentColor" />
                                            {isProcessingStars ? 'Ожидание...' : `Оплатить ${Math.ceil(selectedPack.price / 2)} ⭐️`}
                                        </button>

                                        <div className="flex items-center gap-4 mb-4 w-full">
                                            <div className="h-[1px] bg-white/10 flex-1"></div>
                                            <span className="text-[11px] text-white/40 uppercase tracking-widest font-bold">Картой</span>
                                            <div className="h-[1px] bg-white/10 flex-1"></div>
                                        </div>

                                        {/* Payment Widget Area */}
                                        <div className="w-full bg-bg-secondary rounded-[24px] overflow-hidden relative min-h-[100px]">
                                            <TBankPaymentWidget
                                                amount={selectedPack.price}
                                                credits={selectedPack.credits}
                                                promoCode={appliedPromo?.code}
                                                description={`Pixel: ${selectedPack.credits} зарядов`}
                                                userId={user?.id}
                                                telegramId={window.Telegram?.WebApp?.initDataUnsafe?.user?.id}
                                                onSuccess={() => {
                                                    playSuccess();
                                                    refreshUser(); // CRITICAL: Update balance instantly
                                                    setTimeout(() => onClose(), 2000);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer Terms */}
                                    <div className="p-4 text-center">
                                        <p className="text-[10px] text-white/30 leading-snug">
                                            Совершая покупку, Вы принимаете <a href="#" className="text-blue-400 hover:underline">условия использования</a> и <a href="#" className="text-blue-400 hover:underline">политику конфиденциальности</a>.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PaymentDrawer;
