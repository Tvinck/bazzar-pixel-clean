import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Key, Plus, Trash2, Copy, Check,
    Code, Terminal, Book, AlertCircle, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useSound } from '../context/SoundContext';

// Extend window for Telegram WebApp types
declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initData?: string;
                HapticFeedback?: {
                    impactOccurred: (style: string) => void;
                    notificationOccurred: (type: string) => void;
                };
            };
        };
    }
}

interface APIKey {
    id: string;
    name: string;
    key_prefix: string;
    is_active: boolean;
    last_used_at: string | null;
    created_at: string;
}

const DevDashboardView = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const toaster = useToast();
    const { playClick, playSuccess } = useSound();

    const [keys, setKeys] = useState<APIKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [newKeyName, setNewKeyName] = useState('');
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/user/dev/keys', {
                headers: { 'x-tg-data': window.Telegram?.WebApp?.initData || '' }
            });
            const data = await res.json();
            if (data.keys) setKeys(data.keys);
        } catch (err) {
            console.error('Fetch keys error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async () => {
        if (!newKeyName.trim()) return;
        playClick();
        try {
            const res = await fetch('/api/user/dev/keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tg-data': window.Telegram?.WebApp?.initData || ''
                },
                body: JSON.stringify({ name: newKeyName })
            });
            const data = await res.json();
            if (data.success) {
                setGeneratedKey(data.key.secret);
                setShowKeyModal(true);
                setNewKeyName('');
                fetchKeys();
                playSuccess();
            }
        } catch (err) {
            toaster.error(t('errors.failed'));
        }
    };

    const handleDeleteKey = async (id: string) => {
        if (!window.confirm(t('common.confirmDelete'))) return;
        playClick();
        try {
            await fetch(`/api/user/dev/keys/${id}`, {
                method: 'DELETE',
                headers: { 'x-tg-data': window.Telegram?.WebApp?.initData || '' }
            });
            setKeys(keys.filter(k => k.id !== id));
            toaster.success(t('common.deleted'));
        } catch (err) {
            toaster.error(t('errors.failed'));
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toaster.success(t('common.copied'));
        setTimeout(() => setCopied(false), 2000);
    };

    const integrations = [
        {
            title: 'cURL',
            icon: <Terminal size={18} />,
            code: `curl -X POST https://api.bazzar.pixel/api/generation/external/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Cyberpunk city",
    "modelId": "flux-schnell"
  }'`
        },
        {
            title: 'Node.js',
            icon: <Code size={18} />,
            code: `const response = await fetch('https://api.bazzar.pixel/api/generation/external/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'Space cat astronaut',
    modelId: 'flux-schnell'
  })
});

const { jobId } = await response.json();`
        }
    ];

    return (
        <div className="min-h-screen bg-[#000000] text-white pb-24 md:max-w-5xl md:mx-auto md:px-6">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#000000]/80 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-white/10 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-semibold tracking-tight">Developer API</h1>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-full">
                    <Code size={20} className="text-blue-400" />
                </div>
            </header>

            <main className="p-4 space-y-8 max-w-2xl mx-auto">
                {/* Intro */}
                <section className="space-y-3">
                    <h2 className="text-2xl font-bold">Build with Bazzar Pixel</h2>
                    <p className="text-white/60 leading-relaxed">
                        Integrate our state-of-the-art AI generation capabilities into your own projects, websites, or bots using our REST API.
                    </p>
                </section>

                {/* API Keys Management */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Key size={20} className="text-blue-400" />
                            <h3 className="text-lg font-medium">API Keys</h3>
                        </div>
                        <span className="text-xs text-white/40">{keys.length} / 5</span>
                    </div>

                    <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex gap-2">
                            <input
                                type="text"
                                placeholder="Project Name (e.g. My Awesome App)"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                            />
                            <button
                                onClick={handleCreateKey}
                                disabled={!newKeyName.trim() || keys.length >= 5}
                                className="px-4 py-2 bg-blue-500 hover:bg-accent-blue disabled:opacity-50 disabled:bg-white/10 rounded-xl text-sm font-medium transition-all active:scale-95"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="divide-y divide-white/5">
                            {loading ? (
                                <div className="p-12 flex flex-col items-center justify-center gap-3">
                                    <RefreshCw className="animate-spin text-white/20" size={32} />
                                    <span className="text-sm text-white/40">Loading keys...</span>
                                </div>
                            ) : keys.length === 0 ? (
                                <div className="p-12 text-center space-y-2">
                                    <p className="text-white/40">No API keys generated yet.</p>
                                    <p className="text-xs text-white/20">Create one to start building.</p>
                                </div>
                            ) : (
                                keys.map(key => (
                                    <div key={key.id} className="p-4 flex items-center justify-between group">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{key.name}</span>
                                                {!key.is_active && (
                                                    <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">Inactive</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-white/40">
                                                <code className="bg-white/5 px-1.5 py-0.5 rounded text-white/60">{key.key_prefix}</code>
                                                <span>•</span>
                                                <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteKey(key.id)}
                                            className="p-2 text-white/20 hover:text-red-400 active:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Quick Start Documentation */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Book size={20} className="text-purple-400" />
                        <h3 className="text-lg font-medium">Quick Start</h3>
                    </div>

                    <div className="space-y-4">
                        {integrations.map((item, idx) => (
                            <div key={idx} className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
                                <div className="px-4 py-3 bg-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-medium text-white/60">
                                        {item.icon}
                                        {item.title}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(item.code)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/40"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                                <div className="p-4 overflow-x-auto">
                                    <pre className="text-[12px] font-mono text-blue-300 leading-relaxed">
                                        {item.code}
                                    </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Important Notes */}
                <section className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-4">
                    <AlertCircle className="text-blue-400 flex-shrink-0" size={20} />
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium text-blue-400">Rate Limits & Credits</h4>
                        <p className="text-xs text-white/50 leading-relaxed">
                            API requests consume credits from your main balance. For high-volume projects,
                            please contact our support for specialized B2B pricing and increased rate limits.
                        </p>
                    </div>
                </section>
            </main>

            {/* Secret Key Modal */}
            <AnimatePresence>
                {showKeyModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowKeyModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-[#111111] border border-white/10 rounded-[32px] p-8 shadow-2xl"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                    <Key size={32} className="text-blue-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">Your API Key</h3>
                                    <p className="text-sm text-white/40 leading-relaxed">
                                        Copy this key now. For security reasons, you won't be able to see it again.
                                    </p>
                                </div>

                                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 relative group">
                                    <code className="text-[13px] text-blue-300 break-all font-mono">
                                        {generatedKey}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(generatedKey || '')}
                                        className="absolute top-2 right-2 p-2 bg-[#111111] border border-white/10 rounded-xl shadow-lg hover:bg-white/5 transition-colors"
                                    >
                                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowKeyModal(false)}
                                    className="w-full py-4 bg-white text-black rounded-2xl font-bold active:scale-95 transition-all mt-4"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DevDashboardView;
