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
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 text-center"
                    >
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring' }}
                            className="w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6"
                        >
                            <AlertTriangle size={40} className="text-white" />
                        </motion.div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Упс! Что-то пошло не так
                        </h1>

                        {/* Description */}
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Произошла непредвиденная ошибка. Мы уже работаем над её исправлением.
                        </p>

                        {/* Error Details (Development only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Детали ошибки (только для разработки)
                                </summary>
                                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 text-xs font-mono overflow-auto max-h-40">
                                    <p className="text-rose-600 dark:text-rose-400 mb-2">
                                        {this.state.error.toString()}
                                    </p>
                                    <pre className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </div>
                            </details>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={this.handleReset}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <RefreshCw size={18} />
                                Попробовать снова
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={this.handleGoHome}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
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
