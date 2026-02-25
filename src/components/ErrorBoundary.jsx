import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        // Send to error tracking service (Sentry, etc.)
        if (window.Sentry) {
            window.Sentry.captureException(error, { extra: errorInfo });
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center p-4 font-sans">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md w-full bg-[#2c2c2e] rounded-[24px] shadow-2xl p-8 text-center border border-white/10"
                    >
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring' }}
                            className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-red-500/20 blur-xl"></div>
                            <AlertTriangle size={40} className="text-red-500 relative z-10" />
                        </motion.div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-white mb-3">
                            Упс! Что-то пошло не так
                        </h1>

                        {/* Description */}
                        <p className="text-gray-400 mb-8 text-[15px] leading-relaxed">
                            Произошла непредвиденная ошибка. Мы уже работаем над её исправлением.
                        </p>

                        {/* Error Details (Development only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 text-left">
                                <div className="bg-black/30 rounded-xl p-4 text-xs font-mono overflow-auto max-h-40 border border-white/5 custom-scrollbar">
                                    <p className="text-red-400 mb-2 font-bold">
                                        {this.state.error.toString()}
                                    </p>
                                    <pre className="text-gray-500 whitespace-pre-wrap">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={this.handleReset}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#007aff] text-white font-bold rounded-[16px] shadow-lg shadow-blue-500/20 transition-all hover:bg-[#0069d9]"
                            >
                                <RefreshCw size={18} />
                                Попробовать снова
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={this.handleGoHome}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white/10 text-white font-bold rounded-[16px] hover:bg-white/15 transition-all"
                            >
                                <Home size={18} />
                                На главную
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

// Hook for error handling
export const useErrorHandler = () => {
    const [error, setError] = React.useState(null);

    const handleError = React.useCallback((error, context = {}) => {
        console.error('Error:', error, context);
        setError(error);

        // Send to error tracking
        if (window.Sentry) {
            window.Sentry.captureException(error, { extra: context });
        }
    }, []);

    const clearError = React.useCallback(() => {
        setError(null);
    }, []);

    return { error, handleError, clearError };
};
