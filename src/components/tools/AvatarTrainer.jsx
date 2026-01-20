import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Zap, UserPlus, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { AnimatedButton } from '../ui/AnimatedButtons';
import { useLanguage } from '../../context/LanguageContext';
import { useSound } from '../../context/SoundContext';
import { aiService } from '../../../ai-service';
import { validateFile } from '../../utils/validation';

const AvatarTrainer = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const { playSuccess, playClick } = useSound();

    // State
    const [images, setImages] = useState([]);
    const [triggerWord, setTriggerWord] = useState('');
    const [modelType, setModelType] = useState('person'); // person, style
    const [isTraining, setIsTraining] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, training, success, error

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
                alert(`Skipped ${file.name}: ${validation.error}`);
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

        setIsTraining(true);
        setStatus('training');
        playClick();

        try {
            console.log("Starting training for", triggerWord);

            // Use Secure API
            const result = await aiService.trainModel(images, triggerWord, modelType);

            if (result.success) {
                setStatus('success');
                playSuccess();
            } else {
                throw new Error(result.error || 'Training failed to start');
            }

        } catch (error) {
            console.error('Training Error:', error);
            setStatus('error');
            // If secure API throws, we catch it here
            alert(`Error: ${error.message}`);
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
                    <h2 className="text-white font-bold flex items-center gap-2"><UserPlus className="text-purple-500" /> AI Avatar Training</h2>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center"><X /></button>
                </div>

                {status === 'success' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center animate-fade-in">
                        <CheckCircle size={80} className="text-green-500" />
                        <h3 className="text-2xl font-bold text-white">Training Started!</h3>
                        <p className="text-slate-400 max-w-xs">
                            Your AI Avatar <b>{triggerWord}</b> is being trained. This usually takes about 20-30 minutes. You'll be notified when it's ready.
                        </p>
                        <AnimatedButton onClick={onClose} className="bg-slate-800 text-white px-8">Got it</AnimatedButton>
                    </div>
                ) : (
                    <div className="p-6 max-w-lg mx-auto w-full space-y-8 pb-20">

                        {/* Info */}
                        <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl">
                            <h4 className="flex items-center gap-2 text-purple-300 font-bold mb-2">
                                <Zap size={16} /> How it works
                            </h4>
                            <p className="text-xs text-purple-200/80 leading-relaxed">
                                Upload 5-10 clear photos of yourself. We will train a custom AI model (LoRA) that learns your face. Once done, you can generate yourself in any style!
                            </p>
                        </div>

                        {/* 1. Trigger Word */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">1. Name your Avatar (One Word)</label>
                            <input
                                type="text"
                                placeholder="e.g. oh_bazzar"
                                value={triggerWord}
                                onChange={(e) => setTriggerWord(e.target.value.replace(/\s/g, ''))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none"
                            />
                            <p className="text-[10px] text-slate-500">This will be the magic word you use in prompts.</p>
                        </div>

                        {/* 2. Upload Photos */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-400 uppercase">2. Upload Photos ({images.length}/10)</label>
                                {images.length < 5 && <span className="text-xs text-red-400">Min 5 required</span>}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {/* Upload Button */}
                                <label className="aspect-square bg-slate-800 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700/50 transition-colors">
                                    <Upload size={24} className="text-slate-400 mb-1" />
                                    <span className="text-[10px] text-slate-500 font-bold">Add Photo</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                                </label>

                                {/* Images */}
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => handleRemoveImage(i)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action */}
                        <div className="pt-4">
                            <AnimatedButton
                                variant="primary"
                                disabled={images.length < 5 || !triggerWord || isTraining}
                                onClick={startTraining}
                                className={`w-full py-4 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 ${isTraining ? 'opacity-80' : ''}`}
                            >
                                {isTraining ? 'Uploading & Starting...' : `Start Training (${images.length} Photos)`}
                            </AnimatedButton>
                            {status === 'error' && (
                                <p className="text-center text-red-400 text-xs mt-2">Failed to start training. Try again.</p>
                            )}
                        </div>

                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default AvatarTrainer;
