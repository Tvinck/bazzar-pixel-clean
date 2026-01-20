import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronRight, Crown, Medal, User } from 'lucide-react';
import { analytics } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';

const LeaderboardDrawer = ({ isOpen, onClose }) => {

    // Fetch leaderboard
    const { data: leaderboard, isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            return await analytics.getLeaderboard();
        },
        enabled: isOpen // Only fetch when open
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]" />
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 w-full h-[85%] bg-[#F8F9FC] dark:bg-pixel-dark rounded-t-[2.5rem] z-[70] shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-full flex justify-center pt-4 pb-2" onClick={onClose}><div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" /></div>

                <div className="flex-1 p-6 relative overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <span className="text-xs font-bold text-amber-500 tracking-widest uppercase mb-1 block">Excellence</span>
                            <h2 className="font-display font-bold text-3xl">Top Authors</h2>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300"><ChevronRight className="rotate-90" /></button>
                    </div>

                    {/* Top 3 Podium (Placeholder for visual flair) */}
                    <div className="flex justify-center items-end gap-4 mb-8">
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-300 bg-slate-200 dark:bg-slate-800 mb-2 relative">
                                <span className="absolute -bottom-2 -right-1 bg-slate-400 text-white text-[10px] font-bold px-1.5 rounded-full ring-2 ring-white">2</span>
                            </div>
                            <div className="h-16 w-16 bg-slate-200 dark:bg-slate-800 rounded-t-lg" />
                        </div>
                        {/* 1st Place */}
                        <div className="flex flex-col items-center z-10">
                            <div className="w-20 h-20 rounded-full border-4 border-amber-400 bg-amber-100 dark:bg-amber-900/30 mb-2 relative shadow-lg shadow-amber-500/20">
                                <Crown size={24} className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-400 fill-amber-400 animate-bounce" />
                                <span className="absolute -bottom-2 -right-1 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ring-2 ring-white">1</span>
                            </div>
                            <div className="h-24 w-20 bg-gradient-to-t from-amber-200 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/20 rounded-t-xl" />
                        </div>
                        {/* 3rd Place */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full border-4 border-orange-300 bg-orange-100 dark:bg-orange-900/20 mb-2 relative">
                                <span className="absolute -bottom-2 -right-1 bg-orange-400 text-white text-[10px] font-bold px-1.5 rounded-full ring-2 ring-white">3</span>
                            </div>
                            <div className="h-12 w-16 bg-orange-100 dark:bg-orange-900/10 rounded-t-lg" />
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-3 pb-10">
                        {isLoading ? (
                            <div className="text-center py-10 text-slate-500">Loading champions...</div>
                        ) : (
                            leaderboard?.map((user, index) => (
                                <div key={user.telegram_id || index} className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-700/50">
                                    <div className="font-bold text-slate-400 w-6 text-center">{index + 1}</div>
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-500 font-bold text-sm">
                                        {user.first_name ? user.first_name[0] : <User size={16} />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm leading-tight">{user.first_name || 'Anonymous'}</h4>
                                        <p className="text-[10px] text-slate-500">{user.total_generations} Gens • Level {user.level || 1}</p>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg text-xs font-bold">
                                        {user.xp} XP
                                    </div>
                                </div>
                            ))
                        )}
                        {!isLoading && leaderboard?.length === 0 && (
                            <div className="text-center py-10 text-slate-500">No data available yet.</div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LeaderboardDrawer;
