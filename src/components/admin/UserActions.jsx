import React from 'react';
import { Save, X, Zap } from 'lucide-react';

const UserActions = ({ user, editingUser, setEditingUser, newBalance, setNewBalance, handleUpdateBalance }) => {
    return (
        <div className="flex items-center gap-3">
            {editingUser === user.id ? (
                <div className="flex items-center gap-2">
                    <input
                        autoFocus
                        className="w-16 bg-black/30 rounded px-2 py-1 text-right outline-none text-[13px]"
                        value={newBalance}
                        onChange={e => setNewBalance(e.target.value)}
                    />
                    <button onClick={() => handleUpdateBalance(user.id, newBalance)} className="p-1.5 bg-green-500/20 text-green-500 rounded"><Save size={14} /></button>
                    <button onClick={() => setEditingUser(null)} className="p-1.5 bg-white/10 text-white rounded"><X size={14} /></button>
                </div>
            ) : (
                <button onClick={() => { setEditingUser(user.id); setNewBalance(user.balance); }} className="flex items-center gap-1 bg-accent-blue/10 px-3 py-1.5 rounded-full">
                    <Zap size={12} className="text-accent-blue fill-current" />
                    <span className="text-[13px] font-bold text-accent-blue">{user.balance}</span>
                </button>
            )}
        </div>
    );
};

export default React.memo(UserActions);
