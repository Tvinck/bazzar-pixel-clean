import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, Loader2, AlertCircle, Zap, AlertTriangle, Gift, ThumbsUp, ThumbsDown, Paperclip, X, RotateCcw } from 'lucide-react';
import { getExpertById } from '../config/experts';
import { useUser } from '../context/UserContext';

/**
 * ExpertChatView - Chat interface for individual expert
 * Features: 
 * - Balance tracking and cost per message
 * - Free trial messages (first 3 free per expert)
 * - Quick suggestion buttons
 * - Response ratings (thumbs up/down)
 * - Chat history persistence
 */
export default function ExpertChatView() {
    const { expertId } = useParams();
    const navigate = useNavigate();
    const expert = getExpertById(expertId);
    const { stats, updateStats, telegramId, isLoading: isUserLoading } = useUser();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [error, setError] = useState(null);
    const [balance, setBalance] = useState(stats?.current_balance || 0);
    const [lowBalanceWarning, setLowBalanceWarning] = useState(null);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [freeMessagesLeft, setFreeMessagesLeft] = useState(3);
    const [suggestions, setSuggestions] = useState([]);
    const [image, setImage] = useState(null);
    const [isResetting, setIsResetting] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    // Cost per message (matches backend)
    const MESSAGE_COST = 1;

    // Scroll to bottom when messages change
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Load conversation history and suggestions on mount
    useEffect(() => {
        // Wait for user context to load
        if (isUserLoading) return;

        const loadConversation = async () => {
            try {
                setIsLoadingHistory(true);

                // Fetch conversation history
                const response = await fetch(`/api/experts/${expertId}/conversation`, {
                    headers: {
                        'X-TG-Data': window.Telegram?.WebApp?.initData || '',
                        'X-Dev-Auth-ID': telegramId?.toString() || window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || ''
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setBalance(data.balance);
                    updateStats({ current_balance: data.balance });
                    setFreeMessagesLeft(data.freeMessagesLeft);

                    if (data.messages && data.messages.length > 0) {
                        // Load existing messages
                        const loadedMessages = data.messages.map((m, idx) => ({
                            id: m.id || `msg-${idx}`,
                            dbId: m.id,
                            role: m.role,
                            content: m.content,
                            rating: m.rating,
                            timestamp: new Date(m.created_at),
                        }));
                        setMessages(loadedMessages);
                    } else {
                        // Add greeting for new conversation
                        addGreeting();
                    }
                } else {
                    addGreeting();
                }

                // Fetch suggestions
                const suggestRes = await fetch(`/api/experts/${expertId}/suggestions`);
                if (suggestRes.ok) {
                    const suggestData = await suggestRes.json();
                    setSuggestions(suggestData.suggestions || []);
                }
            } catch (err) {
                console.error('Failed to load conversation:', err);
                addGreeting();
            } finally {
                setIsLoadingHistory(false);
            }
        };

        if (expertId) {
            loadConversation();
        }
    }, [expertId, telegramId, isUserLoading, updateStats, addGreeting]);

    // Add initial greeting
    const addGreeting = useCallback(() => {
        const greetings = {
            health: 'Привет! 👋 Я помогу разобраться с симптомами. Что тебя беспокоит?',
            psychologist: 'Привет! 💜 Я здесь, чтобы выслушать. Как ты себя чувствуешь?',
            durov: 'Привет. Чем могу помочь?',
            nutritionist: 'Привет! 🥗 Готова помочь с питанием. Какой у тебя вопрос?',
            financier: 'Привет! 💵 Давай разберемся с финансами. О чем хочешь поговорить?',
            fitness: 'Привет! 💪 Готов к тренировке? Какие у тебя цели?',
            career: 'Привет! ✨ Рада помочь с карьерой. Что тебя интересует?',
            zhirinovsky: 'Здравствуйте! Я вас внимательно слушаю! Задавайте вопрос!',
            stylist: 'Привет! 👗 Давай найдем твой стиль! Что бы ты хотела обсудить?',
            crypto: 'Yo! 💎 Что хочешь узнать про крипту? WAGMI! 🚀',
            homework: 'Привет! 📚 С каким предметом нужна помощь? Загружай задачу или пиши вопрос!',
        };

        setMessages([{
            id: 'greeting',
            role: 'assistant',
            content: greetings[expertId] || `Привет! Я ${expert?.name || 'эксперт'}. Чем могу помочь?`,
            timestamp: new Date(),
        }]);
    }, [expertId, expert?.name]);

    // Sync balance with global stats
    useEffect(() => {
        if (stats?.current_balance !== undefined) {
            setBalance(stats.current_balance);
        }
    }, [stats?.current_balance]);

    // Image Upload
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Reset Chat
    const handleResetChat = async () => {
        setIsResetting(true);
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        try {
            const response = await fetch(`/api/experts/${expertId}/reset`, {
                method: 'POST',
                headers: {
                    'X-TG-Data': window.Telegram?.WebApp?.initData || '',
                }
            });
            if (response.ok) {
                setMessages([]);
                addGreeting();
                if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                }
            }
        } catch (e) {
            console.error('Reset error:', e);
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
        } finally {
            setIsResetting(false);
        }
    };

    // Rate a message
    const rateMessage = async (messageId, rating) => {
        try {
            const response = await fetch(`/api/experts/messages/${messageId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': window.Telegram?.WebApp?.initData || '',
                },
                body: JSON.stringify({ rating }),
            });

            if (response.ok) {
                setMessages(prev => prev.map(msg =>
                    msg.dbId === messageId ? { ...msg, rating } : msg
                ));

                // Haptic feedback
                if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
            }
        } catch (err) {
            console.error('Failed to rate message:', err);
        }
    };

    // Handle send message
    const handleSend = async (messageText = null) => {
        const textToSend = messageText || input.trim();
        if ((!textToSend && !image) || isLoading) return;

        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: textToSend ? textToSend : '[Фото прикреплено]',
            image: image,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        const imageToSend = image;
        setImage(null);

        setIsLoading(true);
        setError(null);
        setLowBalanceWarning(null);

        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }

        try {
            // Call backend API
            const response = await fetch('/api/experts/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': window.Telegram?.WebApp?.initData || '',
                },
                body: JSON.stringify({
                    expertId,
                    message: textToSend,
                    imageBase64: imageToSend
                }),
            });

            const data = await response.json();

            // Handle insufficient balance
            if (response.status === 402 || data.errorCode === 'INSUFFICIENT_BALANCE') {
                setShowTopUpModal(true);
                setBalance(data.balance || 0);
                setFreeMessagesLeft(data.freeMessagesLeft || 0);
                throw new Error(data.message || 'Недостаточно зарядов');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка сервера');
            }

            // Update balance and free messages from response
            if (data.balance !== undefined) {
                setBalance(data.balance);
                updateStats({ current_balance: data.balance });
            }
            if (data.freeMessagesLeft !== undefined) {
                setFreeMessagesLeft(data.freeMessagesLeft);
            }

            // Show low balance warning if applicable
            if (data.lowBalance && data.lowBalanceMessage) {
                setLowBalanceWarning(data.lowBalanceMessage);
            }

            const assistantMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.response || 'Извини, я не смог сформулировать ответ.',
                timestamp: new Date(),
                isFreeMessage: data.isFreeMessage,
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Success haptic
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }

        } catch (err) {
            console.error('Chat error:', err);
            setError(err.message || 'Не удалось получить ответ. Попробуй еще раз.');

            // Error haptic
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Navigate to top-up
    const handleTopUp = () => {
        setShowTopUpModal(false);
        navigate('/balance');
    };

    if (!expert) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-white text-[17px] font-semibold">Эксперт не найден</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col md:max-w-3xl md:mx-auto">
            {/* Header */}
            <div
                className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-white/5 pt-[calc(env(safe-area-inset-top)+4px)]"
            >
                <div className="flex items-center gap-3 px-4 py-3">
                    <button
                        onClick={() => navigate('/experts')}
                        className="p-1 -ml-1 active:opacity-60 transition-opacity"
                    >
                        <ChevronLeft className="w-7 h-7 text-accent-blue" />
                    </button>

                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                        style={{ background: expert.gradient }}
                    >
                        {expert.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-white text-[17px] font-semibold truncate tracking-tight">{expert.name}</h1>
                        <p className="text-[13px] text-text-secondary">
                            {freeMessagesLeft > 0
                                ? `🎁 ${freeMessagesLeft} бесплатных`
                                : `${MESSAGE_COST}⚡ за сообщение`
                            }
                        </p>
                    </div>

                    {/* Balance Display */}
                    <div className="flex items-center gap-1 bg-bg-elevated px-2.5 py-1.5 rounded-full mr-1">
                        <Zap className="w-4 h-4 fill-[#ffcc00] text-[#ffcc00]" />
                        <span className="text-[15px] font-semibold text-white">{balance ?? '...'}</span>
                    </div>

                    <button
                        onClick={handleResetChat}
                        disabled={isResetting || isLoading}
                        className="p-1.5 rounded-full bg-bg-secondary text-text-secondary active:bg-bg-elevated transition-colors shadow-sm"
                        title="Начать заново"
                    >
                        {isResetting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Free Trial Banner */}
            <AnimatePresence>
                {freeMessagesLeft > 0 && messages.length <= 1 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-accent-blue/15 border-b border-[#34c759]/20 px-4 py-2.5"
                    >
                        <div className="flex items-center gap-2 text-accent-blue text-[13px] font-medium">
                            <Gift className="w-4 h-4 flex-shrink-0" />
                            <span>🎁 {freeMessagesLeft} бесплатных сообщений для знакомства с экспертом!</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Low Balance Warning Banner */}
            <AnimatePresence>
                {lowBalanceWarning && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#ff9f0a]/15 border-b border-[#ff9f0a]/20 px-4 py-2.5"
                    >
                        <div className="flex items-center gap-2 text-[#ff9f0a] text-[13px] font-medium">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>{lowBalanceWarning}</span>
                            <button
                                onClick={handleTopUp}
                                className="ml-auto text-[#ff9f0a] font-semibold"
                            >
                                Пополнить
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {isLoadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-[18px] px-4 py-3 ${msg.role === 'user'
                                            ? 'bg-accent-blue text-white rounded-br-[4px]'
                                            : 'bg-bg-elevated text-white rounded-bl-[4px] shadow-sm'
                                            }`}
                                    >
                                        {msg.image && (
                                            <img src={msg.image} alt="Attachment" className="max-w-full rounded-lg mb-2 border border-white/10" />
                                        )}
                                        <p className="text-[15px] whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                                    </div>

                                    {/* Rating buttons for assistant messages */}
                                    {msg.role === 'assistant' && msg.dbId && (
                                        <div className="flex items-center gap-2 mt-1 ml-1">
                                            <button
                                                onClick={() => rateMessage(msg.dbId, 1)}
                                                className={`p-1.5 rounded-full transition-colors ${msg.rating === 1
                                                    ? 'bg-green-500/30 text-green-400'
                                                    : 'text-gray-500 hover:text-green-400 hover:bg-white/5'
                                                    }`}
                                            >
                                                <ThumbsUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => rateMessage(msg.dbId, -1)}
                                                className={`p-1.5 rounded-full transition-colors ${msg.rating === -1
                                                    ? 'bg-red-500/30 text-red-400'
                                                    : 'text-gray-500 hover:text-red-400 hover:bg-white/5'
                                                    }`}
                                            >
                                                <ThumbsDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Quick Suggestions - show only when few messages */}
                        {messages.length <= 2 && suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-wrap gap-2 mt-4"
                            >
                                {suggestions.slice(0, 4).map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(suggestion)}
                                        disabled={isLoading}
                                        className="px-3.5 py-2 text-[13px] bg-bg-secondary text-white rounded-input active:bg-bg-elevated transition-colors disabled:opacity-50"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {/* Typing Indicator */}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start"
                            >
                                <div className="bg-bg-secondary rounded-[18px] rounded-bl-[6px] px-4 py-3">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-[#8e8e93] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-[#8e8e93] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-[#8e8e93] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 text-red-400 text-sm justify-center"
                            >
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </motion.div>
                        )}
                    </>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 bg-black/95 backdrop-blur-xl border-t border-white/5 p-3 pb-safe">
                <div className="flex flex-col gap-2">
                    {/* Image Preview */}
                    <AnimatePresence>
                        {image && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: 10, height: 0 }}
                                className="relative inline-block ml-12"
                            >
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10">
                                    <img src={image} className="w-full h-full object-cover" alt="Preview" />
                                    <button
                                        onClick={() => setImage(null)}
                                        className="absolute top-1 right-1 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-end gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 mb-0.5 rounded-full text-text-secondary active:bg-bg-secondary transition-colors focus:outline-none"
                        >
                            <Paperclip className="w-[22px] h-[22px]" />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                            />
                        </button>

                        <div className="flex-1 bg-bg-secondary rounded-[22px] px-4 py-3 border border-white/5 shadow-inner min-h-[46px] flex items-center">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Сообщение..."
                                className="w-full bg-transparent text-white placeholder-[#8e8e93] resize-none outline-none text-[16px] max-h-32"
                                rows={1}
                                disabled={isLoading}
                                style={{
                                    height: 'auto',
                                }}
                            />
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSend()}
                            disabled={(!input.trim() && !image) || isLoading}
                            className={`p-3 mb-0.5 rounded-full transition-all duration-200 ${(input.trim() || image) && !isLoading
                                ? 'bg-accent-blue text-white shadow-[0_4px_14px_rgba(0,122,255,0.4)]'
                                : 'bg-bg-secondary text-text-secondary'
                                } flex items-center justify-center`}
                            style={{ width: '46px', height: '46px' }}
                        >
                            {isLoading ? (
                                <Loader2 className="w-[22px] h-[22px] animate-spin" />
                            ) : (
                                <Send className="w-[22px] h-[22px] -ml-0.5" />
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Top Up Modal */}
            <AnimatePresence>
                {showTopUpModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowTopUpModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-bg-secondary rounded-card p-6 max-w-sm w-full text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ff3b30]/15 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-[#ff3b30]" />
                            </div>

                            <h3 className="text-[20px] font-bold text-white mb-2">
                                Недостаточно зарядов
                            </h3>

                            <p className="text-[15px] text-text-secondary mb-6">
                                Для отправки сообщения нужен {MESSAGE_COST} заряд.
                                {balance !== null && ` Ваш баланс: ${balance} ⚡`}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowTopUpModal(false)}
                                    className="flex-1 py-3 rounded-input bg-bg-elevated text-white text-[17px] font-semibold active:bg-bg-elevated"
                                >
                                    Закрыть
                                </button>
                                <button
                                    onClick={handleTopUp}
                                    className="flex-1 py-3 rounded-input bg-accent-blue text-white text-[17px] font-semibold active:bg-blue-600"
                                >
                                    Пополнить
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
