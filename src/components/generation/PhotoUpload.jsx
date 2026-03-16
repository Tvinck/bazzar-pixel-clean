import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Scan, X, PlusCircle } from 'lucide-react';

const PhotoUpload = ({
    maxImagesForModel,
    selectedImages,
    previewUrls,
    handleVisionAnalyze,
    isVisionAnalyzing,
    handleRemoveImage,
    handleFileChange,
    t,
    itemVariants
}) => {
    return (
        <AnimatePresence mode="wait">
            {maxImagesForModel > 0 && (
                <motion.div
                    variants={itemVariants}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4"
                >
                    <div className="bg-[#1c1c1e]/80 backdrop-blur-md border border-white/5 rounded-[18px] p-4 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ImageIcon size={18} className="text-[#3390ec]" />
                                <span className="text-[15px] font-bold text-white">{t('creation.sourcePhotos')}</span>
                            </div>
                            <span className="text-[12px] text-[#8e8e93] font-medium">{selectedImages.length} / {maxImagesForModel}</span>
                        </div>

                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className="relative flex-shrink-0 group">
                                    <div className="w-24 h-24 rounded-[12px] overflow-hidden border border-white/10 shadow-md">
                                        <img src={url} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleVisionAnalyze(idx)}
                                                disabled={isVisionAnalyzing}
                                                className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/40"
                                            >
                                                <Scan size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all z-10 border-2 border-[#1c1c1e]"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {selectedImages.length < maxImagesForModel && (
                                <button
                                    onClick={() => document.getElementById('file-upload').click()}
                                    className="w-24 h-24 rounded-[12px] bg-[#2c2c2e]/60 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1.5 text-[#8e8e93] hover:text-white hover:border-[#3390ec]/50 hover:bg-[#2c2c2e] transition-all active:scale-95 group"
                                >
                                    <PlusCircle size={24} className="group-hover:text-[#3390ec] transition-colors" />
                                    <span className="text-[11px] font-bold uppercase tracking-tighter">{t('creation.add')}</span>
                                </button>
                            )}
                        </div>
                        <input id="file-upload" type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default React.memo(PhotoUpload);
