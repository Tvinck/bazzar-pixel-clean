import React from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Upload, Loader2 } from 'lucide-react';

const TemplateEditModal = ({
    editingTemplate, setEditingTemplate,
    isUploading, handleFileUpload,
    categories, handleAddCategory,
    models, KIE_MODELS_FLAT,
    handleSaveTemplate, handleDeleteTemplate
}) => {
    if (!editingTemplate) return null;

    return createPortal(
        <div className="fixed inset-0 z-[999999] flex justify-center items-end sm:items-center p-0 sm:p-4 font-sans">
            <motion.div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingTemplate(null)}
            />

            <motion.div
                className="bg-bg-secondary w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[24px] sm:rounded-[24px] relative z-10 flex flex-col border border-white/10 shadow-2xl overflow-hidden"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-bg-secondary z-20 shrink-0">
                    <h3 className="text-lg font-bold text-white">{editingTemplate.is_local ? 'Размещение (Local)' : editingTemplate.id?.startsWith('new_') ? 'Новый шаблон' : 'Редактирование'}</h3>
                    <button onClick={() => setEditingTemplate(null)} className="p-2 bg-bg-elevated rounded-full hover:bg-white/10 transition-colors text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar pb-safe-bottom">
                    {/* Preview / Upload Section */}
                    <div className="aspect-[3/4] rounded-card bg-black/50 overflow-hidden relative border border-white/10 mx-auto w-1/2 group">
                        {editingTemplate.src ? (
                            editingTemplate.media_type === 'video' ? (
                                <video src={editingTemplate.src} className="w-full h-full object-cover" muted autoPlay loop />
                            ) : (
                                <img src={editingTemplate.src} className="w-full h-full object-cover" />
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
                                <Upload size={24} />
                                <span className="text-[10px]">Загрузить</span>
                            </div>
                        )}

                        {/* Upload Overlay */}
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm">
                            {isUploading ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" />}
                            <span className="text-[10px] font-bold mt-2 text-white">{isUploading ? 'Загрузка...' : 'Изменить файл'}</span>
                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                        </label>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-[11px] text-gray-500 uppercase block mb-1">Название</label>
                            <input
                                className="w-full bg-bg-elevated p-3 rounded-input text-white outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                placeholder="Название шаблона (ID)"
                                value={editingTemplate.title || ''}
                                onChange={e => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <input
                                className="bg-bg-elevated p-3 rounded-input text-white outline-none placeholder:text-gray-600 text-[12px]"
                                placeholder="URL (или загрузите файл)"
                                value={editingTemplate.src || ''}
                                onChange={e => setEditingTemplate({ ...editingTemplate, src: e.target.value })}
                                readOnly
                            />
                            <input
                                type="number"
                                className="bg-bg-elevated p-3 rounded-input text-white outline-none placeholder:text-gray-600"
                                placeholder="Сортировка"
                                value={editingTemplate.sort_order || 0}
                                onChange={e => setEditingTemplate({ ...editingTemplate, sort_order: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] text-gray-500 uppercase block mb-1">Тип медиа</label>
                                <select
                                    className="w-full bg-bg-elevated p-3 rounded-input text-white outline-none appearance-none"
                                    value={editingTemplate.media_type || 'image'}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, media_type: e.target.value })}
                                >
                                    <option value="image">Фото (Static)</option>
                                    <option value="video">Видео (Animation)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] text-gray-500 uppercase block mb-1">Категория</label>
                                <div className="flex gap-2">
                                    <select
                                        className="w-full bg-bg-elevated p-3 rounded-input text-white outline-none appearance-none"
                                        value={editingTemplate.category || 'trends'}
                                        onChange={e => {
                                            if (e.target.value === 'new_custom_category') {
                                                const newCat = prompt('Введите название новой категории (на английском, например: vintage):');
                                                if (newCat) {
                                                    const label = prompt('Введите название для отображения (например: Винтаж):');
                                                    handleAddCategory(newCat.toLowerCase(), label || newCat);
                                                }
                                            } else {
                                                setEditingTemplate({ ...editingTemplate, category: e.target.value });
                                            }
                                        }}
                                    >
                                        {categories.map(c => (
                                            <option key={c.slug} value={c.slug}>{c.label}</option>
                                        ))}
                                        <option value="new_custom_category">+ Добавить категорию...</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] text-gray-500 uppercase block mb-1">Системный Промпт</label>
                            <textarea
                                className="w-full bg-bg-elevated p-3 rounded-input text-white outline-none placeholder:text-gray-600 h-32 font-mono text-[13px] focus:ring-1 focus:ring-blue-500/50 transition-all"
                                placeholder="Prompt to generate..."
                                value={editingTemplate.generation_prompt || ''}
                                onChange={e => setEditingTemplate({ ...editingTemplate, generation_prompt: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <label className="text-[11px] text-gray-500 uppercase block mb-1">AI Model</label>
                                <select
                                    className="w-full bg-bg-elevated p-3 rounded-input text-white outline-none appearance-none"
                                    value={editingTemplate.model_id || ''}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, model_id: e.target.value })}
                                >
                                    <option value="">Выберите модель...</option>
                                    {/* Merge DB models and KIE models for the dropdown */}
                                    {(() => {
                                        const modelMap = new Map();
                                        // Add DB models first
                                        models.forEach(m => modelMap.set(m.id, { id: m.id, name: m.display_name, cost: m.cost }));
                                        // Add or overwrite with KIE models (canonical)
                                        Object.values(KIE_MODELS_FLAT).forEach(m => {
                                            modelMap.set(m.id, { id: m.id, name: m.name, cost: m.base_cost });
                                        });
                                        return Array.from(modelMap.values()).map(m => (
                                            <option key={m.id} value={m.id}>{m.name} ({m.cost}⚡)</option>
                                        ));
                                    })()}
                                    <option value="google/nano-banana-edit">Nano Banana Edit (5⚡)</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="text-[11px] text-gray-500 uppercase block mb-1">Статус</label>
                                <button
                                    onClick={() => setEditingTemplate({ ...editingTemplate, is_active: !editingTemplate.is_active })}
                                    className={`w-full p-3 rounded-input font-bold transition-all ${editingTemplate.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                                >
                                    {editingTemplate.is_active ? 'Активен' : 'Скрыт'}
                                </button>
                            </div>
                        </div>

                        {editingTemplate.id && !editingTemplate.is_local && !editingTemplate.id.startsWith('new_') && (
                            <button
                                onClick={() => handleDeleteTemplate(editingTemplate.id)}
                                className="w-full mt-4 p-3 bg-red-500/10 text-red-500 rounded-input font-bold hover:bg-red-500/20 transition-colors"
                            >
                                Удалить из базы
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-bg-secondary sticky bottom-0 z-20 pb-8 safe-bottom">
                    <button
                        onClick={() => handleSaveTemplate(editingTemplate)}
                        className="w-full bg-accent-blue text-white font-bold py-3.5 rounded-input shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform hover:bg-[#0069d9]"
                    >
                        {editingTemplate.is_local ? 'Разместить в базе' : 'Сохранить изменения'}
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default React.memo(TemplateEditModal);
