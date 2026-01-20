import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Zap, ArrowRightLeft, Smile, Image as ImageIcon } from 'lucide-react';
import { AnimatedButton } from '../ui/AnimatedButtons';
import { useLanguage } from '../../context/LanguageContext';
import { useSound } from '../../context/SoundContext';

const FaceSwap = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const { playSuccess, playClick } = useSound();

    const [targetImage, setTargetImage] = useState(null); // The body/scene
    const [sourceImage, setSourceImage] = useState(null); // The face to use
    const [resultImage, setResultImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Helpers to handle upload
    const handleUpload = (e, setImg) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImg(ev.target.result);
                playClick();
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSwap = async () => {
        if (!targetImage || !sourceImage) return;

        setIsProcessing(true);
        playClick();

        try {
            // Call API (using mock for now or real service if wired)
            // await aiService.swapFace(targetImage, sourceImage);

            // Mock simulation
            setTimeout(() => {
                setResultImage(targetImage); // Mock result (just simplified)
                setIsProcessing(false);
                playSuccess();
            }, 3000);

        } catch (error) {
            console.error('Swap failed:', error);
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-[100] flex flex-col overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
                    <h2 className="text-white font-bold flex items-center gap-2"><ArrowRightLeft className="text-cyan-400" /> Face Swap</h2>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center"><X /></button>
                </div>

                <div className="p-6 space-y-8 flex-1 flex flex-col items-center max-w-lg mx-auto w-full">

                    {/* 1. Target Image (The Scene) */}
                    <div className="w-full space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><ImageIcon size={14} /> 1. Upload Target (Body)</label>
                        <div className="w-full h-48 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group">
                            {targetImage ? (
                                <img src={targetImage} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-slate-500">
                                    <Upload size={30} className="mx-auto mb-2 opacity-50" />
                                    <span className="text-sm">Tap to upload scene</span>
                                </div>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleUpload(e, setTargetImage)} />
                        </div>
                    </div>

                    {/* 2. Source Image (The Face) */}
                    <div className="w-full space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Smile size={14} /> 2. Upload Face (Source)</label>
                        <div className="w-full h-48 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group">
                            {sourceImage ? (
                                <img src={sourceImage} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-slate-500">
                                    <Upload size={30} className="mx-auto mb-2 opacity-50" />
                                    <span className="text-sm">Tap to upload face</span>
                                </div>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleUpload(e, setSourceImage)} />
                        </div>
                    </div>

                    {/* Result */}
                    {resultImage && (
                        <div className="w-full space-y-2 animate-fade-in">
                            <label className="text-xs font-bold text-green-400 uppercase flex items-center gap-2"><Zap size={14} /> Result</label>
                            <div className="w-full aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/20 ring-2 ring-cyan-500 border border-white/10">
                                <img src={resultImage} className="w-full h-full object-contain" />
                            </div>
                        </div>
                    )}

                    {/* Action */}
                    <div className="w-full pt-4 pb-10">
                        <AnimatedButton
                            variant="primary"
                            disabled={!targetImage || !sourceImage || isProcessing}
                            onClick={handleSwap}
                            className={`w-full py-4 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ${isProcessing ? 'opacity-80' : ''}`}
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2"><ArrowRightLeft /> Swap Faces</span>
                            )}
                        </AnimatedButton>
                    </div>

                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FaceSwap;
