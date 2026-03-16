import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Zap, UserPlus, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { AnimatedButton } from '../ui/AnimatedButtons';
import { useLanguage } from '../../context/LanguageContext';
import { useSound } from '../../context/SoundContext';
import { aiService } from '../../ai-client';
import { validateFile } from '../../utils/validation';
import { useUser } from '../../context/UserContext';
import InsufficientCreditsModal from '../InsufficientCreditsModal';

const AvatarTrainer = ({ isOpen, onClose }) => {
    const { playSuccess, playClick } = useSound();
    const { stats } = useUser();

    // State
    const [images, setImages] = useState([]);
    const [triggerWord, setTriggerWord] = useState('');
    const [modelType, setModelType] = useState('person'); // person, style
    const [isTraining, setIsTraining] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, training, success, error
    const [showCreditModal, setShowCreditModal] = useState(false);

    const handleUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // Validation using utility
        const validFilesToAdd = [];

        files.forEach(file => {
            const validation = validateFile(file, {
                maxSize: 10 * 1024 * 1024, // 10MB
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
            });

            if (validation.valid) {
                validFilesToAdd.push(file);
            } else {
                alert(`Пропущено ${file.name}: ${validation.error}`);
            }
        });

        const remainingSlots = 10 - images.length;
        const finalFiles = validFilesToAdd.slice(0, remainingSlots);

        finalFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImages(prev => [...prev, ev.target.result]);
            };
            reader.readAsDataURL(file);
        });

        if (finalFiles.length > 0) playClick();
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const startTraining = async () => {
        if (images.length < 5) return;
        if (!triggerWord.trim()) return;

        // Cost check (Placeholder: 0 for now as backend is stub)
        const COST = 0;
        if ((stats?.current_balance || 0) < COST) {
            setShowCreditModal(true);
            return;
        }

        setIsTraining(true);
        setStatus('training');
        playClick();

        try {

            // Use Secure API
            const result = await aiService.trainModel(images, triggerWord, modelType);

            if (result.success) {
                setStatus('success');
                playSuccess();
            } else {
                throw new Error(result.error || 'Не удалось начать тренировку');
            }

        } catch (error) {
            console.error('Training Error:', error);
            setStatus('error');
            // If secure API throws, we catch it here
            alert(`Ошибка: ${error.message}`);
        } finally {
            setIsTraining(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-[100] flex flex-col overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
                    <h2 className="text-white font-bold flex items-center gap-2"><UserPlus className="text-accent-purple" /> Тренировка AI Аватара</h2>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center"><X /></button>
                </div>

                <div className="p-4 space-y-6 max-w-lg mx-auto w-full">
                    {/* Info Card */}
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            <Zap size={16} className="text-yellow-400" />
                            Как это работает?
                        </h3>
                        <p className="text-slate-400 text-sm">
                            Загрузите 5-10 фото себя (селфи, разные ракурсы, освещение).
                            Мы обучим персональную модель, которой вы сможете пользоваться.
                        </p>
                    </div>

                    {/* Upload Area */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-white font-bold">Фотографии ({images.length}/10)</span>
                            <span className="text-xs text-slate-500">Мин. 5 фото</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {images.map((img, i) => (
                                <div key={i} className="aspect-square relative rounded-xl overflow-hidden group border border-white/10">
                                    <img src={img} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => handleRemoveImage(i)}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}

                            {images.length < 10 && (
                                <label className="aspect-square bg-slate-800 rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-slate-700 hover:border-purple-500 transition-colors">
                                    <Upload size={24} className="text-slate-400 mb-1" />
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Добавить</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-slate-400 text-sm font-bold mb-2 block">Кодовое слово (Триггер)</label>
                            <input
                                type="text"
                                placeholder="например: ohwx man"
                                value={triggerWord}
                                onChange={(e) => setTriggerWord(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors"
                            />
                            <p className="text-[10px] text-slate-600 mt-1">Уникальное слово для вызова вашего персонажа в промптах.</p>
                        </div>

                        <div>
                            <label className="text-slate-400 text-sm font-bold mb-2 block">Тип модели</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setModelType('person')}
                                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${modelType === 'person' ? 'bg-accent-purple/20 border-purple-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                >
                                    Человек
                                </button>
                                <button
                                    onClick={() => setModelType('style')}
                                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${modelType === 'style' ? 'bg-accent-purple/20 border-purple-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                >
                                    Стиль
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="pt-4">
                        {status === 'success' ? (
                            <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 text-center">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                                    <CheckCircle size={32} className="text-white" />
                                </div>
                                <h3 className="text-white font-bold text-xl mb-1">Успешно!</h3>
                                <p className="text-green-200 text-sm">Тренировка началась. Это займет около 20-30 минут. Мы уведомим вас.</p>
                                <button onClick={onClose} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm">Закрыть</button>
                            </div>
                        ) : (
                            <AnimatedButton
                                onClick={startTraining}
                                disabled={images.length < 5 || !triggerWord || isTraining}
                                className={`w-full py-4 text-lg font-black tracking-wide bg-gradient-to-r from-purple-600 to-indigo-600 ${images.length < 5 || !triggerWord ? 'opacity-50 grayscale' : ''}`}
                            >
                                {isTraining ? 'Запуск...' : 'Начать тренировку'}
                            </AnimatedButton>
                        )}
                    </div>
                </div>

                <InsufficientCreditsModal
                    isOpen={showCreditModal}
                    onClose={() => setShowCreditModal(false)}
                    onTopUp={() => { onClose(); }}
                />

            </motion.div>
        </AnimatePresence>
    );
};

export default AvatarTrainer;
