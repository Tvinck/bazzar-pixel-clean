import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

const SystemHealth = ({ systemHealth, metrics, fetchSystemHealth, isHealthLoading }) => {
    return (
        <div className="bg-bg-elevated p-6 rounded-card border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-3">
                    <ShieldAlert className="text-blue-500" />
                    System Health
                </h2>
                <button
                    onClick={fetchSystemHealth}
                    className={`p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors ${isHealthLoading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {[
                    { id: 'supabase', label: 'Supabase Database', status: systemHealth?.supabase },
                    { id: 'kie', label: 'Kie.ai AI Engine', status: systemHealth?.kie },
                    { id: 'queue', label: 'Pg-Boss Queue Manager', status: systemHealth?.queue }
                ].map(svc => (
                    <div key={svc.id} className="bg-black/20 p-4 rounded-card flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${svc.status === 'healthy' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : svc.status === 'degraded' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                            <span className="font-medium text-[15px]">{svc.label}</span>
                        </div>
                        <div className={`text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${svc.status === 'healthy' ? 'text-green-500 bg-green-500/10' : svc.status === 'degraded' ? 'text-yellow-500 bg-yellow-500/10' : 'text-red-500 bg-red-500/10'}`}>
                            {svc.status || 'Checking...'}
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t border-white/5">
                <label className="text-[11px] text-gray-500 uppercase font-bold tracking-widest block mb-4">Queue Depth (Real-time)</label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-5 rounded-card border border-white/5">
                        <div className="text-[24px] font-black text-blue-500">
                            {metrics?.queue?.active || 0}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase mt-1">Active Jobs</div>
                    </div>
                    <div className="bg-black/40 p-5 rounded-card border border-white/5">
                        <div className="text-[24px] font-black text-gray-400">
                            {metrics?.queue?.waiting || 0}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase mt-1">Waiting in Queue</div>
                    </div>
                </div>
            </div>

            <div className="text-[10px] text-center text-gray-600">
                Last checked: {systemHealth?.timestamp ? new Date(systemHealth.timestamp).toLocaleTimeString() : 'Never'}
            </div>
        </div>
    );
};

export default React.memo(SystemHealth);
