import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Zap, Search, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useSound } from '../../context/SoundContext';

const GiftModal = ({ isOpen, onClose, currentBalance = 0, onGiftSuccess }) => {
    const toaster = useToast();
    const { playClick, playSuccess } = useSound();

    const [step, setStep] = useState(1); // 1 = Select User, 2 = Select Amount, 3 = Success
    const [recipient, setRecipient] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [amount, setAmount] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleClose = () => {
        setStep(1);
        setRecipient('');
        setFoundUser(null);
        setAmount('');
        onClose();
    };

    const handleSearch = async () => {
        if (!recipient.trim()) return;
        playClick();
        setIsSearching(true);
        // Simulate API search
        setTimeout(() => {
            setIsSearching(false);
            if (recipient.length > 2) {
                setFoundUser({
                    id: '12345',
                    username: recipient.replace('@', ''),
                    name: 'Пользователь ТГ',
                    avatar: null
                });
                setStep(2);
            } else {
                toaster.error('Пользователь не найден');
            }
        }, 1000);
    };

    const handleSend = async () => {
        const giftAmount = parseInt(amount, 10);
        if (isNaN(giftAmount) || giftAmount <= 0) {
            toaster.error('Введите корректную сумму');
            return;
        }
        if (giftAmount > currentBalance) {
            toaster.error('Недостаточно зарядов на балансе');
            return;
        }

        playClick();
        setIsSending(true);

        // Simulate API send
        setTimeout(() => {
            setIsSending(false);
            playSuccess();
            setStep(3);
            if (onGiftSuccess) onGiftSuccess(giftAmount);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={step !== 3 ? handleClose : undefined}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-bg-secondary w-full max-w-sm rounded-[24px] overflow-hidden relative z-10 shadow-2xl border border-white/10"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/5">
                            <h3 className="font-bold text-white text-[17px] tracking-[-0.41px] flex items-center gap-2">
                                <Gift size={18} className="text-[#3390ec]" />
                                Подарить заряды
                            </h3>
                            {step !== 3 && (
                                <button onClick={handleClose} className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            {step === 1 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <p className="text-[14px] text-white/60 mb-4 text-center">
                                        Отправьте свои заряды любому пользователю по его ID или @username.
                                    </p>
                                    <div className="relative mb-5">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search size={18} className="text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            value={recipient}
                                            onChange={(e) => setRecipient(e.target.value)}
                                            placeholder="@username или ID"
                                            className="w-full bg-bg-elevated rounded-card py-3.5 pl-10 pr-4 text-[17px] text-white placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-[#3390ec] transition-shadow shadow-inner"
                                            autoFocus
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        disabled={!recipient.trim() || isSearching}
                                        className="w-full bg-accent-blue text-white font-bold text-[17px] py-3.5 rounded-card hover:bg-accent-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-[54px]"
                                    >
                                        {isSearching ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : 'Найти пользователя'}
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    {/* User Card */}
                                    <div className="flex items-center gap-3 bg-bg-elevated p-3 rounded-card mb-5 border border-white/5">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-inner">
                                            <User size={24} className="text-white opacity-80" />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-bold text-white leading-tight">{foundUser?.name}</p>
                                            <p className="text-[13px] text-[#3390ec] font-medium">@{foundUser?.username}</p>
                                        </div>
                                    </div>

                                    <div className="mb-5">
                                        <label className="text-[13px] text-gray-400 font-medium block mb-2 text-center uppercase tracking-wider">Сумма зарядов</label>
                                        <div className="relative max-w-[200px] mx-auto">
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0"
                                                className="w-full bg-transparent text-center text-[48px] font-[900] text-white outline-none placeholder:text-white/20"
                                                autoFocus
                                            />
                                            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 text-yellow-400">
                                                <Zap size={24} fill="currentColor" />
                                            </div>
                                        </div>
                                        <p className="text-center text-[12px] text-white/40 mt-2">
                                            Доступно: <span className="font-bold text-white">{currentBalance} ⚡</span>
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 mb-6">
                                        {[10, 50, 100, 'MAX'].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => { playClick(); setAmount(val === 'MAX' ? currentBalance.toString() : val.toString()); }}
                                                className="bg-bg-elevated hover:bg-bg-elevated text-white text-[14px] font-bold py-2 rounded-input transition-colors border border-white/5"
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleSend}
                                        disabled={!amount || parseInt(amount, 10) <= 0 || isSending}
                                        className="w-full bg-accent-blue text-white font-bold text-[17px] py-3.5 rounded-card hover:bg-accent-blue transition-colors disabled:opacity-50 flex justify-center items-center h-[54px] shadow-lg shadow-blue-500/20"
                                    >
                                        {isSending ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : 'Отправить подарок'}
                                    </button>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-4 relative">
                                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                                        {/* Simplified celebration particles */}
                                        <div className="w-[200px] h-[200px] bg-gradient-to-br from-yellow-400/20 to-blue-500/20 blur-[50px] rounded-full" />
                                    </div>
                                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-green-500/30 relative z-10">
                                        <Gift size={40} className="text-white drop-shadow-md" />
                                    </div>
                                    <h3 className="text-[22px] font-[900] text-white tracking-tight mb-2 relative z-10">
                                        Успешно!
                                    </h3>
                                    <p className="text-[15px] text-white/60 mb-8 max-w-[240px] mx-auto relative z-10">
                                        Вы подарили <span className="text-white font-bold">{amount} ⚡</span> пользователю <span className="text-[#3390ec] font-bold">@{foundUser?.username}</span>.
                                    </p>
                                    <button
                                        onClick={handleClose}
                                        className="w-full bg-bg-elevated hover:bg-bg-elevated text-white font-bold text-[17px] py-3.5 rounded-card transition-colors relative z-10"
                                    >
                                        Закрыть
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GiftModal;
