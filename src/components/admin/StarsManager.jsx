import React from 'react';
import { Plus, Image as ImageIcon, ShieldAlert, Edit2 } from 'lucide-react';

const StarsManager = ({ searchQuery, setSearchQuery, setEditingStar, stars }) => {
    return (
        <div className="space-y-4">
            <div className="flex gap-2 mb-4">
                <input
                    className="flex-1 bg-bg-elevated border-none rounded-card px-4 py-3 text-[15px] outline-none placeholder:text-gray-600"
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
                    className="bg-accent-blue px-4 rounded-card flex items-center justify-center text-white shadow-lg gap-2 active:scale-95 transition-transform cursor-pointer hover:bg-accent-blue"
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
                        className="bg-bg-elevated rounded-card overflow-hidden relative cursor-pointer active:scale-95 transition-transform border border-white/5 group"
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
    );
};

export default React.memo(StarsManager);
