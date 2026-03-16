import React from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Upload, Loader2 } from 'lucide-react';

const StarEditModal = ({
    editingStar, setEditingStar,
    isUploading, handleStarFileUpload,
    handleSaveStar, handleDeleteStar
}) => {
    if (!editingStar) return null;

    return createPortal(
        <div className="fixed inset-0 z-[999999] flex justify-center items-end sm:items-center p-0 sm:p-4 font-sans">
            <motion.div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingStar(null)}
            />

            <motion.div
                className="bg-[#1c1c1e] w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[24px] sm:rounded-[24px] relative z-10 flex flex-col border border-white/10 shadow-2xl overflow-hidden"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1c1c1e] z-20 shrink-0">
                    <h3 className="text-lg font-bold text-white">{editingStar.id?.startsWith('new_') ? 'Новая Звезда' : 'Редактирование'}</h3>
                    <button onClick={() => setEditingStar(null)} className="p-2 bg-[#2c2c2e] rounded-full hover:bg-white/10 transition-colors text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar pb-safe-bottom">
                    {/* Preview / Upload Section */}
                    <div className="aspect-[3/4] rounded-[16px] bg-black/50 overflow-hidden relative border border-white/10 mx-auto w-1/2 group">
                        {editingStar.image_url ? (
                            <img src={editingStar.image_url} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
                                <Upload size={24} />
                                <span className="text-[10px]">Загрузить фото</span>
                            </div>
                        )}

                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm">
                            {isUploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" />}
                            <span className="text-[10px] font-bold mt-2 text-white">{isUploading ? 'Загрузка...' : 'Изменить фото'}</span>
                            <input type="file" className="hidden" onChange={handleStarFileUpload} accept="image/*" />
                        </label>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-[11px] text-gray-500 uppercase block mb-1">Имя</label>
                            <input
                                className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                placeholder="Имя звезды"
                                value={editingStar.name || ''}
                                onChange={e => setEditingStar({ ...editingStar, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[11px] text-gray-500 uppercase block mb-1">Slug (ID)</label>
                            <input
                                className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none placeholder:text-gray-600 font-mono text-[13px]"
                                placeholder="unique_slug"
                                value={editingStar.slug || ''}
                                onChange={e => setEditingStar({ ...editingStar, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                            />
                        </div>

                        <div>
                            <label className="text-[11px] text-gray-500 uppercase block mb-1">Описание</label>
                            <input
                                className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none placeholder:text-gray-600"
                                placeholder="Краткое описание"
                                value={editingStar.description || ''}
                                onChange={e => setEditingStar({ ...editingStar, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[11px] text-gray-500 uppercase block mb-1">Фото URL</label>
                            <input
                                className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none placeholder:text-gray-600 text-[12px]"
                                value={editingStar.image_url || ''}
                                onChange={e => setEditingStar({ ...editingStar, image_url: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] text-gray-500 uppercase block mb-1">Сортировка</label>
                                <input
                                    type="number"
                                    className="w-full bg-[#2c2c2e] p-3 rounded-[12px] text-white outline-none"
                                    value={editingStar.sort_order || 0}
                                    onChange={e => setEditingStar({ ...editingStar, sort_order: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-gray-500 uppercase block mb-1">Статус</label>
                                <button
                                    onClick={() => setEditingStar({ ...editingStar, is_active: !editingStar.is_active })}
                                    className={`w-full p-3 rounded-[12px] font-bold transition-all ${editingStar.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                                >
                                    {editingStar.is_active ? 'Активен' : 'Скрыт'}
                                </button>
                            </div>
                        </div>

                        {editingStar.id && !editingStar.id.startsWith('new_') && (
                            <button
                                onClick={() => handleDeleteStar(editingStar.id)}
                                className="w-full mt-4 p-3 bg-red-500/10 text-red-500 rounded-[12px] font-bold hover:bg-red-500/20 transition-colors"
                            >
                                Удалить звезду
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-[#1c1c1e] sticky bottom-0 z-20 pb-8 safe-bottom">
                    <button
                        onClick={() => handleSaveStar(editingStar)}
                        className="w-full bg-[#007aff] text-white font-bold py-3.5 rounded-[12px] shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform hover:bg-[#0069d9]"
                    >
                        Сохранить
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default React.memo(StarEditModal);
