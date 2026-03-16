import React from 'react';
import { RefreshCw, BarChart3, ShieldAlert, Layout, PartyPopper, Video, Users, MessageSquare, Send, Zap, Tag } from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, fetchData, isRefreshing }) => {
    return (
        <div className="sticky top-0 z-40 bg-bg-secondary/90 backdrop-blur-md border-b border-white/5 px-4 pt-12 pb-3">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold tracking-tight">Pixel Admin</h1>
                <button
                    onClick={fetchData}
                    className={`p-2 bg-bg-elevated rounded-full text-white/50 hover:text-white ${isRefreshing ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                    { id: 'dashboard', label: 'Статистика', icon: BarChart3 },
                    { id: 'system', label: 'Система', icon: ShieldAlert },
                    { id: 'templates', label: 'Шаблоны', icon: Layout },
                    { id: 'greetings', label: 'Поздравления', icon: PartyPopper },
                    { id: 'monitoring', label: 'Эфир', icon: Video },
                    { id: 'users', label: 'Люди', icon: Users },
                    { id: 'messages', label: 'Рассылка', icon: MessageSquare },
                    { id: 'publications', label: 'Публикации', icon: Send },
                    { id: 'models', label: 'Models', icon: Zap },
                    { id: 'promotions', label: 'Акции', icon: Tag },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-accent-blue text-white shadow-lg shadow-blue-500/20'
                            : 'bg-bg-elevated text-gray-400 hover:text-white'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default React.memo(AdminSidebar);
