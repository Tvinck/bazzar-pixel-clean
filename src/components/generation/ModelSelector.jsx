import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Layers } from 'lucide-react';

const ModelSelector = ({
    t,
    filteredFamilies,
    selectedFamilyId,
    setSelectedFamilyId,
    setSelectedModelId,
    playClick,
    currentFamily,
    selectedModelId,
    currentModel,
    maxImagesForModel,
    itemVariants
}) => {
    return (
        <motion.div variants={itemVariants} className="space-y-4">
            <div className="px-4 flex items-center justify-between">
                <h2 className="text-[17px] font-bold text-white tracking-tight">{t('creation.model')}</h2>
                <div className="px-2 py-0.5 bg-accent-blue/10 text-accent-blue rounded-md text-[10px] font-bold uppercase tracking-wider">Premium AI</div>
            </div>

            {/* Family Selector */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 pb-2">
                {filteredFamilies.map(family => (
                    <button
                        key={family.id}
                        onClick={() => {
                            setSelectedFamilyId(family.id);
                            setSelectedModelId(family.models[0].id);
                            playClick();
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-input text-[15px] font-semibold whitespace-nowrap transition-all
                            ${selectedFamilyId === family.id
                                ? 'bg-accent-blue text-white'
                                : 'bg-bg-secondary text-text-secondary hover:bg-bg-elevated hover:text-white'
                            }`}
                    >
                        <span className="text-[17px]">{family.icon}</span>
                        <span>{family.name}</span>
                    </button>
                ))}
            </div>

            {/* Model Variants */}
            <div className="px-4 mb-3">
                {currentFamily.models.length > 1 && (
                    <div className="bg-bg-secondary rounded-input p-1 flex gap-1 overflow-x-auto no-scrollbar mb-3">
                        {currentFamily.models.map(model => (
                            <button
                                key={model.id}
                                onClick={() => { setSelectedModelId(model.id); playClick(); }}
                                className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all whitespace-nowrap flex-1
                                    ${selectedModelId === model.id
                                        ? 'bg-[#636366] text-white shadow-sm'
                                        : 'text-text-secondary hover:text-white'
                                    }`}
                            >
                                {model.name}
                            </button>
                        ))}
                    </div>
                )}
                {/* Model Description + Cost + Capabilities */}
                <motion.div
                    key={selectedModelId}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-bg-secondary rounded-input p-3.5 border border-white/5"
                >
                    <div className="flex justify-between items-start gap-3 mb-2.5">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Cpu size={14} className="text-accent-blue" />
                                <span className="text-[14px] font-semibold text-white">{currentModel?.name}</span>
                            </div>
                            <p className="text-[12px] text-text-secondary leading-tight">{currentModel?.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#ffcc00]/15 text-[#ffcc00] px-3 py-1.5 rounded-full text-[12px] font-bold flex-shrink-0">
                            <Zap size={12} className="fill-current" />
                            {currentModel?.pricing_type === 'resolution' ? '~' : ''}{currentModel?.base_cost}
                        </div>
                    </div>

                    {/* Capabilities Badges */}
                    {currentModel?.capabilities && (
                        <div className="flex flex-wrap gap-1.5">
                            {currentModel.capabilities.map(cap => (
                                <span
                                    key={cap}
                                    className="px-2 py-0.5 bg-bg-elevated text-[10px] font-medium text-text-secondary rounded-md border border-white/5"
                                >
                                    {cap.replace(/-/g, ' → ').replace(/^\w/, c => c.toUpperCase())}
                                </span>
                            ))}
                            {currentModel?.resolutions && (
                                <span className="px-2 py-0.5 bg-accent-blue/10 text-[10px] font-medium text-accent-blue rounded-md">
                                    до {currentModel.resolutions[currentModel.resolutions.length - 1]}
                                </span>
                            )}
                            {currentModel?.durations && (
                                <span className="px-2 py-0.5 bg-accent-purple/10 text-[10px] font-medium text-purple-400 rounded-md">
                                    {currentModel.durations.join(' / ')}
                                </span>
                            )}
                        </div>
                    )}
                </motion.div>

                {maxImagesForModel > 1 && (
                    <div className="mt-3">
                        <div className="inline-flex items-center gap-2 bg-accent-blue/10 text-accent-blue px-3 py-2 rounded-input text-[13px] font-medium">
                            <Layers size={16} />
                            {t('creation.addPhoto')} {t('creation.maxPhotos').replace('{max}', maxImagesForModel.toString())}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default React.memo(ModelSelector);
