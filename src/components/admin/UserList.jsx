import React from 'react';
import UserCard from './UserCard';

const UserList = ({
    searchQuery,
    setSearchQuery,
    searchFilteredUsers,
    editingUser,
    setEditingUser,
    newBalance,
    setNewBalance,
    handleUpdateBalance
}) => {
    return (
        <div className="space-y-4">
            <input
                className="w-full bg-bg-elevated border-none rounded-card px-4 py-3 text-[15px] outline-none placeholder:text-gray-600"
                placeholder="Поиск пользователей..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="space-y-2">
                {searchFilteredUsers.map(u => (
                    <UserCard
                        key={u.id}
                        user={u}
                        editingUser={editingUser}
                        setEditingUser={setEditingUser}
                        newBalance={newBalance}
                        setNewBalance={setNewBalance}
                        handleUpdateBalance={handleUpdateBalance}
                    />
                ))}
            </div>
        </div>
    );
};

export default React.memo(UserList);
