import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users, Gift, Copy, Share2,
    Award, TrendingUp,
    ChevronLeft, Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useSound } from '../context/SoundContext';

interface BlockProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

// iOS-style Block
const Block = ({ children, className = '', title }: BlockProps) => (
    <div className="mb-6">
        {title && <p className="text-[13px] text-gray-400 font-medium uppercase tracking-wider mb-2 ml-4">{title}</p>}
        <div className={`bg-[#1c1c1e] rounded-[14px] overflow-hidden ${className}`}>
            {children}
        </div>
    </div>
);

interface ReferralStats {
    total_invites: number;
    active_referrals: number;
    total_earned: number;
    current_tier: number;
    reward_per_invite: number;
}

interface ReferralInfo {
    name: string;
    username: string | null;
    date: string;
}

const ReferralDashView = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user } = useUser();
    const toaster = useToast();
    const { playClick } = useSound();

    // @ts-ignore
    const tg = window.Telegram?.WebApp;

    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [referrals, setReferrals] = useState<ReferralInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const botUsername = 'bazzar_pixel_bot';
    const referralLink = `https://t.me/${botUsername}/app?startapp=r-${user?.telegram_id}`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = { 'X-TG-Data': tg?.initData || '' };
                const [statsRes, listRes] = await Promise.all([
                    fetch('/api/user/referrals/stats', { headers }),
                    fetch('/api/user/referrals/list', { headers })
                ]);

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
                if (listRes.ok) {
                    const listData = await listRes.json();
                    setReferrals(listData.referrals || []);
                }
            } catch (e) {
                console.error('Failed to fetch referral data', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tg]);

    const copyLink = () => {
        playClick();
        navigator.clipboard.writeText(referralLink);
        // @ts-ignore
        toaster.show?.(t('common.copied') || 'Скопировано!');
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
    };

    const shareLink = () => {
        playClick();
        const text = encodeURIComponent(`🎨 Создавай шедевры с помощью ИИ в Bazzar Pixel! Получи бонус по моей ссылке:`);
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`);
    };

    const tiers = [
        { level: 1, limit: 5, reward: 10, label: 'Новичок' },
        { level: 2, limit: 15, reward: 15, label: 'Партнер' },
        { level: 3, limit: 50, reward: 20, label: 'Амбассадор' },
        { level: 4, limit: 999, reward: 25, label: 'Легенда' }
    ];

    const currentTier = stats?.current_tier || 1;
    const nextTier = tiers.find(tier => tier.level === currentTier + 1) || tiers[tiers.length - 1];
    const progress = stats ? Math.min(100, (stats.total_invites / nextTier.limit) * 100) : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24 pt-4 px-4 overflow-y-auto w-full md:max-w-3xl md:mx-auto md:px-6">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white active:bg-[#2c2c2e] mr-3"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-[24px] font-bold tracking-[-0.6px]">Referral Dash</h1>
            </div>

            {/* Referral Link Card */}
            <Block className="p-5 bg-gradient-to-br from-[#007aff] to-[#0051af]" title="">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Share2 size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[17px] leading-tight">Ваша ссылка</h3>
                        <p className="text-[13px] text-white/70">Приглашайте друзей и зарабатывайте</p>
                    </div>
                </div>

                <div className="bg-black/20 rounded-xl p-3 mb-4 flex items-center justify-between border border-white/10">
                    <span className="text-[14px] font-mono text-white/90 truncate mr-2">
                        {referralLink.replace('https://', '')}
                    </span>
                    <button onClick={copyLink} className="p-2 bg-white/10 rounded-lg active:scale-90 transition-transform">
                        <Copy size={18} />
                    </button>
                </div>

                <button
                    onClick={shareLink}
                    className="w-full py-3.5 bg-white text-[#007aff] font-bold rounded-xl active:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    <Share2 size={18} />
                    Отправить друзьям
                </button>
            </Block>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#1c1c1e] rounded-[14px] p-4 border border-[#2c2c2e]">
                    <div className="text-blue-500 mb-1"><Users size={20} /></div>
                    <div className="text-[24px] font-bold">{stats?.total_invites || 0}</div>
                    <div className="text-[13px] text-gray-400">Приглашено</div>
                </div>
                <div className="bg-[#1c1c1e] rounded-[14px] p-4 border border-[#2c2c2e]">
                    <div className="text-green-500 mb-1"><TrendingUp size={20} /></div>
                    <div className="text-[24px] font-bold">{stats?.active_referrals || 0}</div>
                    <div className="text-[13px] text-gray-400">Активных</div>
                </div>
                <div className="bg-[#1c1c1e] rounded-[14px] p-4 border border-[#2c2c2e] col-span-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-orange-500 mb-1"><Gift size={20} /></div>
                            <div className="text-[24px] font-bold">{stats?.total_earned || 0} ⚡</div>
                            <div className="text-[13px] text-gray-400">Всего заработано</div>
                        </div>
                        <div className="text-right">
                            <div className="text-blue-400 mb-1 font-medium">{stats?.reward_per_invite || 10} ⚡</div>
                            <div className="text-[13px] text-gray-400">За каждого друга</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progressive Scale */}
            <Block title="Прогрессивная шкала">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[15px] font-medium text-white">Уровень {currentTier}: {tiers[currentTier - 1].label}</span>
                        <span className="text-[13px] text-gray-400">{stats?.total_invites || 0} / {nextTier.limit}</span>
                    </div>
                    <div className="w-full h-2 bg-[#2c2c2e] rounded-full overflow-hidden mb-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-blue-500"
                        />
                    </div>

                    <div className="space-y-3 mt-4">
                        {tiers.map((tier, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${currentTier === tier.level ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-black/20'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentTier >= tier.level ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                                        {currentTier > tier.level ? <Award size={16} /> : tier.level}
                                    </div>
                                    <div>
                                        <div className={`text-[15px] font-bold ${currentTier >= tier.level ? 'text-white' : 'text-gray-500'}`}>{tier.label}</div>
                                        <div className="text-[12px] text-gray-500">{tier.reward} ⚡ за приглашение</div>
                                    </div>
                                </div>
                                <div className="text-[13px] text-gray-400">
                                    {tier.limit > 900 ? '50+' : `${tier.limit} приглашений`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Block>

            {/* Recent Invitations */}
            <Block title="Последние приглашения">
                {referrals.length > 0 ? (
                    <div className="divide-y divide-[#2c2c2e]">
                        {referrals.map((ref, idx) => (
                            <div key={idx} className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center text-[14px]">👤</div>
                                    <div>
                                        <div className="text-[15px] font-medium">{ref.name}</div>
                                        {ref.username && <div className="text-[12px] text-gray-500">@{ref.username}</div>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[12px] text-gray-500">{new Date(ref.date).toLocaleDateString('ru-RU')}</div>
                                    <div className="text-[13px] text-green-500 font-medium">+ бонус</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <Info size={32} className="mx-auto mb-2 opacity-20" />
                        <p>У вас пока нет приглашенных друзей</p>
                    </div>
                )}
            </Block>

            <p className="text-[12px] text-gray-500 px-4 text-center mt-4">
                Бонус начисляется в момент первого входа друга в приложение по вашей ссылке.
                Активным считается пользователь, создавший хотя бы одну работу.
            </p>
        </div>
    );
};

export default ReferralDashView;
