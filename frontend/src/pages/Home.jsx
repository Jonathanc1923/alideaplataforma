import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Plus, MessageSquare, Activity, ChevronRight, Shield, Zap } from 'lucide-react'

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

export default function Home() {
    const [sessions, setSessions] = useState([]);
    const [newSessionName, setNewSessionName] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        try {
            const res = await axios.get(`${API_BASE}/sessions`);
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 5000);
        return () => clearInterval(interval);
    }, []);

    const createSession = async (e) => {
        e.preventDefault();
        if (!newSessionName.trim()) return;
        try {
            await axios.post(`${API_BASE}/sessions`, { session_name: newSessionName });
            setNewSessionName('');
            fetchSessions();
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'CONNECTED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'QR_READY': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'INITIALIZING': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-12 animate-slide-up">
            
            {/* Header / Hero Section */}
            <div className="text-center max-w-2xl mx-auto mt-4 mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
                    <Shield size={14} /> 100% Baileys Anti-Ban Compliant
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                    Multi-Agent <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">WhatsApp Engine</span>
                </h1>
                <p className="text-slate-400 text-lg">
                    Crea y administra múltiples agentes virtuales con simulación de comportamiento humano para respuestas automatizadas sin riesgo de bloqueos.
                </p>
            </div>

            {/* Create Session Form */}
            <div className="max-w-xl mx-auto glass-panel rounded-2xl p-2 pl-6 flex items-center justify-between border-t border-slate-700/80 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                <form onSubmit={createSession} className="flex-1 flex gap-4 items-center">
                    <input 
                        type="text" 
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        placeholder="Nombre de la nueva sesión (ej. Ventas, Soporte)..."
                        className="flex-1 bg-transparent border-0 text-slate-200 placeholder-slate-500 focus:ring-0 px-2 py-4 outline-none text-lg"
                    />
                    <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 group">
                        Crear <Plus className="group-hover:rotate-90 transition-transform" size={20} />
                    </button>
                </form>
            </div>

            {/* Sessions Grid */}
            <div className="mt-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Activity className="text-indigo-400" /> 
                        Sesiones Activas
                    </h2>
                    <span className="bg-slate-800/80 px-3 py-1 rounded-lg text-sm text-slate-400 border border-slate-700">
                        {sessions.length} Agente(s)
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading && sessions.length === 0 ? (
                        <div className="col-span-full h-32 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full border-r-2 border-indigo-400 animate-spin"></div>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="col-span-full p-12 text-center glass-card rounded-2xl border-dashed">
                            <p className="text-slate-400">No tienes sesiones activas. Crea una para comenzar.</p>
                        </div>
                    ) : sessions.map(session => (
                        <div key={session.id} className="glass-card rounded-2xl p-6 flex flex-col group relative overflow-hidden">
                            {/* Decorative gradient orb inside card */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 group-hover:border-indigo-500/30 transition-colors">
                                    <MessageSquare className="text-indigo-400" size={24} />
                                </div>
                                <span className={`px-3 py-1 text-xs rounded-full font-bold border flex items-center gap-1.5 ${getStatusStyle(session.status)}`}>
                                    {session.status === 'CONNECTED' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow"></div>}
                                    {session.status}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-2 relative z-10">{session.session_name}</h3>
                            <p className="text-slate-400 text-sm mb-8 flex-1 relative z-10">ID: <span className="font-mono text-xs opacity-70">{session.id}</span></p>
                            
                            <div className="relative z-10">
                                <Link to={`/sessions/${session.id}`} className="w-full bg-slate-800/80 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-500/30 px-4 py-3 rounded-xl font-medium flex items-center justify-between transition-all group/btn">
                                    Configurar Agente
                                    <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
