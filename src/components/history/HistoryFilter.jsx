import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Folder, Filter, SortDesc, Heart } from 'lucide-react';

const HistoryFilter = ({
    collections,
    activeCollection,
    setActiveCollection,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    filterType,
    setFilterType,
    sortBy,
    setSortBy
}) => {
    return (
        <div className="mb-4 space-y-3">
            {/* Collections Horizontal Scroll */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                    onClick={() => setActiveCollection('all')}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeCollection === 'all' ? 'bg-accent-blue text-white' : 'bg-bg-elevated text-gray-400'}`}
                >
                    Все работы
                </button>
                {Object.keys(collections).map(name => (
                    <button
                        key={name}
                        onClick={() => setActiveCollection(name)}
                        className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeCollection === name ? 'bg-accent-purple text-white' : 'bg-bg-elevated text-gray-400'}`}
                    >
                        <Folder size={14} /> {name}
                    </button>
                ))}
            </div>

            <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Поиск по промпту или модели..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-bg-elevated border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-[14px] text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 transition-colors"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-3 rounded-xl border transition-colors ${showFilters ? 'bg-accent-blue/20 border-accent-blue/30 text-accent-blue' : 'bg-bg-elevated border-white/5 text-gray-400'}`}
                >
                    <Filter size={20} />
                </button>
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 bg-bg-elevated/50 border border-white/5 rounded-2xl flex flex-col gap-3">
                            {/* Type Filter */}
                            <div className="flex bg-bg-secondary rounded-xl p-1">
                                {['all', 'image', 'video'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all ${filterType === type ? 'bg-bg-elevated text-white shadow-sm' : 'text-gray-500'}`}
                                    >
                                        {type === 'all' ? 'Все' : type === 'image' ? 'Фото' : 'Видео'}
                                    </button>
                                ))}
                            </div>

                            {/* Sort Order */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSortBy('date')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-medium transition-colors ${sortBy === 'date' ? 'bg-accent-blue/20 text-accent-blue' : 'bg-bg-secondary text-gray-400'}`}
                                >
                                    <SortDesc size={14} /> По дате
                                </button>
                                <button
                                    onClick={() => setSortBy('likes')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-medium transition-colors ${sortBy === 'likes' ? 'bg-[#ff2d55]/20 text-[#ff2d55]' : 'bg-bg-secondary text-gray-400'}`}
                                >
                                    <Heart size={14} /> По лайкам
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default React.memo(HistoryFilter);
