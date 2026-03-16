import React from 'react';
import { Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

const PromotionsManager = ({
    searchQuery, setSearchQuery,
    setEditingPromotion, promotions,
    handleTogglePromotion, handleDeletePromotion
}) => {
    return (
        <div className="space-y-4">
            <div className="flex gap-2 mb-4">
                <input
                    className="flex-1 bg-bg-elevated border-none rounded-card px-4 py-3 text-[15px] outline-none placeholder:text-gray-600"
                    placeholder="Поиск акций..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <button
                    onClick={() => setEditingPromotion({
                        id: `new_${Date.now()}`,
                        is_active: true,
                        discount_percent: 0
                    })}
                    className="bg-accent-blue px-4 rounded-card flex items-center justify-center text-white shadow-lg gap-2 active:scale-95 transition-transform cursor-pointer hover:bg-accent-blue"
                >
                    <Plus size={20} />
                    <span className="text-[13px] font-bold hidden sm:inline">Добавить</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {promotions.filter(p => (p.title || '').toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
                    <div
                        key={p.id}
                        className="bg-bg-elevated rounded-card overflow-hidden relative border border-white/5 p-4 flex flex-col gap-3 group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-3">
                                <h4 className="font-bold text-[15px] truncate">{p.title}</h4>
                                <p className="text-[12px] text-gray-400 line-clamp-2 mt-1">{p.description}</p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditingPromotion(p); }}
                                    className="px-3 py-1 bg-white/10 rounded-full text-[12px] font-medium hover:bg-white/20 transition-colors"
                                >
                                    Ред.
                                </button>
                                <button
                                    onClick={() => handleTogglePromotion(p.id, p.is_active)}
                                    className={`p-1.5 rounded-full transition-colors ${p.is_active ? 'text-green-500 bg-green-500/10' : 'text-gray-500 bg-white/5'}`}
                                >
                                    {p.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono bg-accent-blue/10 text-accent-blue px-2 py-1 rounded-md bg-opacity-70 dark:bg-opacity-20 border border-accent-blue/20">
                                -{p.discount_percent}%
                            </span>
                            {(p.valid_until || p.valid_from) && (
                                <span className="text-[10px] text-gray-500 bg-black/30 px-2 py-1 flex items-center gap-1 rounded-md">
                                    {p.valid_from ? new Date(p.valid_from).toLocaleDateString() : '∞'} → {p.valid_until ? new Date(p.valid_until).toLocaleDateString() : '∞'}
                                </span>
                            )}
                        </div>

                        {p.banner_url && (
                            <div className="mt-2 aspect-[21/9] bg-black/50 rounded-lg overflow-hidden relative border border-white/5">
                                <img src={p.banner_url} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                            {p.id && !p.id.startsWith('new_') && (
                                <button
                                    onClick={() => handleDeletePromotion(p.id)}
                                    className="p-1.5 bg-red-500/10 text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100 ml-2 shadow-[0_4px_10px_rgba(239,68,68,0.2)] mt-5 z-20 hover:scale-105 active:scale-95"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(PromotionsManager);
