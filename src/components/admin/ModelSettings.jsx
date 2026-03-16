import React from 'react';

const ModelSettings = ({ models, handleUpdateModel }) => {
    return (
        <div className="space-y-3">
            {models.map(m => (
                <div key={m.id} className="bg-bg-elevated p-4 rounded-card border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-[15px]">{m.display_name}</h3>
                        <div className={`w-2 h-2 rounded-full ${m.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-500 uppercase">Cost (⚡)</label>
                            <input
                                type="number"
                                className="w-full bg-black/20 rounded-lg px-3 py-2 mt-1 text-[13px]"
                                defaultValue={m.cost}
                                onBlur={e => handleUpdateModel(m.id, { cost: parseInt(e.target.value) })}
                            />
                        </div>
                        <button
                            onClick={() => handleUpdateModel(m.id, { is_active: !m.is_active })}
                            className="px-4 py-2 bg-white/5 rounded-lg text-[12px] font-medium mt-auto h-[38px]"
                        >
                            {m.is_active ? 'Отключить' : 'Включить'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default React.memo(ModelSettings);
