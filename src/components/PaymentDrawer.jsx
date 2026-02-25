import React, { useState } from 'react';
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
    { id: 'pack_100', credits: 100, price: 99, bonus: 0, gradient: 'from-blue-500 to-cyan-400' },
    { id: 'pack_500', credits: 500, price: 390, bonus: 50, gradient: 'from-violet-500 to-purple-500', tag: '-29%' },
    { id: 'pack_1500', credits: 1500, price: 990, bonus: 200, gradient: 'from-amber-400 to-orange-500', tag: '-50%' }
];

const PaymentDrawer = ({ isOpen, onClose }) => {
    const { user, stats } = useUser();
    const { playClick, playSuccess } = useSound();
    const dragControls = useDragControls();

    // Copy Link Logic
    const [copied, setCopied] = useState(false);
    const inviteLink = `https://t.me/bazzar_pixel_bot?start=ref_${user?.telegram_id || user?.id}`;

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

    const handleBuy = (pack) => {
        playClick();
        setSelectedPack(pack);
    };

    const handleBack = () => {
        playClick();
        setSelectedPack(null);
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
                        className="fixed bottom-0 left-0 right-0 md:left-1/2 md:right-auto md:bottom-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[100] bg-[#1c1c1e] rounded-t-[32px] md:rounded-[32px] overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh] w-full md:w-[480px] shadow-2xl"
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

                            {/* --- VIEW 1: PACKAGES LIST --- */}
                            {!selectedPack ? (
                                <div className="animate-in slide-in-from-right-10 duration-300">
                                    {/* Packages */}
                                    <div className="mb-8">
                                        <h4 className="text-[17px] font-semibold text-white mb-4 flex items-center gap-2">
                                            Пополнение
                                        </h4>
                                        <div className="space-y-3">
                                            {PACKS.map(pack => (
                                                <motion.div
                                                    key={pack.id}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleBuy(pack)}
                                                    className="bg-[#2c2c2e] rounded-[20px] p-4 flex items-center justify-between cursor-pointer border border-white/5 hover:border-blue-500/30 transition-colors group relative overflow-hidden"
                                                >
                                                    <div className="flex items-center gap-4 relative z-10">
                                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${pack.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                                            <Zap size={20} className="text-white fill-white" />
                                                        </div>
                                                        <div>
                                                            <div className="text-[17px] font-bold text-white flex items-center gap-2">
                                                                {pack.credits} зарядов
                                                            </div>
                                                            {pack.tag && (
                                                                <div className="absolute top-[-10px] left-[130px] bg-[#3390ec] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                                                    {pack.tag}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[#f5c53b]">
                                                        {/* Assuming Star represents value, or just style choice */}
                                                        <span className="text-[17px] font-[800]">{pack.price} ₽</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Earn Section */}
                                    <div className="mb-8">
                                        <h4 className="text-[17px] font-semibold text-white mb-4">
                                            Заработать токены
                                        </h4>
                                        <div className="bg-[#2c2c2e] rounded-[24px] p-5 border border-white/5 relative overflow-hidden">
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

                                            <div className="bg-[#1c1c1e] rounded-[14px] flex items-center p-1 pl-3 border border-white/5">
                                                <div className="flex-1 truncate text-[13px] text-blue-400 font-medium">
                                                    {inviteLink}
                                                </div>
                                                <button
                                                    onClick={handleCopy}
                                                    className={`w-9 h-8 rounded-[10px] flex items-center justify-center transition-all ${copied ? 'bg-green-500 text-white' : 'bg-[#3390ec] text-white checked:bg-green-500'}`}
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
                                        <div className="inline-flex items-center gap-1.5 bg-[#2c2c2e] rounded-full px-3 py-1 mb-4 border border-white/10">
                                            <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <Sparkles size={10} className="text-[#3390ec]" fill="currentColor" />
                                            </div>
                                            <span className="text-[13px] font-semibold text-white">Pixel</span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-[14px] text-white/60 font-medium leading-relaxed max-w-[280px] mx-auto mb-8">
                                            Вы точно хотите приобрести <span className="text-white font-bold">{selectedPack.credits} зарядов</span> у Pixel за <span className="text-white font-bold">{selectedPack.price} ₽</span>?
                                        </p>

                                        {/* Payment Widget Area */}
                                        <div className="w-full bg-[#1c1c1e] rounded-[24px] overflow-hidden relative min-h-[100px]">
                                            <TBankPaymentWidget
                                                amount={selectedPack.price}
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
