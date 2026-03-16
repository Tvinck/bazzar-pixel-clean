import React from 'react';

const GenerationLogs = ({ recentGenerations }) => {
    return (
        <div className="grid grid-cols-2 gap-3">
            {recentGenerations.map((gen) => (
                <div key={gen.id} className="relative aspect-[3/4] bg-bg-elevated rounded-card overflow-hidden border border-white/5">
                    {gen.type === 'video' ? (
                        <video src={gen.result_url || gen.image_url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                    ) : (
                        <img src={gen.result_url || gen.image_url} className="w-full h-full object-cover" loading="lazy" />
                    )}
                    <div className="absolute bottom-0 w-full p-2 bg-gradient-to-t from-black/90 to-transparent">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-white/20 overflow-hidden">
                                {gen.user?.avatar_url && <img src={gen.user.avatar_url} className="w-full h-full object-cover" />}
                            </div>
                            <span className="text-[10px] truncate opacity-70">@{gen.user?.username}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default React.memo(GenerationLogs);
