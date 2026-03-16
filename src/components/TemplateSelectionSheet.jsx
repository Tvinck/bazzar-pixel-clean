import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '../context/SoundContext';

const TemplateSelectionSheet = ({ template, isOpen, onClose }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const { playClick } = useSound();

    // Cleanup body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!template) return null;

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            playClick();
            onClose(); // close sheet
            // Delay navigation slightly so the sheet close animation plays
            setTimeout(() => {
                navigate(`/template/${template.id}`, {
                    state: { template, initialFile: file }
                });
            }, 100);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { playClick(); onClose(); }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 inset-x-0 bg-bg-secondary rounded-t-[32px] pt-6 pb-12 px-5 z-[101] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10 flex flex-col items-center"
                    >
                        {/* Drag Handle (Visual only) */}
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mb-6" />

                        {/* Top Close Button (Desktop or generic style) */}
                        <button
                            onClick={() => { playClick(); onClose(); }}
                            className="absolute top-5 left-5 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X size={18} className="text-white" />
                        </button>

                        {/* Images Illustration Block */}
                        <div className="flex justify-center items-center w-full mb-8 mt-2 relative perspective-[1000px]">
                            {/* Left Image: Placeholder Selfie */}
                            <motion.div
                                initial={{ x: -20, rotate: -15, opacity: 0 }}
                                animate={{ x: 0, rotate: -8, opacity: 1 }}
                                transition={{ delay: 0.1, type: "spring" }}
                                className="w-[110px] aspect-[4/5] rounded-card overflow-hidden shadow-2xl relative z-10 border-[3px] border-white/10 bg-bg-elevated"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop"
                                    alt="Selfie Example"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                            </motion.div>

                            {/* Arrow / Connection */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                            >
                                <div className="bg-white p-2 rounded-full shadow-lg text-black">
                                    <ArrowRight size={20} strokeWidth={3} />
                                </div>
                            </motion.div>

                            {/* Right Image: Template Preview */}
                            <motion.div
                                initial={{ x: 20, rotate: 15, opacity: 0 }}
                                animate={{ x: 0, rotate: 8, opacity: 1 }}
                                transition={{ delay: 0.15, type: "spring" }}
                                className="w-[110px] aspect-[4/5] rounded-card overflow-hidden shadow-2xl relative z-10 border-[3px] border-white/10 ml-[-15px] bg-bg-elevated"
                            >
                                <img
                                    src={template.src}
                                    alt={template.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                            </motion.div>
                        </div>

                        {/* Title Text */}
                        <div className="text-center mb-8 px-2">
                            <h2 className="text-[22px] font-bold leading-[1.3] text-white tracking-tight">
                                Загрузите селфи или фото, чтобы создать <br />
                                <span className="text-[#3390ec] font-black">{template.title}</span>
                            </h2>
                        </div>

                        {/* Buttons */}
                        <div className="w-full space-y-3 px-2">
                            <button
                                onClick={() => { playClick(); fileInputRef.current?.click(); }}
                                className="w-full bg-accent-blue text-white rounded-card py-4 font-bold text-[17px] flex justify-center items-center gap-2.5 shadow-[0_8px_20px_rgba(51,144,236,0.3)] active:scale-95 transition-transform"
                            >
                                <Plus size={22} strokeWidth={2.5} /> Загрузить фото
                            </button>

                            <button
                                onClick={() => { playClick(); cameraInputRef.current?.click(); }}
                                className="w-full bg-bg-elevated text-white rounded-card py-4 font-bold text-[17px] flex justify-center items-center gap-2.5 active:scale-95 transition-transform"
                            >
                                <Camera size={22} strokeWidth={2.5} /> Открыть камеру
                            </button>
                        </div>

                        {/* Hidden Native File Inputs */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <input
                            type="file"
                            ref={cameraInputRef}
                            accept="image/*"
                            capture="user"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TemplateSelectionSheet;
