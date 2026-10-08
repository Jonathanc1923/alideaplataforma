import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Bot, Lock, ArrowLeft, ShieldCheck, Sparkles, Building2, User, KeyRound, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const isAdminMode = searchParams.get('mode') === 'admin';
  const [activeTab, setActiveTab] = useState(isAdminMode ? 'admin' : 'user');
  
  // User login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Admin login state
  const [adminPin, setAdminPin] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('mode') === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('user');
    }
  }, [searchParams]);

  // Handle Client / Business Login
  const handleUserLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa tu usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        username: username.trim(),
        password: password.trim()
      });

      const { user, sessionId, sessionName } = res.data;
      localStorage.setItem('alidea_auth', JSON.stringify({
        role: 'user',
        user,
        sessionId,
        sessionName
      }));

      navigate('/workspace');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || 'Error al iniciar sesión. Revisa tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Master Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!adminPin.trim()) {
      setErrorMessage('Por favor introduce la clave maestra');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/admin-login`, {
        pin: adminPin.trim()
      });

      if (res.data.success) {
        localStorage.setItem('alidea_auth', JSON.stringify({
          role: 'admin',
          token: res.data.token
        }));
        navigate('/admin');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || 'Clave de administrador incorrecta.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('demo');
    setPassword('demo123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-[#0b0f19]">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Back to Home Button */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Volver a la página principal
        </Link>
        <span className="text-xs text-slate-500">Alidea Suite v2.0</span>
      </div>

      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 mx-auto mb-4 shadow-xl shadow-indigo-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
              <Bot className="text-indigo-400" size={30} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
            {activeTab === 'admin' ? 'Panel de Control' : 'Iniciar Sesión en Alidea'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'admin' ? 'Acceso Autorizado' : 'Plataforma de Automatización de WhatsApp & CRM de Ventas'}
          </p>
        </div>

        {/* Error Alert with Security Badge */}
        {errorMessage && (
          <div className={`p-4 mb-5 rounded-2xl border text-xs flex items-start gap-3 animate-fade-in ${
            errorMessage.includes('bloquead') || errorMessage.includes('intentos')
              ? 'bg-rose-950/60 border-rose-500/50 text-rose-200 shadow-xl shadow-rose-950/40'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <AlertCircle size={18} className="shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold leading-relaxed">{errorMessage}</p>
              {errorMessage.includes('bloquead') && (
                <p className="text-[11px] text-rose-300/80">
                  🛡️ <strong>Protección de Seguridad:</strong> Máximo 3 intentos permitidos. Para reintentar, debes esperar el tiempo indicado.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Client / Business Login */}
        {activeTab === 'user' && (
          <form onSubmit={handleUserLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Usuario o Nombre de Negocio</span>
                <Building2 size={13} className="text-indigo-400" />
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej. mi_empresa o demo"
                className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Contraseña</span>
                <KeyRound size={13} className="text-indigo-400" />
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Ingresando al sistema...</span>
              ) : (
                <>
                  <span>Ingresar a mi Workspace</span>
                  <ShieldCheck size={16} />
                </>
              )}
            </button>

            {/* Terms and conditions disclaimer */}
            <div className="text-center pt-2">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Al iniciar sesión, declaras haber leído y aceptado nuestros{' '}
                <Link to="/terms" className="text-indigo-400 hover:text-indigo-300 underline font-medium">
                  Términos y Condiciones de Uso
                </Link>.
              </p>
            </div>

            {/* Demo Helper Button */}
            <div className="pt-3 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1.5"
              >
                <Sparkles size={13} /> Probar con cuenta de demostración (demo / demo123)
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Admin Login (Only accessed via /admin or /login?mode=admin) */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Clave Maestra de Acceso
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="••••"
                  className="w-full glass-input px-4 py-3 rounded-xl text-sm tracking-widest text-center text-lg font-mono"
                  autoFocus
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? 'Accediendo...' : 'Ingresar'}
            </button>
          </form>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-slate-500 z-10 flex flex-col items-center gap-1.5">
        <div>Alidea Platform • WhatsApp Bot Autónomo y CRM Inteligente</div>
        <Link to="/terms" className="text-[11px] text-slate-400 hover:text-indigo-400 transition-colors">
          Términos y Condiciones del Servicio
        </Link>
      </div>
    </div>
  );
}
