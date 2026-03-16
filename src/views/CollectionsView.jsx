import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Folder, Plus, Trash2, Check, Layers, Eye, Film } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useSound } from '../context/SoundContext';

const CollectionsView = () => {
    const navigate = useNavigate();
    const toaster = useToast();
    const { playClick, playSuccess } = useSound();

    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');

    useEffect(() => {
        // Load collections from local storage
        const loadCollections = () => {
            try {
                const saved = JSON.parse(localStorage.getItem('bazzar_collections') || '[]');
                setCollections(Array.isArray(saved) ? saved : []);
            } catch (e) {
                console.error('Failed to load collections', e);
            }
        };
        loadCollections();
    }, []);

    const saveCollections = (items) => {
        setCollections(items);
        localStorage.setItem('bazzar_collections', JSON.stringify(items));
    };

    const handleCreateCollection = () => {
        if (!newCollectionName.trim()) {
            setIsCreating(false);
            return;
        }

        const newCol = {
            id: Date.now().toString(),
            name: newCollectionName.trim(),
            items: [],
            createdAt: new Date().toISOString()
        };

        saveCollections([...collections, newCol]);
        setNewCollectionName('');
        setIsCreating(false);
        playSuccess();
        toaster.success('Коллекция создана');
    };

    const handleDeleteCollection = (id) => {
        if (window.confirm('Вы уверены, что хотите удалить эту коллекцию?')) {
            saveCollections(collections.filter(c => c.id !== id));
            if (selectedCollection?.id === id) setSelectedCollection(null);
            toaster.success('Коллекция удалена');
        }
    };

    const handleRemoveFromCollection = (collectionId, itemId) => {
        const updated = collections.map(col => {
            if (col.id === collectionId) {
                return { ...col, items: col.items.filter(item => item.id !== itemId) };
            }
            return col;
        });
        saveCollections(updated);
        // Also update local selectedCollection state if active
        if (selectedCollection?.id === collectionId) {
            setSelectedCollection(updated.find(c => c.id === collectionId));
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col md:max-w-3xl md:mx-auto relative pt-[calc(env(safe-area-inset-top)+10px)] selection:bg-accent-blue/30">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-black/80 backdrop-blur-xl z-30 border-b border-white/5 shadow-sm">
                <div className="flex items-center">
                    <button onClick={() => { playClick(); selectedCollection ? setSelectedCollection(null) : navigate(-1); }} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-[18px] font-bold ml-1">
                        {selectedCollection ? selectedCollection.name : 'Коллекции'}
                    </h1>
                </div>
                {!selectedCollection && (
                    <button
                        onClick={() => { playClick(); setIsCreating(true); }}
                        className="bg-accent-blue/10 text-[#3390ec] p-2 rounded-full hover:bg-accent-blue/20 transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
                {/* Create Modal (Inline) */}
                {isCreating && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-bg-secondary p-4 rounded-2xl border border-white/10 mb-6 shadow-xl">
                        <label className="text-[13px] font-medium text-gray-400 mb-2 block uppercase tracking-wider">Новая коллекция</label>
                        <div className="flex gap-2">
                            <input
                                autoFocus
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                placeholder="Название..."
                                className="flex-1 bg-bg-elevated px-4 py-2.5 rounded-xl outline-none focus:ring-1 focus:ring-[#3390ec] transition-shadow text-[15px]"
                                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateCollection(); if (e.key === 'Escape') setIsCreating(false); }}
                            />
                            <button onClick={handleCreateCollection} className="bg-accent-blue text-white px-4 rounded-xl font-bold hover:bg-accent-blue transition-colors">
                                <Check size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {!selectedCollection ? (
                    // ── Collections List ──
                    collections.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center opacity-50">
                            <Layers size={64} className="mb-4 text-gray-500" strokeWidth={1} />
                            <p className="text-[17px] font-medium tracking-tight">У вас пока нет коллекций</p>
                            <p className="text-[15px] mt-1 text-gray-400">Сохраняйте лучшие генерации в папки</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {collections.map(col => (
                                <motion.div
                                    key={col.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedCollection(col)}
                                    className="bg-bg-secondary rounded-[18px] p-4 border border-white/5 cursor-pointer flex flex-col items-center justify-center text-center aspect-square shadow-sm relative group overflow-hidden"
                                >
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteCollection(col.id); }}
                                        className="absolute top-2 right-2 w-7 h-7 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                    {/* Preview grid if items exist */}
                                    {col.items && col.items.length > 0 ? (
                                        <div className="w-16 h-16 mb-3 rounded-xl overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5 transform -rotate-6 shadow-md border border-white/10 group-hover:rotate-0 transition-transform duration-300">
                                            {[...Array(4)].map((_, i) => (
                                                <div key={i} className="bg-bg-elevated w-full h-full">
                                                    {col.items[i]?.url && <img src={col.items[i].url} className="w-full h-full object-cover" />}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-bg-elevated rounded-xl mb-3 flex items-center justify-center transform -rotate-6 shadow-md border border-glass-border group-hover:rotate-0 transition-transform duration-300">
                                            <Folder size={28} className="text-gray-500" />
                                        </div>
                                    )}

                                    <h3 className="font-bold text-[15px] truncate w-full px-2 drop-shadow-sm">{col.name}</h3>
                                    <p className="text-[12px] text-gray-400 mt-1">{col.items?.length || 0} файлов</p>
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    // ── Inside a Collection ──
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {(!selectedCollection.items || selectedCollection.items.length === 0) ? (
                            <div className="col-span-full text-center py-20 opacity-50 flex flex-col items-center">
                                <Folder size={48} className="mb-4 text-gray-500" />
                                <p className="text-[15px]">Папка пуста</p>
                            </div>
                        ) : (
                            selectedCollection.items.map((item, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={item.id || idx}
                                    className="relative aspect-square rounded-card overflow-hidden group border border-white/5"
                                >
                                    <img src={item.url} alt="Generation" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                                        <p className="text-[10px] text-white/80 line-clamp-2 leading-tight drop-shadow-md">{item.prompt}</p>

                                        <div className="flex justify-end mt-2 gap-1.5">
                                            {/* Open image in external viewer or something */}
                                            <button onClick={() => window.open(item.url, '_blank')} className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-90">
                                                <Eye size={12} />
                                            </button>
                                            <button onClick={() => handleRemoveFromCollection(selectedCollection.id, item.id)} className="w-7 h-7 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white active:scale-90">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    {item.type === 'video' && (
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                                            <Film size={10} className="text-white" />
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionsView;
