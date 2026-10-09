import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Bot, 
  Users, 
  UserPlus, 
  TrendingUp, 
  ShieldAlert, 
  Power, 
  Trash2, 
  Edit3, 
  LogIn, 
  Search, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  MessageSquare, 
  Lock, 
  DollarSign, 
  RefreshCw, 
  X,
  ExternalLink,
  Zap,
  Cpu,
  Sparkles,
  Plus,
  Save,
  Sliders,
  Check
} from 'lucide-react';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';
const ADMIN_PIN = '2732';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeAdminTab, setActiveAdminTab] = useState('users'); // 'users' | 'simulator'

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeBots: 0, totalLeads: 0, totalPipelineValue: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlan, setNewPlan] = useState('Plan Pro');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit user form state
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editNewPassword, setEditNewPassword] = useState('');

  // ==========================================
  // LANDING SIMULATOR CONFIGURATION STATE
  // ==========================================
  const [simBotName, setSimBotName] = useState('Alidea Bot Asistente');
  const [simWelcomeMessage, setSimWelcomeMessage] = useState('¡Hola! Bienvenido a Alidea 🚀. Automatizamos tus ventas en WhatsApp y organizamos tus clientes en un CRM inteligente.');
  const [simKeywords, setSimKeywords] = useState([]);
  const [simAiEnabled, setSimAiEnabled] = useState(true);
  const [simAiPrompt, setSimAiPrompt] = useState('');
  const [simAiTemp, setSimAiTemp] = useState(0.35);
  const [simSaving, setSimSaving] = useState(false);
  const [simSuccessMsg, setSimSuccessMsg] = useState('');

  // Simulator New Keyword rule modal
  const [showSimKwModal, setShowSimKwModal] = useState(false);
  const [newSimKw, setNewSimKw] = useState('');
  const [newSimResponse, setNewSimResponse] = useState('');
  const [newSimStage, setNewSimStage] = useState('En Conversación');

  // Simulator Catalog State & Modal
  const [simCatalog, setSimCatalog] = useState([]);
  const [showSimProdModal, setShowSimProdModal] = useState(false);
  const [newSimProdName, setNewSimProdName] = useState('');
  const [newSimProdPrice, setNewSimProdPrice] = useState('');
  const [newSimProdDesc, setNewSimProdDesc] = useState('');
  const [newSimProdCategory, setNewSimProdCategory] = useState('Servicios');

  // Check admin authorization
  useEffect(() => {
    const authData = localStorage.getItem('alidea_auth');
    if (!authData) {
      navigate('/login?mode=admin');
      return;
    }

    try {
      const parsed = JSON.parse(authData);
      if (parsed.role !== 'admin' || parsed.token !== ADMIN_PIN) {
        navigate('/login?mode=admin');
        return;
      }
    } catch (e) {
      navigate('/login?mode=admin');
      return;
    }

    fetchAdminData();
    fetchSimulatorConfig();
    const interval = setInterval(fetchAdminData, 8000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      const headers = { 'x-admin-key': ADMIN_PIN };
      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/users`, { headers }),
        axios.get(`${API_BASE}/admin/stats`, { headers })
      ]);

      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimulatorConfig = async () => {
    try {
      const headers = { 'x-admin-key': ADMIN_PIN };
      const res = await axios.get(`${API_BASE}/admin/simulator-config`, { headers });
      if (res.data) {
        setSimBotName(res.data.bot_name || 'Alidea Bot Asistente');
        setSimWelcomeMessage(res.data.welcome_message || '');
        setSimKeywords(Array.isArray(res.data.keywords) ? res.data.keywords : []);
        setSimCatalog(Array.isArray(res.data.catalog) ? res.data.catalog : []);
        setSimAiEnabled(res.data.ai_enabled === 1 || res.data.ai_enabled === true);
        setSimAiPrompt(res.data.ai_system_prompt || '');
        setSimAiTemp(res.data.ai_temperature || 0.35);
      }
    } catch(err) {
      console.error('Error fetching simulator config:', err);
    }
  };

  const handleSaveSimulatorConfig = async (e) => {
    if (e) e.preventDefault();
    setSimSaving(true);
    setSimSuccessMsg('');
    try {
      const headers = { 'x-admin-key': ADMIN_PIN };
      await axios.put(
        `${API_BASE}/admin/simulator-config`,
        {
          bot_name: simBotName.trim(),
          welcome_message: simWelcomeMessage.trim(),
          keywords: simKeywords,
          catalog: simCatalog,
          ai_enabled: simAiEnabled ? 1 : 0,
          ai_system_prompt: simAiPrompt.trim(),
          ai_temperature: simAiTemp
        },
        { headers }
      );
      setSimSuccessMsg('¡Configuración del Simulador de la Landing guardada exitosamente!');
      setTimeout(() => setSimSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar configuración del simulador');
    } finally {
      setSimSaving(false);
    }
  };

  const handleAddSimProduct = (e) => {
    e.preventDefault();
    if (!newSimProdName.trim() || !newSimProdPrice) {
      alert('Completa el nombre y el precio del producto para la demo');
      return;
    }
    const updated = [
      ...simCatalog,
      {
        id: `sim-prod-${Date.now()}`,
        name: newSimProdName.trim(),
        price: parseFloat(newSimProdPrice) || 0,
        description: newSimProdDesc.trim(),
        category: newSimProdCategory.trim() || 'Servicios'
      }
    ];
    setSimCatalog(updated);
    setShowSimProdModal(false);
    setNewSimProdName('');
    setNewSimProdPrice('');
    setNewSimProdDesc('');
    setNewSimProdCategory('Servicios');
  };

  const handleDeleteSimProduct = (idx) => {
    const updated = simCatalog.filter((_, i) => i !== idx);
    setSimCatalog(updated);
  };

  const handleAddSimKeyword = (e) => {
    e.preventDefault();
    if (!newSimKw.trim() || !newSimResponse.trim()) {
      alert('Completa la palabra clave y la respuesta');
      return;
    }
    const updated = [
      ...simKeywords,
      {
        keyword: newSimKw.trim(),
        response: newSimResponse.trim(),
        stage: newSimStage
      }
    ];
    setSimKeywords(updated);
    setShowSimKwModal(false);
    setNewSimKw('');
    setNewSimResponse('');
    setNewSimStage('En Conversación');
  };

  const handleDeleteSimKeyword = (idx) => {
    const updated = simKeywords.filter((_, i) => i !== idx);
    setSimKeywords(updated);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newUsername.trim() || !newPassword.trim() || !newBusinessName.trim()) {
      setFormError('Por favor completa todos los campos requeridos');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/admin/users`,
        {
          username: newUsername.trim(),
          password: newPassword.trim(),
          business_name: newBusinessName.trim(),
          phone: newPhone.trim(),
          plan: newPlan
        },
        { headers: { 'x-admin-key': ADMIN_PIN } }
      );

      setShowCreateModal(false);
      setNewUsername('');
      setNewPassword('');
      setNewBusinessName('');
      setNewPhone('');
      fetchAdminData();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.error || 'Error al crear el nuevo usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditBusinessName(user.business_name);
    setEditPhone(user.phone || '');
    setEditPlan(user.plan || 'Plan Pro');
    setEditIsActive(user.is_active === 1);
    setEditNewPassword('');
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      await axios.put(
        `${API_BASE}/admin/users/${selectedUser.id}`,
        {
          business_name: editBusinessName.trim(),
          phone: editPhone.trim(),
          plan: editPlan,
          is_active: editIsActive,
          password: editNewPassword.trim() ? editNewPassword.trim() : undefined
        },
        { headers: { 'x-admin-key': ADMIN_PIN } }
      );

      setShowEditModal(false);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error al actualizar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`¿Estás seguro de eliminar el usuario "${user.business_name}" (@${user.username})? Se borrarán sus datos de CRM y bot.`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/admin/users/${user.id}`, {
        headers: { 'x-admin-key': ADMIN_PIN }
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar usuario');
    }
  };

  // Direct Impersonation: jump to that user's workspace
  const impersonateUser = (user) => {
    localStorage.setItem('alidea_auth', JSON.stringify({
      role: 'user',
      impersonatedFromAdmin: true,
      user: {
        id: user.id,
        username: user.username,
        business_name: user.business_name,
        phone: user.phone,
        plan: user.plan
      },
      sessionId: user.session_id,
      sessionName: user.business_name
    }));

    navigate('/workspace');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('alidea_auth');
    navigate('/login');
  };

  const filteredUsers = users.filter(u => 
    u.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phone && u.phone.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans pb-16">
      
      {/* 1. TOP ADMIN BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
              <Lock size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white font-heading">Panel Maestro Alidea</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  PIN 2732
                </span>
              </div>
              <p className="text-xs text-slate-400">Administración Central de Negocios y Sesiones WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAdminData}
              title="Actualizar datos"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <RefreshCw size={16} />
            </button>
            <Link 
              to="/" 
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ExternalLink size={14} /> Ver Landing
            </Link>
            <button 
              onClick={handleAdminLogout}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
            >
              <Power size={14} /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* TAB SWITCHER */}
        <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeAdminTab === 'users'
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users size={16} />
            <span>Negocios & Usuarios ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('simulator')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeAdminTab === 'simulator'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles size={16} className="text-amber-400" />
            <span>Simulador de la Landing Page</span>
            {simAiEnabled && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                IA Activa
              </span>
            )}
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: GESTIÓN DE USUARIOS Y NEGOCIOS */}
        {/* ==================================================== */}
        {activeAdminTab === 'users' && (
          <>
            {/* 2. STATS OVERVIEW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Negocios Registrados</span>
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Users size={18} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white font-heading">{stats.totalUsers}</div>
                <div className="text-[11px] text-slate-500 mt-1">Cuentas activas</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bots WhatsApp</span>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Bot size={18} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-400 font-heading">{stats.activeBots}</div>
                <div className="text-[11px] text-slate-500 mt-1">Conexiones activas</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads CRM</span>
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-purple-400 font-heading">{stats.totalLeads}</div>
                <div className="text-[11px] text-slate-500 mt-1">Prospectos capturados</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consumo Total IA</span>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                    <Zap size={18} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-amber-400 font-heading">
                  {users.reduce((sum, u) => sum + (u.total_tokens_used || 0), 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Tokens de IA de por vida</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Global ($)</span>
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-cyan-400 font-heading">
                  ${(stats.totalPipelineValue || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Monto en negociación</div>
              </div>
            </div>

            {/* 3. USER MANAGEMENT ACTION BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar negocio, usuario o teléfono..."
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <button 
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                <span>Crear Nuevo Negocio / Usuario</span>
              </button>
            </div>

            {/* 4. USERS TABLE */}
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-4 px-6">Negocio / Cliente</th>
                      <th className="py-4 px-6">Credenciales</th>
                      <th className="py-4 px-6">Plan</th>
                      <th className="py-4 px-6">Estado WhatsApp</th>
                      <th className="py-4 px-6">Consumo IA</th>
                      <th className="py-4 px-6">Leads CRM</th>
                      <th className="py-4 px-6">Palabras Clave</th>
                      <th className="py-4 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-slate-400">
                          <div className="inline-block w-8 h-8 rounded-full border-r-2 border-indigo-500 animate-spin mb-2"></div>
                          <div>Cargando negocios de Alidea...</div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-slate-400">
                          No se encontraron usuarios registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-white text-base">{u.business_name}</div>
                            <div className="text-xs text-slate-400">{u.phone || 'Sin teléfono'}</div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="font-mono text-indigo-300 text-xs bg-indigo-500/10 px-2 py-0.5 rounded inline-block">
                              @{u.username}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {u.is_active ? 'Cuenta Activa' : 'Cuenta Suspendida'}
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {u.plan}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            {u.session_status === 'CONNECTED' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Conectado
                              </span>
                            ) : u.session_status === 'QR_READY' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <QrCode size={12} /> QR Listo para escanear
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                Desconectado
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6">
                            <div className="font-bold text-amber-400 font-mono flex items-center gap-1.5">
                              <Zap size={14} className="text-amber-400 fill-amber-400/20" />
                              <span>{(u.total_tokens_used || 0).toLocaleString()}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">Tokens de IA consumidos</div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="font-bold text-white">{u.leads_count} leads</div>
                            <div className="text-xs text-slate-400">${(u.pipeline_value || 0).toLocaleString()}</div>
                          </td>

                          <td className="py-4 px-6 text-slate-300 font-medium">
                            {u.keywords_count} respuestas
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => impersonateUser(u)}
                                title="Ingresar a su Workspace para ver su bot y CRM"
                                className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
                              >
                                <LogIn size={14} /> Entrar
                              </button>
                              
                              <button 
                                onClick={() => openEditModal(u)}
                                title="Editar usuario o contraseña"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button 
                                onClick={() => handleDeleteUser(u)}
                                title="Eliminar usuario"
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ==================================================== */}
        {/* TAB 2: CONFIGURACIÓN DEL SIMULADOR DE LA LANDING */}
        {/* ==================================================== */}
        {activeAdminTab === 'simulator' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            
            {/* Header del Simulador */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/30">
                  <Bot size={28} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                    Bot del Simulador de la Landing Page
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Configura las respuestas automáticas, palabras clave y la Inteligencia Artificial del chat demo que prueban tus visitantes.
                  </p>
                </div>
              </div>

              <Link
                to="/#simulador"
                target="_blank"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <ExternalLink size={14} />
                <span>Ver Simulador en Vivo</span>
              </Link>
            </div>

            {simSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>{simSuccessMsg}</span>
              </div>
            )}

            {/* Formulario Principal de Configuración */}
            <form onSubmit={handleSaveSimulatorConfig} className="space-y-6">
              
              {/* Bloque 1: Identidad del Bot */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot size={18} className="text-indigo-400" />
                  <span>1. Identidad y Mensaje de Bienvenida</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nombre del Asistente en el Mockup
                    </label>
                    <input
                      type="text"
                      value={simBotName}
                      onChange={(e) => setSimBotName(e.target.value)}
                      placeholder="Ej: Sofia (Asesora Alidea) o Alidea Bot"
                      className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Estado Visible en el Simulador
                    </label>
                    <input
                      type="text"
                      disabled
                      value="en línea las 24 horas"
                      className="w-full glass-input px-4 py-2.5 rounded-xl text-sm bg-slate-900/50 text-emerald-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mensaje de Bienvenida Inicial (el primer mensaje que ve el visitante al abrir la página)
                  </label>
                  <textarea
                    rows={2}
                    value={simWelcomeMessage}
                    onChange={(e) => setSimWelcomeMessage(e.target.value)}
                    placeholder="Escribe el mensaje de saludo inicial..."
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm leading-relaxed"
                    required
                  />
                </div>
              </div>

              {/* Bloque 2: Palabras Clave y Respuestas Rápidas */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MessageSquare size={18} className="text-emerald-400" />
                      <span>2. Palabras Clave del Simulador ({simKeywords.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Si el visitante escribe estas palabras, el simulador responderá con el texto configurado y moverá la tarjeta Kanban.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSimKwModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Plus size={15} />
                    <span>Agregar Regla</span>
                  </button>
                </div>

                {simKeywords.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
                    No tienes palabras clave configuradas. El simulador pasará todas las consultas a la IA o al mensaje por defecto.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {simKeywords.map((kw, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-indigo-300 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              {kw.keyword}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Etapa CRM: {kw.stage || 'En Conversación'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {kw.response}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteSimKeyword(idx)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors self-end sm:self-center"
                          title="Eliminar regla"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bloque 3: Catálogo de Productos para la Demo / Simulador */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Package size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-heading">
                        3. Catálogo de Productos para la Demo
                      </h3>
                      <p className="text-xs text-slate-400">
                        Productos que el bot de la landing mostrará cuando el visitante pida el catálogo o pregunte por planes y servicios.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSimProdModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
                  >
                    <Plus size={15} />
                    <span>Añadir Producto a la Demo</span>
                  </button>
                </div>

                {simCatalog.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80">
                    <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-semibold">No hay productos agregados al catálogo de la demo.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Haz clic en "Añadir Producto a la Demo" para que el bot tenga productos que ofrecer en vivo.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {simCatalog.map((prod, pIdx) => (
                      <div key={prod.id || pIdx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between group hover:border-rose-500/30 transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                              {prod.category || 'General'}
                            </span>
                            <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              ${prod.price}
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-sm">{prod.name}</h4>
                          {prod.description && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prod.description}</p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-800 mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteSimProduct(pIdx)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bloque 4: Inteligencia Artificial (IA) para Consultas Abiertas */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Zap size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-heading">
                        4. Inteligencia Artificial (IA) para la Landing
                      </h3>
                      <p className="text-xs text-slate-400">
                        Si el visitante pregunta algo que no coincide con ninguna palabra clave, la IA responderá con este contexto y los productos del catálogo.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simAiEnabled}
                      onChange={(e) => setSimAiEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {simAiEnabled && (
                  <div className="space-y-4 pt-2 animate-fade-in">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Prompt del Sistema / Instrucciones Comerciales de la Demo
                        </label>
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Motor: Alidea Genesis AI™
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={simAiPrompt}
                        onChange={(e) => setSimAiPrompt(e.target.value)}
                        placeholder="Define quién es el bot, qué servicios vende Alidea, precios de referencia, tono y cómo debe responder..."
                        className="w-full glass-input px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono leading-relaxed"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Consejo: Explica detalladamente los beneficios de Alidea (CRM, Bot WhatsApp, Retargeting Masivo) para que la IA responda preguntas avanzadas en la demo.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Guardado */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={simSaving}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{simSaving ? 'Guardando Configuración...' : 'Guardar Configuración del Simulador'}</span>
                </button>
              </div>

            </form>

          </div>
        )}

      </main>

      {/* MODAL AGREGAR PRODUCTO AL SIMULADOR */}
      {showSimProdModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in">
            <button 
              onClick={() => setShowSimProdModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white font-heading mb-4 flex items-center gap-2">
              <Package size={18} className="text-rose-400" />
              <span>Añadir Producto a la Demo</span>
            </h3>

            <form onSubmit={handleAddSimProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Producto o Plan *
                </label>
                <input
                  type="text"
                  value={newSimProdName}
                  onChange={(e) => setNewSimProdName(e.target.value)}
                  placeholder="Ej: Plan Acceso Total Anual"
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Precio ($ USD o S/) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newSimProdPrice}
                    onChange={(e) => setNewSimProdPrice(e.target.value)}
                    placeholder="350"
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={newSimProdCategory}
                    onChange={(e) => setNewSimProdCategory(e.target.value)}
                    placeholder="Servicios, Software, etc."
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción o Beneficios Clave
                </label>
                <textarea
                  rows={2}
                  value={newSimProdDesc}
                  onChange={(e) => setNewSimProdDesc(e.target.value)}
                  placeholder="Incluye Bot WhatsApp 24/7, CRM Kanban, Retargeting Masivo..."
                  className="w-full glass-input px-4 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimProdModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25"
                >
                  Agregar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR PALABRA CLAVE AL SIMULADOR */}
      {showSimKwModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in">
            <button 
              onClick={() => setShowSimKwModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white font-heading mb-4 flex items-center gap-2">
              <Plus size={18} className="text-emerald-400" />
              <span>Agregar Regla de Respuesta</span>
            </h3>

            <form onSubmit={handleAddSimKeyword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Palabras Clave (separadas por coma)
                </label>
                <input
                  type="text"
                  value={newSimKw}
                  onChange={(e) => setNewSimKw(e.target.value)}
                  placeholder="Ej: precio, costo, planes, cuanto vale"
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Respuesta del Bot en el Simulador
                </label>
                <textarea
                  rows={3}
                  value={newSimResponse}
                  onChange={(e) => setNewSimResponse(e.target.value)}
                  placeholder="Escribe la respuesta automática..."
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Etapa del CRM Kanban a Simular
                </label>
                <select
                  value={newSimStage}
                  onChange={(e) => setNewSimStage(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm bg-slate-900"
                >
                  <option value="Nuevo Lead">Nuevo Lead</option>
                  <option value="En Conversación">En Conversación</option>
                  <option value="Propuesta Enviada">Propuesta Enviada</option>
                  <option value="Negociación">Negociación</option>
                  <option value="Cerrado / Ganado">Cerrado / Ganado</option>
                  <option value="Descartado">Descartado</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimKwModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25"
                >
                  Agregar Regla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <UserPlus size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">Crear Nuevo Negocio</h3>
                <p className="text-xs text-slate-400">Asigna usuario, contraseña y su bot de WhatsApp quedará listo</p>
              </div>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Negocio / Empresa *
                </label>
                <input 
                  type="text" 
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  placeholder="ej. Inmobiliaria Costa Verde, Moda Express..."
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Usuario de Acceso *
                  </label>
                  <input 
                    type="text" 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="ej. costa_verde"
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contraseña *
                  </label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono del Negocio
                  </label>
                  <input 
                    type="text" 
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+51 987 654 321"
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Plan Asignado
                  </label>
                  <select 
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm bg-slate-900"
                  >
                    <option value="Plan Emprendedor">Plan Emprendedor ($29)</option>
                    <option value="Plan Pro">Plan Pro Empresa ($59)</option>
                    <option value="Plan Corporativo">Plan Corporativo ($119)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT USER MODAL */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Edit3 size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">Editar Negocio: {selectedUser.business_name}</h3>
                <p className="text-xs text-slate-400">Usuario: @{selectedUser.username}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Negocio
                </label>
                <input 
                  type="text" 
                  value={editBusinessName}
                  onChange={(e) => setEditBusinessName(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono
                  </label>
                  <input 
                    type="text" 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Plan
                  </label>
                  <select 
                    value={editPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm bg-slate-900"
                  >
                    <option value="Plan Emprendedor">Plan Emprendedor</option>
                    <option value="Plan Pro">Plan Pro Empresa</option>
                    <option value="Plan Corporativo">Plan Corporativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cambiar Contraseña (dejar en blanco para mantener la actual)
                </label>
                <input 
                  type="password" 
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="Nueva contraseña opcional"
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-slate-300">Cuenta Activa (permitir acceso al cliente)</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
