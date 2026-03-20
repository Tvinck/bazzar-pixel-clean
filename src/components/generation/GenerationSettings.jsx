import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Music, Settings2, Check } from 'lucide-react';
import BottomSheet from '../ui/BottomSheet';

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
                        
                        <BottomSheet
                            isOpen={openDropdown === 'res'}
                            onClose={() => setOpenDropdown(null)}
                            title={t('creation.resolution')}
                        >
                            <div className="space-y-1">
                                {(currentModel.resolutions || ['1K', '2K']).map(res => (
                                    <button 
                                        key={res}
                                        onClick={() => {
                                            setCustomValues(p => ({ ...p, resolution: res }));
                                            setOpenDropdown(null);
                                        }}
                                        className={`w-full text-left px-4 py-3.5 rounded-input text-[17px] transition-all flex justify-between items-center ${customValues.resolution === res ? 'bg-accent-blue/10 text-accent-blue' : 'text-white hover:bg-bg-elevated'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span>{res}</span>
                                            {currentModel.pricing_type === 'resolution' && (
                                                <span className="text-text-secondary text-[12px]">{res === '4K' ? '24 cr' : '18 cr'}</span>
                                            )}
                                        </div>
                                        {customValues.resolution === res && <Check size={20} className="text-accent-blue" />}
                                    </button>
                                ))}
                            </div>
                        </BottomSheet>
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

                        <BottomSheet
                            isOpen={openDropdown === 'ar'}
                            onClose={() => setOpenDropdown(null)}
                            title={t('creation.aspectRatio')}
                        >
                            <div className="space-y-1">
                                {['1:1', '16:9', '9:16', '4:3', '3:4'].map(r => (
                                    <button 
                                        key={r} 
                                        onClick={() => { setCustomValues(p => ({ ...p, aspect_ratio: r })); setOpenDropdown(null); }} 
                                        className={`w-full text-left px-4 py-3.5 rounded-input text-[17px] transition-all flex justify-between items-center ${customValues.aspect_ratio === r ? 'bg-accent-blue/10 text-accent-blue' : 'text-white hover:bg-bg-elevated'}`}
                                    >
                                        {r}
                                        {customValues.aspect_ratio === r && <Check size={20} className="text-accent-blue" />}
                                    </button>
                                ))}
                            </div>
                        </BottomSheet>
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
                        
                        <BottomSheet
                            isOpen={openDropdown === 'mode'}
                            onClose={() => setOpenDropdown(null)}
                            title="Выберите режим"
                        >
                            <div className="space-y-1">
                                {currentModel.modes.map(m => (
                                    <button 
                                        key={m} 
                                        onClick={() => { setCustomValues(p => ({ ...p, mode: m })); setOpenDropdown(null); }} 
                                        className={`w-full text-left px-4 py-3.5 rounded-input text-[17px] transition-all flex justify-between items-center capitalize ${customValues.mode === m ? 'bg-accent-blue/10 text-accent-blue' : 'text-white hover:bg-bg-elevated'}`}
                                    >
                                        {m.replace(/-/g, ' ')}
                                        {customValues.mode === m && <Check size={20} className="text-accent-blue" />}
                                    </button>
                                ))}
                            </div>
                        </BottomSheet>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default React.memo(GenerationSettings);
