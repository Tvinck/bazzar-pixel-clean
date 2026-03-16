import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';

const GenerationButton = ({
    cost,
    handleGenerate,
    isProcessing,
    isCanceling,
    cancelCountdown,
    t
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] bg-gradient-to-t from-black via-black/90 to-transparent pt-10 z-30 pointer-events-none md:max-w-3xl md:mx-auto">
            <div className="pointer-events-auto">
                <div className="flex items-center gap-3 mb-3 px-1">
                    <div className="flex-1 h-[1px] bg-white/5" />
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-text-secondary">
                        <span>Стоимость:</span>
                        <div className="flex items-center gap-1 text-[#ffcc00] bg-[#ffcc00]/10 px-2 py-0.5 rounded-full">
                            <Zap size={12} className="fill-current" />
                            {cost} ⚡
                        </div>
                    </div>
                    <div className="flex-1 h-[1px] bg-white/5" />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={(isProcessing && !isCanceling)}
                    className={`w-full h-[58px] rounded-[18px] font-black text-[18px] shadow-2xl transition-all relative overflow-hidden group 
                        ${isCanceling 
                            ? 'bg-red-500/20 border border-red-500/50 text-red-500' 
                            : 'bg-gradient-to-r from-[#007aff] to-[#3390ec] text-white'}`}
                >
                    <AnimatePresence mode="wait">
                        {isCanceling ? (
                            <motion.div 
                                key="cancel"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center justify-center gap-3"
                            >
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-500 text-white text-[14px] font-bold">
                                    {cancelCountdown}
                                </span>
                                {t('creation.cancel')}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="generate"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center justify-center gap-2"
                            >
                                <Sparkles size={22} className="animate-pulse" />
                                {t('creation.generate')}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </div>
    );
};

export default React.memo(GenerationButton);
