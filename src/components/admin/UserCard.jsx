import React from 'react';
import { Users } from 'lucide-react';
import UserActions from './UserActions';

const UserCard = ({ user, editingUser, setEditingUser, newBalance, setNewBalance, handleUpdateBalance }) => {
    return (
        <div className="bg-[#2c2c2e] p-4 rounded-[16px] flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <Users size={18} />}
                </div>
                <div className="min-w-0">
                    <div className="font-medium text-[14px] truncate">{user.first_name || 'User'}</div>
                    <div className="text-[11px] text-gray-500 truncate">@{user.username} • {user.total_gens} gens</div>
                </div>
            </div>
            <UserActions
                user={user}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                newBalance={newBalance}
                setNewBalance={setNewBalance}
                handleUpdateBalance={handleUpdateBalance}
            />
        </div>
    );
};

export default React.memo(UserCard);
