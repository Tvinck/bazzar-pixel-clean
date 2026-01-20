import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eraser, Download, Undo2, Image as ImageIcon, Wand2, Upload, Paintbrush, Loader2 } from 'lucide-react';
import { AnimatedButton } from '../ui/AnimatedButtons';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { aiService } from '../../ai-service';
import { tracking, EVENTS } from '../../lib/tracking';
import { captureError } from '../../lib/monitoring';

const InpaintingEditor = ({ isOpen, onClose, initialImage }) => {
    const { t } = useLanguage();
    const { toast } = useToast();

    // Refs
    const containerRef = useRef(null);
    const imageCanvasRef = useRef(null);
    const maskCanvasRef = useRef(null);

    // State
    const [image, setImage] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(30);
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [mode, setMode] = useState('brush'); // brush, eraser
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [history, setHistory] = useState([]); // Undo stack (snapshots of mask)

    // Load Image
    const handleImageUpload = useCallback((src) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            setImage(img);
            setResultImage(null);
            setHistory([]);

            // Calculate dimensions to fit container
            if (containerRef.current) {
                const container = containerRef.current;
                const maxWidth = container.clientWidth;
                const maxHeight = container.clientHeight;

                let w = img.width;
                let h = img.height;

                // Scale down logic
                const scale = Math.min(maxWidth / w, maxHeight / h, 1); // Never scale up

                // Or force fit to container if simpler, but aspect ratio matters
                const displayW = w * scale;
                const displayH = h * scale;

                setCanvasSize({ width: displayW, height: displayH });

                // We will rely on useEffect to draw once canvasSize is set
            }
        };
        img.onerror = () => toast.error('Failed to load image');
        img.src = src;
    }, [toast]);

    useEffect(() => {
        if (initialImage) {
            handleImageUpload(initialImage);
        }
    }, [initialImage, isOpen, handleImageUpload]);

    // Initialize/Draw Canvases when size/image changes
    useEffect(() => {
        if (!image || !imageCanvasRef.current || !maskCanvasRef.current) return;

        const imgCanvas = imageCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        const ctxImg = imgCanvas.getContext('2d');
        const ctxMask = maskCanvas.getContext('2d');

        // Set dimensions
        imgCanvas.width = canvasSize.width;
        imgCanvas.height = canvasSize.height;
        maskCanvas.width = canvasSize.width;
        maskCanvas.height = canvasSize.height;

        // Draw Image
        ctxImg.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
        ctxImg.drawImage(image, 0, 0, imgCanvas.width, imgCanvas.height);

        // Clear Mask
        ctxMask.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

    }, [image, canvasSize]);

    // Drawing Logic
    const getCoordinates = (e) => {
        if (!maskCanvasRef.current) return { x: 0, y: 0 };
        const rect = maskCanvasRef.current.getBoundingClientRect();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        if (!image || isProcessing || resultImage) return;
        setIsDrawing(true);
        draw(e);
    };

    const draw = (e) => {
        if (!isDrawing || !maskCanvasRef.current) return;
        const ctx = maskCanvasRef.current.getContext('2d');
        const { x, y } = getCoordinates(e);

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (mode === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = 'rgba(255, 105, 180, 0.5)'; // Hot pink, semi-transparent
        }

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const ctx = maskCanvasRef.current?.getContext('2d');
        ctx?.beginPath();
        saveHistory();
    };

    const saveHistory = () => {
        const canvas = maskCanvasRef.current;
        if (canvas) {
            setHistory(prev => [...prev.slice(-10), canvas.toDataURL()]); // Keep last 10
        }
    };

    const undo = () => {
        if (history.length === 0 || !maskCanvasRef.current) return;

        const newHistory = [...history];
        newHistory.pop(); // Remove current state
        const prevState = newHistory[newHistory.length - 1]; // Get prev

        setHistory(newHistory);

        const ctx = maskCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);

        if (prevState) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = prevState;
        }
    };

    // Manual Upload
    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File too large (max 5MB)');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => handleImageUpload(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    // Generate
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error('Please describe what to fill');
            return;
        }
        if (!image) return;

        setIsProcessing(true);
        tracking.track(EVENTS.GENERATION_STARTED, { type: 'inpainting' });

        try {
            // 1. Prepare Mask (White on Black) for API
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = canvasSize.width;
            maskCanvas.height = canvasSize.height;
            const maskCtx = maskCanvas.getContext('2d');

            // Fill black background
            maskCtx.fillStyle = 'black';
            maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

            // Draw the visible mask as White
            // We need to use the pixel data from maskCanvasRef (which is pink 0.5 alpha)
            // Strategy: Draw maskCanvasRef (source-over) onto this black canvas, but we need it to be SOLID WHITE.

            // Better strategy:
            // Iterate visible mask pixels? No, slow.
            // Composite operation? 
            // 'source-in' - retain only where both overlap.

            // Easiest: The maskCanvasRef has pixels where we painted.
            // We can draw it, then use 'source-in' with white fill.

            maskCtx.drawImage(maskCanvasRef.current, 0, 0);
            maskCtx.globalCompositeOperation = 'source-in';
            maskCtx.fillStyle = 'white';
            maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

            // Get base64
            const maskBase64 = maskCanvas.toDataURL('image/png').split(',')[1];

            // Get original image base64 (scaled to canvas size to match mask)
            // Or use stored image if original resolution is preferred, but mask must match.
            // Let's use canvas-sized image for consistency.
            const imgBase64 = imageCanvasRef.current.toDataURL('image/jpeg', 0.9).split(',')[1];

            // Call API
            const result = await aiService.editImage(
                prompt,
                imgBase64,
                maskBase64
            );

            if (result.success) {
                setResultImage(result.imageUrl);
                tracking.track(EVENTS.GENERATION_COMPLETED, { type: 'inpainting' });
                toast.success('Magic complete!');
            } else {
                throw new Error(result.error || 'Generation failed');
            }

        } catch (error) {
            console.error(error);
            captureError(error, { context: 'inpainting' });
            toast.error('Failed to edit image');
            tracking.track(EVENTS.GENERATION_FAILED, { type: 'inpainting', error: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 z-[100] flex flex-col h-[100dvh]"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-800 z-10">
                    <h2 className="text-white font-bold flex items-center gap-2"><Eraser className="text-pink-500" /> Magic Eraser</h2>
                    <div className="flex gap-2">
                        {history.length > 0 && !resultImage && (
                            <button onClick={undo} className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700">
                                <Undo2 size={20} />
                            </button>
                        )}
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#151515] checkered-bg" ref={containerRef}>
                    {!image ? (
                        <div className="text-center p-6">
                            <label className="cursor-pointer flex flex-col items-center gap-4 p-10 border-2 border-dashed border-slate-700 rounded-[2rem] hover:border-pink-500 transition-all hover:bg-slate-900/50 group">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Upload size={32} className="text-pink-500" />
                                </div>
                                <div>
                                    <span className="text-white font-bold text-lg block mb-1">Upload Photo</span>
                                    <span className="text-slate-500 text-sm">Tap to browse gallery</span>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                            </label>
                        </div>
                    ) : (
                        <div className="relative shadow-2xl rounded-lg overflow-hidden"
                            style={{ width: canvasSize.width, height: canvasSize.height }}>

                            {/* Result Overlay */}
                            {resultImage ? (
                                <div className="absolute inset-0 z-30">
                                    <img src={resultImage} alt="Result" className="w-full h-full object-contain" />
                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                        <button onClick={() => { setImage(null); setResultImage(null); }} className="px-4 py-2 bg-slate-900/80 text-white rounded-xl backdrop-blur-md text-sm font-bold border border-white/10">
                                            New
                                        </button>
                                        <button className="px-4 py-2 bg-green-500 text-white rounded-xl shadow-lg text-sm font-bold flex items-center gap-1">
                                            <Download size={16} /> Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Image Layer */}
                                    <canvas
                                        ref={imageCanvasRef}
                                        className="absolute inset-0 z-10"
                                    />

                                    {/* Drawing Layer */}
                                    <canvas
                                        ref={maskCanvasRef}
                                        className={`absolute inset-0 z-20 touch-none ${mode === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    />
                                </>
                            )}

                            {isProcessing && (
                                <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
                                    <Loader2 size={48} className="text-pink-500 animate-spin" />
                                    <span className="text-white font-bold animate-pulse">Doing Magic...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Controls */}
                {image && !resultImage && (
                    <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-5 pb-8 safe-area-bottom">
                        {/* Tools */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
                                <button
                                    onClick={() => setMode('brush')}
                                    className={`p-2.5 rounded-lg transition-all ${mode === 'brush' ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Paintbrush size={20} />
                                </button>
                                <button
                                    onClick={() => setMode('eraser')}
                                    className={`p-2.5 rounded-lg transition-all ${mode === 'eraser' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Eraser size={20} />
                                </button>
                            </div>

                            <div className="flex-1 flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-xl">
                                <span className="text-[10px] text-slate-400 font-bold uppercase w-8">Size</span>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                    className="flex-1 h-1 bg-slate-600 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                />
                                <div className="w-6 h-6 rounded-full bg-pink-500" style={{ transform: `scale(${brushSize / 50})` }} />
                            </div>
                        </div>

                        {/* Input & Action */}
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="What should be here?"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-2xl px-4 text-white placeholder:text-slate-600 outline-none"
                            />
                            <AnimatedButton
                                variant="primary"
                                icon={<Wand2 size={20} />}
                                onClick={handleGenerate}
                                disabled={isProcessing}
                                className="px-6 bg-gradient-to-r from-pink-500 to-rose-600 whitespace-nowrap"
                            >
                                Fill
                            </AnimatedButton>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default InpaintingEditor;
