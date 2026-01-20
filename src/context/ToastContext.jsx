import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

const Toast = ({ id, type, message, onClose }) => {
    const icons = {
        success: <CheckCircle size={20} className="text-emerald-500" />,
        error: <XCircle size={20} className="text-rose-500" />,
        warning: <AlertCircle size={20} className="text-amber-500" />,
        info: <Info size={20} className="text-blue-500" />
    };

    const colors = {
        success: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
        error: 'from-rose-500/10 to-rose-500/5 border-rose-500/20',
        warning: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
        info: 'from-blue-500/10 to-blue-500/5 border-blue-500/20'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex items-center gap-3 bg-gradient-to-r ${colors[type]} backdrop-blur-xl border rounded-2xl p-4 shadow-lg w-full md:w-auto md:min-w-[300px] max-w-md pointer-events-auto`}
        >
            {icons[type]}
            <p className="flex-1 text-sm font-medium text-slate-900 dark:text-white">
                {message}
            </p>
            <button
                onClick={() => onClose(id)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
                <X size={16} className="text-slate-500" />
            </button>
        </motion.div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const toast = {
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
                    {toasts.map((toast) => (
                        <Toast
                            key={toast.id}
                            id={toast.id}
                            type={toast.type}
                            message={toast.message}
                            onClose={removeToast}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
