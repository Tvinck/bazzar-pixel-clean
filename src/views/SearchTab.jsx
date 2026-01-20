import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SearchTab = () => {
    const { t } = useLanguage();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pt-2"
        >
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder={t.search.placeholder} className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-display text-lg text-slate-900 dark:text-white" autoFocus />
            </div>
            <div className="mt-8">
                <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4 ml-2">{t.search.recent}</h3>
                <div className="flex flex-wrap gap-2">
                    {['Cyberpunk', 'Anime Girl', 'Logo Design', 'NFT Art'].map(tag => (
                        <span key={tag} className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-medium text-sm border border-slate-100 dark:border-slate-700 shadow-sm">{tag}</span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default SearchTab;
