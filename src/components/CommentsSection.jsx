import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Reply, Heart, ChevronDown, ChevronUp, User } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSound } from '../context/SoundContext';
import { useToast } from '../context/ToastContext';

/**
 * CommentsSection — nested comments up to 3 levels deep
 * Props: creationId (string)
 */

const MOCK_COMMENTS = [
    {
        id: '1', text: 'Невероятно! Как вы добились такой детализации?', user_name: 'Алексей',
        avatar_emoji: '🎨', created_at: new Date(Date.now() - 3600000).toISOString(), likes: 5,
        replies: [
            {
                id: '1-1', text: 'Спасибо! Использовал Flux Pro с детальным промптом', user_name: 'Автор',
                avatar_emoji: '✨', created_at: new Date(Date.now() - 1800000).toISOString(), likes: 2,
                replies: [
                    {
                        id: '1-1-1', text: 'Круто, попробую тоже!', user_name: 'Мария',
                        avatar_emoji: '💫', created_at: new Date(Date.now() - 900000).toISOString(), likes: 0, replies: []
                    }
                ]
            }
        ]
    },
    {
        id: '2', text: 'Хочу такой же стиль! Поделитесь промптом 🙏', user_name: 'Дима',
        avatar_emoji: '🔥', created_at: new Date(Date.now() - 7200000).toISOString(), likes: 3, replies: []
    },
];

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'только что';
    if (mins < 60) return `${mins} мин`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч`;
    const days = Math.floor(hours / 24);
    return `${days} д`;
};

const CommentItem = ({ comment, depth = 0, onReply, onLike }) => {
    const [showReplies, setShowReplies] = useState(depth < 1);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const canReply = depth < 2; // max 3 levels (0, 1, 2)

    return (
        <div className={`${depth > 0 ? 'ml-6 pl-3 border-l border-white/5' : ''}`}>
            <div className="flex gap-2.5 py-2.5">
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[14px]
                    ${depth === 0 ? 'bg-blue-500/20' : depth === 1 ? 'bg-accent-purple/20' : 'bg-green-500/20'}`}>
                    {comment.avatar_emoji || <User size={14} className="text-white/50" />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-[13px] font-bold text-white">{comment.user_name}</span>
                        <span className="text-[11px] text-white/25">{timeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-[13px] text-white/70 leading-snug">{comment.text}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-1.5">
                        <button
                            onClick={() => onLike(comment.id)}
                            className="flex items-center gap-1 text-[11px] text-white/30 hover:text-red-400 active:scale-95 transition-all"
                        >
                            <Heart size={12} /> {comment.likes > 0 && comment.likes}
                        </button>
                        {canReply && (
                            <button
                                onClick={() => onReply(comment.id, comment.user_name)}
                                className="flex items-center gap-1 text-[11px] text-white/30 hover:text-blue-400 active:scale-95 transition-all"
                            >
                                <Reply size={12} /> Ответить
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Toggle Replies */}
            {hasReplies && (
                <>
                    {!showReplies && (
                        <button
                            onClick={() => setShowReplies(true)}
                            className="flex items-center gap-1 text-[11px] text-blue-400 ml-10 mb-1 hover:text-blue-300"
                        >
                            <ChevronDown size={12} /> {comment.replies.length} {comment.replies.length === 1 ? 'ответ' : 'ответа'}
                        </button>
                    )}
                    <AnimatePresence>
                        {showReplies && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                {comment.replies.map((reply) => (
                                    <CommentItem
                                        key={reply.id}
                                        comment={reply}
                                        depth={depth + 1}
                                        onReply={onReply}
                                        onLike={onLike}
                                    />
                                ))}
                                {showReplies && hasReplies && (
                                    <button
                                        onClick={() => setShowReplies(false)}
                                        className="flex items-center gap-1 text-[11px] text-white/20 ml-10 mb-1 hover:text-white/40"
                                    >
                                        <ChevronUp size={12} /> Скрыть
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
};

const CommentsSection = ({ creationId }) => {
    const { user } = useUser();
    const { playClick } = useSound();
    const toaster = useToast();

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null); // { id, userName }
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Load comments
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`/api/creation/${creationId}/comments`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.comments) setComments(data.comments);
                    else setComments(MOCK_COMMENTS); // fallback
                } else {
                    setComments(MOCK_COMMENTS);
                }
            } catch {
                setComments(MOCK_COMMENTS);
            }
        };
        if (creationId) fetchComments();
    }, [creationId]);

    const handleSend = async () => {
        if (!newComment.trim()) return;
        if (!user) {
            toaster.error('Войдите чтобы комментировать');
            return;
        }
        setIsSending(true);
        playClick();

        const commentData = {
            text: newComment.trim(),
            parent_id: replyingTo?.id || null,
            user_name: user.first_name || user.username || 'Аноним',
        };

        try {
            const res = await fetch(`/api/creation/${creationId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            });
            const data = await res.json();

            // Optimistic local insert
            const newItem = {
                id: data.id || Date.now().toString(),
                text: commentData.text,
                user_name: commentData.user_name,
                avatar_emoji: '💬',
                created_at: new Date().toISOString(),
                likes: 0,
                replies: []
            };

            if (replyingTo) {
                // Insert as nested reply
                setComments(prev => insertReply(prev, replyingTo.id, newItem));
            } else {
                setComments(prev => [newItem, ...prev]);
            }

            setNewComment('');
            setReplyingTo(null);
        } catch {
            toaster.error('Не удалось отправить комментарий');
        } finally {
            setIsSending(false);
        }
    };

    const insertReply = (commentsList, parentId, newReply) => {
        return commentsList.map(c => {
            if (c.id === parentId) {
                return { ...c, replies: [...(c.replies || []), newReply] };
            }
            if (c.replies && c.replies.length > 0) {
                return { ...c, replies: insertReply(c.replies, parentId, newReply) };
            }
            return c;
        });
    };

    const handleLike = (commentId) => {
        playClick();
        setComments(prev => toggleLike(prev, commentId));
    };

    const toggleLike = (commentsList, targetId) => {
        return commentsList.map(c => {
            if (c.id === targetId) return { ...c, likes: (c.likes || 0) + 1 };
            if (c.replies) return { ...c, replies: toggleLike(c.replies, targetId) };
            return c;
        });
    };

    const handleReply = (id, userName) => {
        setReplyingTo({ id, userName });
        setIsExpanded(true);
    };

    const totalCount = comments.reduce((sum, c) => {
        const countReplies = (r) => r.reduce((s, reply) => s + 1 + (reply.replies ? countReplies(reply.replies) : 0), 0);
        return sum + 1 + (c.replies ? countReplies(c.replies) : 0);
    }, 0);

    return (
        <div className="mx-4 mb-4">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between py-3 text-white/60 hover:text-white/80 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <MessageCircle size={18} />
                    <span className="text-[15px] font-bold">Комментарии</span>
                    {totalCount > 0 && (
                        <span className="bg-white/10 text-white/50 text-[12px] font-bold px-2 py-0.5 rounded-full">
                            {totalCount}
                        </span>
                    )}
                </div>
                <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Comments List */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="bg-bg-secondary rounded-card border border-white/5 overflow-hidden">
                            {/* Comment Input */}
                            <div className="p-3 border-b border-white/5">
                                {replyingTo && (
                                    <div className="flex items-center gap-2 mb-2 text-[12px] text-blue-400">
                                        <Reply size={12} />
                                        <span>Ответ для {replyingTo.userName}</span>
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            className="ml-auto text-white/30 hover:text-white/50"
                                        >✕</button>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                                        placeholder={replyingTo ? 'Ваш ответ...' : 'Написать комментарий...'}
                                        className="flex-1 bg-white/5 rounded-input px-3 py-2 text-[14px] text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-blue-500/50"
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleSend}
                                        disabled={!newComment.trim() || isSending}
                                        className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center disabled:opacity-30 active:bg-blue-700 transition-colors shrink-0"
                                    >
                                        {isSending ? (
                                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Send size={16} className="text-white ml-0.5" />
                                        )}
                                    </motion.button>
                                </div>
                            </div>

                            {/* Comments */}
                            <div className="px-3 pb-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {comments.length === 0 ? (
                                    <div className="py-8 text-center text-white/20 text-[13px]">
                                        <MessageCircle size={24} className="mx-auto mb-2 opacity-30" />
                                        Пока нет комментариев. Будьте первым!
                                    </div>
                                ) : (
                                    comments.map(comment => (
                                        <CommentItem
                                            key={comment.id}
                                            comment={comment}
                                            onReply={handleReply}
                                            onLike={handleLike}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommentsSection;
