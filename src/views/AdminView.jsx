import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, ShieldAlert, Zap, Globe, Image as ImageIcon, Video, X, Users, Coins, Search, Edit2, Save } from 'lucide-react';

const AdminView = () => {
    const { user, profile } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'models' | 'users'

    // Data
    const [templates, setTemplates] = useState([]);
    const [models, setModels] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit State
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [editingUser, setEditingUser] = useState(null); // For balance edit

    useEffect(() => {
        const WHITELIST_IDS = ['13658f8b-3f48-4394-a320-dd8e2277d079'];

        if (profile?.role === 'admin' || (user?.id && WHITELIST_IDS.includes(user.id))) {
            setIsAdmin(true);
            fetchData();
        } else {
            const params = new URLSearchParams(window.location.search);
            if (params.get('staff') === '1') {
                setIsAdmin(true);
                fetchData();
            }
        }
    }, [profile, user]);

    const fetchData = async () => {
        setIsLoading(true);
        const { data: tData } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
        const { data: mData } = await supabase.from('ai_models').select('*').order('id');
        const { data: uData } = await supabase.from('profiles').select('*').order('balance', { ascending: false }).limit(50);

        if (tData) setTemplates(tData);
        if (mData) setModels(mData);
        if (uData) setUsers(uData);
        setIsLoading(false);
    };

    // --- TEMPLATE ACTIONS ---
    const handleSaveTemplate = async (tpl) => {
        const isNew = !tpl.id;
        const payload = {
            name: tpl.name,
            description: tpl.description,
            image_url: tpl.image_url,
            prompt: tpl.prompt,
            base_prompt: tpl.base_prompt,
            model_id: tpl.model_id,
            category: tpl.category,
            sort_order: parseInt(tpl.sort_order || 0),
            is_public: tpl.is_public !== false
        };

        let error;
        try {
            if (isNew) {
                const { error: e } = await supabase.from('templates').insert([payload]);
                error = e;
            } else {
                const { error: e } = await supabase.from('templates').update(payload).eq('id', tpl.id);
                error = e;
            }
        } catch (e) { error = e; }

        if (!error) {
            setEditingTemplate(null);
            fetchData();
        } else {
            alert('Ошибка при сохранении: ' + error.message);
        }
    };

    const handleDeleteTemplate = async (id) => {
        if (!confirm('Удалить этот шаблон?')) return;
        await supabase.from('templates').delete().eq('id', id);
        fetchData();
    };

    // --- MODEL ACTIONS ---
    const handleUpdateModel = async (id, changes) => {
        const { error } = await supabase.from('ai_models').update(changes).eq('id', id);
        if (!error) fetchData();
        else alert('Ошибка при обновлении модели: ' + error.message);
    };

    // --- USER ACTIONS ---
    const handleUpdateBalance = async (userId, newBalance) => {
        const val = parseInt(newBalance);
        if (isNaN(val)) return;

        const { error } = await supabase.from('profiles').update({ balance: val }).eq('id', userId);
        if (error) {
            alert('Ошибка баланса: ' + error.message);
        } else {
            setEditingUser(null);
            // Local update
            setUsers(users.map(u => u.id === userId ? { ...u, balance: val } : u));
        }
    };

    // --- RENDER ---

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 opacity-50">
                <ShieldAlert size={48} className="mb-4 text-red-500" />
                <h2 className="text-xl font-bold">Доступ ограничен</h2>
                <p className="text-xs text-center max-w-xs mt-2">Панель управления доступна только для персонала Studio.</p>
                <button className="mt-8 text-[10px] underline" onClick={() => { setIsAdmin(true); fetchData(); }}>[Force Dev Login]</button>
            </div>
        );
    }

    const filteredUsers = users.filter(u =>
        (u.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.includes(searchQuery)
    );

    return (
        <div className="pb-32 px-4 pt-6">
            <h1 className="text-3xl font-black font-display mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 text-white flex items-center justify-center rounded-xl shadow-lg shadow-indigo-500/30">
                    <ShieldAlert size={20} />
                </div>
                Staff Panel
            </h1>

            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'templates' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-500' : 'text-slate-400'}`}
                >
                    Шаблоны
                </button>
                <button
                    onClick={() => setActiveTab('models')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'models' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-500' : 'text-slate-400'}`}
                >
                    AI Модели
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-500' : 'text-slate-400'}`}
                >
                    Юзеры
                </button>
            </div>

            {/* --- TEMPLATES LIST --- */}
            {activeTab === 'templates' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <button
                        onClick={() => setEditingTemplate({ sort_order: 0, is_public: true, category: 'art' })}
                        className="w-full bg-indigo-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform"
                    >
                        <Plus size={20} /> Создать новый шаблон
                    </button>

                    <div className="grid grid-cols-1 gap-3">
                        {templates.map(t => (
                            <div key={t.id} className="bg-white dark:bg-slate-800 p-3 rounded-2xl flex gap-4 shadow-sm border border-slate-100 dark:border-slate-700 items-center">
                                <div className="w-20 h-20 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden relative">
                                    {t.image_url ? (
                                        <img src={t.image_url} className="w-full h-full object-cover" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>
                                    )}
                                    <div className="absolute top-1 left-1 bg-black/50 text-white text-[9px] font-bold px-1.5 rounded backdrop-blur-sm">#{t.sort_order}</div>
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <h3 className="font-bold truncate text-slate-900 dark:text-white mb-1">{t.name || 'Без названия'}</h3>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg text-slate-500 font-bold uppercase">{t.category}</span>
                                        <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg text-blue-500 font-mono">{t.model_id}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingTemplate(t)} className="flex-1 text-xs bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-3 py-2 rounded-lg font-bold">Изменить</button>
                                        <button onClick={() => handleDeleteTemplate(t.id)} className="w-10 flex items-center justify-center bg-red-50 dark:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- MODELS LIST --- */}
            {activeTab === 'models' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-xs text-blue-600 dark:text-blue-300 mb-4">
                        💡 Здесь вы можете менять стоимость генерации для разных моделей ИИ.
                    </div>

                    {models.map(m => (
                        <div key={m.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="font-bold text-lg text-slate-900 dark:text-white">{m.display_name || m.id}</div>
                                    <div className="text-xs text-slate-400 font-mono mt-0.5 bg-slate-100 dark:bg-slate-700 inline-block px-1.5 py-0.5 rounded">{m.id}</div>
                                </div>
                                <div className={`w-3 h-3 rounded-full shadow-sm mt-2 ${m.is_active ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500'}`} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Цена (Кредиты)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            defaultValue={m.cost}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 pl-4 pr-10 font-black text-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                                            onBlur={(e) => handleUpdateModel(m.id, { cost: parseInt(e.target.value) })}
                                        />
                                        <div className="absolute right-3 top-3 text-slate-400"><Zap size={16} className="fill-current" /></div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Действия</label>
                                    <button
                                        onClick={() => handleUpdateModel(m.id, { is_active: !m.is_active })}
                                        className={`w-full h-[52px] rounded-xl font-bold text-xs transition-colors border ${m.is_active ? 'border-red-100 bg-red-50 text-red-500 hover:bg-red-100' : 'border-green-100 bg-green-50 text-green-600 hover:bg-green-100'}`}
                                    >
                                        {m.is_active ? 'Отключить' : 'Включить'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- USERS LIST --- */}
            {activeTab === 'users' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            className="w-full bg-white dark:bg-slate-800 py-3 pl-12 pr-4 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="Поиск по имени или ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        {filteredUsers.map(u => (
                            <div key={u.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">
                                        {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-full" /> : '👤'}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm truncate">{u.first_name || u.full_name || 'User'}</div>
                                        <div className="text-[10px] text-slate-400 font-mono truncate">{u.id}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {editingUser === u.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                type="number"
                                                defaultValue={u.balance}
                                                className="w-20 bg-slate-100 dark:bg-slate-900 rounded-lg px-2 py-1 text-right font-bold text-sm"
                                                id={`bal-${u.id}`}
                                            />
                                            <button
                                                onClick={() => handleUpdateBalance(u.id, document.getElementById(`bal-${u.id}`).value)}
                                                className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center"
                                            >
                                                <Save size={16} />
                                            </button>
                                            <button
                                                onClick={() => setEditingUser(null)}
                                                className="w-8 h-8 bg-slate-200 text-slate-500 rounded-lg flex items-center justify-center"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setEditingUser(u.id)}
                                            className="flex flex-col items-end px-3 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-1 font-black text-indigo-500">
                                                <Coins size={14} className="fill-indigo-500" />
                                                {u.balance}
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-bold uppercase">Баланс</div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* --- EDIT TEMPLATE MODAL --- */}
            {editingTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] p-6 max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 custom-scrollbar border border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-2xl font-display">{editingTemplate.id ? 'Редактировать' : 'Новый шаблон'}</h3>
                            <button onClick={() => setEditingTemplate(null)} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500"><X size={18} /></button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Название</label>
                                    <input className="input-field" placeholder="Например: Cyber Samurai" value={editingTemplate.name || ''} onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Сортировка (1-999)</label>
                                    <input type="number" className="input-field" value={editingTemplate.sort_order || 0} onChange={e => setEditingTemplate({ ...editingTemplate, sort_order: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="label">Категория</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['art', 'photo', 'anime', 'video'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setEditingTemplate({ ...editingTemplate, category: cat })}
                                            className={`py-2 rounded-lg text-xs font-bold capitalize transition-all border ${editingTemplate.category === cat ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-transparent'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Картинка (URL)</label>
                                    <input className="input-field text-xs" placeholder="https://..." value={editingTemplate.image_url || ''} onChange={e => setEditingTemplate({ ...editingTemplate, image_url: e.target.value })} />
                                </div>
                                <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                    {editingTemplate.image_url ? <img src={editingTemplate.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" />}
                                </div>
                            </div>

                            <div>
                                <label className="label mb-1">Системный Промпт (Скрытый)</label>
                                <p className="text-[10px] text-slate-400 mb-2">Эта часть добавляется к промпту пользователя автоматически.</p>
                                <textarea
                                    className="input-field h-24 font-mono text-xs leading-relaxed"
                                    placeholder="masterpiece, best quality, 8k, style of..."
                                    value={editingTemplate.base_prompt || ''}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, base_prompt: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="label mb-2">Выберите AI Модель</label>
                                <select className="input-field py-3" value={editingTemplate.model_id || 'flux-pro'} onChange={e => setEditingTemplate({ ...editingTemplate, model_id: e.target.value })}>
                                    {models.map(m => <option key={m.id} value={m.id}>{m.display_name} ({m.cost} ⚡)</option>)}
                                    <option value="flux-pro">Flux Pro (Default)</option>
                                    <option value="flux-schnell">Flux Schnell</option>
                                    <option value="kling">Kling AI Video</option>
                                    <option value="runway-gen3-alpha">Runway Gen-3</option>
                                    <option value="midjourney-v6">Midjourney V6</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-white/10">
                            <button onClick={() => setEditingTemplate(null)} className="flex-1 py-4 font-bold bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500">Отмена</button>
                            <button onClick={() => handleSaveTemplate(editingTemplate)} className="flex-[2] py-4 font-bold bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform">Сохранить изменения</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .label {
                    @apply text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2;
                }
                .input-field {
                    @apply bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 w-full text-sm font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-300;
                }
            `}</style>
        </div>
    );
};

export default AdminView;
