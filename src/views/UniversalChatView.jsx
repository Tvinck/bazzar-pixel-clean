import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, Loader2, AlertCircle, Zap, AlertTriangle, Gift, ThumbsUp, ThumbsDown, Paperclip, X, RotateCcw } from 'lucide-react';
import { useUser } from '../context/UserContext';

/**
 * UniversalChatView - Unified chat component for private/creator/knowledge chats
 * Features:
 * - Dynamic system prompts based on chat type
 * - User profile context injection
 * - Balance tracking and free trials
 * - Chat history persistence
 * - Response ratings
 */



import { CHAT_INFO, MESSAGE_COST } from '../config/chatConfig';
import { BlockErrorBoundary } from '../components/ErrorBoundary';
import SEO from '../components/SEO/SEO';

// Sub-components for better error isolation
const MessagesList = ({ 
    messages, 
    isLoadingHistory, 
    isLoading, 
    error, 
    messagesEndRef, 
    rateMessage,
    suggestions = [],
    handleSend
}) => (
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
                                    ? 'bg-[#007aff] text-white rounded-br-[4px]'
                                    : 'bg-[#2c2c2e] text-white rounded-bl-[4px] shadow-sm'
                                    }`}
                            >
                                {msg.image && (
                                    <img src={msg.image} alt="Attachment" className="max-w-full rounded-lg mb-2 border border-white/10" />
                                )}
                                <p className="text-[15px] whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                            </div>

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

                {/* Quick Suggestions */}
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
                                className="px-3.5 py-2 text-[13px] bg-[#1c1c1e] text-white rounded-[10px] active:bg-[#2c2c2e] transition-colors disabled:opacity-50"
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
                        <div className="bg-[#1c1c1e] rounded-[18px] rounded-bl-[6px] px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-[#8e8e93] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-[#8e8e93] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-[#8e8e93] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}

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
);

const ChatInput = ({
    image,
    setImage,
    fileInputRef,
    handleImageChange,
    inputRef,
    input,
    setInput,
    handleKeyPress,
    isLoading,
    handleSend
}) => (
    <div className="sticky bottom-0 bg-black/95 backdrop-blur-xl border-t border-white/5 p-3 pb-safe">
        <div className="flex flex-col gap-2">
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
                    className="p-3 mb-0.5 rounded-full text-[#8e8e93] active:bg-[#1c1c1e] transition-colors focus:outline-none"
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

                <div className="flex-1 bg-[#1c1c1e] rounded-[22px] px-4 py-3 border border-white/5 shadow-inner min-h-[46px] flex items-center">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Сообщение..."
                        className="w-full bg-transparent text-white placeholder-[#8e8e93] resize-none outline-none text-[16px] max-h-32"
                        rows={1}
                        disabled={isLoading}
                    />
                </div>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSend()}
                    disabled={(!input.trim() && !image) || isLoading}
                    className={`p-3 mb-0.5 rounded-full transition-all duration-200 ${(input.trim() || image) && !isLoading
                        ? 'bg-[#007aff] text-white shadow-[0_4px_14px_rgba(0,122,255,0.4)]'
                        : 'bg-[#1c1c1e] text-[#8e8e93]'
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
);

export default function UniversalChatView() {
    const { chatType } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { stats, updateStats, telegramId, isLoading: isUserLoading } = useUser();

    // Safety check for CHAT_INFO and chatType
    const chatInfo = (CHAT_INFO && chatType) ? CHAT_INFO[chatType] : null;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [error, setError] = useState(null);
    const [balance, setBalance] = useState(stats?.current_balance || 0);
    const [lowBalanceWarning, setLowBalanceWarning] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [freeMessagesLeft, setFreeMessagesLeft] = useState(3);
    const [suggestions, setSuggestions] = useState([]);
    const [image, setImage] = useState(null);
    const [isResetting, setIsResetting] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const addGreeting = useCallback(() => {
        if (!chatInfo) return;
        setMessages([{
            id: 'greeting',
            role: 'assistant',
            content: chatInfo.greetings.join('\n\n'),
            timestamp: new Date(),
        }]);
    }, [chatInfo]);

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
                window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
            }
        } catch (err) {
            console.error('Failed to rate message:', err);
        }
    };

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
            const response = await fetch(`/api/chat/${chatType}/reset`, {
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

    const handleSend = useCallback(async (messageText = null) => {
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
        setLowBalanceWarning(false);

        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');

        try {
            const response = await fetch(`/api/chat/${chatType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TG-Data': window.Telegram?.WebApp?.initData || '',
                },
                body: JSON.stringify({ message: textToSend, imageBase64: imageToSend }),
            });

            const data = await response.json();

            if (response.status === 402) {
                setShowTopUpModal(true);
                setBalance(data.balance || 0);
                setFreeMessagesLeft(0);
                throw new Error(data.message || 'Недостаточно зарядов');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка сервера');
            }

            if (data.balance !== undefined) {
                setBalance(data.balance);
                updateStats({ current_balance: data.balance });
            }
            if (data.freeMessagesLeft !== undefined) setFreeMessagesLeft(data.freeMessagesLeft);
            if (data.lowBalance) setLowBalanceWarning(true);

            const assistantMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                isFreeMessage: data.isFreeMessage,
            };

            setMessages(prev => [...prev, assistantMessage]);
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');

        } catch (err) {
            setError(err.message);
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
        } finally {
            setIsLoading(false);
        }
    }, [input, image, isLoading, chatType, updateStats]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Handle initial message from HomeView
    useEffect(() => {
        if (location.state?.initialMessage) {
            const msg = location.state.initialMessage;
            // Clear state to prevent re-sending on refresh
            window.history.replaceState({}, document.title);
            handleSend(msg);
        }
    }, [location.state, handleSend]);

    // Load conversation history and suggestions on mount
    useEffect(() => {
        // Wait for user context to load
        if (isUserLoading) return;

        const loadConversation = async () => {
            if (!chatInfo) return;

            try {
                setIsLoadingHistory(true);

                // Fetch history
                const response = await fetch(`/api/chat/${chatType}/history`, {
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

                    if (data.messages?.length > 0) {
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
                        addGreeting();
                    }
                } else {
                    addGreeting();
                }

                // Fetch suggestions
                const suggestRes = await fetch(`/api/chat/${chatType}/suggestions`);
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

        loadConversation();
    }, [chatType, telegramId, isUserLoading, chatInfo, addGreeting, updateStats]);

    // Sync balance with global stats
    useEffect(() => {
        if (stats?.current_balance !== undefined) {
            setBalance(stats.current_balance);
        }
    }, [stats?.current_balance]);



    if (!chatInfo) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-white text-[17px] font-semibold">Чат не найден</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col md:max-w-3xl md:mx-auto">
            <SEO 
                title={`${chatInfo.name} — Bazzar Pixel`}
                description={`Чат с ${chatInfo.name}. ${chatInfo.greetings[0]}`}
            />
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-white/5 pt-[calc(env(safe-area-inset-top)+4px)]">
                <div className="flex items-center gap-3 px-4 py-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-1 -ml-1 active:opacity-60 transition-opacity"
                    >
                        <ChevronLeft className="w-7 h-7 text-[#007aff]" />
                    </button>

                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${chatInfo.color} flex items-center justify-center text-xl`}>
                        {chatInfo.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-white text-[17px] font-semibold truncate tracking-tight">{chatInfo.name}</h1>
                        <p className="text-[13px] text-[#8e8e93]">
                            {freeMessagesLeft > 0
                                ? `🎁 ${freeMessagesLeft} бесплатных`
                                : `${MESSAGE_COST}⚡ за сообщение`
                            }
                        </p>
                    </div>

                    <div className="flex items-center gap-1 bg-[#2c2c2e] px-2.5 py-1.5 rounded-full mr-1">
                        <Zap className="w-4 h-4 fill-[#ffcc00] text-[#ffcc00]" />
                        <span className="text-[15px] font-semibold text-white">{balance ?? '...'}</span>
                    </div>

                    <button
                        onClick={handleResetChat}
                        disabled={isResetting || isLoading}
                        className="p-1.5 rounded-full bg-[#1c1c1e] text-[#8e8e93] active:bg-[#2c2c2e] transition-colors shadow-sm"
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
                        className="bg-[#34c759]/15 border-b border-[#34c759]/20 px-4 py-2.5"
                    >
                        <div className="flex items-center gap-2 text-[#34c759] text-[13px] font-medium">
                            <Gift className="w-4 h-4 flex-shrink-0" />
                            <span>🎁 {freeMessagesLeft} бесплатных сообщений!</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Low Balance Warning */}
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
                            <span>Мало зарядов!</span>
                            <button onClick={() => navigate('/balance')} className="ml-auto text-[#ff9f0a] font-semibold">
                                Пополнить
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages */}
            <BlockErrorBoundary>
                <MessagesList 
                    messages={messages}
                    isLoadingHistory={isLoadingHistory}
                    isLoading={isLoading}
                    error={error}
                    messagesEndRef={messagesEndRef}
                    rateMessage={rateMessage}
                    suggestions={suggestions}
                    handleSend={handleSend}
                />
            </BlockErrorBoundary>

            <BlockErrorBoundary>
                <ChatInput 
                    image={image}
                    setImage={setImage}
                    fileInputRef={fileInputRef}
                    handleImageChange={handleImageChange}
                    inputRef={inputRef}
                    input={input}
                    setInput={setInput}
                    handleKeyPress={handleKeyPress}
                    isLoading={isLoading}
                    handleSend={handleSend}
                />
            </BlockErrorBoundary>

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
                            className="bg-[#1c1c1e] rounded-[14px] p-6 max-w-sm w-full text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ff3b30]/15 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-[#ff3b30]" />
                            </div>
                            <h3 className="text-[20px] font-bold text-white mb-2">Недостаточно зарядов</h3>
                            <p className="text-[15px] text-[#8e8e93] mb-6">
                                Для сообщения нужен {MESSAGE_COST} заряд. Баланс: {balance} ⚡
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowTopUpModal(false)}
                                    className="flex-1 py-3 rounded-[12px] bg-[#2c2c2e] text-white text-[17px] font-semibold active:bg-[#3a3a3c]"
                                >
                                    Закрыть
                                </button>
                                <button
                                    onClick={() => { setShowTopUpModal(false); navigate('/balance'); }}
                                    className="flex-1 py-3 rounded-[12px] bg-[#007aff] text-white text-[17px] font-semibold active:bg-blue-600"
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
