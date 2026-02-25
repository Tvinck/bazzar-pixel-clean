import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import GenerationResult from './GenerationResult'; // Re-use result modal if needed, or handle differently

const GenerationTopWidget = () => {
    const { activeGenerations, closeTask } = useUser();

    // We want to show:
    // 1. Minimized processing tasks
    // 2. Completed tasks (until dismissed)
    const visibleTasks = activeGenerations.filter(t =>
        (t.status === 'processing' && t.isMinimized) ||
        t.status === 'success' ||
        t.status === 'error'
    );

    // If result modal is open, we might want to hide this? 
    // Handled by local state in parent typically, but here we manage list.
    const [selectedResult, setSelectedResult] = useState(null);

    if (visibleTasks.length === 0 && !selectedResult) return null;

    return (
        <>
            {/* Top Floating Pill */}
            <div className="fixed top-[calc(env(safe-area-inset-top)+12px)] left-0 right-0 z-[9000] flex flex-col items-center gap-2 pointer-events-none px-4">
                <AnimatePresence>
                    {visibleTasks.map(task => (
                        <motion.div
                            key={task.id}
                            initial={{ y: -50, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -50, opacity: 0, scale: 0.9 }}
                            className="pointer-events-auto"
                        >
                            <TaskPill
                                task={task}
                                onClose={() => closeTask(task.id)}
                                onOpen={(result) => setSelectedResult({ ...result, type: task.type })}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Result Modal Overlay */}
            <AnimatePresence>
                {selectedResult && (
                    <GenerationResult
                        result={selectedResult}
                        type={selectedResult.type}
                        onClose={() => setSelectedResult(null)}
                        onRemix={() => setSelectedResult(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

const TaskPill = ({ task, onClose, onOpen }) => {
    const isProcessing = task.status === 'processing';
    const isSuccess = task.status === 'success';
    const isError = task.status === 'error';

    return (
        <div
            onClick={() => isSuccess && onOpen(task.result)}
            className={`
                h-12 pl-1 pr-3 rounded-full flex items-center gap-3 shadow-xl border backdrop-blur-xl transition-all cursor-pointer select-none
                ${isProcessing ? 'bg-slate-900/80 border-slate-700 text-white' : ''}
                ${isSuccess ? 'bg-white/90 border-white/50 text-slate-900 shadow-indigo-500/20' : ''}
                ${isError ? 'bg-red-500/90 border-red-400 text-white' : ''}
            `}
        >
            {/* Icon Box */}
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isProcessing ? 'bg-white/10' : ''}
                ${isSuccess ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white' : ''}
                ${isError ? 'bg-white/20' : ''}
            `}>
                {isProcessing && <Loader2 size={18} className="animate-spin text-indigo-400" />}
                {isSuccess && <Check size={20} strokeWidth={3} />}
                {isError && <X size={20} />}
            </div>

            {/* Text Content */}
            <div className="flex flex-col justify-center min-w-[80px]">
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider leading-tight">
                    {isProcessing ? 'Generating' : isSuccess ? 'Complete' : 'Error'}
                </span>
                <span className="text-xs font-bold leading-tight truncate max-w-[120px]">
                    {task.prompt || 'Creation'}
                </span>
            </div>

            {/* Action / Dismiss */}
            {!isProcessing && (
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-current opacity-50 hover:opacity-100 transition-opacity ml-1"
                >
                    <X size={12} />
                </button>
            )}
        </div>
    );
};

export default GenerationTopWidget;
