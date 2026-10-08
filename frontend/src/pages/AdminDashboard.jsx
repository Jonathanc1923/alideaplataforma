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
  Cpu
} from 'lucide-react';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';
const ADMIN_PIN = '2732';

export default function AdminDashboard() {
  const navigate = useNavigate();

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
            <div className="text-[11px] text-slate-500 mt-1">Tokens Qwen 7B de por vida</div>
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
                        <div className="text-[11px] text-slate-500">Tokens Qwen 7B</div>
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

      </main>

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
