import React from 'react';
import { Send, Search, X, Loader2 } from 'lucide-react';

const BroadcastForm = ({
    isBroadcastMode, setIsBroadcastMode,
    selectedUserForMessage, setSelectedUserForMessage,
    broadcastSegment, setBroadcastSegment,
    searchQuery, setSearchQuery,
    users,
    messageText, setMessageText,
    mediaUrl, setMediaUrl,
    mediaType, setMediaType,
    isSending, handleSendMessage
}) => {
    return (
        <div className="bg-[#2c2c2e] p-4 rounded-[16px] border border-white/5 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <Send size={20} />
                Отправка сообщений
            </h2>

            {/* Target Selection */}
            <div className="flex bg-black/20 p-1 rounded-lg">
                <button
                    onClick={() => { setIsBroadcastMode(false); setSelectedUserForMessage(null); }}
                    className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-all ${!isBroadcastMode ? 'bg-[#007aff] text-white' : 'text-gray-400'}`}
                >
                    Личное
                </button>
                <button
                    onClick={() => { setIsBroadcastMode(true); setSelectedUserForMessage(null); }}
                    className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-all ${isBroadcastMode ? 'bg-red-500 text-white' : 'text-gray-400'}`}
                >
                    Рассылка (Сегменты)
                </button>
            </div>

            {isBroadcastMode && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                    <label className="text-[11px] text-gray-500 uppercase">Сегмент аудитории</label>
                    <select
                        className="w-full bg-black/20 rounded-[12px] p-3 text-[13px] outline-none text-white appearance-none"
                        value={broadcastSegment}
                        onChange={e => setBroadcastSegment(e.target.value)}
                    >
                        <option value="all">Все пользователи</option>
                        <option value="active">Активные (за 7 дней)</option>
                        <option value="sleeping">Спящие (не заходили 7 дней)</option>
                        <option value="zerobalance">С нулевым балансом</option>
                        <option value="newbies">Новички (менее 3 генераций)</option>
                        <option value="vip">VIP (платящие)</option>
                    </select>
                </div>
            )}

            {!isBroadcastMode && (
                <div className="space-y-2">
                    <label className="text-[11px] text-gray-500 uppercase">Получатель</label>
                    {selectedUserForMessage ? (
                        <div className="flex items-center justify-between bg-black/20 p-3 rounded-[12px]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0">
                                    {selectedUserForMessage.avatar_url && <img src={selectedUserForMessage.avatar_url} className="w-full h-full object-cover" />}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[13px] font-bold truncate">{selectedUserForMessage.first_name}</div>
                                    <div className="text-[10px] text-gray-500 truncate">@{selectedUserForMessage.username}</div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUserForMessage(null)} className="p-2 text-white/50 hover:text-white shrink-0"><X size={16} /></button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                            <input
                                className="w-full bg-black/20 rounded-[12px] pl-10 pr-4 py-3 text-[13px] outline-none text-white placeholder:text-gray-600"
                                placeholder="Найти пользователя..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1c1e] border border-white/10 rounded-[12px] overflow-hidden z-20 max-h-48 overflow-y-auto shadow-2xl">
                                    {(() => {
                                        const safeUsers = Array.isArray(users) ? users : [];
                                        const filteredUsersList = safeUsers.filter(u => {
                                            if (!searchQuery) return true;
                                            const q = searchQuery.toLowerCase();
                                            return (u.username?.toLowerCase() || '').includes(q) ||
                                                (u.telegram_id?.toString() || '').includes(q);
                                        });
                                        return filteredUsersList.slice(0, 5).map(u => (
                                            <div
                                                key={u.id}
                                                onClick={() => { setSelectedUserForMessage(u); setSearchQuery(''); }}
                                                className="p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden shrink-0">
                                                    {u.avatar_url && <img src={u.avatar_url} className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="text-[13px] truncate">{u.username || u.first_name}</div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Message Content */}
            <div className="space-y-3">
                <div>
                    <label className="text-[11px] text-gray-500 uppercase block mb-1">Сообщение</label>
                    <textarea
                        className="w-full bg-black/20 rounded-[12px] p-3 text-[13px] outline-none text-white placeholder:text-gray-600 min-h-[100px]"
                        placeholder="Введите текст сообщения..."
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-[11px] text-gray-500 uppercase block mb-1">Медиа (Опционально)</label>
                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-black/20 rounded-[12px] p-3 text-[13px] outline-none text-white placeholder:text-gray-600"
                            placeholder="URL картинки или видео"
                            value={mediaUrl}
                            onChange={e => setMediaUrl(e.target.value)}
                        />
                        <select
                            className="bg-black/20 rounded-[12px] px-3 outline-none text-[12px]"
                            value={mediaType}
                            onChange={e => setMediaType(e.target.value)}
                        >
                            <option value="image">Фото</option>
                            <option value="video">Видео</option>
                        </select>
                    </div>
                </div>

                {mediaUrl && (
                    <div className="aspect-video bg-black/50 rounded-lg overflow-hidden relative">
                        {mediaType === 'video' ? (
                            <video src={mediaUrl} className="w-full h-full object-contain" controls />
                        ) : (
                            <img src={mediaUrl} className="w-full h-full object-contain" />
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={handleSendMessage}
                disabled={isSending || (!isBroadcastMode && !selectedUserForMessage)}
                className={`w-full py-3.5 rounded-[12px] font-bold text-white flex items-center justify-center gap-2 transition-all ${isSending ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#007aff] hover:bg-blue-600 active:scale-[0.98]'}`}
            >
                {isSending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                {isBroadcastMode ? 'Начать рассылку' : 'Отправить сообщение'}
            </button>
        </div>
    );
};

export default React.memo(BroadcastForm);
