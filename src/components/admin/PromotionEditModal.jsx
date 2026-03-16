import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, ToggleLeft, ToggleRight, Loader2, Plus } from 'lucide-react';

const PromotionEditModal = ({
    editingPromotion, setEditingPromotion,
    handleSavePromotion
}) => {
    if (!editingPromotion) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999999] flex justify-center items-end sm:items-center p-0 sm:p-4 font-sans">
                <motion.div
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setEditingPromotion(null)}
                />

                <motion.div
                    className="bg-bg-secondary w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[24px] sm:rounded-[24px] relative z-10 flex flex-col border border-white/10 shadow-2xl overflow-hidden"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-bg-secondary z-20 shrink-0">
                        <h3 className="text-lg font-bold text-white">{editingPromotion.id?.startsWith('new_') ? 'Новая акция' : 'Редактирование акции'}</h3>
                        <button onClick={() => setEditingPromotion(null)} className="p-2 bg-bg-elevated rounded-full hover:bg-white/10 transition-colors text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-safe-bottom">
                        <div>
                            <label className="text-[11px] text-gray-500 uppercase block mb-1">Название акции</label>
                            <input
                                className="w-full bg-bg-elevated p-3 rounded-input text-white outline-none placeholder:text-gray-600"
                                placeholder="Summer Sale"
                                value={editingPromotion.title || ''}
                                onChange={e => setEditingPromotion({ ...editingPromotion, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[11px] text-gray-500 uppercase block mb-1">Описание</label>
                            <textarea
                                className="w-full bg-bg-elevated p-3 rounded-input text-white outline-none placeholder:text-gray-600 h-24"
                                placeholder="-50% на все генерации..."
                                value={editingPromotion.description || ''}
                                onChange={e => setEditingPromotion({ ...editingPromotion, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] text-gray-500 uppercase block mb-1">Скидка (%)</label>
                                <input
                                    type="number"
                                    className="w-full bg-bg-elevated p-3 rounded-input text-white outline-none"
                                    value={editingPromotion.discount_percent || 0}
                                    onChange={e => setEditingPromotion({ ...editingPromotion, discount_percent: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-gray-500 uppercase block mb-1">Banner URL (опц.)</label>
                                <input
                                    className="w-full bg-bg-elevated p-3 rounded-input text-white outline-none"
                                    placeholder="https://..."
                                    value={editingPromotion.banner_url || ''}
                                    onChange={e => setEditingPromotion({ ...editingPromotion, banner_url: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] text-gray-500 uppercase block mb-1">Начало</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-bg-elevated p-3 rounded-input text-white outline-none text-[13px] appearance-none"
                                    value={editingPromotion.valid_from ? new Date(editingPromotion.valid_from).toISOString().slice(0, 16) : ''}
                                    onChange={e => setEditingPromotion({ ...editingPromotion, valid_from: new Date(e.target.value).toISOString() })}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-gray-500 uppercase block mb-1">Конец</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-bg-elevated p-3 rounded-input text-white outline-none text-[13px] appearance-none"
                                    value={editingPromotion.valid_until ? new Date(editingPromotion.valid_until).toISOString().slice(0, 16) : ''}
                                    onChange={e => setEditingPromotion({ ...editingPromotion, valid_until: new Date(e.target.value).toISOString() })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[11px] text-gray-500 uppercase">Статус:</label>
                            <button
                                onClick={() => setEditingPromotion({ ...editingPromotion, is_active: !editingPromotion.is_active })}
                                className={`px-4 py-2 rounded-lg font-bold transition-all text-[13px] ${editingPromotion.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                            >
                                {editingPromotion.is_active ? 'Активна' : 'Отключена'}
                            </button>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/10 bg-bg-secondary sticky bottom-0 z-20 pb-8 safe-bottom">
                        <button
                            onClick={() => handleSavePromotion(editingPromotion)}
                            className="w-full bg-accent-blue text-white font-bold py-3.5 rounded-input shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Сохранить акцию
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default React.memo(PromotionEditModal);
