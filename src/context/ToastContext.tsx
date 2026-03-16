import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// --- TYPES ---

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

export interface ToastContextType {
    success: (message: string, duration?: number) => number;
    error: (message: string, duration?: number) => number;
    warning: (message: string, duration?: number) => number;
    info: (message: string, duration?: number) => number;
}

// --- COMPONENTS ---

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

interface ToastProps {
    id: number;
    type: ToastType;
    message: string;
    onClose: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, onClose }) => {
    const icons = {
        success: <CheckCircle size={20} className="text-emerald-500" />,
        error: <XCircle size={20} className="text-rose-500" />,
        warning: <AlertCircle size={20} className="text-amber-500" />,
        info: <Info size={20} className="text-blue-500" />
    };

    const colors = {
        success: 'bg-bg-secondary/80 border-green-500/30 text-green-400',
        error: 'bg-bg-secondary/80 border-red-500/30 text-red-400',
        warning: 'bg-bg-secondary/80 border-yellow-500/30 text-yellow-400',
        info: 'bg-bg-secondary/80 border-blue-500/30 text-blue-400'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            className={`flex items-center gap-3 backdrop-blur-xl border rounded-card p-4 shadow-2xl w-full md:w-auto md:min-w-[320px] max-w-md pointer-events-auto ${colors[type]}`}
        >
            <div className={`p-2 rounded-full bg-white/5`}>
                {icons[type]}
            </div>
            <p className="flex-1 text-[13px] font-medium text-white leading-snug">
                {message}
            </p>
            <button
                onClick={() => onClose(id)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors opacity-70 hover:opacity-100"
            >
                < X size={14} className="text-white" />
            </button>
        </motion.div>
    );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    const toast: ToastContextType = {
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration),
        warning: (message, duration) => addToast(message, 'warning', duration),
        info: (message, duration) => addToast(message, 'info', duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:top-24 md:w-auto z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <Toast
                            key={t.id}
                            id={t.id}
                            type={t.type}
                            message={t.message}
                            onClose={removeToast}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
