import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronLeft, Copy, Users, TrendingUp,
    DollarSign, Check, Crown
} from 'lucide-react';
// @ts-ignore
import { useUser } from '../context/UserContext';
// @ts-ignore
import { useSound } from '../context/SoundContext';
// @ts-ignore
import { useToast } from '../context/ToastContext';

interface AffiliateStats {
    promoCode: string;
    commission: number;
    totalReferrals: number;
    activeReferrals: number;
    totalEarned: number;
    pendingPayout: number;
    monthlyEarnings: { month: string; amount: number }[];
}

const MOCK_STATS: AffiliateStats = {
    promoCode: 'PARTNER2026',
    commission: 0.15,
    totalReferrals: 47,
    activeReferrals: 32,
    totalEarned: 12450,
    pendingPayout: 3200,
    monthlyEarnings: [
        { month: 'Янв', amount: 1200 },
        { month: 'Фев', amount: 2800 },
        { month: 'Мар', amount: 3200 },
    ]
};

const StatCard = ({ icon, label, value, color = 'bg-blue-500', sublabel }: {
    icon: React.ReactNode; label: string; value: string; color?: string; sublabel?: string
}) => (
    <div className="bg-[#1c1c1e] rounded-[16px] p-4 border border-white/5 flex-1 min-w-[140px]">
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center mb-3 shadow-lg`}>
            {icon}
        </div>
        <p className="text-[22px] font-[900] text-white tracking-tight">{value}</p>
        <p className="text-[12px] text-white/40 font-medium mt-0.5">{label}</p>
        {sublabel && <p className="text-[11px] text-green-400 font-bold mt-1">{sublabel}</p>}
    </div>
);

const AffiliateView = () => {
    const navigate = useNavigate();
    const { user: _currentUser } = useUser();
    const { playClick, playSuccess } = useSound();
    const toaster = useToast() as any;

    const [stats, setStats] = useState<AffiliateStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [payoutRequested, setPayoutRequested] = useState(false);

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setStats(MOCK_STATS);
            setIsLoading(false);
        }, 600);
    }, []);

    const handleCopyCode = () => {
        if (!stats) return;
        playClick();
        navigator.clipboard.writeText(stats.promoCode);
        setCopied(true);
        toaster.success('Промокод скопирован!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRequestPayout = () => {
        playSuccess();
        setPayoutRequested(true);
        toaster.success('Заявка на вывод отправлена!');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!stats) return null;

    const maxEarning = Math.max(...stats.monthlyEarnings.map(e => e.amount), 1);

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center justify-between px-4 h-14">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-blue-500">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-[17px] font-bold tracking-[-0.41px]">Партнёрская программа</h1>
                    <div className="w-8" />
                </div>
            </header>

            <div className="px-4 pt-6 space-y-6">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-purple-500/20 via-[#1c1c1e] to-blue-500/20 rounded-[24px] p-5 border border-purple-500/20 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -mr-10 -mt-10" />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Crown size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[18px] font-[900] text-white">Партнёр Pixel AI</h2>
                            <p className="text-[13px] text-purple-400 font-bold">{stats.commission * 100}% с каждой покупки навсегда</p>
                        </div>
                    </div>

                    {/* Promo Code */}
                    <div className="bg-[#1c1c1e] rounded-[14px] flex items-center p-1.5 pl-4 border border-white/5 relative z-10">
                        <div className="flex-1">
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Промокод</p>
                            <p className="text-[20px] font-[900] text-white tracking-widest">{stats.promoCode}</p>
                        </div>
                        <button
                            onClick={handleCopyCode}
                            className={`w-10 h-10 rounded-[10px] flex items-center justify-center transition-all ${copied ? 'bg-green-500' : 'bg-[#3390ec]'} text-white`}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="flex gap-3 flex-wrap">
                    <StatCard
                        icon={<Users size={16} className="text-white" />}
                        label="Рефералов"
                        value={stats.totalReferrals.toString()}
                        color="bg-blue-500"
                        sublabel={`${stats.activeReferrals} активных`}
                    />
                    <StatCard
                        icon={<DollarSign size={16} className="text-white" />}
                        label="Заработано"
                        value={`${stats.totalEarned.toLocaleString()} ₽`}
                        color="bg-green-500"
                    />
                </div>

                {/* Earnings Chart */}
                <div className="bg-[#1c1c1e] rounded-[20px] p-5 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                            <TrendingUp size={16} className="text-green-400" />
                            Доход по месяцам
                        </h3>
                    </div>
                    <div className="flex items-end gap-3 h-[100px]">
                        {stats.monthlyEarnings.map((m, i) => (
                            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(m.amount / maxEarning) * 80}px` }}
                                    transition={{ delay: i * 0.15, duration: 0.5 }}
                                    className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg min-h-[4px]"
                                />
                                <span className="text-[11px] text-white/40 font-medium">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payout Section */}
                <div className="bg-[#1c1c1e] rounded-[20px] p-5 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-[12px] text-white/40 uppercase tracking-widest font-bold">К выводу</p>
                            <p className="text-[28px] font-[900] text-white">{stats.pendingPayout.toLocaleString()} ₽</p>
                        </div>
                        <button
                            onClick={handleRequestPayout}
                            disabled={stats.pendingPayout < 1000 || payoutRequested}
                            className="bg-[#3390ec] text-white font-bold text-[14px] px-5 py-2.5 rounded-[12px] disabled:opacity-40 active:scale-[0.97] transition-all shadow-lg shadow-blue-500/20"
                        >
                            {payoutRequested ? 'Заявка отправлена' : 'Вывести на TBank'}
                        </button>
                    </div>
                    <p className="text-[11px] text-white/30">Минимальная сумма вывода: 1 000 ₽. Выплата в течение 3 рабочих дней.</p>
                </div>

                {/* How it works */}
                <div className="bg-[#1c1c1e] rounded-[20px] p-5 border border-white/5">
                    <h3 className="text-[15px] font-bold text-white mb-4">Как это работает</h3>
                    <div className="space-y-3">
                        {[
                            { step: '1', text: 'Поделитесь промокодом с аудиторией', icon: '📣' },
                            { step: '2', text: 'Новый пользователь вводит код при оплате', icon: '⭐' },
                            { step: '3', text: `Вы получаете ${stats.commission * 100}% с каждой покупки навсегда`, icon: '💰' },
                        ].map(s => (
                            <div key={s.step} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center text-[14px] shrink-0">
                                    {s.icon}
                                </div>
                                <p className="text-[13px] text-white/70 font-medium">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AffiliateView;
