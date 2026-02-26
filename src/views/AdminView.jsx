import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import {
    Plus, Trash2, ShieldAlert, Zap, Globe, Image as ImageIcon, Video,
    X, Users, Coins, Search, Edit2, Save, RefreshCw, BarChart3,
    Layout, Settings as SettingsIcon, ChevronRight, Play, MoreHorizontal, Upload, Loader2,
    MessageSquare, Send, PartyPopper
} from 'lucide-react';
import { motion } from 'framer-motion'; // Keep for list, remove AnimatePresence
import { useToast } from '../context/ToastContext';
import { templatesData } from '../data/templates';
import { KIE_MODELS_FLAT } from '../kie-models';

const AdminView = () => {
    const { user, profile } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('templates');

    const toast = useToast();
    const [stats, setStats] = useState({ users: 0, models: 0, templates: 0, gens24h: 0 });
    const [recentGenerations, setRecentGenerations] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [models, setModels] = useState([]);
    const [users, setUsers] = useState([]);
    const [stars, setStars] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit State
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [editingStar, setEditingStar] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [newBalance, setNewBalance] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);

    // Messaging state
    const [isBroadcastMode, setIsBroadcastMode] = useState(false);
    const [selectedUserForMessage, setSelectedUserForMessage] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState('image');
    const [isSending, setIsSending] = useState(false);
    // ... (rest of state)

    useEffect(() => {
        if (user) {
            const ADMIN_IDS = [603207436, 500096232, 1165860888, 1040481322];
            const ADMIN_USERS = ['artykosh', 'natelinsss'];
            const isDev = ADMIN_IDS.includes(user.telegram_id) || ADMIN_IDS.includes(Number(user.telegram_id));
            const isAdminUser = user?.username && ADMIN_USERS.includes(user.username.toLowerCase());
            const hasRole = profile?.role === 'admin' || user?.is_admin === true;

            if (isDev || isAdminUser || hasRole) {
                setIsAdmin(true);
                fetchData();
            } else {
                setIsAdmin(false);
            }
        }
    }, [profile, user]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 2) {
                searchUsers(searchQuery);
            } else if (searchQuery.length === 0 && users.length < 100) {
                // If search cleared and we have a filtered list (less than typical limit or generic check), reload defaults
                fetchData();
            }
        }, 600);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const searchUsers = async (query) => {
        // setIsLoading(true); // Optional: depends if we want full screen loader
        try {
            let queryBuilder = supabase.from('users').select('*, user_stats(*)');

            // Check if UUID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);

            if (isUuid) {
                queryBuilder = queryBuilder.eq('id', query);
            } else {
                queryBuilder = queryBuilder.or(`username.ilike.%${query}%,first_name.ilike.%${query}%`).limit(50);
            }

            const { data, error } = await queryBuilder;

            if (error) throw error;

            if (data) {
                const processedUsers = data.map(u => ({
                    ...u,
                    balance: u.user_stats?.[0]?.current_balance ?? u.balance ?? 0,
                    total_gens: u.user_stats?.[0]?.total_generations ?? 0
                }));
                setUsers(processedUsers);
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Ошибка поиска');
        }
        // setIsLoading(false);
    };

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const pTemplates = supabase.from('templates').select('*').order('sort_order', { ascending: true });
            const pModels = supabase.from('ai_models').select('*').order('cost', { ascending: true });
            // Load default users list (latest)
            const pUsers = supabase.from('users').select('*, user_stats(*)').order('created_at', { ascending: false }).limit(100);
            const pGens = supabase.from('creations').select('*, user:users(username, avatar_url)').order('created_at', { ascending: false }).limit(50);
            const pCountUsers = supabase.from('users').select('id', { count: 'exact', head: true });
            const pCategories = supabase.from('template_categories').select('*').order('sort_order', { ascending: true });
            const pStars = supabase.from('stars').select('*').order('sort_order', { ascending: true });

            const [tRes, mRes, uRes, gRes, cUserRes, catRes, sRes] = await Promise.all([
                pTemplates, pModels, pUsers, pGens, pCountUsers, pCategories, pStars
            ]);

            if (catRes.data && catRes.data.length > 0) {
                setCategories(catRes.data);
            } else {
                setCategories([
                    { slug: 'trends', label: 'Тренды' },
                    { slug: 'dances', label: 'Танцы' },
                    { slug: 'photo', label: 'Фото' },
                    { slug: 'video', label: 'Видео' },
                    { slug: 'pets', label: 'Питомцы' },
                    { slug: 'cars', label: 'Авто' },
                    { slug: 'winter', label: 'Зима' },
                    { slug: 'effects', label: 'Эффекты' }
                ]);
            }

            if (tRes.data && tRes.data.length > 0) {
                const dbIds = new Set(tRes.data.map(t => t.id));
                const localToAdd = templatesData.filter(t => !dbIds.has(t.id)).map(t => ({
                    ...t,
                    media_type: t.mediaType || t.media_type || 'image',
                    is_local: true,
                    is_active: true
                }));
                const combined = [...tRes.data, ...localToAdd].sort((a, b) => (
                    (a.sort_order !== null ? a.sort_order : 999) - (b.sort_order !== null ? b.sort_order : 999)
                ));
                setTemplates(combined);
            } else {
                setTemplates(templatesData.map(t => ({
                    ...t,
                    media_type: t.mediaType || t.media_type || 'image',
                    is_local: true,
                    is_active: true
                })));
            }

            if (mRes.data) setModels(mRes.data);
            if (sRes.data) setStars(sRes.data);

            if (uRes.data) {
                const processedUsers = uRes.data.map(u => ({
                    ...u,
                    balance: u.user_stats?.[0]?.current_balance ?? u.balance ?? 0,
                    total_gens: u.user_stats?.[0]?.total_generations ?? 0
                }));
                setUsers(processedUsers);
            }

            if (gRes.data) setRecentGenerations(gRes.data);

            setStats({
                users: cUserRes.count || 0,
                models: mRes.data?.length || 0,
                templates: tRes.data?.length || 0,
                gens24h: gRes.data?.length || 0
            });
        } catch (err) {
            console.error('Admin Data Error:', err);
            toast.error('Ошибка загрузки данных');
            setTemplates(templatesData.map(t => ({
                ...t,
                media_type: t.mediaType || t.media_type || 'image',
                is_local: true,
                is_active: true
            })));
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;
            let bucketName = 'templates';

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) {
                console.warn('Templates bucket failed, trying public...', uploadError);
                bucketName = 'public';
                const { error: error2 } = await supabase.storage.from(bucketName).upload(filePath, file);
                if (error2) throw error2;
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            setEditingTemplate(prev => ({
                ...prev,
                src: publicUrl,
                media_type: file.type.startsWith('video/') ? 'video' : 'image'
            }));

            toast.success('Файл загружен!');
        } catch (error) {
            toast.error('Ошибка загрузки: ' + error.message);
            console.error('Upload Error', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleStarFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `star_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;
            const bucketName = 'uploads';

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            setEditingStar(prev => ({
                ...prev,
                image_url: publicUrl
            }));

            toast.success('Фото загружено!');
        } catch (error) {
            toast.error('Ошибка загрузки: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveTemplate = async (tpl) => {
        const payload = {
            id: tpl.id.startsWith('new_') ? crypto.randomUUID() : tpl.id,
            title: tpl.title,
            description: tpl.description,
            src: tpl.src,
            prompt: tpl.prompt || '',
            generation_prompt: tpl.generation_prompt,
            model_id: tpl.model_id,
            category: tpl.category,
            sort_order: parseInt(tpl.sort_order || 0),
            is_active: tpl.is_active !== false,
            media_type: tpl.media_type || 'image',
            required_files_count: parseInt(tpl.required_files_count || 1)
        };

        const cleanPayload = { ...payload };
        // If the ID was manually created on client (UUID), we send it.
        // It's safe to send ID for Insert in most PG configs if unqiue

        try {
            const { error } = await supabase.from('templates').upsert(cleanPayload);
            if (error) throw error;
            toast.success('Сохранено в базу данных');
            setEditingTemplate(null);
            fetchData();
        } catch (e) {
            toast.error('Ошибка: ' + e.message);
        }
    };

    const handleDeleteTemplate = async (id) => {
        if (!confirm('Удалить?')) return;
        try {
            const { error } = await supabase.from('templates').delete().eq('id', id);
            if (error) throw error;
            toast.success('Удалено');
            fetchData();
            setEditingTemplate(null);
        } catch (e) {
            toast.error('Ошибка удаления');
        }
    };

    const handleUpdateModel = async (id, changes) => {
        try {
            const { error } = await supabase.from('ai_models').update(changes).eq('id', id);
            if (error) throw error;
            toast.success('Обновлено');
            fetchData();
        } catch (e) {
            toast.error('Ошибка');
        }
    };

    const handleSendMessage = async () => {
        if (!messageText && !mediaUrl) return toast.error('Введите текст или добавьте медиа');
        if (!selectedUserForMessage && !isBroadcastMode) return toast.error('Выберите пользователя');

        if (isBroadcastMode && !confirm('⚠️ Вы уверены, что хотите отправить это ВСЕМ пользователям?')) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/admin/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-id': user.id
                },
                body: JSON.stringify({
                    userId: isBroadcastMode ? null : selectedUserForMessage.id,
                    message: messageText,
                    mediaUrl,
                    mediaType,
                    isBroadcast: isBroadcastMode
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(isBroadcastMode ? `Отправлено ${data.count} пользователям` : 'Сообщение отправлено');
                setMessageText('');
                setMediaUrl('');
                setMediaType('image');
            } else {
                throw new Error(data.error);
            }
        } catch (e) {
            toast.error('Ошибка отправки: ' + e.message);
        } finally {
            setIsSending(false);
        }
    };

    const handleUpdateBalance = async (userId, balance) => {
        const val = parseInt(balance);
        if (isNaN(val)) return;

        try {
            const { error } = await supabase.from('user_stats').update({ current_balance: val }).eq('user_id', userId);
            if (error) {
                const { error: e2 } = await supabase.from('users').update({ balance: val }).eq('id', userId);
                if (e2) throw e2;
            }
            toast.success('Баланс обновлен!');
            setEditingUser(null);
            fetchData();
        } catch (e) {
            toast.error('Ошибка: ' + e.message);
        }
    };

    const handleAddCategory = async (slug, label) => {
        try {
            const { error } = await supabase.from('template_categories').insert({ slug, label, sort_order: categories.length + 10 });
            if (error) throw error;
            toast.success('Категория добавлена!');
            fetchData();
            setEditingTemplate(prev => ({ ...prev, category: slug }));
        } catch (e) {
            toast.error('Ошибка добавления категории: ' + e.message);
        }
    };

    const handleSaveStar = async (star) => {
        try {
            const payload = {
                name: star.name,
                slug: star.slug,
                description: star.description,
                image_url: star.image_url,
                preview_video_url: star.preview_video_url,
                sort_order: parseInt(star.sort_order || 0),
                is_active: star.is_active !== false
            };

            let res;
            if (star.id && !star.id.startsWith('new_')) {
                res = await fetch(`/api/admin/stars/${star.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('/api/admin/stars', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            const data = await res.json();
            if (!data.success && !data.id) throw new Error(data.error || 'Failed to save');

            toast.success('Звезда сохранена!');
            setEditingStar(null);
            fetchData();
        } catch (e) {
            console.error(e);
            toast.error('Ошибка сохранения: ' + e.message);
        }
    };

    const handleDeleteStar = async (id) => {
        if (!confirm('Удалить звезду?')) return;
        try {
            const res = await fetch(`/api/admin/stars/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Звезда удалена');
            fetchData();
        } catch (e) {
            toast.error('Ошибка удаления: ' + e.message);
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#1c1c1e] flex flex-col items-center justify-center text-gray-500">
                <ShieldAlert size={48} className="mb-4 text-red-500" />
                <h2 className="text-xl font-bold">Доступ ограничен</h2>
            </div>
        );
    }

    const filteredUsers = users.filter(u =>
        (u.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.includes(searchQuery)
    );

    const visibleTemplates = templates.filter(t =>
        (selectedCategoryFilter === 'all' || t.category === selectedCategoryFilter) &&
        ((t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.id || '').includes(searchQuery))
    );

    return (
        <div className="min-h-screen bg-[#1c1c1e] text-white font-sans pb-32 md:max-w-5xl md:mx-auto md:px-6">
            <div className="sticky top-0 z-40 bg-[#1c1c1e]/90 backdrop-blur-md border-b border-white/5 px-4 pt-12 pb-3">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold tracking-tight">Pixel Admin</h1>
                    <button
                        onClick={fetchData}
                        className={`p-2 bg-[#2c2c2e] rounded-full text-white/50 hover:text-white ${isRefreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                        { id: 'templates', label: 'Шаблоны', icon: Layout },
                        { id: 'greetings', label: 'Поздравления', icon: PartyPopper },
                        { id: 'monitoring', label: 'Эфир', icon: Video },
                        { id: 'users', label: 'Люди', icon: Users },
                        { id: 'messages', label: 'Рассылка', icon: MessageSquare },
                        { id: 'models', label: 'Models', icon: Zap },
                        { id: 'dashboard', label: 'Статистика', icon: BarChart3 },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-[#007aff] text-white shadow-lg shadow-blue-500/20'
                                : 'bg-[#2c2c2e] text-gray-400 hover:text-white'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 pt-6 space-y-6">

                {activeTab === 'templates' && (
                    <div className="space-y-4">
                        <div className="flex gap-2 mb-4">
                            <input
                                className="flex-1 bg-[#2c2c2e] border-none rounded-[14px] px-4 py-3 text-[15px] outline-none placeholder:text-gray-600"
                                placeholder="Поиск по названию..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <button
                                onClick={() => setEditingTemplate({
                                    id: `new_${Date.now()}`,
                                    sort_order: templates.length + 1,
                                    is_active: true,
                                    category: 'trends',
                                    media_type: 'image'
                                })}
                                className="bg-[#007aff] px-4 rounded-[14px] flex items-center justify-center text-white shadow-lg gap-2 active:scale-95 transition-transform cursor-pointer hover:bg-blue-600"
                            >
                                <Plus size={20} />
                                <span className="text-[13px] font-bold hidden sm:inline">Добавить</span>
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-2">
                            <button
                                onClick={() => setSelectedCategoryFilter('all')}
                                className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${selectedCategoryFilter === 'all' ? 'bg-white text-black' : 'bg-[#2c2c2e] text-white/70 hover:text-white'}`}
                            >
                                Все
                            </button>
                            {categories.map(c => (
                                <button
                                    key={c.slug}
                                    onClick={() => setSelectedCategoryFilter(c.slug)}
                                    className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${selectedCategoryFilter === c.slug ? 'bg-white text-black' : 'bg-[#2c2c2e] text-white/70 hover:text-white'}`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {visibleTemplates.map((t) => (
                                <div
                                    key={t.id}
                                    onClick={() => setEditingTemplate(t)}
                                    className="bg-[#2c2c2e] rounded-[16px] overflow-hidden relative cursor-pointer active:scale-95 transition-transform border border-white/5 group"
                                >
                                    <div className="aspect-[9/16] bg-black/50 relative">
                                        {t.src && (t.media_type === 'video' ? (
                                            <video src={`${t.src}#t=0.0,0.1`} className="w-full h-full object-cover" muted preload="metadata" />
                                        ) : (
                                            <img src={t.src} className="w-full h-full object-cover" loading="lazy" />
                                        ))}
                                        {!t.is_active && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <ShieldAlert className="text-red-500" />
                                            </div>
                                        )}
                                        {t.is_local && (
                                            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#007aff] rounded text-[9px] font-bold shadow-lg">
                                                LOCAL
                                            </div>
                                        )}
                                        {/* Edit Overlay Hint */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Edit2 className="text-white bg-black/50 p-2 rounded-full backdrop-blur-md" size={24} />
                                        </div>

                                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                            <p className="text-[12px] font-bold leading-tight line-clamp-2">{t.title}</p>
                                            <p className="text-[10px] text-white/50">{t.model_id}</p>
                                        </div>
                                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded text-[9px] font-mono">
                                            {t.sort_order}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- GREETINGS --- */}
                {activeTab === 'greetings' && (
                    <div className="space-y-4">
                        <div className="flex gap-2 mb-4">
                            <input
                                className="flex-1 bg-[#2c2c2e] border-none rounded-[14px] px-4 py-3 text-[15px] outline-none placeholder:text-gray-600"
                                placeholder="Поиск звезд..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <button
                                onClick={() => setEditingStar({
                                    id: `new_${Date.now()}`,
                                    sort_order: stars.length + 1,
                                    is_active: true
                                })}
                                className="bg-[#007aff] px-4 rounded-[14px] flex items-center justify-center text-white shadow-lg gap-2 active:scale-95 transition-transform cursor-pointer hover:bg-blue-600"
                            >
                                <Plus size={20} />
                                <span className="text-[13px] font-bold hidden sm:inline">Добавить</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {stars.filter(s => (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())).map((s) => (
                                <div
                                    key={s.id}
                                    onClick={() => setEditingStar(s)}
                                    className="bg-[#2c2c2e] rounded-[16px] overflow-hidden relative cursor-pointer active:scale-95 transition-transform border border-white/5 group"
                                >
                                    <div className="aspect-[3/4] bg-black/50 relative">
                                        {s.image_url ? (
                                            <img src={s.image_url} className="w-full h-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                <ImageIcon size={32} />
                                            </div>
                                        )}
                                        {!s.is_active && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <ShieldAlert className="text-red-500" />
                                            </div>
                                        )}

                                        {/* Edit Overlay Hint */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Edit2 className="text-white bg-black/50 p-2 rounded-full backdrop-blur-md" size={24} />
                                        </div>

                                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                            <p className="text-[12px] font-bold leading-tight line-clamp-2">{s.name}</p>
                                            <p className="text-[10px] text-white/50">{s.description}</p>
                                        </div>
                                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded text-[9px] font-mono">
                                            {s.sort_order}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- MONITORING and other tabs same ... --- */}
                {activeTab === 'monitoring' && (
                    <div className="grid grid-cols-2 gap-3">
                        {recentGenerations.map((gen, i) => (
                            <div key={gen.id} className="relative aspect-[3/4] bg-[#2c2c2e] rounded-[16px] overflow-hidden border border-white/5">
                                {gen.type === 'video' ? (
                                    <video src={gen.result_url || gen.image_url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                                ) : (
                                    <img src={gen.result_url || gen.image_url} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute bottom-0 w-full p-2 bg-gradient-to-t from-black/90 to-transparent">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-white/20 overflow-hidden">
                                            {gen.user?.avatar_url && <img src={gen.user.avatar_url} className="w-full h-full object-cover" />}
                                        </div>
                                        <span className="text-[10px] truncate opacity-70">@{gen.user?.username}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- MESSAGING --- */}
                {activeTab === 'messages' && (
                    <div className="space-y-4">
                        <div className="bg-[#2c2c2e] p-4 rounded-[16px] border border-white/5 space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Send size={20} />
                                Отправка сообщений
                            </h2>

                            {/* Target Selection */}
                            <div className="flex bg-black/20 p-1 rounded-lg">
                                <button
                                    onClick={() => { setIsBroadcastMode(false); setSelectedUserForMessage(null); }}
                                    className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-all ${!isBroadcastMode ? 'bg-[#007aff] text-white' : 'text-gray-400'}`}
                                >
                                    Личное
                                </button>
                                <button
                                    onClick={() => { setIsBroadcastMode(true); setSelectedUserForMessage(null); }}
                                    className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-all ${isBroadcastMode ? 'bg-red-500 text-white' : 'text-gray-400'}`}
                                >
                                    Рассылка (Всем)
                                </button>
                            </div>

                            {!isBroadcastMode && (
                                <div className="space-y-2">
                                    <label className="text-[11px] text-gray-500 uppercase">Получатель</label>
                                    {selectedUserForMessage ? (
                                        <div className="flex items-center justify-between bg-black/20 p-3 rounded-[12px]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                                                    {selectedUserForMessage.avatar_url && <img src={selectedUserForMessage.avatar_url} className="w-full h-full object-cover" />}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-bold">{selectedUserForMessage.first_name}</div>
                                                    <div className="text-[10px] text-gray-500">@{selectedUserForMessage.username}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedUserForMessage(null)} className="p-2 text-white/50 hover:text-white"><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                                            <input
                                                className="w-full bg-black/20 rounded-[12px] pl-10 pr-4 py-3 text-[13px] outline-none text-white placeholder:text-gray-600"
                                                placeholder="Найти пользователя..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                            />
                                            {searchQuery && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1c1e] border border-white/10 rounded-[12px] overflow-hidden z-10 max-h-48 overflow-y-auto shadow-2xl">
                                                    {filteredUsers.slice(0, 5).map(u => (
                                                        <div
                                                            key={u.id}
                                                            onClick={() => { setSelectedUserForMessage(u); setSearchQuery(''); }}
                                                            className="p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3"
                                                        >
                                                            <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden">
                                                                {u.avatar_url && <img src={u.avatar_url} className="w-full h-full object-cover" />}
                                                            </div>
                                                            <div className="text-[13px]">{u.username || u.first_name}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Message Content */}
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[11px] text-gray-500 uppercase block mb-1">Сообщение</label>
                                    <textarea
                                        className="w-full bg-black/20 rounded-[12px] p-3 text-[13px] outline-none text-white placeholder:text-gray-600 min-h-[100px]"
                                        placeholder="Введите текст сообщения..."
                                        value={messageText}
                                        onChange={e => setMessageText(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] text-gray-500 uppercase block mb-1">Медиа (Опционально)</label>
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 bg-black/20 rounded-[12px] p-3 text-[13px] outline-none text-white placeholder:text-gray-600"
                                            placeholder="URL картинки или видео"
                                            value={mediaUrl}
                                            onChange={e => setMediaUrl(e.target.value)}
                                        />
                                        <select
                                            className="bg-black/20 rounded-[12px] px-3 outline-none text-[12px]"
                                            value={mediaType}
                                            onChange={e => setMediaType(e.target.value)}
                                        >
                                            <option value="image">Фото</option>
                                            <option value="video">Видео</option>
                                        </select>
                                    </div>
                                </div>

                                {mediaUrl && (
                                    <div className="aspect-video bg-black/50 rounded-lg overflow-hidden relative">
                                        {mediaType === 'video' ? (
                                            <video src={mediaUrl} className="w-full h-full object-contain" controls />
                                        ) : (
                                            <img src={mediaUrl} className="w-full h-full object-contain" />
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSendMessage}
                                disabled={isSending || (!isBroadcastMode && !selectedUserForMessage)}
                                className={`w-full py-3.5 rounded-[12px] font-bold text-white flex items-center justify-center gap-2 transition-all ${isSending ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#007aff] hover:bg-blue-600 active:scale-[0.98]'}`}
                            >
                                {isSending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                {isBroadcastMode ? 'Начать рассылку' : 'Отправить сообщение'}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- USERS --- */}
                {activeTab === 'users' && (
                    <div className="space-y-4">
                        <input
                            className="w-full bg-[#2c2c2e] border-none rounded-[14px] px-4 py-3 text-[15px] outline-none placeholder:text-gray-600"
                            placeholder="Поиск пользователей..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <div className="space-y-2">
                            {filteredUsers.map(u => (
                                <div key={u.id} className="bg-[#2c2c2e] p-4 rounded-[16px] flex items-center justify-between border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                            {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <Users size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-[14px]">{u.first_name || 'User'}</div>
                                            <div className="text-[11px] text-gray-500">@{u.username} • {u.total_gens} gens</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {editingUser === u.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    className="w-16 bg-black/30 rounded px-2 py-1 text-right outline-none text-[13px]"
                                                    value={newBalance}
                                                    onChange={e => setNewBalance(e.target.value)}
                                                />
                                                <button onClick={() => handleUpdateBalance(u.id, newBalance)} className="p-1.5 bg-green-500/20 text-green-500 rounded"><Save size={14} /></button>
                                                <button onClick={() => setEditingUser(null)} className="p-1.5 bg-white/10 text-white rounded"><X size={14} /></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setEditingUser(u.id); setNewBalance(u.balance); }} className="flex items-center gap-1 bg-[#007aff]/10 px-3 py-1.5 rounded-full">
                                                <Zap size={12} className="text-[#007aff] fill-current" />
                                                <span className="text-[13px] font-bold text-[#007aff]">{u.balance}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'models' && (
                    <div className="space-y-3">
                        {models.map(m => (
                            <div key={m.id} className="bg-[#2c2c2e] p-4 rounded-[16px] border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-[15px]">{m.display_name}</h3>
                                    <div className={`w-2 h-2 rounded-full ${m.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                </div>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex-1">
                                        <label className="text-[10px] text-gray-500 uppercase">Cost (⚡)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-black/20 rounded-lg px-3 py-2 mt-1 text-[13px]"
                                            defaultValue={m.cost}
                                            onBlur={e => handleUpdateModel(m.id, { cost: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleUpdateModel(m.id, { is_active: !m.is_active })}
                                        className="px-4 py-2 bg-white/5 rounded-lg text-[12px] font-medium mt-auto h-[38px]"
                                    >
                                        {m.is_active ? 'Отключить' : 'Включить'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#2c2c2e] p-4 rounded-[16px] border border-white/5">
                            <div className="text-[24px] font-bold">{stats.users}</div>
                            <div className="text-[11px] text-gray-500 uppercase">Пользователей</div>
                        </div>
                        <div className="bg-[#2c2c2e] p-4 rounded-[16px] border border-white/5">
                            <div className="text-[24px] font-bold">{stats.gens24h}</div>
                            <div className="text-[11px] text-gray-500 uppercase">Генераций (24h)</div>
                        </div>
                        <div className="bg-[#2c2c2e] p-4 rounded-[16px] border border-white/5">
                            <div className="text-[24px] font-bold">{stats.templates}</div>
                            <div className="text-[11px] text-gray-500 uppercase">Шаблонов</div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL WITH FRAMER MOTION & PORTAL */}
            {
                editingTemplate && createPortal(
                    <div className="fixed inset-0 z-[999999] flex justify-center items-end sm:items-center p-0 sm:p-4 font-sans">
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingTemplate(null)}
                        />

                        {/* Content */}
                        <motion.div
                            className="bg-[#1c1c1e] w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[24px] sm:rounded-[24px] relative z-10 flex flex-col border border-white/10 shadow-2xl overflow-hidden"
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1c1c1e] z-20 shrink-0">
                                <h3 className="text-lg font-bold text-white">{editingTemplate.is_local ? 'Размещение (Local)' : editingTemplate.id.startsWith('new_') ? 'Новый шаблон' : 'Редактирование'}</h3>
                                <button onClick={() => setEditingTemplate(null)} className="p-2 bg-[#2c2c2e] rounded-full hover:bg-white/10 transition-colors text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar pb-safe-bottom">
                                {/* Preview / Upload Section */}
                                <div className="aspect-[3/4] rounded-[16px] bg-black/50 overflow-hidden relative border border-white/10 mx-auto w-1/2 group">
                                    {editingTemplate.src ? (
                                        editingTemplate.media_type === 'video' ? (
                                            <video src={editingTemplate.src} className="w-full h-full object-cover" muted autoPlay loop />
                                        ) : (
                                            <img src={editingTemplate.src} className="w-full h-full object-cover" />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
                                            <Upload size={24} />
                                            <span className="text-[10px]">Загрузить</span>
                                        </div>
                                    )}

                                    {/* Upload Overlay */}
                                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm">
                                        {isUploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" />}
                                        <span className="text-[10px] font-bold mt-2 text-white">{isUploading ? 'Загрузка...' : 'Изменить файл'}</span>
                                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[11px] text-gray-500 uppercase block mb-1">Название</label>
                                        <input
                                            className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                            placeholder="Название шаблона (ID)"
                                            value={editingTemplate.title || ''}
                                            onChange={e => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            className="bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none placeholder:text-gray-600 text-[12px]"
                                            placeholder="URL (или загрузите файл)"
                                            value={editingTemplate.src || ''}
                                            onChange={e => setEditingTemplate({ ...editingTemplate, src: e.target.value })}
                                            readOnly
                                        />
                                        <input
                                            type="number"
                                            className="bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none placeholder:text-gray-600"
                                            placeholder="Сортировка"
                                            value={editingTemplate.sort_order || 0}
                                            onChange={e => setEditingTemplate({ ...editingTemplate, sort_order: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] text-gray-500 uppercase block mb-1">Тип медиа</label>
                                            <select
                                                className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none appearance-none"
                                                value={editingTemplate.media_type || 'image'}
                                                onChange={e => setEditingTemplate({ ...editingTemplate, media_type: e.target.value })}
                                            >
                                                <option value="image">Фото (Static)</option>
                                                <option value="video">Видео (Animation)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-gray-500 uppercase block mb-1">Категория</label>
                                            <div className="flex gap-2">
                                                <select
                                                    className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none appearance-none"
                                                    value={editingTemplate.category || 'trends'}
                                                    onChange={e => {
                                                        if (e.target.value === 'new_custom_category') {
                                                            const newCat = prompt('Введите название новой категории (на английском, например: vintage):');
                                                            if (newCat) {
                                                                const label = prompt('Введите название для отображения (например: Винтаж):');
                                                                handleAddCategory(newCat.toLowerCase(), label || newCat);
                                                            }
                                                        } else {
                                                            setEditingTemplate({ ...editingTemplate, category: e.target.value });
                                                        }
                                                    }}
                                                >
                                                    {categories.map(c => (
                                                        <option key={c.slug} value={c.slug}>{c.label}</option>
                                                    ))}
                                                    <option value="new_custom_category">+ Добавить категорию...</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] text-gray-500 uppercase block mb-1">Системный Промпт</label>
                                        <textarea
                                            className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none placeholder:text-gray-600 h-32 font-mono text-[13px] focus:ring-1 focus:ring-blue-500/50 transition-all"
                                            placeholder="Prompt to generate..."
                                            value={editingTemplate.generation_prompt || ''}
                                            onChange={e => setEditingTemplate({ ...editingTemplate, generation_prompt: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <label className="text-[11px] text-gray-500 uppercase block mb-1">AI Model</label>
                                            <select
                                                className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none appearance-none"
                                                value={editingTemplate.model_id || ''}
                                                onChange={e => setEditingTemplate({ ...editingTemplate, model_id: e.target.value })}
                                            >
                                                <option value="">Выберите модель...</option>
                                                {/* Merge DB models and KIE models for the dropdown */}
                                                {(() => {
                                                    const modelMap = new Map();
                                                    // Add DB models first
                                                    models.forEach(m => modelMap.set(m.id, { id: m.id, name: m.display_name, cost: m.cost }));
                                                    // Add or overwrite with KIE models (canonical)
                                                    Object.values(KIE_MODELS_FLAT).forEach(m => {
                                                        modelMap.set(m.id, { id: m.id, name: m.name, cost: m.base_cost });
                                                    });
                                                    return Array.from(modelMap.values()).map(m => (
                                                        <option key={m.id} value={m.id}>{m.name} ({m.cost}⚡)</option>
                                                    ));
                                                })()}
                                                <option value="google/nano-banana-edit">Nano Banana Edit (5⚡)</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[11px] text-gray-500 uppercase block mb-1">Статус</label>
                                            <button
                                                onClick={() => setEditingTemplate({ ...editingTemplate, is_active: !editingTemplate.is_active })}
                                                className={`w-full p-3 rounded-[12px] font-bold transition-all ${editingTemplate.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                                            >
                                                {editingTemplate.is_active ? 'Активен' : 'Скрыт'}
                                            </button>
                                        </div>
                                    </div>

                                    {editingTemplate.id && !editingTemplate.is_local && !editingTemplate.id.startsWith('new_') && (
                                        <button
                                            onClick={() => handleDeleteTemplate(editingTemplate.id)}
                                            className="w-full mt-4 p-3 bg-red-500/10 text-red-500 rounded-[12px] font-bold hover:bg-red-500/20 transition-colors"
                                        >
                                            Удалить из базы
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t border-white/10 bg-[#1c1c1e] sticky bottom-0 z-20 pb-8 safe-bottom">
                                <button
                                    onClick={() => handleSaveTemplate(editingTemplate)}
                                    className="w-full bg-[#007aff] text-white font-bold py-3.5 rounded-[12px] shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform hover:bg-[#0069d9]"
                                >
                                    {editingTemplate.is_local ? 'Разместить в базе' : 'Сохранить изменения'}
                                </button>
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )
            }

            {/* EDIT STAR MODAL */}
            {
                editingStar && createPortal(
                    <div className="fixed inset-0 z-[999999] flex justify-center items-end sm:items-center p-0 sm:p-4 font-sans">
                        <motion.div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingStar(null)}
                        />

                        <motion.div
                            className="bg-[#1c1c1e] w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[24px] sm:rounded-[24px] relative z-10 flex flex-col border border-white/10 shadow-2xl overflow-hidden"
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1c1c1e] z-20 shrink-0">
                                <h3 className="text-lg font-bold text-white">{editingStar.id?.startsWith('new_') ? 'Новая Звезда' : 'Редактирование'}</h3>
                                <button onClick={() => setEditingStar(null)} className="p-2 bg-[#2c2c2e] rounded-full hover:bg-white/10 transition-colors text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar pb-safe-bottom">
                                {/* Preview / Upload Section */}
                                <div className="aspect-[3/4] rounded-[16px] bg-black/50 overflow-hidden relative border border-white/10 mx-auto w-1/2 group">
                                    {editingStar.image_url ? (
                                        <img src={editingStar.image_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
                                            <Upload size={24} />
                                            <span className="text-[10px]">Загрузить фото</span>
                                        </div>
                                    )}

                                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm">
                                        {isUploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" />}
                                        <span className="text-[10px] font-bold mt-2 text-white">{isUploading ? 'Загрузка...' : 'Изменить фото'}</span>
                                        <input type="file" className="hidden" onChange={handleStarFileUpload} accept="image/*" />
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[11px] text-gray-500 uppercase block mb-1">Имя</label>
                                        <input
                                            className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                            placeholder="Имя звезды"
                                            value={editingStar.name || ''}
                                            onChange={e => setEditingStar({ ...editingStar, name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] text-gray-500 uppercase block mb-1">Slug (ID)</label>
                                        <input
                                            className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none placeholder:text-gray-600 font-mono text-[13px]"
                                            placeholder="unique_slug"
                                            value={editingStar.slug || ''}
                                            onChange={e => setEditingStar({ ...editingStar, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] text-gray-500 uppercase block mb-1">Описание</label>
                                        <input
                                            className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none placeholder:text-gray-600"
                                            placeholder="Краткое описание"
                                            value={editingStar.description || ''}
                                            onChange={e => setEditingStar({ ...editingStar, description: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] text-gray-500 uppercase block mb-1">Фото URL</label>
                                        <input
                                            className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none placeholder:text-gray-600 text-[12px]"
                                            value={editingStar.image_url || ''}
                                            onChange={e => setEditingStar({ ...editingStar, image_url: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] text-gray-500 uppercase block mb-1">Сортировка</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none"
                                                value={editingStar.sort_order || 0}
                                                onChange={e => setEditingStar({ ...editingStar, sort_order: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-gray-500 uppercase block mb-1">Статус</label>
                                            <button
                                                onClick={() => setEditingStar({ ...editingStar, is_active: !editingStar.is_active })}
                                                className={`w-full p-3 rounded-[12px] font-bold transition-all ${editingStar.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                                            >
                                                {editingStar.is_active ? 'Активен' : 'Скрыт'}
                                            </button>
                                        </div>
                                    </div>

                                    {editingStar.id && !editingStar.id.startsWith('new_') && (
                                        <button
                                            onClick={() => handleDeleteStar(editingStar.id)}
                                            className="w-full mt-4 p-3 bg-red-500/10 text-red-500 rounded-[12px] font-bold hover:bg-red-500/20 transition-colors"
                                        >
                                            Удалить звезду
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t border-white/10 bg-[#1c1c1e] sticky bottom-0 z-20 pb-8 safe-bottom">
                                <button
                                    onClick={() => handleSaveStar(editingStar)}
                                    className="w-full bg-[#007aff] text-white font-bold py-3.5 rounded-[12px] shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform hover:bg-[#0069d9]"
                                >
                                    Сохранить
                                </button>
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )
            }
        </div >
    );
};

export default AdminView;
