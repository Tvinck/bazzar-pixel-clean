import React, { useState, useEffect } from 'react';
import { Trophy, ChevronRight, Crown, Medal, User } from 'lucide-react';
import { analytics } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { TelegramModal, TelegramListItem } from './TelegramAnimations';

const LeaderboardDrawer = ({ isOpen, onClose }) => {

    // Fetch leaderboard
    const { data: leaderboard, isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            return await analytics.getLeaderboard();
        },
        enabled: isOpen, // Only fetch when open
        staleTime: 5 * 60 * 1000
    });

    return (
        <TelegramModal isOpen={isOpen} onClose={onClose}>
            <div className="flex-1 p-6 relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <span className="text-[11px] font-[800] text-amber-500 tracking-widest uppercase mb-1 block">Hall of Fame</span>
                        <h2 className="font-display font-[800] text-3xl text-white tracking-tight">Top Authors</h2>
                    </div>
                    {/* Close button is handled by drag handle, but we can keep this or remove */}
                </div>

                {/* Top 3 Podium */}
                <div className="flex justify-center items-end gap-4 mb-10 mt-4">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center opacity-80 scale-90">
                        <div className="w-14 h-14 rounded-full border-2 border-white/10 bg-white/5 mb-3 relative flex items-center justify-center text-2xl shadow-lg">
                            🥈
                            <span className="absolute -bottom-2 bg-[#1c1c1e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">#2</span>
                        </div>
                        <div className="h-16 w-16 bg-gradient-to-t from-white/10 to-transparent rounded-t-2xl border-t border-white/10" />
                    </div>
                    {/* 1st Place */}
                    <div className="flex flex-col items-center z-10 -mx-2">
                        <div className="w-20 h-20 rounded-full border-2 border-amber-500 bg-amber-500/10 mb-3 relative flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                            👑
                            <span className="absolute -bottom-3 bg-amber-500 text-black text-[11px] font-[900] px-3 py-0.5 rounded-full shadow-lg">#1</span>
                        </div>
                        <div className="h-24 w-20 bg-gradient-to-t from-amber-500/20 to-transparent rounded-t-2xl border-t border-amber-500/20" />
                    </div>
                    {/* 3rd Place */}
                    <div className="flex flex-col items-center opacity-80 scale-90">
                        <div className="w-14 h-14 rounded-full border-2 border-orange-700/30 bg-orange-900/10 mb-3 relative flex items-center justify-center text-2xl shadow-lg">
                            🥉
                            <span className="absolute -bottom-2 bg-[#1c1c1e] text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/20">#3</span>
                        </div>
                        <div className="h-14 w-16 bg-gradient-to-t from-orange-500/10 to-transparent rounded-t-2xl border-t border-orange-500/10" />
                    </div>
                </div>

                {/* List */}
                <div className="space-y-2 pb-10">
                    {isLoading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full mx-auto mb-2" />
                            <div className="text-white/30 text-xs font-medium">Loading champions...</div>
                        </div>
                    ) : (
                        leaderboard?.map((user, index) => (
                            <TelegramListItem key={user.telegram_id || index} delay={index * 0.05}>
                                <div className="flex items-center gap-4 bg-white/5 p-3 pr-4 rounded-[20px] active:scale-[0.98] transition-all border border-white/5 hover:bg-white/10">
                                    <div className="font-[800] text-white/20 w-8 text-center text-lg italic">
                                        {index + 1}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
                                        {user.first_name ? user.first_name[0].toUpperCase() : <User size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm leading-tight text-white/90 truncate">
                                            {user.first_name || 'Anonymous'}
                                        </h4>
                                        <p className="text-[11px] text-white/40 mt-0.5 font-medium flex items-center gap-2">
                                            <span>{user.total_generations} Gens</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span>Lvl {user.level || 1}</span>
                                        </p>
                                    </div>
                                    <div className="bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-xl text-xs font-[800] border border-amber-500/20 shadow-sm shrink-0">
                                        {user.xp} XP
                                    </div>
                                </div>
                            </TelegramListItem>
                        ))
                    )}
                    {!isLoading && (!leaderboard || leaderboard.length === 0) && (
                        <div className="text-center py-12 px-6 rounded-2xl bg-white/5 border border-white/5 border-dashed">
                            <div className="text-3xl mb-2">🏆</div>
                            <div className="text-white font-bold mb-1">Be the first!</div>
                            <div className="text-white/30 text-xs">Start creating to join the leaderboard.</div>
                        </div>
                    )}
                </div>
            </div>
        </TelegramModal>
    );
};

export default LeaderboardDrawer;
