import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, X, Zap, Smile, Download, Trash2, CheckCircle, Loader2,
    ChevronRight, Send, Package, ExternalLink, Info, ChevronDown,
    Sparkles, Image as ImageIcon, Wand2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '../context/SoundContext';
import { useUser } from '../context/UserContext';
import { STICKER_PACKS } from '../config/stickerPacks';

const StickersView = () => {
    const navigate = useNavigate();
    const { playSuccess, playClick } = useSound();
    const { pay, stats } = useUser();
    const playError = () => { };
    const scrollRef = useRef(null);

    const [sourceImage, setSourceImage] = useState(null);
    const [activePackType] = useState('static');
    const filteredPacks = STICKER_PACKS.filter(p => (p.type || 'static') === activePackType);
    const [selectedPack, setSelectedPack] = useState(filteredPacks[0] || STICKER_PACKS[0]);
    const [selectedStickers, setSelectedStickers] = useState({});
    const [results, setResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentSticker, setCurrentSticker] = useState('');
    const [useBranding, setUseBranding] = useState(true);
    const [isSending, setIsSending] = useState({});
    const [isCreatingPack, setIsCreatingPack] = useState(false);
    const [packLink, setPackLink] = useState(null);
    const [telegramId, setTelegramId] = useState(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '603207436');

    useEffect(() => {
        if (filteredPacks.length > 0 && !filteredPacks.find(p => p.id === selectedPack.id)) {
            setSelectedPack(filteredPacks[0]);
            setSelectedStickers({});
        }
    }, [activePackType, filteredPacks, selectedPack.id]);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => { setSourceImage(ev.target.result); playClick(); };
            reader.readAsDataURL(file);
        }
    };

    const toggleSticker = (stickerId) => {
        setSelectedStickers(prev => ({ ...prev, [stickerId]: !prev[stickerId] }));
        playClick();
    };

    const selectAll = () => {
        const all = {};
        selectedPack.stickers.forEach(s => { all[s.id] = true; });
        setSelectedStickers(all);
        playClick();
    };

    const deselectAll = () => { setSelectedStickers({}); playClick(); };

    const selectedCount = Object.values(selectedStickers).filter(Boolean).length;
    const baseCost = Math.min(selectedCount * 20, 90);
    const brandingFee = useBranding ? 0 : 20;
    const totalCost = baseCost + brandingFee;

    const generateStickers = async () => {
        if (!sourceImage || selectedCount === 0) return;

        const payment = await pay(totalCost);
        if (!payment.success) {
            alert('Недостаточно средств! Пополните баланс.');
            return;
        }

        setIsProcessing(true);
        const stickersToGenerate = selectedPack.stickers.filter(s => selectedStickers[s.id]);
        setResults(stickersToGenerate.map(s => ({ ...s, status: 'pending', resultUrl: null })));
        setProgress(0);
        playClick();

        try {
            const total = stickersToGenerate.length;
            const newResults = stickersToGenerate.map(s => ({ ...s, status: 'pending' }));

            for (let i = 0; i < total; i++) {
                const sticker = stickersToGenerate[i];
                setCurrentSticker(sticker.title);
                try {
                    const response = await fetch('/api/generate-stickers', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(window.Telegram?.WebApp?.initData
                                ? { 'x-telegram-init-data': window.Telegram.WebApp.initData }
                                : {})
                        },
                        body: JSON.stringify({
                            source_image: sourceImage,
                            prompt: sticker.prompt,
                            type: selectedPack.type || 'static',
                            videoUrl: sticker.videoUrl,
                            userId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'browser_user'
                        })
                    });

                    const text = await response.text();
                    let data;
                    try { data = JSON.parse(text); } catch { throw new Error('Invalid server response'); }
                    if (!response.ok) throw new Error(data.error || 'Generation failed');

                    if (data.success && data.imageUrl) {
                        newResults[i] = { ...sticker, status: 'success', resultUrl: data.imageUrl };
                    } else {
                        newResults[i] = { ...sticker, status: 'error' };
                    }
                } catch (err) {
                    console.error(`Failed to generate ${sticker.title}:`, err);
                    newResults[i] = { ...sticker, status: 'error' };
                }

                setResults([...newResults]);
                setProgress(((i + 1) / total) * 100);

                if (i < total - 1) {
                    setCurrentSticker('Ожидание (лимит запросов)...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }

            setIsProcessing(false);
            setCurrentSticker('');
            playSuccess();
        } catch (error) {
            console.error('Pack generation failed:', error);
            setIsProcessing(false);
        }
    };

    const downloadSticker = (url, title) => {
        const link = document.createElement('a');
        link.href = url;
        const ext = url.includes('.webm') ? 'webm' : url.includes('.mp4') ? 'mp4' : 'png';
        link.download = `sticker_${title.replace(/\s+/g, '_').toLowerCase()}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [sentToast, setSentToast] = useState(null);

    const sendToBot = async (sticker, idx) => {
        setIsSending(prev => ({ ...prev, [idx]: true }));
        try {
            const response = await fetch('/api/send-sticker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId,
                    imageUrl: sticker.resultUrl,
                    emoji: sticker.emoji || '😊'
                })
            });
            if (response.ok) {
                playSuccess();
                setSentToast(idx);
                setTimeout(() => setSentToast(null), 2000);
            } else {
                playError();
            }
        } catch (err) {
            console.error('Send sticker failed:', err);
        } finally {
            setIsSending(prev => ({ ...prev, [idx]: false }));
        }
    };

    const createStickerPack = async () => {
        const successStickers = results.filter(s => s.status === 'success');
        if (successStickers.length === 0) return;
        if (!telegramId) { alert('Пожалуйста, введите ваш Telegram ID'); return; }

        setIsCreatingPack(true);
        try {
            const response = await fetch('/api/create-sticker-pack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId,
                    stickers: successStickers.map(s => ({
                        url: new URL(s.resultUrl, window.location.origin).href,
                        emoji: s.emoji || '😊'
                    })),
                    packTitle: `${selectedPack.name} — Pixel AI`,
                    addBranding: useBranding
                })
            });
            const data = await response.json();
            if (data.success && data.packLink) {
                setPackLink(data.packLink);
                playSuccess();
            } else {
                throw new Error(data.error || 'Failed to create pack');
            }
        } catch (err) {
            console.error('Create pack failed:', err);
        } finally {
            setIsCreatingPack(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col md:max-w-3xl md:mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-black/95 backdrop-blur-xl z-30 pt-[calc(env(safe-area-inset-top)+10px)] border-b border-white/5">
                <div onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center -ml-2 active:opacity-60">
                    <ChevronDown className="rotate-90 text-accent-blue" size={28} />
                </div>
                <h1 className="text-[17px] font-semibold tracking-tight flex-1 text-center mr-6">
                    AI Стикеры
                </h1>
                <div className="absolute right-4 flex items-center gap-1.5 bg-bg-elevated px-2.5 py-1 rounded-full">
                    <Zap size={14} className="fill-[#ffcc00] text-[#ffcc00]" />
                    <span className="text-[15px] font-semibold">{stats?.current_balance || 0}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-44 pt-4 space-y-5">

                {/* How It Works */}
                <div className="px-4">
                    <div className="bg-bg-secondary rounded-card p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <Info size={14} className="text-accent-blue" />
                            <h3 className="text-[13px] font-bold text-text-secondary uppercase tracking-wider">Как это работает</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { emoji: '📸', text: 'Загрузите селфи — чёткое фото лица' },
                                { emoji: '🎨', text: 'Выберите стикерпак и отметьте стикеры' },
                                { emoji: '🤖', text: 'ИИ создаст стикеры с вашим лицом' },
                                { emoji: '📲', text: 'Добавьте набор в Telegram одной кнопкой' }
                            ].map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-center gap-3"
                                >
                                    <span className="text-base">{step.emoji}</span>
                                    <span className="text-[13px] text-text-secondary leading-snug">{step.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {!isProcessing && results.length === 0 && (
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-4 space-y-5">

                        {/* 1. Upload Face */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                <span className="w-5 h-5 rounded-full bg-accent-blue text-white text-[10px] font-black flex items-center justify-center">1</span>
                                Загрузите фото
                            </label>
                            <div className="w-full h-44 bg-bg-secondary rounded-card border-2 border-dashed border-white/10 flex items-center justify-center relative overflow-hidden group hover:border-accent-blue/50 transition-all">
                                {sourceImage ? (
                                    <div className="relative w-full h-full">
                                        <img src={sourceImage} className="w-full h-full object-cover" alt="face" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSourceImage(null); }}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500/20 backdrop-blur-sm rounded-full">
                                            <span className="text-[10px] text-green-400 font-bold">✓ Фото загружено</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-4">
                                        <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                            <Upload size={24} className="text-accent-blue" />
                                        </div>
                                        <span className="text-xs font-medium text-text-secondary">Загрузите селфи</span>
                                        <p className="text-[10px] text-[#636366] mt-1">Чёткое фото лица для лучшего результата</p>
                                    </div>
                                )}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleUpload} />
                            </div>
                        </div>

                        {/* 2. Pack Selection */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                <span className="w-5 h-5 rounded-full bg-accent-blue text-white text-[10px] font-black flex items-center justify-center">2</span>
                                Выберите стикерпак
                            </label>

                            <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {filteredPacks.map(pack => (
                                    <button
                                        key={pack.id}
                                        onClick={() => { setSelectedPack(pack); setSelectedStickers({}); playClick(); }}
                                        className={`shrink-0 px-3.5 py-2.5 rounded-input text-[13px] font-semibold transition-all flex items-center gap-1.5 ${selectedPack.id === pack.id
                                            ? 'bg-accent-blue text-white shadow-lg shadow-[#007aff]/20'
                                            : 'bg-bg-secondary text-text-secondary hover:text-white'
                                            }`}
                                    >
                                        <span className="text-base">{pack.emoji}</span>
                                        {pack.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Sticker Selection Grid */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                    <span className="w-5 h-5 rounded-full bg-accent-blue text-white text-[10px] font-black flex items-center justify-center">3</span>
                                    Выберите стикеры
                                </label>
                                <button
                                    onClick={selectedCount === selectedPack.stickers.length ? deselectAll : selectAll}
                                    className="text-[11px] font-bold text-accent-blue"
                                >
                                    {selectedCount === selectedPack.stickers.length ? 'Снять все' : 'Выбрать все'}
                                </button>
                            </div>

                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                {selectedPack.stickers.map(sticker => {
                                    const isSelected = !!selectedStickers[sticker.id];
                                    return (
                                        <motion.div
                                            key={sticker.id}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => toggleSticker(sticker.id)}
                                            className={`relative p-3 rounded-input cursor-pointer transition-all flex flex-col items-center gap-2 ${isSelected
                                                ? 'bg-accent-blue/15 border-2 border-accent-blue/60 ring-2 ring-[#007aff]/10'
                                                : 'bg-bg-secondary border-2 border-transparent hover:bg-bg-elevated'
                                                }`}
                                        >
                                            {sticker.videoUrl ? (
                                                <video src={sticker.videoUrl} className="w-16 h-16 object-contain" autoPlay loop muted playsInline />
                                            ) : (
                                                <span className="text-3xl">{sticker.preview}</span>
                                            )}
                                            <span className="text-[10px] font-bold text-text-secondary text-center leading-tight">{sticker.title}</span>
                                            {isSelected && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 right-1.5">
                                                    <CheckCircle size={16} className="text-accent-blue" fill="rgba(0,122,255,0.2)" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 4. Branding Toggle */}
                        <div
                            onClick={() => setUseBranding(!useBranding)}
                            className={`p-3 rounded-input border transition-all cursor-pointer flex items-center gap-3 ${useBranding
                                ? 'bg-accent-purple/10 border-purple-500/30'
                                : 'bg-bg-secondary border-white/5'
                                }`}
                        >
                            <Zap size={16} className={useBranding ? 'text-purple-400' : 'text-[#636366]'} fill={useBranding ? 'currentColor' : 'none'} />
                            <div className="flex-1">
                                <span className="text-[13px] font-bold text-white">Вотермарка {useBranding ? '(Бесплатно)' : '(+20 ⚡️)'}</span>
                                <p className="text-[9px] text-[#636366]">@Pixel_ai_bot</p>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${useBranding ? 'bg-purple-600' : 'bg-[#48484a]'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${useBranding ? 'right-0.5' : 'left-0.5'}`} />
                            </div>
                        </div>

                    </motion.div>
                )}

                {/* Processing UI */}
                {isProcessing && (
                    <div className="px-4 py-16 text-center space-y-5">
                        <div className="relative w-28 h-28 mx-auto">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="56" cy="56" r="52" stroke="#1c1c1e" strokeWidth="6" fill="transparent" />
                                <circle cx="56" cy="56" r="52" stroke="#007aff" strokeWidth="6" fill="transparent"
                                    strokeDasharray={327} strokeDashoffset={327 - (327 * progress) / 100}
                                    strokeLinecap="round" className="transition-all duration-500 ease-out" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black text-white">{Math.round(progress)}%</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Генерируем стикеры...</h3>
                            {currentSticker && (
                                <p className="text-sm text-text-secondary mt-1">Сейчас: <span className="text-accent-blue">{currentSticker}</span></p>
                            )}
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-6">
                                {results.map((s, idx) => (
                                <div key={idx} className="aspect-square rounded-input bg-bg-secondary border border-white/5 flex items-center justify-center overflow-hidden">
                                    {s.status === 'success' ? (
                                        <img src={s.resultUrl} className="w-full h-full object-contain p-1" alt={s.title} />
                                    ) : s.status === 'error' ? (
                                        <X size={20} className="text-red-500/50" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xl opacity-30">{s.preview}</span>
                                            <Loader2 size={12} className="text-accent-blue animate-spin opacity-30" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results */}
                {!isProcessing && results.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold text-sm">Результат: {selectedPack.name}</h3>
                            {!window.Telegram?.WebApp?.initDataUnsafe?.user && (
                                <input
                                    type="text" value={telegramId}
                                    onChange={(e) => setTelegramId(e.target.value)}
                                    placeholder="Telegram ID"
                                    className="bg-bg-elevated text-white text-xs px-2 py-1 rounded-lg border border-white/10 w-28 text-center"
                                />
                            )}
                            <button
                                onClick={() => { setResults([]); setProgress(0); setSelectedStickers({}); setPackLink(null); }}
                                className="text-[11px] font-bold text-accent-blue"
                            >
                                ← Назад
                            </button>
                        </div>

                        {/* Create Pack Button */}
                        {!packLink ? (
                            <motion.button
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={createStickerPack}
                                disabled={isCreatingPack || results.filter(s => s.status === 'success').length === 0}
                                className="w-full py-3.5 rounded-input bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20 disabled:opacity-50 transition-all"
                            >
                                {isCreatingPack ? (
                                    <><Loader2 size={18} className="animate-spin" /> Создаём стикерпак...</>
                                ) : (
                                    <><Package size={18} /> Добавить в Telegram</>
                                )}
                            </motion.button>
                        ) : (
                            <motion.a
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                href={packLink} target="_blank" rel="noopener noreferrer"
                                className="w-full py-3.5 rounded-input bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-green-500/20 no-underline transition-all"
                            >
                                <ExternalLink size={18} /> Открыть стикерпак
                            </motion.a>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {results.map((sticker, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="bg-bg-secondary rounded-card overflow-hidden border border-white/5 group relative aspect-square"
                                >
                                    {sticker.status === 'success' ? (
                                        <>
                                            {(sticker.resultUrl.includes('.webm') || sticker.resultUrl.includes('.mp4')) ? (
                                                <video src={sticker.resultUrl} className="w-full h-full object-contain p-2" autoPlay loop muted playsInline />
                                            ) : (
                                                <img src={sticker.resultUrl} className="w-full h-full object-contain p-2" alt={sticker.title} />
                                            )}
                                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button onClick={() => downloadSticker(sticker.resultUrl, sticker.title)}
                                                    className="w-9 h-9 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20 transition">
                                                    <Download size={16} />
                                                </button>
                                                <button onClick={() => sendToBot(sticker, idx)}
                                                    disabled={isSending[idx]}
                                                    className="w-9 h-9 rounded-full bg-accent-blue text-white flex items-center justify-center hover:bg-[#005ec4] transition disabled:opacity-50">
                                                    {isSending[idx] ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                </button>
                                            </div>
                                            {sentToast === idx && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-0 bg-green-600/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-card z-10"
                                                >
                                                    <CheckCircle size={28} className="text-white mb-1.5" />
                                                    <span className="text-[10px] font-bold text-white text-center leading-tight px-2">Отправлено в диалог бота!</span>
                                                </motion.div>
                                            )}
                                        </>
                                    ) : sticker.status === 'error' ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center">
                                            <X size={24} className="text-red-500/50 mb-1" />
                                            <span className="text-[9px] text-[#636366] font-bold">Ошибка</span>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Loader2 size={24} className="text-accent-blue animate-spin opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full">
                                        <p className="text-[8px] text-white font-bold text-center truncate">{sticker.emoji} {sticker.title}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Bottom Action Button */}
            {!isProcessing && results.length === 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-black/95 backdrop-blur-xl border-t border-white/5 z-40">
                    <button
                        disabled={!sourceImage || selectedCount === 0 || isProcessing}
                        onClick={generateStickers}
                        className={`w-full h-[50px] rounded-input flex items-center justify-center gap-2 text-[17px] font-semibold transition-all active:scale-[0.98]
                            ${!sourceImage || selectedCount === 0
                                ? 'bg-bg-elevated text-text-secondary'
                                : 'bg-accent-blue text-white hover:bg-accent-blue shadow-sm'
                            }`}
                    >
                        {selectedCount === 0 ? 'Выберите стикеры' : (
                            <>
                                <span>Сгенерировать</span>
                                <span className="bg-black/20 px-2 py-0.5 rounded-md text-[13px] ml-1 flex items-center gap-1 font-semibold">
                                    <Zap size={12} fill="currentColor" /> {totalCost}
                                </span>
                            </>
                        )}
                    </button>
                    {!sourceImage && selectedCount > 0 && (
                        <p className="text-[10px] text-center text-[#636366] mt-2">Сначала загрузите фото ☝️</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default StickersView;
