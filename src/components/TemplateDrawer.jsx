import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Upload, Zap, Film, Check, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSound } from '../context/SoundContext';
import { AnimatedButton } from './ui/AnimatedButtons';

const TemplateDrawer = ({ isOpen, onClose, template }) => {
    const { t } = useLanguage();
    const { playClick, playSuccess } = useSound();

    // Multi-file support
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    // Dynamic fields support
    const [formValues, setFormValues] = useState({});

    const [generationsCount, setGenerationsCount] = useState(1);
    const COST_PER_GEN = 15;

    // Reset state when template opens/closes or changes
    useEffect(() => {
        if (isOpen && template) {
            setSelectedFiles(new Array(template.requiredFilesCount || 1).fill(null));
            setPreviewUrls(new Array(template.requiredFilesCount || 1).fill(null));
            setFormValues({});
            setGenerationsCount(1);
        } else {
            // Cleanup URLs
            previewUrls.forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        }
    }, [isOpen, template]);

    const requiredFilesCount = template?.requiredFilesCount || 1;
    const fields = template?.fields || [];

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            playClick();

            const newFiles = [...selectedFiles];
            newFiles[index] = file;
            setSelectedFiles(newFiles);

            const newUrls = [...previewUrls];
            if (newUrls[index]) URL.revokeObjectURL(newUrls[index]);
            newUrls[index] = URL.createObjectURL(file);
            setPreviewUrls(newUrls);
        }
    };

    const handleRemoveFile = (index) => {
        playClick();
        const newFiles = [...selectedFiles];
        newFiles[index] = null;
        setSelectedFiles(newFiles);

        const newUrls = [...previewUrls];
        if (newUrls[index]) URL.revokeObjectURL(newUrls[index]);
        newUrls[index] = null;
        setPreviewUrls(newUrls);
    };

    const handleFieldChange = (id, value) => {
        setFormValues(prev => ({ ...prev, [id]: value }));
    };

    const handleGenerate = () => {
        // Validation
        const validFiles = selectedFiles.filter(f => f).length;
        if (validFiles < requiredFilesCount) return;

        playClick();
        playSuccess();

        console.log('Generating with:', {
            template: template.id,
            files: selectedFiles,
            fields: formValues,
            count: generationsCount
        });

        const fieldSummary = Object.entries(formValues).map(([k, v]) => `${k}: ${v}`).join(', ');
        alert(`Generation Started!\n\nTemplate: ${template.title}\nFiles Uploaded: ${validFiles}\nOptions: ${fieldSummary || 'Default'}\nTotal Cost: ${generationsCount * COST_PER_GEN} credits`);

        onClose();
    };

    if (!template) return null;

    // Check if all requirements met
    const isFilesReady = selectedFiles.filter(f => f).length >= requiredFilesCount;
    // Check required fields? Assuming all fields optional or text for now.
    // Ideally we add 'required' to fields config. Assuming all required for now if text.
    // const isFieldsReady = fields.every(f => formValues[f.id]); 
    const isReady = isFilesReady;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 w-full h-[95%] bg-[#F8F9FC] dark:bg-pixel-dark rounded-t-[2.5rem] z-[70] shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full flex justify-center pt-4 pb-2" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>

                        <div className="flex-1 p-6 relative overflow-y-auto pb-24">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <span className="text-xs font-bold text-indigo-500 tracking-widest uppercase mb-1 block">Template</span>
                                    <h2 className="font-display font-bold text-2xl leading-none pr-4">{template.title}</h2>
                                </div>
                                <button onClick={onClose} className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300">
                                    <ChevronRight className="rotate-90" />
                                </button>
                            </div>

                            {/* Template Preview */}
                            <div className="aspect-[9/16] w-full max-w-[200px] mx-auto rounded-3xl overflow-hidden shadow-2xl mb-8 bg-black relative ring-4 ring-white dark:ring-slate-800/50">
                                {template.mediaType === 'image' ? (
                                    <img
                                        src={template.src}
                                        className="w-full h-full object-cover"
                                        alt={template.title}
                                    />
                                ) : (
                                    <video
                                        src={template.src}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-xs text-center">
                                    <p className="font-medium line-clamp-2">{template.description}</p>
                                </div>
                            </div>

                            {/* Inputs Section */}
                            <div className="space-y-8 max-w-sm mx-auto">

                                {/* 1. File Uploads */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Upload size={16} className="text-indigo-500" />
                                            {template.fileLabel || `Upload Photo${requiredFilesCount > 1 ? 's' : ''}`}
                                        </label>
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                            {selectedFiles.filter(Boolean).length}/{requiredFilesCount}
                                        </span>
                                    </div>

                                    <div className={`grid gap-3 ${requiredFilesCount > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                        {Array.from({ length: requiredFilesCount }).map((_, i) => (
                                            <div key={i} className={`relative group ${requiredFilesCount > 1 ? 'aspect-square' : 'aspect-[2/1]'}`}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, i)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                    disabled={!!previewUrls[i]}
                                                />
                                                <div className={`
                                                    w-full h-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2
                                                    ${previewUrls[i]
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10'
                                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'}
                                                `}>
                                                    {previewUrls[i] ? (
                                                        <div className="relative w-full h-full">
                                                            <img src={previewUrls[i]} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveFile(i); }}
                                                                className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 text-red-500 p-1.5 rounded-full z-30 shadow-sm hover:scale-110 transition-transform"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm text-indigo-500">
                                                                <Upload size={18} />
                                                            </div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                {requiredFilesCount > 1 ? `Photo #${i + 1}` : 'Select Photo'}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Dynamic Fields */}
                                {fields.length > 0 && (
                                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        {fields.map(field => (
                                            <div key={field.id} className="space-y-2">
                                                <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">
                                                    {field.label}
                                                </label>
                                                {field.type === 'select' ? (
                                                    <div className="relative">
                                                        <select
                                                            value={formValues[field.id] || ''}
                                                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                            className="w-full px-4 py-3 pr-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none font-medium transition-all"
                                                        >
                                                            <option value="" disabled>Выберите опцию</option>
                                                            {field.options.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                            <ChevronRight className="rotate-90 w-4 h-4" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type={field.type || 'text'}
                                                        placeholder={field.placeholder}
                                                        value={formValues[field.id] || ''}
                                                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                        className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium placeholder:text-slate-400 transition-all text-sm"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* 3. Generations Count */}
                                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <label className="text-sm font-bold text-slate-500 ml-1">Generations Count</label>
                                    <div className="flex gap-2">
                                        {[1, 5, 10].map(count => (
                                            <button
                                                key={count}
                                                onClick={() => { setGenerationsCount(count); playClick(); }}
                                                className={`
                                                    flex-1 py-2.5 rounded-xl border-2 font-bold text-sm relative overflow-hidden transition-all
                                                    ${generationsCount === count
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300'
                                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                                    }
                                                `}
                                            >
                                                {count}x
                                                {generationsCount === count && (
                                                    <div className="absolute top-1 right-1 text-indigo-500">
                                                        <Check size={10} strokeWidth={4} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-4 px-1">
                                <span className="text-sm font-medium text-slate-500">Total Cost</span>
                                <div className="flex items-center gap-1.5 font-bold text-xl text-slate-900 dark:text-white">
                                    <Zap size={20} className="text-amber-400 fill-amber-400" />
                                    {generationsCount * COST_PER_GEN}
                                </div>
                            </div>
                            <AnimatedButton
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={handleGenerate}
                                disabled={!isReady}
                                icon={<Film size={20} />}
                            >
                                Generate
                            </AnimatedButton>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TemplateDrawer;
