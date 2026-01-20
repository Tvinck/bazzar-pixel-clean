import React from 'react';

const NavButton = ({ icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`p-3 rounded-full transition-all relative ${isActive ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white'}`}
    >
        <Icon size={24} strokeWidth={2} />
        {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_#FBBF24]"></div>}
    </button>
);

export default NavButton;
