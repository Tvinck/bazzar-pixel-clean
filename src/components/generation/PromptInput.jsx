import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Clock, Sparkles, Recycle } from 'lucide-react';
import { CreateGraphic } from '../ui/GuideGraphics';

const PromptInput = ({
    inputs,
    setInputs,
    t,
    showPromptHistory,
    setShowPromptHistory,
    recentPrompts,
    handleVoiceInput,
    isListening,
    handleEnhancePrompt,
    isEnhancing,
    showRefine,
    setShowRefine,
    PRESET_STYLES,
    handleAddPreset,
    playClick,
    itemVariants
}) => {
    return (
        <motion.div variants={itemVariants} className="px-4">
            <div className="bg-bg-secondary/80 backdrop-blur-md border border-white/5 rounded-[18px] p-4 relative shadow-lg overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3390ec]/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-input bg-gradient-to-br from-blue-500 to-[#3390ec] flex items-center justify-center shadow-md">
                        <CreateGraphic />
                    </div>
                    <div>
                        <h2 className="text-[17px] font-bold text-white tracking-tight leading-tight">{t('creation.question')}</h2>
                        <p className="text-[13px] text-gray-400 mt-0.5 font-medium">{t('creation.describeIdea')}</p>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="relative">
                        <textarea
                            placeholder={t('creation.placeholder')}
                            value={inputs.prompt || ''}
                            onChange={e => setInputs({ ...inputs, prompt: e.target.value })}
                            onFocus={() => setShowPromptHistory(true)}
                            onBlur={() => setTimeout(() => setShowPromptHistory(false), 200)}
                            className="w-full bg-bg-elevated/60 focus:bg-bg-elevated/90 rounded-input p-3.5 pr-12 text-white text-[15px] placeholder:text-text-secondary resize-none outline-none min-h-[100px] leading-relaxed transition-all shadow-inner border border-white/5 focus:border-[#3390ec]/50"
                        />
                        <button
                            onClick={handleVoiceInput}
                            className={`absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                        </button>
                    </div>

                    <AnimatePresence>
                        {showPromptHistory && recentPrompts.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-bg-elevated border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
                            >
                                <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2 text-gray-400">
                                    <Clock size={14} />
                                    <span className="text-[12px] font-medium uppercase tracking-wider">Недавние промпты</span>
                                </div>
                                {recentPrompts.map((p, idx) => (
                                    <button
                                        key={idx}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setInputs({ ...inputs, prompt: p });
                                            setShowPromptHistory(false);
                                        }}
                                        className="w-full text-left px-3 py-3 text-[14px] text-white border-b border-white/5 last:border-none hover:bg-bg-elevated transition-colors truncate"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEnhancePrompt}
                        disabled={isEnhancing || !inputs.prompt?.trim()}
                        className={`px-4 py-1.5 rounded-input text-[13px] font-bold whitespace-nowrap transition-all shadow-sm focus:outline-none flex items-center gap-1.5 flex-shrink-0
                            ${inputs.prompt?.trim()
                                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400/50'
                                : 'bg-bg-elevated/40 border border-white/5 text-text-secondary cursor-not-allowed'
                            }`}
                    >
                        {isEnhancing ? (
                            <><span className="w-3.5 h-3.5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" /> Улучшаю...</>
                        ) : (
                            <><Sparkles size={14} /> Улучшить</>
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setShowRefine(!showRefine); playClick(); }}
                        disabled={!inputs.prompt?.trim()}
                        className={`px-4 py-1.5 rounded-input text-[13px] font-bold whitespace-nowrap transition-all shadow-sm focus:outline-none flex items-center gap-1.5 flex-shrink-0
                            ${showRefine
                                ? 'bg-blue-500 text-white border border-blue-400'
                                : inputs.prompt?.trim()
                                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:text-white hover:border-blue-400'
                                    : 'bg-bg-elevated/40 border border-white/5 text-text-secondary cursor-not-allowed'
                            }`}
                    >
                        <Recycle size={14} /> {showRefine ? 'Отмена' : 'Изменить'}
                    </motion.button>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {PRESET_STYLES.map(style => (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                key={style.id}
                                onClick={() => handleAddPreset(style.prompt)}
                                className="px-3.5 py-1.5 rounded-input bg-bg-elevated/80 border border-white/5 text-[13px] font-semibold text-white whitespace-nowrap active:bg-bg-elevated transition-all shadow-sm focus:outline-none"
                            >
                                {style.label}
                            </motion.button>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {showRefine && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-white/5"
                        >
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Что изменить? (например: сделай в стиле киберпанк)"
                                    className="flex-1 bg-bg-elevated rounded-input px-3 py-2 text-[14px] text-white outline-none border border-white/5 focus:border-blue-500/50"
                                    autoFocus
                                />
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-input text-[13px] font-bold">
                                    OK
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default React.memo(PromptInput);
