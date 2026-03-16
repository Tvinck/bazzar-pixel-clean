import React from 'react';
import { Zap } from 'lucide-react';

const AdminStats = ({ metrics, stats }) => {
    return (
        <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-elevated p-4 rounded-card border border-white/5 relative overflow-hidden group hover:border-accent-blue/30 transition-colors">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-accent-blue/10 rounded-full blur-xl group-hover:bg-accent-blue/20 transition-colors" />
                    <div className="text-[28px] font-black">{metrics?.totals?.users || stats.users || 0}</div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">Всего Юзеров</div>
                </div>
                <div className="bg-bg-elevated p-4 rounded-card border border-white/5 relative overflow-hidden group hover:border-[#34c759]/30 transition-colors">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-accent-blue/10 rounded-full blur-xl group-hover:bg-accent-blue/20 transition-colors" />
                    <div className="text-[28px] font-black text-accent-blue">{metrics?.activeUsers24h || 0}</div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">Актив. (24h)</div>
                </div>
                <div className="bg-bg-elevated p-4 rounded-card border border-white/5 relative overflow-hidden col-span-2 group hover:border-[#ff9500]/30 transition-colors">
                    <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#ff9500]/10 to-transparent pointer-events-none" />
                    <div className="text-[32px] font-black tracking-tight flex items-center gap-3">
                        {metrics?.conversion || '0%'}
                        <span className="text-[14px] font-medium text-gray-400 bg-white/5 px-2 py-1 rounded-lg">Deposits / Users</span>
                    </div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">Конверсия оплат</div>
                </div>
            </div>

            {/* Timeline Chart */}
            <div className="bg-bg-elevated p-5 rounded-card border border-white/5">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center justify-between">
                    <span>Генерации (7 дней)</span>
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px]">{metrics?.totals?.recentGens || 0} всего</span>
                </h3>

                <div className="h-40 flex items-end gap-2 shrink-0 overflow-x-auto no-scrollbar pb-2">
                    {metrics?.timeline && metrics.timeline.length > 0 ? (
                        (() => {
                            const max = Math.max(...metrics.timeline.map(d => d.count), 1);
                            return metrics.timeline.map((point, idx) => (
                                <div key={idx} className="flex-1 min-w-[32px] flex flex-col items-center justify-end gap-2 group">
                                    <div className="w-full relative flex justify-center group-hover:-translate-y-1 transition-transform">
                                        <span className="absolute -top-7 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                                            {point.count}
                                        </span>
                                        <div
                                            className="w-full max-w-[40px] bg-gradient-to-t from-[#007aff]/20 to-[#007aff] rounded-t-md transition-all duration-500"
                                            style={{ height: `${(point.count / max) * 120}px`, minHeight: '4px' }}
                                        />
                                    </div>
                                    <span className="text-[9px] text-gray-500 font-medium">{point.date}</span>
                                </div>
                            ));
                        })()
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-[12px]">Нет данных за период</div>
                    )}
                </div>
            </div>

            {/* Top Prompts */}
            <div className="bg-bg-elevated rounded-card border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-400">Топ Промптов</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {metrics?.topPrompts?.length > 0 ? (
                        metrics.topPrompts.map((p, idx) => (
                            <div key={idx} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : idx === 1 ? 'bg-gray-400/20 text-gray-400' : idx === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-white/5 text-gray-500'}`}>
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium text-white truncate">{p.prompt}</p>
                                </div>
                                <div className="text-[12px] font-mono text-gray-400 bg-black/30 px-2 py-1 rounded">
                                    {p.count}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 text-[13px]">Мало данных для статистики</div>
                    )}
                </div>
            </div>

            {/* Cache Stats */}
            {metrics?.cache && (
                <div className="bg-gradient-to-br from-[#2c2c2e] to-[#1c1c1e] p-5 rounded-card border border-accent-blue/20 shadow-[0_0_30px_rgba(0,122,255,0.05)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[13px] font-bold uppercase tracking-wider text-accent-blue flex items-center gap-2">
                            <Zap size={14} /> LRU Prompt Cache
                        </h3>
                        <span className="text-[10px] font-mono bg-accent-blue/10 text-accent-blue px-2 py-1 rounded-full">{metrics.cache.size} records</span>
                    </div>

                    <div className="flex h-3 rounded-full overflow-hidden bg-black/40 mb-3">
                        <div className="h-full bg-accent-blue" style={{ width: `${metrics.cache.hits + metrics.cache.misses === 0 ? 0 : (metrics.cache.hits / (metrics.cache.hits + metrics.cache.misses)) * 100}%` }} title="Hits" />
                        <div className="h-full bg-red-500/50" style={{ width: `${metrics.cache.hits + metrics.cache.misses === 0 ? 0 : (metrics.cache.misses / (metrics.cache.hits + metrics.cache.misses)) * 100}%` }} title="Misses" />
                    </div>

                    <div className="flex justify-between text-[11px] font-medium uppercase tracking-wider">
                        <span className="text-accent-blue">Hits: {metrics.cache.hits}</span>
                        <span className="text-red-400">Misses: {metrics.cache.misses}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(AdminStats);
