import React from 'react';
import { ShieldAlert, Edit2, Plus } from 'lucide-react';

const TemplatesManager = ({
    searchQuery, setSearchQuery,
    setEditingTemplate, templatesLength,
    selectedCategoryFilter, setSelectedCategoryFilter, categories,
    visibleTemplates
}) => {
    return (
        <div className="space-y-4">
            <div className="flex gap-2 mb-4">
                <input
                    className="flex-1 bg-bg-elevated border-none rounded-card px-4 py-3 text-[15px] outline-none placeholder:text-gray-600"
                    placeholder="Поиск по названию..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <button
                    onClick={() => setEditingTemplate({
                        id: `new_${Date.now()}`,
                        sort_order: templatesLength + 1,
                        is_active: true,
                        category: 'trends',
                        media_type: 'image'
                    })}
                    className="bg-accent-blue px-4 rounded-card flex items-center justify-center text-white shadow-lg gap-2 active:scale-95 transition-transform cursor-pointer hover:bg-accent-blue"
                >
                    <Plus size={20} />
                    <span className="text-[13px] font-bold hidden sm:inline">Добавить</span>
                </button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-2">
                <button
                    onClick={() => setSelectedCategoryFilter('all')}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${selectedCategoryFilter === 'all' ? 'bg-white text-black' : 'bg-bg-elevated text-white/70 hover:text-white'}`}
                >
                    Все
                </button>
                {categories.map(c => (
                    <button
                        key={c.slug}
                        onClick={() => setSelectedCategoryFilter(c.slug)}
                        className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${selectedCategoryFilter === c.slug ? 'bg-white text-black' : 'bg-bg-elevated text-white/70 hover:text-white'}`}
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
                        className="bg-bg-elevated rounded-card overflow-hidden relative cursor-pointer active:scale-95 transition-transform border border-white/5 group"
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
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-accent-blue rounded text-[9px] font-bold shadow-lg">
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
    );
};

export default React.memo(TemplatesManager);
