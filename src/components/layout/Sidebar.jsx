import React from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, Plus, History, User, Zap } from 'lucide-react';
import { useUser } from '../../context/UserContext';

// eslint-disable-next-line no-unused-vars
const SidebarItem = ({ icon: _Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
            ? 'bg-white/10 text-white shadow-inner'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
    >
        <_Icon
            size={20}
            className={`transition-colors ${isActive ? 'text-[#3390ec]' : 'group-hover:text-white'}`}
        />
        <span className="text-sm font-medium">{label}</span>
        {isActive && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3390ec]" />
        )}
    </button>
);

const Sidebar = ({ activeTab, onTabChange, onCreateClick }) => {
    const { user, stats } = useUser();

    // Helper to determine if a route is active (including sub-routes if needed)
    const isActive = (tab) => activeTab === tab;

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0f0f0f] border-r border-white/5 flex flex-col z-50 hidden md:flex">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-[#3390ec] to-[#89216B] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <span className="text-white font-bold text-lg">P</span>
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">Pixel AI</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                <SidebarItem
                    icon={Home}
                    label="Главная"
                    isActive={isActive('home')}
                    onClick={() => onTabChange('home')}
                />
                <SidebarItem
                    icon={Compass}
                    label="Галерея"
                    isActive={isActive('gallery')}
                    onClick={() => onTabChange('gallery')}
                />
                <SidebarItem
                    icon={History}
                    label="История"
                    isActive={isActive('history')}
                    onClick={() => onTabChange('history')}
                />
                <SidebarItem
                    icon={User}
                    label="Профиль"
                    isActive={isActive('profile')}
                    onClick={() => onTabChange('profile')}
                />
            </nav>

            {/* Create Button (Prominent) */}
            <div className="px-4 mb-8">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCreateClick}
                    className="w-full py-3 bg-gradient-to-r from-[#3390ec] to-[#007aff] rounded-xl text-white font-semibold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    <span>Создать</span>
                </motion.button>
            </div>

            {/* User Stats / Profile Mini */}
            <div className="p-4 border-t border-white/5 bg-[#1c1c1e]/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden border border-white/10">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/50">
                                <User size={18} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.username || 'Guest User'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Zap size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-gray-400 font-mono">
                                {(stats?.current_balance || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};


export default Sidebar;
