import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import galleryAPI from '../lib/galleryAPI';
import { useCloudStorage } from '../hooks/useCloudStorage';
import CompareModal from '../components/CompareModal';
import SEO from '../components/SEO/SEO';

import HistoryFilter from '../components/history/HistoryFilter';
import HistoryGrid from '../components/history/HistoryGrid';
import HistoryEmpty from '../components/history/HistoryEmpty';
import HistoryModal from '../components/history/HistoryModal';

const SparkleIcon = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <motion.path
            d="M12 2L14.09 8.26L20.18 8.63L15.54 12.74L16.82 19.02L12 15.77L7.18 19.02L8.46 12.74L3.82 8.63L9.91 8.26L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.15"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        />
    </svg>
);

const HistoryLoadingSkeleton = () => (
    <div className="pt-4 pb-32 px-4 bg-[#1c1c1e] min-h-screen text-white">
        <div className="mb-6 px-1">
            <div className="h-8 w-28 bg-white/5 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-16 bg-white/5 rounded-md animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="aspect-square rounded-[20px] bg-[#2c2c2e] overflow-hidden relative"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                    />
                </motion.div>
            ))}
        </div>
    </div>
);

const HistoryView = () => {
    const navigate = useNavigate();
    const { user, isLoading: isUserLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [generations, setGenerations] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    // ── Filters & Search ───
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // all | image | video
    const [sortBy, setSortBy] = useState('date'); // date | likes
    const [showFilters, setShowFilters] = useState(false);

    // ── Compare Mode ───
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedCompareIds, setSelectedCompareIds] = useState([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    // ── Collections ───
    const { getItem, setItem } = useCloudStorage();
    const [collections, setCollections] = useState({});
    const [activeCollection, setActiveCollection] = useState('all');
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');

    useEffect(() => {
        const loadCollections = async () => {
            const saved = await getItem('bazzar_collections');
            if (saved) {
                try {
                    setCollections(JSON.parse(saved));
                } catch { }
            }
        };
        loadCollections();
    }, [getItem]);

    useEffect(() => {
        if (isUserLoading) return;
        let isMounted = true;
        
        const fetchHistory = async (showLoading = true) => {
            if (!user?.id) { setIsLoading(false); return; }
            if (showLoading) setIsLoading(true);
            try {
                const data = await galleryAPI.getUserCreations(user.id, true);
                if (isMounted) setGenerations(data || []);
            } catch (error) {
                console.error("Failed to load history", error);
                if (isMounted) setGenerations([]);
            } finally { if (isMounted) setIsLoading(false); }
        };

        fetchHistory();

        const hasPending = generations.some(g => g.status === 'pending');
        const pollInterval = setInterval(() => {
            if (hasPending) {
                fetchHistory(false);
            }
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };
    }, [user, isUserLoading, generations]);

    const handlePublish = async (item) => {
        if (!item) return;
        const newStatus = !item.is_public;
        setGenerations(prev => prev.map(g => g.id === item.id ? { ...g, is_public: newStatus } : g));
        setSelectedItem(prev => prev ? { ...prev, is_public: newStatus } : null);
        try {
            const res = await galleryAPI.togglePublic(item.id, newStatus);
            if (!res.success) throw new Error('Failed');
        } catch {
            setGenerations(prev => prev.map(g => g.id === item.id ? { ...g, is_public: !newStatus } : g));
            setSelectedItem(prev => prev ? { ...prev, is_public: !newStatus } : null);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm('Удалить этот шедевр?')) return;
        setGenerations(prev => prev.filter(g => g.id !== item.id));
        setSelectedItem(null);
        try { await galleryAPI.deleteCreation(item.id); } catch { window.location.reload(); }
    };

    const handleRepeat = (item) => {
        navigate(`/generate/${item.type === 'video' ? 'video-gen' : 'image-gen'}`, {
            state: { prompt: item.prompt, model: item.model_id }
        });
    };

    const handleDownload = async (item) => {
        const url = item.image_url;
        const filename = `pixel-gen-${item.id.slice(0, 8)}.${item.type === 'video' ? 'mp4' : 'png'}`;
        if (window.Telegram?.WebApp?.downloadFile) {
            try { window.Telegram.WebApp.downloadFile({ url, file_name: filename }); return; } catch { }
        }
        try {
            const res = await fetch(url, { mode: 'cors' });
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl; a.download = filename; a.click();
            window.URL.revokeObjectURL(blobUrl);
        } catch { window.open(url, '_blank'); }
    };

    const handleSaveToCollection = async (collectionName, itemId) => {
        const currentItems = collections[collectionName] || [];

        let newCollections;
        if (currentItems.includes(itemId)) {
            newCollections = {
                ...collections,
                [collectionName]: currentItems.filter(id => id !== itemId)
            };
            if (newCollections[collectionName].length === 0) {
                delete newCollections[collectionName];
            }
        } else {
            newCollections = {
                ...collections,
                [collectionName]: [...currentItems, itemId]
            };
        }

        setCollections(newCollections);
        await setItem('bazzar_collections', JSON.stringify(newCollections));
        setShowCollectionModal(false);
        setNewCollectionName('');
    };

    const filteredGenerations = useMemo(() => {
        return generations
            .filter(gen => {
                const searchMatch = !searchQuery ||
                    (gen.prompt && gen.prompt.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (gen.model_id && gen.model_id.toLowerCase().includes(searchQuery.toLowerCase()));
                const typeMatch = filterType === 'all' || gen.type === filterType;
                const collectionMatch = activeCollection === 'all' ||
                    (collections[activeCollection] && collections[activeCollection].includes(gen.id));
                return searchMatch && typeMatch && collectionMatch;
            })
            .sort((a, b) => {
                if (sortBy === 'likes') return (b.likes_count || 0) - (a.likes_count || 0);
                return new Date(b.created_at) - new Date(a.created_at);
            });
    }, [generations, searchQuery, filterType, sortBy, activeCollection, collections]);

    const handleCardClick = (gen) => {
        if (isSelectionMode) {
            setSelectedCompareIds(prev =>
                prev.includes(gen.id) ? prev.filter(id => id !== gen.id) : [...prev, gen.id].slice(0, 4)
            );
        } else {
            setSelectedItem(gen);
        }
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedCompareIds([]);
    };

    if (isLoading) return <HistoryLoadingSkeleton />;

    if (!generations || generations.length === 0) {
        return <HistoryEmpty onCreateClick={() => navigate('/create')} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-4 pb-32 px-4 bg-[#1c1c1e] min-h-screen text-white font-sans"
        >
            <SEO title="История генераций — Bazzar Pixel" description="Просматривай и управляй своими AI творениями" />
            
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mb-6 px-1 flex items-end justify-between"
            >
                <div>
                    <div className="flex items-center gap-2">
                        <motion.h1 className="text-[28px] font-bold leading-tight" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            История
                        </motion.h1>
                        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}>
                            <SparkleIcon size={22} className="text-[#007aff]" />
                        </motion.div>
                    </div>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-[13px] text-gray-400 font-medium">
                        {generations.length} {(generations.length === 1 || (generations.length % 10 === 1 && generations.length !== 11)) ? 'работа' : (generations.length < 5 || (generations.length % 10 < 5 && generations.length % 10 > 0 && (generations.length < 10 || generations.length > 20))) ? 'работы' : 'работ'}
                    </motion.p>
                </div>

                {generations.length > 1 && (
                    <button
                        onClick={toggleSelectionMode}
                        className={`text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors ${isSelectionMode ? 'bg-[#007aff] text-white' : 'bg-[#2c2c2e] text-white'}`}
                    >
                        {isSelectionMode ? 'Отмена' : 'Сравнить'}
                    </button>
                )}
            </motion.div>

            <AnimatePresence>
                {isSelectionMode && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="bg-[#2c2c2e] p-3 rounded-2xl flex items-center justify-between">
                            <span className="text-sm font-medium pl-2">
                                Выбрано: {selectedCompareIds.length} / 4
                            </span>
                            <button
                                disabled={selectedCompareIds.length < 2}
                                onClick={() => setShowCompareModal(true)}
                                className="bg-[#007aff] text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Сравнить
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <HistoryFilter
                collections={collections}
                activeCollection={activeCollection}
                setActiveCollection={setActiveCollection}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filterType={filterType}
                setFilterType={setFilterType}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            <HistoryGrid
                filteredGenerations={filteredGenerations}
                selectedCompareIds={selectedCompareIds}
                isSelectionMode={isSelectionMode}
                handleCardClick={handleCardClick}
            />

            <HistoryModal
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                handleRepeat={handleRepeat}
                handlePublish={handlePublish}
                handleDownload={handleDownload}
                handleDelete={handleDelete}
                navigate={navigate}
                setShowCollectionModal={setShowCollectionModal}
                showCollectionModal={showCollectionModal}
                collections={collections}
                handleSaveToCollection={handleSaveToCollection}
                newCollectionName={newCollectionName}
                setNewCollectionName={setNewCollectionName}
            />

            <CompareModal
                isOpen={showCompareModal}
                onClose={() => setShowCompareModal(false)}
                items={generations.filter(g => selectedCompareIds.includes(g.id))}
            />
        </motion.div>
    );
};

export default HistoryView;
