import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Trash2, Clock, Smartphone, MessageSquare, Zap, Target, Shield, Paperclip, Image as ImageIcon, FileAudio, Edit2, X } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function SessionDetail() {
    const { id } = useParams();
    const [qrStatus, setQrStatus] = useState({ status: 'LOADING', qr: null });
    const [keywords, setKeywords] = useState([]);
    
    // Form state
    const [keyword, setKeyword] = useState('');
    const [responseText, setResponseText] = useState('');
    const [delayMin, setDelayMin] = useState(2);
    const [delayMax, setDelayMax] = useState(6);
    const [mediaFile, setMediaFile] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const startEditing = (kw) => {
        setEditingId(kw.id);
        setKeyword(kw.keyword);
        setResponseText(kw.response_text || '');
        setDelayMin(kw.delay_min || 2);
        setDelayMax(kw.delay_max || 6);
        setMediaFile(null); 
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setKeyword('');
        setResponseText('');
        setDelayMin(2);
        setDelayMax(6);
        setMediaFile(null);
        const fileInput = document.getElementById('mediaInput');
        if (fileInput) fileInput.value = '';
    };

    const fetchSessionData = async () => {
        try {
            const res = await axios.get(`${API_BASE}/sessions/${id}/qr`);
            setQrStatus(res.data);
        } catch (err) {
            console.error('Error fetching session info:', err);
        }
    };

    const fetchKeywords = async () => {
        try {
            const res = await axios.get(`${API_BASE}/sessions/${id}/keywords`);
            setKeywords(res.data);
        } catch (err) {
            console.error('Error fetching keywords:', err);
        }
    };

    useEffect(() => {
        fetchSessionData();
        fetchKeywords();
        const interval = setInterval(fetchSessionData, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const addKeyword = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('keyword', keyword);
            formData.append('response_text', responseText);
            formData.append('delay_min', delayMin);
            formData.append('delay_max', delayMax);
            if (mediaFile) {
                formData.append('media', mediaFile);
            }

            if (editingId) {
                await axios.put(`${API_BASE}/sessions/${id}/keywords/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setEditingId(null);
            } else {
                await axios.post(`${API_BASE}/sessions/${id}/keywords`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setKeyword('');
            setResponseText('');
            setDelayMin(2);
            setDelayMax(6);
            setMediaFile(null);
            
            // Reset input file value
            const fileInput = document.getElementById('mediaInput');
            if (fileInput) fileInput.value = '';

            fetchKeywords();
        } catch (err) {
            alert('Error agregando la regla de autorrespuesta');
        }
    };

    const deleteKeyword = async (kwId) => {
        if(!window.confirm('¿Seguro que deseas eliminar esta regla?')) return;
        try {
            await axios.delete(`${API_BASE}/sessions/${id}/keywords/${kwId}`);
            fetchKeywords();
        } catch (err) {
            alert('Error eliminando');
        }
    };

    const startSession = async () => {
        try {
            await axios.post(`${API_BASE}/sessions/${id}/start`);
            fetchSessionData();
        } catch (err) {
            alert('Error starting session');
        }
    };

    const logoutSession = async () => {
        if(!window.confirm('¿Seguro que deseas cerrar la sesión actual de WhatsApp? Tendrás que escanear el QR nuevamente.')) return;
        try {
            setQrStatus({ status: 'INITIALIZING', qr: null });
            await axios.post(`${API_BASE}/sessions/${id}/logout`);
            fetchSessionData();
        } catch (err) {
            alert('Error closing session');
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'CONNECTED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'QR_READY': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'INITIALIZING': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative z-10 pb-20">
            <Link to="/" className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700/50 hover:border-indigo-500/50">
                <ArrowLeft className="mr-2" size={16} /> Volver al Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Panel: Session Status & QR */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                        {/* Status decoration */}
                        <div className={`absolute top-0 left-0 w-full h-1 ${
                            qrStatus.status === 'CONNECTED' ? 'bg-emerald-500' : 
                            qrStatus.status === 'QR_READY' ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}></div>

                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                            <Smartphone className="text-indigo-400" /> Estado de Conexión
                        </h2>
                        
                        <div className="flex flex-col items-center">
                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold border mb-8 flex items-center gap-2 ${getStatusStyle(qrStatus.status)}`}>
                                {qrStatus.status === 'CONNECTED' && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow"></div>}
                                {qrStatus.status}
                            </div>

                            <div className="w-full bg-slate-900/60 rounded-xl p-6 border border-slate-700/50 flex flex-col items-center min-h-[300px] justify-center">
                                {qrStatus.status === 'QR_READY' && qrStatus.qr && (
                                    <div className="flex flex-col items-center animate-slide-up">
                                        <div className="p-3 bg-white rounded-xl shadow-xl shadow-amber-500/10 mb-4">
                                            <img src={qrStatus.qr} alt="QR Code" className="w-56 h-56" />
                                        </div>
                                        <p className="text-sm font-medium text-amber-400 animate-pulse">Escanea el QR en WhatsApp &rarr; Dispositivos vinculados</p>
                                    </div>
                                )}

                                {qrStatus.status === 'CONNECTED' && (
                                    <div className="flex flex-col items-center text-center animate-slide-up w-full">
                                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500/50 mb-4">
                                            <Zap className="text-emerald-400" size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-emerald-400 mb-1">Agente Activo</h3>
                                        <p className="text-sm text-slate-400 mb-6">Escuchando mensajes entrantes</p>
                                        
                                        <button onClick={logoutSession} className="text-red-400 hover:text-white border border-red-500/30 hover:bg-red-500 w-full py-2.5 rounded-xl font-semibold transition-all">
                                            Cerrar Sesión (Desvincular)
                                        </button>
                                    </div>
                                )}

                                {qrStatus.status === 'DISCONNECTED' && (
                                    <div className="w-full text-center">
                                        <p className="text-slate-400 mb-6">La sesión ha sido desconectada o cerrada.</p>
                                        <button onClick={startSession} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-full py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all active:scale-95">
                                            Generar Nuevo QR
                                        </button>
                                    </div>
                                )}
                                
                                {qrStatus.status === 'INITIALIZING' && (
                                    <div className="flex flex-col items-center text-center">
                                         <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                                         <p className="text-slate-400 font-medium">Iniciando motor Baileys...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                            <h4 className="text-indigo-300 text-xs tracking-wider uppercase font-bold mb-2 flex items-center gap-1">
                                <Shield size={12}/> The Humanizer Activo
                            </h4>
                            <p className="text-xs text-indigo-200/70 leading-relaxed">
                                El sistema ejecutará automáticamente "Marcado como leído" y estado "Escribiendo..." antes de reponder, aplicando tu delay dinámico.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Keywords Management */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Add Keyword Form */}
                    <div className="glass-panel p-6 md:p-8 rounded-2xl border-t border-slate-700/80">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-purple-500/20 rounded-lg border border-purple-500/30">
                                <Target className="text-purple-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Reglas de Autorrespuesta</h2>
                                <p className="text-sm text-slate-400">Entrena a este agente indicándole qué debe responder.</p>
                            </div>
                        </div>

                        <form onSubmit={addKeyword} className="bg-slate-900/40 border border-slate-700/50 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
                            {/* Decorative blur */}
                            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="md:col-span-2 relative z-10">
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Si el cliente dice (Palabra o frase clave):</label>
                                <input required type="text" value={keyword} onChange={e=>setKeyword(e.target.value)}
                                    placeholder="Ej. precio, info, horario de atencion"
                                    className="w-full glass-input rounded-xl px-4 py-3" />
                            </div>

                            <div className="md:col-span-2 relative z-10">
                                <label className="block text-sm font-semibold text-slate-300 mb-2">El agente debe responder con:</label>
                                <textarea value={responseText} onChange={e=>setResponseText(e.target.value)} rows="4"
                                    placeholder="¡Hola! Nuestros precios son... (Opcional si subes imagen)"
                                    className="w-full glass-input rounded-xl px-4 py-3 resize-none" />
                            </div>

                            <div className="md:col-span-2 relative z-10">
                                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                    <Paperclip size={16} className="text-cyan-400" />
                                    Adjuntar Imagen, Audio o Video (Opcional)
                                </label>
                                <div className="relative">
                                    <input id="mediaInput" type="file" onChange={e=>setMediaFile(e.target.files[0])}
                                        accept="image/*,audio/*,video/*,.pdf"
                                        className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30 transition-all border border-slate-700/50 rounded-xl p-2 bg-slate-900/50" />
                                </div>
                                {mediaFile && <p className="text-xs text-cyan-300 mt-2 font-medium">✨ Archivo listo: {mediaFile.name}</p>}
                            </div>

                            <div className="relative z-10">
                                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                                    <Clock size={16} className="text-indigo-400"/> Delay Mínimo (seg)
                                </label>
                                <div className="relative">
                                    <input required type="number" min="0" value={delayMin} onChange={e=>setDelayMin(e.target.value)}
                                        className="w-full glass-input rounded-xl px-4 py-3 pl-10" />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">s</span>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                                    <Clock size={16} className="text-purple-400" /> Delay Máximo (seg)
                                </label>
                                <div className="relative">
                                    <input required type="number" min="0" value={delayMax} onChange={e=>setDelayMax(e.target.value)}
                                        className="w-full glass-input rounded-xl px-4 py-3 pl-10" />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">s</span>
                                </div>
                            </div>

                            <div className="md:col-span-2 mt-4 relative z-10 flex gap-3">
                                <button type="submit" className={`flex-1 ${editingId ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/20' : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-600/20'} text-white py-4 rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2`}>
                                    <MessageSquare size={20} /> {editingId ? 'Actualizar Regla' : 'Guardar Regla'}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={cancelEditing} className="flex-1 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-700">
                                        <X size={20} /> Cancelar Edición
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Keywords List */}
                    <div className="glass-panel p-6 md:p-8 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-700/50 pb-4">Conocimientos del Agente</h3>
                        {keywords.length === 0 ? (
                            <div className="text-center py-10 bg-slate-900/30 rounded-xl border border-dashed border-slate-700">
                                <div className="mx-auto w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                    <Target className="text-slate-500" size={20} />
                                </div>
                                <p className="text-slate-400 font-medium">Aún no le has enseñado a responder nada.</p>
                                <p className="text-slate-500 text-sm mt-1">Añade tu primera regla arriba.</p>
                            </div>
                        ) : (
                            <ul className="space-y-4">
                                {keywords.map((kw, idx) => (
                                    <li key={kw.id} className="relative bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/40 transition-all group overflow-hidden">
                                        
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                                    <span className="font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-lg text-sm shadow-sm backdrop-blur-md">
                                                        "{kw.keyword}"
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md">
                                                        <Clock size={12} /> Espera {kw.delay_min} a {kw.delay_max}s + tipeo
                                                    </span>
                                                    {kw.media_type && kw.media_type.startsWith('image/') && (
                                                        <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md border border-cyan-500/30">
                                                            <ImageIcon size={12} /> Imagen Adjunta
                                                        </span>
                                                    )}
                                                    {kw.media_type && kw.media_type.startsWith('audio/') && (
                                                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md border border-emerald-500/30">
                                                            <FileAudio size={12} /> Audio (Nota de Voz)
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/70 relative">
                                                    <div className="absolute -left-2 top-4 w-4 h-4 bg-slate-800/80 border-l border-t border-slate-700/70 rotate-[-45deg]"></div>
                                                    <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed relative z-10">{kw.response_text}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 mt-1">
                                                <button onClick={() => startEditing(kw)} title="Editar regla" className="text-slate-500 hover:text-amber-400 bg-slate-800 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/30 p-2.5 rounded-lg transition-colors">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => deleteKeyword(kw.id)} title="Eliminar regla" className="text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 p-2.5 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
