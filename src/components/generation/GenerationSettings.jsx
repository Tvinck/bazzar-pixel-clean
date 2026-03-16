import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Music, Settings2 } from 'lucide-react';

const GenerationSettings = ({
    t,
    currentModel,
    currentFamily,
    customValues,
    setCustomValues,
    openDropdown,
    setOpenDropdown,
    itemVariants
}) => {
    return (
        <motion.div variants={itemVariants} className="space-y-4">
            <div className="px-5 flex items-center gap-2">
                <Settings2 size={18} className="text-text-secondary" />
                <h2 className="text-[16px] font-bold text-white tracking-tight">{t('creation.settings')}</h2>
            </div>
            <div className="px-4 md:px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* Aspect Ratio / Resolution */}
                {(currentModel?.pricing_type === 'resolution' || currentModel?.resolutions) ? (
                    <div className="relative">
                        <label className="text-[13px] font-semibold text-text-secondary mb-1.5 block ml-1">{t('creation.resolution')}</label>
                        <button
                            onClick={() => setOpenDropdown(openDropdown === 'res' ? null : 'res')}
                            className="w-full h-11 bg-bg-secondary rounded-input flex items-center justify-between px-3 text-[15px] font-medium"
                        >
                            <span className="text-white">{customValues.resolution || currentModel.default_res || '1K'}</span>
                            <ChevronDown size={18} className="text-text-secondary" />
                        </button>
                        <AnimatePresence>
                            {openDropdown === 'res' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-bg-elevated rounded-input overflow-hidden z-20 shadow-xl"
                                >
                                    {(currentModel.resolutions || ['1K', '2K']).map(res => (
                                        <button key={res}
                                            onClick={() => {
                                                setCustomValues(p => ({ ...p, resolution: res }));
                                                setOpenDropdown(null);
                                            }}
                                            className="w-full text-left px-4 py-3 text-[15px] text-white border-b border-white/5 last:border-0 hover:bg-bg-elevated"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span>{res}</span>
                                                {currentModel.pricing_type === 'resolution' && (
                                                    <span className="text-text-secondary text-[13px]">{res === '4K' ? '24 cr' : '18 cr'}</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    // Default Aspect Ratio selector for standard models
                    <div className="relative">
                        <label className="text-[13px] font-semibold text-text-secondary mb-1.5 block ml-1">{t('creation.aspectRatio')}</label>
                        <button
                            onClick={() => setOpenDropdown(openDropdown === 'ar' ? null : 'ar')}
                            className="w-full h-11 bg-bg-secondary rounded-input flex items-center justify-between px-3 text-[15px] font-medium"
                        >
                            <span className="text-white">{customValues.aspect_ratio || '1:1'}</span>
                            <ChevronDown size={18} className="text-text-secondary" />
                        </button>
                        {openDropdown === 'ar' && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-elevated rounded-input z-20 shadow-xl overflow-hidden">
                                {['1:1', '16:9', '9:16', '4:3', '3:4'].map(r => (
                                    <button key={r} onClick={() => { setCustomValues(p => ({ ...p, aspect_ratio: r })); setOpenDropdown(null); }} className="w-full text-left px-4 py-3 text-[15px] text-white border-b border-white/5 last:border-0 hover:bg-bg-elevated">
                                        {r}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Video Duration */}
                {currentFamily.id === 'video' && currentModel?.durations && (
                    <div>
                        <label className="text-[13px] font-semibold text-text-secondary mb-1.5 block ml-1">{t('creation.duration')}</label>
                        <div className="flex bg-bg-secondary rounded-input p-1 h-11 items-center">
                            {currentModel.durations.map(dur => (
                                <button key={dur}
                                    onClick={() => setCustomValues(p => ({ ...p, duration: dur }))}
                                    className={`flex-1 h-full rounded-[8px] text-[13px] font-medium transition-all ${customValues.duration === dur ? 'bg-[#636366] text-white shadow-sm' : 'text-text-secondary'}`}
                                >
                                    {dur}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Enable Audio (for Veo 3.1 or Suno) */}
                {currentModel?.inputs?.audio === 'boolean' && (
                    <div className="flex items-center justify-between bg-bg-secondary rounded-input px-4 h-11 col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2">
                            <Music size={16} className="text-[#3390ec]" />
                            <span className="text-[14px] font-medium text-white">Звук (Audio)</span>
                        </div>
                        <button
                            onClick={() => setCustomValues(p => ({ ...p, audio: !p.audio }))}
                            className={`w-10 h-6 rounded-full transition-colors relative ${customValues.audio ? 'bg-accent-blue' : 'bg-bg-elevated'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${customValues.audio ? 'left-5' : 'left-1'}`} />
                        </button>
                    </div>
                )}

                {/* Model-Specific Mode (e.g. Ideogram or Recraft) */}
                {currentModel?.modes && (
                    <div className="relative col-span-2 md:col-span-1">
                        <label className="text-[13px] font-semibold text-text-secondary mb-1.5 block ml-1">Режим (Mode)</label>
                        <button
                            onClick={() => setOpenDropdown(openDropdown === 'mode' ? null : 'mode')}
                            className="w-full h-11 bg-bg-secondary rounded-input flex items-center justify-between px-3 text-[15px] font-medium"
                        >
                            <span className="text-white capitalize">{(customValues.mode || currentModel.default_mode || currentModel.modes[0]).replace(/-/g, ' ')}</span>
                            <ChevronDown size={18} className="text-text-secondary" />
                        </button>
                        {openDropdown === 'mode' && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-elevated rounded-input z-20 shadow-xl overflow-hidden">
                                {currentModel.modes.map(m => (
                                    <button key={m} onClick={() => { setCustomValues(p => ({ ...p, mode: m })); setOpenDropdown(null); }} className="w-full text-left px-4 py-3 text-[15px] text-white border-b border-white/5 last:border-0 hover:bg-bg-elevated capitalize">
                                        {m.replace(/-/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default React.memo(GenerationSettings);
