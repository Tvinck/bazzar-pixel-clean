import React from 'react';
import { Send, Loader2 } from 'lucide-react';

const PublicationsForm = ({
    pubChannel, setPubChannel,
    pubDate, setPubDate,
    pubTime, setPubTime,
    pubText, setPubText,
    pubMediaUrl, setPubMediaUrl,
    pubMediaType, setPubMediaType,
    isPublishing, handlePublishToChannel
}) => {
    return (
        <div className="bg-bg-elevated p-4 rounded-card border border-white/5 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <Send size={20} />
                Публикация в канал
            </h2>

            <div className="space-y-3">
                <div>
                    <label className="text-[11px] text-gray-500 uppercase block mb-1">Канал / Чат</label>
                    <input
                        className="w-full bg-black/20 rounded-input p-3 text-[13px] outline-none text-white placeholder:text-gray-600"
                        placeholder="@channel_name или ID"
                        value={pubChannel}
                        onChange={e => setPubChannel(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[11px] text-gray-500 uppercase block mb-1">Дата (опц.)</label>
                        <input
                            type="date"
                            className="w-full bg-black/20 rounded-input p-3 text-[13px] outline-none text-white appearance-none"
                            value={pubDate}
                            onChange={e => setPubDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-[11px] text-gray-500 uppercase block mb-1">Время (опц.)</label>
                        <input
                            type="time"
                            className="w-full bg-black/20 rounded-input p-3 text-[13px] outline-none text-white appearance-none"
                            value={pubTime}
                            onChange={e => setPubTime(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[11px] text-gray-500 uppercase block mb-1">Текст поста</label>
                    <textarea
                        className="w-full bg-black/20 rounded-input p-3 text-[13px] outline-none text-white placeholder:text-gray-600 min-h-[140px]"
                        placeholder="Markdown разметка поддерживается..."
                        value={pubText}
                        onChange={e => setPubText(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-[11px] text-gray-500 uppercase block mb-1">Медиа</label>
                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-black/20 rounded-input p-3 text-[13px] outline-none text-white placeholder:text-gray-600"
                            placeholder="URL картинки или видео"
                            value={pubMediaUrl}
                            onChange={e => setPubMediaUrl(e.target.value)}
                        />
                        <select
                            className="bg-black/20 rounded-input px-3 outline-none text-[12px]"
                            value={pubMediaType}
                            onChange={e => setPubMediaType(e.target.value)}
                        >
                            <option value="image">Фото</option>
                            <option value="video">Видео</option>
                        </select>
                    </div>

                    {pubMediaUrl && (
                        <div className="mt-3 aspect-video bg-black/50 rounded-lg overflow-hidden relative">
                            {pubMediaType === 'video' ? (
                                <video src={pubMediaUrl} className="w-full h-full object-contain" controls />
                            ) : (
                                <img src={pubMediaUrl} className="w-full h-full object-contain" />
                            )}
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={handlePublishToChannel}
                disabled={isPublishing || (!pubText && !pubMediaUrl)}
                className={`w-full py-3.5 rounded-input font-bold text-white flex items-center justify-center gap-2 transition-all ${isPublishing ? 'bg-gray-600 cursor-not-allowed' : 'bg-accent-blue hover:bg-accent-blue active:scale-[0.98]'}`}
            >
                {isPublishing ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                {(pubDate && pubTime) ? 'Запланировать публикацию' : 'Опубликовать сейчас'}
            </button>
        </div>
    );
};

export default React.memo(PublicationsForm);
