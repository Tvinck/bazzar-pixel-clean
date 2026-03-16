import React, { useState, useEffect } from 'react';
import { ListRow } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, Zap, Globe, ShieldAlert, Check,
    User, MapPin, Briefcase, Heart, MessageCircle, Languages,
    Edit2, ChevronLeft, X, Wallet, HelpCircle, FileText, Users, Terminal,
    Gift, Crown, ArrowRight, Mail, Bell, Layers
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useSound } from '../context/SoundContext';
import AnimatedIcon from '../components/ui/AnimatedIcon';
import SEO from '../components/SEO/SEO';

// Components
import { ProfileSkeleton } from '../components/ui/Skeletons';
import GiftModal from '../components/modals/GiftModal';



const EditModal = ({ isOpen, onClose, title, value, onSave, type = 'text', options = [] }) => {
    const { t } = useLanguage();
    const [val, setVal] = useState(value || '');

    useEffect(() => {
        setVal(value || '');
    }, [value, isOpen]);

    const handleSave = () => {
        onSave(val);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-bg-secondary w-full max-w-sm rounded-card p-5 relative z-10 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-white text-[17px] tracking-[-0.41px]">{title}</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-gray-400 active:scale-95 transition-transform"><X size={18} /></button>
                </div>

                {type === 'select' ? (
                    <div className="space-y-1">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => setVal(opt)}
                                className={`w-full py-3 px-4 rounded-input text-left text-[17px] tracking-[-0.41px] transition-all flex justify-between items-center ${val === opt ? 'bg-accent-blue/10 text-accent-blue' : 'text-white hover:bg-bg-elevated'}`}
                            >
                                {opt}
                                {val === opt && <Check size={20} className="text-accent-blue" strokeWidth={2.5} />}
                            </button>
                        ))}
                    </div>
                ) : (
                    <input
                        type={type}
                        value={val}
                        onChange={e => setVal(e.target.value)}
                        className="w-full bg-bg-elevated rounded-input py-3 px-4 text-[17px] text-white placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-[#007aff] transition-shadow tracking-[-0.41px]"
                        placeholder={t('profile.enterValue') || 'Введите значение...'}
                        autoFocus
                    />
                )}

                <button
                    onClick={handleSave}
                    className="w-full mt-4 bg-accent-blue text-white font-semibold text-[17px] py-3 rounded-input active:opacity-80 transition-opacity tracking-[-0.41px]"
                >
                    {t('common.save')}
                </button>
            </motion.div>
        </div>
    );
};

const TransactionHistory = () => {
    const { t } = useLanguage();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const isDev = !window.Telegram?.WebApp?.initData;
                let data = [];
                if (isDev) {
                    data = [
                        { id: 1, type: 'topup', amount: 100, description: 'Пополнение баланса', created_at: new Date(Date.now() - 10000000).toISOString() },
                        { id: 2, type: 'generation', amount: -5, description: 'Генерация изображения', created_at: new Date(Date.now() - 5000000).toISOString() },
                        { id: 3, type: 'chat', amount: -1, description: 'Чат', created_at: new Date(Date.now() - 1000000).toISOString() }
                    ];
                } else {
                    const res = await fetch('/api/payments/transactions', {
                        headers: { 'X-TG-Data': window.Telegram?.WebApp?.initData || '' }
                    });
                    if (res.ok) {
                        const json = await res.json();
                        data = json.transactions || [];
                    }
                }
                setTransactions(data);
            } catch (e) {
                console.error('Failed to fetch transactions', e);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) return <div className="p-4 text-center text-gray-500 text-[15px] tracking-[-0.24px]">{t('common.loading')}</div>;
    if (transactions.length === 0) return <div className="p-4 text-center text-gray-500 text-[15px] tracking-[-0.24px]">{t('home.historyEmpty')}</div>;

    return (
        <div className="flex flex-col">
            {transactions.slice(0, 5).map((tx, idx) => (
                <div key={tx.id || idx} className="flex items-center justify-between py-[11px] pl-4 pr-3 relative hover:bg-bg-elevated transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-500/10' : 'bg-bg-elevated'}`}>
                            <Zap size={16} className={tx.amount > 0 ? "fill-current text-green-500" : "text-white"} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[17px] text-white tracking-[-0.41px] leading-[22px]">{tx.description || (tx.amount > 0 ? 'Пополнение' : 'Списание')}</span>
                            <span className="text-[13px] text-gray-400 tracking-[-0.08px] leading-[18px]">{new Date(tx.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                    </div>
                    <span className={`text-[17px] tracking-[-0.41px] ${tx.amount > 0 ? 'text-green-500' : 'text-white'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                    {idx !== Math.min(transactions.length, 5) - 1 && <div className="absolute bottom-0 left-[52px] right-0 h-[0.5px] bg-[#38383a]" />}
                </div>
            ))}
        </div>
    );
};

const ProfileView = ({ onOpenPayment }) => {
    const navigate = useNavigate();
    const { user, stats, isLoading, profile, refreshUser } = useUser();
    const { lang, setLang, t } = useLanguage();
    const { playClick } = useSound();

    const ADMIN_USERS = ['artykosh', 'natelinsss'];
    const ADMIN_IDS = [603207436, 500096232, 1165860888];
    const isDev = user?.telegram_id && ADMIN_IDS.includes(Number(user.telegram_id));
    const isAdmin = (user?.username && ADMIN_USERS.includes(user.username.toLowerCase())) || isDev || profile?.role === 'admin';

    const [profileData, setProfileData] = useState({
        gender: '',
        age: '',
        location: '',
        activity: '',
        interests: '',
        style: '',
        pixelLang: '',
        bio: '',
        website: '',
        isPublic: false
    });

    const displayName = user?.first_name || 'Пользователь';
    const initals = displayName.substring(0, 2).toUpperCase();

    const [editModal, setEditModal] = useState({
        isOpen: false,
        field: null,
        title: '',
        type: 'text',
        options: []
    });

    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (profile) {
                setProfileData({
                    gender: profile.gender || '',
                    age: profile.age_range || '',
                    location: profile.location || '',
                    activity: profile.occupation || '',
                    interests: Array.isArray(profile.interests) ? profile.interests.join(', ') : (profile.interests || ''),
                    style: profile.communication_style || '',
                    pixelLang: profile.language || '',
                    bio: profile.bio || '',
                    website: profile.website || '',
                    isPublic: profile.is_public_profile || false
                });
                return;
            }

            try {
                const response = await fetch('/api/user/profile', {
                    headers: { 'X-TG-Data': window.Telegram?.WebApp?.initData || '' }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.profile) {
                        setProfileData({
                            gender: data.profile.gender || '',
                            age: data.profile.age_range || '',
                            location: data.profile.location || '',
                            activity: data.profile.occupation || '',
                            interests: (data.profile.interests || []).join(', '),
                            style: data.profile.communication_style || '',
                            pixelLang: data.profile.language || ''
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
                try {
                    const saved = JSON.parse(localStorage.getItem('pixel_profile_data') || '{}');
                    setProfileData(prev => ({ ...prev, ...saved }));
                } catch { }
            }
        };
        loadProfile();
    }, [user, profile]);

    const handleSaveField = async (value) => {
        const field = editModal.field;
        const newData = { ...profileData, [field]: value };
        setProfileData(newData);
        localStorage.setItem('pixel_profile_data', JSON.stringify(newData));

        try {
            const apiData = {
                gender: newData.gender === 'Мужской' ? 'male' : newData.gender === 'Женский' ? 'female' : newData.gender,
                age_range: newData.age,
                location: newData.location,
                occupation: newData.activity,
                interests: newData.interests ? newData.interests.split(',').map(i => i.trim()) : [],
                communication_style: newData.style === 'Дружелюбный' ? 'friendly' : newData.style === 'Официальный' ? 'formal' : newData.style === 'Саркастичный' ? 'playful' : newData.style,
                language: newData.pixelLang === 'Русский' ? 'ru' : newData.pixelLang === 'English' ? 'en' : 'ru',
                bio: newData.bio,
                website: newData.website,
                is_public_profile: newData.isPublic
            };

            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': window.Telegram?.WebApp?.initData || ''
                },
                body: JSON.stringify(apiData)
            });
            refreshUser();
        } catch (err) {
            console.warn('Failed to sync profile to API', err);
        }
    };

    const openEdit = (field, title, type = 'text', options = []) => {
        playClick();
        setEditModal({ isOpen: true, field, title, type, options });
    };

    const filledCount = Object.values(profileData).filter(v => v && v.toString().length > 0).length + 1;
    const totalFields = 8;
    const progressPercent = Math.round((filledCount / totalFields) * 100);

    if (isLoading) return <ProfileSkeleton />;

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24 pt-4 px-4 overflow-y-auto w-full md:max-w-2xl md:mx-auto md:px-6">
            <SEO 
                title="Профиль — Bazzar Pixel"
                description="Настройки аккаунта, баланс зарядов и управление подпиской"
            />

            {/* Header Settings Style */}
            <div className="flex flex-col items-center mb-6">
                <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-[#3390ec] to-blue-600 flex items-center justify-center text-[40px] font-bold text-white shadow-xl border-2 border-transparent relative mt-2">
                    {initals}
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-bg-secondary border-2 border-black flex items-center justify-center text-white active:bg-bg-elevated">
                        <Edit2 size={14} />
                    </button>
                </div>
                <h1 className="text-[28px] font-bold mt-3 tracking-[-0.6px]">{displayName}</h1>
                <p className="text-[17px] text-accent-blue tracking-[-0.41px] mt-0.5 font-medium cursor-pointer active:opacity-70">
                    {t('profile.editProfile')}
                </p>
            </div>

            <div className="space-y-6">

                {/* 1. Wallet & App Info */}
                <ListBlock>
                    <ListRow
                        icon={<Wallet size={16} className="text-white" />}
                        iconColor="bg-orange-500"
                        label={t('profile.walletTokens')}
                        value={stats?.current_balance || 0}
                        onClick={() => { playClick(); onOpenPayment(); }}
                    />
                    <ListRow
                        icon={<Gift size={16} className="text-white" />}
                        iconColor="bg-pink-500"
                        label="Подарить ⚡"
                        value="Отправить"
                        onClick={() => { playClick(); setIsGiftModalOpen(true); }}
                    />
                    <ListRow
                        icon={<Globe size={16} className="text-white" />}
                        iconColor="bg-indigo-500"
                        label={t('profile.interfaceLang')}
                        value={lang === 'ru' ? 'Русский' : 'English'}
                        onClick={() => {
                            playClick();
                            setLang(lang === 'ru' ? 'en' : 'ru');
                        }}
                        isLast
                    />
                </ListBlock>

                {/* Subscription Rollover Status */}
                {user?.subscription && (
                    <div className="bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] rounded-card p-4 border border-purple-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-accent-purple/10 rounded-full blur-[30px] -mr-6 -mt-6" />
                        <div className="flex items-center gap-3 mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <Crown size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-[15px] font-bold text-white">Pixel PRO</h4>
                                    <span className="bg-accent-purple/20 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Активна</span>
                                </div>
                                <p className="text-[12px] text-white/40">Следующее списание: 10 апр</p>
                            </div>
                        </div>
                        <div className="bg-bg-secondary rounded-input p-3 relative z-10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[12px] text-white/50 font-medium">Остаток зарядов</span>
                                <span className="text-[14px] font-bold text-white">{stats?.current_balance || 0} / 1500 ⚡</span>
                            </div>
                            <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, ((stats?.current_balance || 0) / 1500) * 100)}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-purple-400 mt-2 flex items-center gap-1">
                                <Zap size={10} fill="currentColor" /> Перенос до 30% остатка на след. месяц
                            </p>
                        </div>
                    </div>
                )}

                {isAdmin && (
                    <ListBlock>
                        <ListRow
                            icon={<ShieldAlert size={16} className="text-white" />}
                            iconColor="bg-red-500"
                            label={t('profile.adminPanel')}
                            subtext={t('profile.adminPanelDesc')}
                            onClick={() => navigate('/admin')}
                            isLast
                        />
                    </ListBlock>
                )}

                {/* 2. Info details block */}
                <div>
                    <p className="text-[13px] text-gray-400 font-medium uppercase tracking-wider mb-2 ml-4">{t('profile.personalData')}</p>
                    <ListBlock>
                        <ListRow label={t('profile.name')} value={displayName} />
                        <ListRow label={t('profile.gender')} value={profileData.gender || t('profile.notSpecified')} onClick={() => openEdit('gender', t('profile.gender'), 'select', ['Мужской', 'Женский'])} />
                        <ListRow label={t('profile.age')} value={profileData.age || t('profile.notSpecified')} onClick={() => openEdit('age', t('profile.age'), 'number')} />
                        <ListRow label={t('profile.location')} value={profileData.location || t('profile.setCity')} onClick={() => openEdit('location', t('profile.location'))} />
                        <ListRow label={t('profile.activity')} value={profileData.activity || t('profile.setActivity')} onClick={() => openEdit('activity', t('profile.activity'))} />
                        <ListRow label={t('profile.interests')} value={profileData.interests || t('profile.setInterests')} onClick={() => openEdit('interests', t('profile.interests'))} isLast />
                    </ListBlock>
                    {progressPercent < 100 && (
                        <p className="text-[13px] text-gray-500 leading-tight mt-2 ml-4 tracking-[-0.08px]">
                            {t('profile.profileProgress').replace('{percent}', progressPercent.toString())}
                        </p>
                    )}
                </div>

                {/* 3. Pixel Style */}
                <div>
                    <p className="text-[13px] text-gray-400 font-medium uppercase tracking-wider mb-2 ml-4">{t('profile.pixelSettings')}</p>
                    <ListBlock>
                        <ListRow
                            icon={<MessageCircle size={16} className="text-white" />}
                            iconColor="bg-pink-500"
                            label={t('profile.communicationStyle')}
                            value={profileData.style || t('profile.notSpecified')}
                            onClick={() => openEdit('style', t('profile.communicationStyle'), 'select', ['Дружелюбный', 'Официальный', 'Саркастичный', 'Милый'])}
                        />
                        <ListRow
                            icon={<Languages size={16} className="text-white" />}
                            iconColor="bg-teal-500"
                            label={t('profile.responseLang')}
                            value={profileData.pixelLang || 'Русский'}
                            onClick={() => openEdit('pixelLang', t('profile.responseLang'), 'select', ['Русский', 'English', 'Español'])}
                            isLast
                        />
                    </ListBlock>
                </div>

                {/* 4. Social & Privacy */}
                <div>
                    <p className="text-[13px] text-gray-400 font-medium uppercase tracking-wider mb-2 ml-4">{t('profile.socialPrivacy')}</p>
                    <ListBlock>
                        <ListRow
                            icon={<Layers size={16} className="text-white" />}
                            iconColor="bg-amber-500"
                            label="Коллекции"
                            value="Управление"
                            onClick={() => navigate('/collections')}
                        />
                        <ListRow
                            icon={<Users size={16} className="text-white" />}
                            iconColor="bg-blue-600"
                            label={t('profile.referralDash')}
                            value={t('profile.bonuses')}
                            onClick={() => navigate('/referrals')}
                        />
                        <ListRow
                            icon={<Crown size={16} className="text-white" />}
                            iconColor="bg-accent-purple"
                            label="Партнёрская программа"
                            value="15% комиссия"
                            onClick={() => navigate('/affiliate')}
                        />
                        <ListRow
                            icon={<User size={16} className="text-white" />}
                            iconColor="bg-blue-500"
                            label={t('profile.publicProfile')}
                            value={profileData.isPublic ? t('profile.on') : t('profile.off')}
                            onClick={() => handleSaveField(!profileData.isPublic).then(() => setProfileData(p => ({ ...p, isPublic: !p.isPublic })))}
                        />
                        <ListRow
                            icon={<Edit2 size={16} className="text-white" />}
                            iconColor="bg-accent-purple"
                            label={t('profile.bio')}
                            value={profileData.bio || t('profile.notSpecified')}
                            onClick={() => openEdit('bio', t('profile.bio'))}
                        />
                        <ListRow
                            icon={<Terminal size={16} className="text-white" />}
                            iconColor="bg-gray-700"
                            label="Developer API"
                            value={t('profile.manageKeys') || 'Управление'}
                            onClick={() => navigate('/developer')}
                            isLast
                        />
                    </ListBlock>
                    <p className="text-[12px] text-gray-500 mt-2 ml-4 px-2">
                        {t('profile.privacyTip')}
                    </p>
                </div>

                {/* 5. Transactions */}
                <div>
                    <p className="text-[13px] text-gray-400 font-medium uppercase tracking-wider mb-2 ml-4">{t('profile.recentTransactions')}</p>
                    <ListBlock>
                        <TransactionHistory />
                    </ListBlock>
                </div>

                {/* 6. Email for Reactivation */}
                <div>
                    <p className="text-[13px] text-gray-400 font-medium uppercase tracking-wider mb-2 ml-4">Уведомления</p>
                    <ListBlock>
                        <ListRow
                            icon={<Mail size={16} className="text-white" />}
                            iconColor="bg-orange-500"
                            label="Email"
                            value={profileData.email || 'Добавить'}
                            onClick={() => openEdit('email', 'Email для уведомлений')}
                        />
                        <ListRow
                            icon={<Bell size={16} className="text-white" />}
                            iconColor="bg-green-500"
                            label="Новые функции и модели"
                            value={profileData.emailNotifications ? 'Вкл' : 'Выкл'}
                            onClick={() => {
                                playClick();
                                setProfileData(p => ({ ...p, emailNotifications: !p.emailNotifications }));
                            }}
                            isLast
                        />
                    </ListBlock>
                    <p className="text-[12px] text-gray-500 mt-2 ml-4 px-2">
                        Мы отправим письмо только когда появится что-то новое и крутое ✨
                    </p>
                </div>

                {/* 5. Extra */}
                <ListBlock>
                    <ListRow
                        icon={<HelpCircle size={16} className="text-white" />}
                        iconColor="bg-blue-500/50"
                        label={t('profile.support')}
                        onClick={() => window.open('https://t.me/ArtyKosh', '_blank')}
                    />
                    <ListRow
                        icon={<FileText size={16} className="text-white" />}
                        iconColor="bg-gray-500"
                        label={t('profile.about')}
                        onClick={() => navigate('/guide')}
                        isLast
                    />
                </ListBlock>

            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editModal.isOpen && (
                    <EditModal
                        isOpen={editModal.isOpen}
                        onClose={() => setEditModal({ ...editModal, isOpen: false })}
                        title={editModal.title}
                        value={profileData[editModal.field]}
                        type={editModal.type}
                        options={editModal.options}
                        onSave={handleSaveField}
                    />
                )}
            </AnimatePresence>

            {/* Gift Modal */}
            <GiftModal
                isOpen={isGiftModalOpen}
                onClose={() => setIsGiftModalOpen(false)}
                currentBalance={stats?.current_balance || 0}
                onGiftSuccess={() => {
                    // Temporarily subtract from local balance 
                    if (stats && typeof refreshUser === 'function') {
                        refreshUser();
                    }
                }}
            />
        </div>
    );
};

export default ProfileView;

