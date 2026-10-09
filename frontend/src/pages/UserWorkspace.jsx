import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Bot, 
  Users, 
  TrendingUp, 
  QrCode, 
  Power, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Phone, 
  Mail, 
  ExternalLink, 
  DollarSign, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  FileText, 
  Volume2, 
  Video, 
  Kanban, 
  List,
  AlertCircle,
  Package,
  CalendarCheck,
  CheckCircle,
  ShoppingCart,
  MessageCircle,
  Tag,
  Check,
  Activity,
  FileSpreadsheet,
  Radio,
  Zap,
  Layers,
  StopCircle,
  Play,
  Sliders,
  Brain,
  Cpu,
  AlertTriangle,
  Receipt,
  Calculator,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Percent,
  BarChart3,
  PieChart,
  Target,
  Flame,
  Calendar,
  PauseCircle,
  PlayCircle,
  ShieldAlert
} from 'lucide-react';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

export default function UserWorkspace() {
  const navigate = useNavigate();

  // Auth & Session
  const [auth, setAuth] = useState(null);
  const [activeTab, setActiveTab] = useState('crm'); // 'crm' | 'chat' | 'tasks' | 'catalog' | 'bot' | 'dashboard'

  // Dashboard Stats
  const [crmStats, setCrmStats] = useState({
    totalLeads: 0,
    totalPipelineValue: 0,
    wonValue: 0,
    conversionRate: 0,
    stageCounts: { nuevo: 0, contactado: 0, propuesta: 0, negociacion: 0, ganado: 0, perdido: 0 }
  });

  // Bot & QR state
  const [botStatus, setBotStatus] = useState({ status: 'INITIALIZING', qr: null, phone: null });
  const [keywords, setKeywords] = useState([]);
  const [loadingBot, setLoadingBot] = useState(false);

  // Keyword Form State (Multiple sequential messages support)
  const [kwWord, setKwWord] = useState('');
  const [kwResponses, setKwResponses] = useState(['']);
  const [kwDelayMin, setKwDelayMin] = useState(2);
  const [kwDelayMax, setKwDelayMax] = useState(5);
  const [kwMediaDelayMin, setKwMediaDelayMin] = useState(2);
  const [kwMediaDelayMax, setKwMediaDelayMax] = useState(5);
  const [kwFiles, setKwFiles] = useState([]);
  const [editingKwId, setEditingKwId] = useState(null);
  const [existingKwMedia, setExistingKwMedia] = useState([]);

  const handleAddResponseBox = () => {
    setKwResponses(prev => [...prev, '']);
  };

  const handleRemoveResponseBox = (idx) => {
    setKwResponses(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : ['']);
  };

  const handleUpdateResponseBox = (idx, value) => {
    setKwResponses(prev => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  // Live Bot Simulator State
  const [simMessage, setSimMessage] = useState('');
  const [simChat, setSimChat] = useState([
    { sender: 'bot', text: '¡Hola! Este es el simulador interactivo de tu bot de Alidea. Escribe cualquier palabra clave para probar tus respuestas en tiempo real.', time: 'Ahora' }
  ]);
  const [isSimTyping, setIsSimTyping] = useState(false);

  // CRM Leads State
  const [leads, setLeads] = useState([]);
  const [crmView, setCrmView] = useState('kanban'); // 'kanban' | 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  // Lead Modals
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadStage, setLeadStage] = useState('nuevo');
  const [leadDealValue, setLeadDealValue] = useState(0);
  const [leadSource, setLeadSource] = useState('whatsapp');
  const [leadTags, setLeadTags] = useState('');
  const [leadNotes, setLeadNotes] = useState('');

  // Lead Timeline & Activity Modal
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timelineLead, setTimelineLead] = useState(null);
  const [leadActivities, setLeadActivities] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');

  // ==========================================
  // NEW: 1. LIVE CHAT STATE
  // ==========================================
  const [conversations, setConversations] = useState([]);
  const [activeChatJid, setActiveChatJid] = useState(null);
  const [activeChatMessages, setActiveChatMessages] = useState([]);
  const [liveChatInput, setLiveChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [chatTagFilter, setChatTagFilter] = useState('all');

  // ==========================================
  // NEW: 2. TASKS & REMINDERS STATE
  // ==========================================
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskLeadId, setTaskLeadId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [taskDueTime, setTaskDueTime] = useState('11:00 AM');
  const [taskPriority, setTaskPriority] = useState('media');

  // ==========================================
  // NEW: 3. PRODUCTS & ORDERS STATE
  // ==========================================
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [catalogSubTab, setCatalogSubTab] = useState('products'); // 'products' | 'orders'
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('General');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');

  // Currency & Business Settings State
  const [currencyCode, setCurrencyCode] = useState(auth?.user?.currency_code || 'PEN');
  const [currencySymbol, setCurrencySymbol] = useState(auth?.user?.currency_symbol || 'S/');
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [currencySuccessMsg, setCurrencySuccessMsg] = useState('');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // New Order Modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderLeadId, setOrderLeadId] = useState('');
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [orderNotes, setOrderNotes] = useState('');

  // ==========================================
  // NEW: 4. CRM TAGS STATE
  // ==========================================
  const [crmTags, setCrmTags] = useState([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const [showChatCrmPanel, setShowChatCrmPanel] = useState(true);

  // Dynamic calculation of totals by configured and active tags
  const tagTotals = useMemo(() => {
    const map = new Map();

    // 1. Add all configured CRM tags (default + custom)
    crmTags.forEach(t => {
      const key = t.name.toLowerCase().trim();
      map.set(key, {
        id: t.id,
        name: t.name,
        color: t.color || '#6366f1',
        count: 0
      });
    });

    // 2. Scan leads and count, also adding any tags that exist on leads
    leads.forEach(lead => {
      if (!lead.tags) return;
      const tagList = lead.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      tagList.forEach(tagName => {
        const key = tagName.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            id: `dyn-${key}`,
            name: tagName,
            color: '#6366f1',
            count: 0
          });
        }
        map.get(key).count += 1;
      });
    });

    return Array.from(map.values());
  }, [crmTags, leads]);

  // ==========================================
  // NEW: 5. RETARGETING & BROADCAST STATE
  // ==========================================
  const [showRetargetingModal, setShowRetargetingModal] = useState(false);
  const [retargetingName, setRetargetingName] = useState('');
  const [retargetingTag, setRetargetingTag] = useState('all');
  const [retargetingMessages, setRetargetingMessages] = useState([
    { text: '', mediaFiles: [] }
  ]);
  const [retargetingSettings, setRetargetingSettings] = useState({
    msgDelayMin: 3,
    msgDelayMax: 6,
    batchSize: 5,
    batchDelaySeconds: 30
  });
  const [activeCampaignId, setActiveCampaignId] = useState(null);
  const [campaignProgress, setCampaignProgress] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [isStartingRetargeting, setIsStartingRetargeting] = useState(false);

  // ==========================================
  // NEW: 6. ALIDEA GENESIS AI™ STATE
  // ==========================================
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiSystemPrompt, setAiSystemPrompt] = useState('');
  const [aiTemperature, setAiTemperature] = useState(0.5);
  const [aiDelayMin, setAiDelayMin] = useState(2);
  const [aiDelayMax, setAiDelayMax] = useState(5);
  const [aiStatus, setAiStatus] = useState({ online: true, checking: false, message: 'Alidea Genesis AI™ Activo' });
  const [showAiConfigModal, setShowAiConfigModal] = useState(false);
  const [savingAi, setSavingAi] = useState(false);
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestInput, setAiTestInput] = useState('');
  const [aiTestOutput, setAiTestOutput] = useState('');
  const [showAiTestSection, setShowAiTestSection] = useState(false);

  // Compute Word Count for the 3,000 word limit
  const aiWordCount = useMemo(() => {
    if (!aiSystemPrompt) return 0;
    return aiSystemPrompt.trim().split(/\s+/).filter(Boolean).length;
  }, [aiSystemPrompt]);

  // ==========================================
  // NEW: 7. CONTABILIDAD & FINANZAS STATE
  // ==========================================
  const [accountingSubTab, setAccountingSubTab] = useState('diario'); // 'diario' | 'mayor' | 'balance'
  const [accountingEntries, setAccountingEntries] = useState([]);
  const [accountingSummary, setAccountingSummary] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    saldoNeto: 0,
    totalNotasCredito: 0,
    totalNotasDebito: 0,
    totalImpuestos: 0,
    count: 0
  });
  const [accountingLedger, setAccountingLedger] = useState({ accounts: [], totalDebe: 0, totalHaber: 0, diferencia: 0, estaCuadrado: true });
  const [annualBalance, setAnnualBalance] = useState(null);
  const [taxSettings, setTaxSettings] = useState({
    default_tax_percentage: 18,
    income_tax_percentage: 29.5,
    income_tax_manual_amount: 0,
    income_tax_mode: 'percentage'
  });
  const [loadingAccounting, setLoadingAccounting] = useState(false);
  const [accYear, setAccYear] = useState(new Date().getFullYear());
  const [accMonth, setAccMonth] = useState('');
  const [accClassification, setAccClassification] = useState('all');
  const [accType, setAccType] = useState('all');
  const [accSearch, setAccSearch] = useState('');

  // Asientos Modals & Form
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryDescription, setEntryDescription] = useState('');
  const [entryReferenceDoc, setEntryReferenceDoc] = useState('');
  const [entryType, setEntryType] = useState('ingreso');
  const [entryClassification, setEntryClassification] = useState('activo');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryTaxPercentage, setEntryTaxPercentage] = useState(18);
  const [entryNotes, setEntryNotes] = useState('');

  // Tax Settings Modal & Form
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [taxFormDefault, setTaxFormDefault] = useState(18);
  const [taxFormIncomePercent, setTaxFormIncomePercent] = useState(29.5);
  const [taxFormIncomeManual, setTaxFormIncomeManual] = useState(0);
  const [taxFormIncomeMode, setTaxFormIncomeMode] = useState('percentage');
  const [isSavingTax, setIsSavingTax] = useState(false);

  // ==========================================
  // NEW: 8. BUSINESS ANALYTICS & BI STATE
  // ==========================================
  const [analyticsGranularity, setAnalyticsGranularity] = useState('monthly'); // 'monthly' | 'weekly'
  const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());
  const [analyticsCategoryFilter, setAnalyticsCategoryFilter] = useState('all'); // 'all' | 'financial' | 'funnel' | 'products' | 'traffic'
  const [businessInsights, setBusinessInsights] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // 1. Initial Load & Auth Check
  useEffect(() => {
    const rawAuth = localStorage.getItem('alidea_auth');
    if (!rawAuth) {
      navigate('/login');
      return;
    }

    try {
      const parsed = JSON.parse(rawAuth);
      if (!parsed.user || !parsed.sessionId) {
        navigate('/login');
        return;
      }
      setAuth(parsed);
    } catch (e) {
      navigate('/login');
    }
  }, [navigate]);

  // 2. Fetch Data when Auth is ready
  useEffect(() => {
    if (!auth) return;

    fetchBotStatus();
    fetchKeywords();
    fetchLeads();
    fetchCrmStats();
    fetchChatConversations();
    fetchTasks();
    fetchProducts();
    fetchOrders();
    fetchCrmTags();
    fetchAiSettings();
    fetchUserSettings();

    const interval = setInterval(() => {
      fetchBotStatus();
      fetchLeads();
      fetchCrmStats();
      if (activeTab === 'chat') {
        fetchChatConversations();
        if (activeChatJid) fetchMessagesForJid(activeChatJid);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [auth, activeTab, activeChatJid]);

  // ==========================================
  // ALIDEA GENESIS AI™ API CALLS & HANDLERS
  // ==========================================
  const fetchAiSettings = async () => {
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/sessions/${auth.sessionId}/ai-settings`);
      if (res.data) {
        setAiEnabled(Boolean(res.data.ai_enabled));
        setAiSystemPrompt(res.data.ai_system_prompt || '');
        setAiTemperature(res.data.ai_temperature !== undefined ? res.data.ai_temperature : 0.5);
        setAiDelayMin(res.data.ai_delay_min !== undefined ? res.data.ai_delay_min : 2);
        setAiDelayMax(res.data.ai_delay_max !== undefined ? res.data.ai_delay_max : 5);
        if (res.data.status) {
          setAiStatus({
            online: Boolean(res.data.status.connected),
            checking: false,
            message: res.data.status.message || 'Alidea Genesis AI™ Activo'
          });
        }
      }
    } catch (err) {
      console.error('Error fetching AI settings:', err);
    }
  };

  const handleToggleAi = async (enable) => {
    if (!auth) return;
    setAiEnabled(enable);
    try {
      await axios.put(`${API_BASE}/sessions/${auth.sessionId}/ai-settings`, {
        ai_enabled: enable ? 1 : 0,
        ai_system_prompt: aiSystemPrompt,
        ai_temperature: aiTemperature,
        ai_delay_min: aiDelayMin,
        ai_delay_max: aiDelayMax
      });
      // If turning on for the first time without context, prompt to configure
      if (enable && (!aiSystemPrompt || aiSystemPrompt.trim().length === 0)) {
        setShowAiConfigModal(true);
      }
    } catch (err) {
      console.error('Error toggling AI:', err);
    }
  };

  const handleSaveAiSettings = async (e) => {
    if (e) e.preventDefault();
    if (!auth) return;
    
    if (aiWordCount > 3000) {
      alert(`El contexto del negocio excede el límite permitido (${aiWordCount} / 3000 palabras). Por favor resume el texto.`);
      return;
    }

    setSavingAi(true);
    try {
      await axios.put(`${API_BASE}/sessions/${auth.sessionId}/ai-settings`, {
        ai_enabled: aiEnabled ? 1 : 0,
        ai_system_prompt: aiSystemPrompt,
        ai_temperature: aiTemperature,
        ai_delay_min: aiDelayMin,
        ai_delay_max: aiDelayMax
      });
      alert('¡Base de conocimiento y configuración de Alidea Genesis AI™ guardada correctamente!');
      setShowAiConfigModal(false);
      fetchAiSettings();
    } catch (err) {
      console.error('Error saving AI settings:', err);
      alert('Error al guardar la configuración de IA.');
    } finally {
      setSavingAi(false);
    }
  };

  const handleTestAiDirect = async (e) => {
    if (e) e.preventDefault();
    if (!aiTestInput.trim() || !auth) return;
    setTestingAi(true);
    setAiTestOutput('');
    try {
      const res = await axios.post(`${API_BASE}/sessions/${auth.sessionId}/ai-test`, {
        prompt: aiTestInput.trim(),
        systemPrompt: aiSystemPrompt,
        temperature: aiTemperature
      });
      if (res.data.success) {
        if (res.data.shouldAnswer && res.data.messages && res.data.messages.length > 0) {
          setAiTestOutput(res.data.messages.join('\n\n'));
        } else {
          setAiTestOutput('🛡️ [Transferencia Segura a Humano]: Esta consulta no se encuentra en el contexto del negocio o carece de certeza. Para evitar alucinaciones o errores, la IA decide no responder y transferir el chat a un asesor humano.');
        }
      } else {
        setAiTestOutput(`❌ ${res.data.error || 'No se pudo generar respuesta'}`);
      }
    } catch (err) {
      console.error('Error testing AI:', err);
      setAiTestOutput(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setTestingAi(false);
    }
  };

  // API Calls
  const fetchBotStatus = async () => {
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/sessions/${auth.sessionId}/qr`);
      setBotStatus(res.data);
    } catch (err) {
      console.error('Error fetching bot status:', err);
    }
  };

  const fetchKeywords = async () => {
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/sessions/${auth.sessionId}/keywords`);
      setKeywords(res.data);
    } catch (err) {
      console.error('Error fetching keywords:', err);
    }
  };

  const fetchLeads = async () => {
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/crm/leads`, {
        headers: { 'x-user-id': auth.user.id },
        params: { stage: stageFilter, search: searchTerm }
      });
      setLeads(res.data);
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  const fetchCrmStats = async () => {
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/crm/stats`, {
        headers: { 'x-user-id': auth.user.id }
      });
      setCrmStats(res.data);
    } catch (err) {
      console.error('Error fetching crm stats:', err);
    }
  };

  // Live Chat API
  const fetchChatConversations = async () => {
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/chat/conversations`, {
        headers: { 'x-user-id': auth.user.id }
      });
      setConversations(res.data);
      if (!activeChatJid && res.data.length > 0) {
        setActiveChatJid(res.data[0].jid);
        fetchMessagesForJid(res.data[0].jid);
      }
    } catch (err) {
      console.error('Error fetching chat conversations:', err);
    }
  };

  const fetchMessagesForJid = async (jid) => {
    if (!auth || !jid) return;
    try {
      const res = await axios.get(`${API_BASE}/chat/messages/${encodeURIComponent(jid)}`, {
        headers: { 'x-user-id': auth.user.id }
      });
      setActiveChatMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages for jid:', err);
    }
  };

  const handleSendLiveChatMessage = async (e) => {
    e.preventDefault();
    if (!liveChatInput.trim() || !activeChatJid) return;

    const textToSend = liveChatInput.trim();
    setLiveChatInput('');
    setSendingChat(true);

    try {
      await axios.post(`${API_BASE}/chat/send`, {
        sessionId: auth.sessionId,
        jid: activeChatJid,
        text: textToSend
      });

      fetchMessagesForJid(activeChatJid);
      fetchChatConversations();
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Error al enviar mensaje');
    } finally {
      setSendingChat(false);
    }
  };

  // ==========================================
  // CRM TAGS API & CHAT TAGGING
  // ==========================================
  const fetchCrmTags = async () => {
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/crm/tags`, {
        headers: { 'x-user-id': auth.user.id }
      });
      setCrmTags(res.data);
    } catch (err) {
      console.error('Error fetching CRM tags:', err);
    }
  };

  const handleCreateCrmTag = async (e) => {
    if (e) e.preventDefault();
    if (!newTagName.trim() || !auth) return;

    try {
      await axios.post(`${API_BASE}/crm/tags`, {
        name: newTagName.trim(),
        color: newTagColor
      }, {
        headers: { 'x-user-id': auth.user.id }
      });
      setNewTagName('');
      setShowCreateTagModal(false);
      fetchCrmTags();
    } catch (err) {
      console.error('Error creating CRM tag:', err);
      alert('Error al crear la etiqueta');
    }
  };

  const handleDeleteCrmTag = async (tagId) => {
    if (!window.confirm('¿Eliminar esta etiqueta del CRM?')) return;
    try {
      await axios.delete(`${API_BASE}/crm/tags/${tagId}`, {
        headers: { 'x-user-id': auth.user.id }
      });
      fetchCrmTags();
      fetchChatConversations();
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleChatTag = async (tagName, action = 'toggle') => {
    if (!activeChatJid || !auth) return;
    const activeConv = conversations.find(c => c.jid === activeChatJid);

    let impliedStage = null;
    if (action !== 'remove' && tagName) {
      const tLower = tagName.toLowerCase();
      if (tLower.includes('ganad') || tLower.includes('cerrad')) impliedStage = 'ganado';
      else if (tLower.includes('propuest') || tLower.includes('cotizac')) impliedStage = 'propuesta';
      else if (tLower.includes('negocia') || tLower.includes('interesad')) impliedStage = 'negociacion';
      else if (tLower.includes('conversac') || tLower.includes('contactad')) impliedStage = 'contactado';
      else if (tLower.includes('descart') || tLower.includes('perdid')) impliedStage = 'perdido';
    }

    try {
      await axios.post(`${API_BASE}/chat/set-tag`, {
        leadId: activeConv?.lead_id,
        jid: activeChatJid,
        phone: activeConv?.sender_phone || activeChatJid.split('@')[0],
        sessionId: auth.sessionId,
        tagName,
        stage: impliedStage,
        action: action || 'toggle'
      }, {
        headers: { 'x-user-id': auth.user.id }
      });
      fetchChatConversations();
      fetchLeads();
      fetchCrmStats();
    } catch (err) {
      console.error('Error toggling chat tag:', err);
    }
  };

  const handleToggleChatAi = async (targetJid = null, forceState = null) => {
    const jid = targetJid || activeChatJid;
    if (!jid || !auth) return;
    const targetConv = conversations.find(c => c.jid === jid);
    const currentLead = leads.find(l => (targetConv?.lead_id && l.id === targetConv.lead_id) || (targetConv?.sender_phone && l.phone === targetConv.sender_phone));
    
    let isCurrentlyDisabled = 0;
    if (currentLead && currentLead.ai_disabled !== undefined && currentLead.ai_disabled !== null) {
      isCurrentlyDisabled = currentLead.ai_disabled;
    } else if (targetConv && targetConv.lead_ai_disabled !== undefined && targetConv.lead_ai_disabled !== null) {
      isCurrentlyDisabled = targetConv.lead_ai_disabled;
    }

    const nextDisabledState = forceState !== null ? (forceState ? 1 : 0) : (isCurrentlyDisabled === 1 ? 0 : 1);

    try {
      await axios.post(`${API_BASE}/chat/toggle-ai`, {
        leadId: currentLead?.id || targetConv?.lead_id || null,
        jid: jid,
        phone: targetConv?.sender_phone || jid.split('@')[0],
        sessionId: auth.sessionId,
        ai_disabled: nextDisabledState
      }, {
        headers: { 'x-user-id': auth.user.id }
      });
      fetchChatConversations();
      fetchLeads();
    } catch (err) {
      console.error('Error toggling chat AI:', err);
    }
  };

  const handleToggleTagAi = async (tagId, currentDisabled) => {
    if (!auth || !tagId) return;
    const newDisabled = (currentDisabled === 1 || currentDisabled === true || currentDisabled === '1') ? 0 : 1;
    try {
      await axios.put(`${API_BASE}/crm/tags/${tagId}/ai-toggle`, {
        ai_disabled: newDisabled
      }, {
        headers: { 'x-user-id': auth.user.id }
      });
      fetchCrmTags();
    } catch (err) {
      console.error('Error toggling tag AI:', err);
    }
  };

  // ==========================================
  // RETARGETING HELPERS & API
  // ==========================================
  const handleAddRetargetingMessage = () => {
    setRetargetingMessages(prev => [...prev, { text: '', mediaFiles: [] }]);
  };

  const handleRemoveRetargetingMessage = (idx) => {
    setRetargetingMessages(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : [{ text: '', mediaFiles: [] }]);
  };

  const handleUpdateRetargetingText = (idx, text) => {
    setRetargetingMessages(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], text };
      return copy;
    });
  };

  const handleAttachFilesToRetargetingMsg = async (idx, files) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.files) {
        setRetargetingMessages(prev => {
          const copy = [...prev];
          const existing = copy[idx].mediaFiles || [];
          copy[idx] = { ...copy[idx], mediaFiles: [...existing, ...res.data.files] };
          return copy;
        });
      }
    } catch (err) {
      console.error('Error uploading retargeting files:', err);
      alert('Error al subir los archivos adjuntos');
    }
  };

  const handleRemoveRetargetingMedia = (msgIdx, fileIdx) => {
    setRetargetingMessages(prev => {
      const copy = [...prev];
      const mediaList = (copy[msgIdx].mediaFiles || []).filter((_, i) => i !== fileIdx);
      copy[msgIdx] = { ...copy[msgIdx], mediaFiles: mediaList };
      return copy;
    });
  };

  const getAllTargetableContacts = () => {
    const contactMap = new Map();

    leads.forEach(l => {
      const cleanPhone = (l.phone || '').replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 6) {
        contactMap.set(cleanPhone, {
          id: l.id,
          name: l.name || 'Cliente',
          phone: l.phone,
          tags: l.tags || ''
        });
      }
    });

    conversations.forEach(c => {
      const cleanPhone = (c.sender_phone || c.jid?.split('@')[0] || '').replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 6 && !contactMap.has(cleanPhone)) {
        contactMap.set(cleanPhone, {
          id: c.lead_id || `conv-${cleanPhone}`,
          name: c.lead_name || c.sender_name || `Contacto ${cleanPhone.slice(-4)}`,
          phone: c.sender_phone || ('+' + cleanPhone),
          tags: c.lead_tags || ''
        });
      }
    });

    return Array.from(contactMap.values());
  };

  const getTargetContactsCount = () => {
    const allContacts = getAllTargetableContacts();
    if (retargetingTag === 'all') {
      return allContacts.length;
    }
    return allContacts.filter(c => {
      if (!c.tags) return false;
      const tagList = c.tags.toLowerCase().split(',').map(t => t.trim());
      return tagList.some(item => item.includes(retargetingTag.toLowerCase()) || retargetingTag.toLowerCase().includes(item));
    }).length;
  };

  const fetchCampaignHistory = async () => {
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/retargeting/history`, {
        headers: { 'x-user-id': auth.user.id }
      });
      setCampaignHistory(res.data || []);
    } catch (err) {
      console.error('Error fetching campaign history:', err);
    }
  };

  const handleStartRetargeting = async (e) => {
    if (e) e.preventDefault();
    if (!auth) return;

    const formattedMessages = [];
    for (const msg of retargetingMessages) {
      if (msg.text && msg.text.trim()) {
        formattedMessages.push({
          type: 'text',
          text: msg.text.trim()
        });
      }
      if (msg.mediaFiles && msg.mediaFiles.length > 0) {
        for (const file of msg.mediaFiles) {
          formattedMessages.push({
            type: file.type || 'image',
            mediaUrl: file.url,
            filename: file.filename,
            originalName: file.originalName,
            caption: ''
          });
        }
      }
    }

    if (formattedMessages.length === 0) {
      alert('Debes ingresar al menos un texto o adjuntar un archivo para la campaña de retargeting.');
      return;
    }

    if (getTargetContactsCount() === 0) {
      alert('No se encontraron contactos con la etiqueta seleccionada. Elige "Todas las etiquetas" o asigna etiquetas a tus contactos en el chat.');
      return;
    }

    setIsStartingRetargeting(true);
    try {
      const res = await axios.post(`${API_BASE}/retargeting/start`, {
        name: retargetingName.trim() || `Retargeting ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`,
        sessionId: auth.sessionId,
        targetTags: retargetingTag === 'all' ? null : [retargetingTag],
        messages: formattedMessages,
        settings: retargetingSettings
      }, {
        headers: { 'x-user-id': auth.user.id }
      });

      if (res.data.success) {
        setActiveCampaignId(res.data.campaignId);
        setShowRetargetingModal(false);
        setShowProgressModal(true);
        setCampaignProgress({
          campaignId: res.data.campaignId,
          total: res.data.totalContacts,
          sent: 0,
          failed: 0,
          status: 'running',
          logs: [`🚀 Campaña iniciada para ${res.data.totalContacts} contactos.`]
        });
      }
    } catch (err) {
      console.error('Error starting retargeting:', err);
      alert(err.response?.data?.error || 'Error al iniciar la campaña de retargeting');
    } finally {
      setIsStartingRetargeting(false);
    }
  };

  const handleStopCampaign = async () => {
    if (!activeCampaignId) return;
    if (!window.confirm('¿Seguro que deseas pausar / detener la campaña de retargeting?')) return;
    try {
      await axios.post(`${API_BASE}/retargeting/stop/${activeCampaignId}`);
      setCampaignProgress(prev => prev ? { ...prev, status: 'stopped' } : null);
    } catch (err) {
      console.error('Error stopping campaign:', err);
    }
  };

  // Poll Retargeting Progress
  useEffect(() => {
    let timer;
    if (showProgressModal && activeCampaignId) {
      const poll = async () => {
        try {
          const res = await axios.get(`${API_BASE}/retargeting/status/${activeCampaignId}`);
          setCampaignProgress(res.data);
          if (res.data.status === 'completed' || res.data.status === 'stopped' || res.data.status === 'error') {
            clearInterval(timer);
          }
        } catch (e) {
          console.error('Error polling retargeting status:', e);
        }
      };
      poll();
      timer = setInterval(poll, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showProgressModal, activeCampaignId]);

  const handleUpdateChatLeadStage = async (newStage) => {
    const activeConv = conversations.find(c => c.jid === activeChatJid);
    if (!activeConv || !auth) return;

    try {
      if (activeConv.lead_id) {
        await axios.put(`${API_BASE}/crm/leads/${activeConv.lead_id}`, {
          stage: newStage
        }, {
          headers: { 'x-user-id': auth.user.id }
        });
      } else {
        const phone = '+' + activeChatJid.split('@')[0].replace(/[^0-9]/g, '');
        await axios.post(`${API_BASE}/crm/leads`, {
          name: activeConv.sender_name || `Contacto ${phone.slice(-4)}`,
          phone: phone,
          stage: newStage,
          source: 'whatsapp'
        }, {
          headers: { 'x-user-id': auth.user.id }
        });
      }
      fetchChatConversations();
      fetchLeads();
      fetchCrmStats();
    } catch (err) {
      console.error('Error updating chat lead stage:', err);
    }
  };

  // Tasks API
  const fetchTasks = async () => {
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/crm/tasks`, {
        headers: { 'x-user-id': auth.user.id }
      });
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      await axios.post(`${API_BASE}/crm/tasks`, {
        user_id: auth.user.id,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        lead_id: taskLeadId || null,
        due_date: taskDueDate,
        due_time: taskDueTime,
        priority: taskPriority
      });

      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskLeadId('');
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Error al crear tarea');
    }
  };

  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === 'pendiente' ? 'completada' : 'pendiente';
    try {
      await axios.put(`${API_BASE}/crm/tasks/${task.id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    try {
      await axios.delete(`${API_BASE}/crm/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // Currency & Business Settings API
  const fetchUserSettings = async () => {
    if (!auth?.user?.id) return;
    try {
      const res = await axios.get(`${API_BASE}/user/settings`, {
        headers: { 'x-user-id': auth.user.id }
      });
      if (res.data) {
        if (res.data.currency_code) setCurrencyCode(res.data.currency_code);
        if (res.data.currency_symbol) setCurrencySymbol(res.data.currency_symbol);
      }
    } catch (err) {
      console.warn('Error loading user settings:', err);
    }
  };

  const handleSaveCurrencySettings = async (code, symbol) => {
    if (!auth?.user?.id) return;
    setSavingCurrency(true);
    const finalCode = (code || currencyCode).trim() || 'PEN';
    const finalSymbol = (symbol || currencySymbol).trim() || 'S/';
    try {
      await axios.put(`${API_BASE}/user/settings`, {
        currency_code: finalCode,
        currency_symbol: finalSymbol
      }, {
        headers: { 'x-user-id': auth.user.id }
      });

      setCurrencyCode(finalCode);
      setCurrencySymbol(finalSymbol);

      // Update local storage
      const stored = localStorage.getItem('alidea_auth');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.user) {
            parsed.user.currency_code = finalCode;
            parsed.user.currency_symbol = finalSymbol;
            localStorage.setItem('alidea_auth', JSON.stringify(parsed));
          }
        } catch(e) {}
      }

      setCurrencySuccessMsg('¡Moneda actualizada con éxito!');
      setShowCurrencyModal(false);
      setTimeout(() => setCurrencySuccessMsg(''), 3500);
    } catch (err) {
      console.error('Error saving currency settings:', err);
      alert('Error al guardar la moneda del negocio');
    } finally {
      setSavingCurrency(false);
    }
  };

  // Products & Orders API
  const fetchProducts = async () => {
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/products`, {
        headers: { 'x-user-id': auth.user.id }
      });
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchOrders = async () => {
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/orders`, {
        headers: { 'x-user-id': auth.user.id }
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdSku('');
    setProdPrice('');
    setProdCategory('General');
    setProdDesc('');
    setProdImageUrl('');
    setShowProductModal(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProdName(product.name || '');
    setProdSku(product.sku || '');
    setProdPrice(product.price !== undefined ? String(product.price) : '');
    setProdCategory(product.category || 'General');
    setProdDesc(product.description || '');
    setProdImageUrl(product.image_url || '');
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice) return;

    try {
      if (editingProduct) {
        await axios.put(`${API_BASE}/products/${editingProduct.id}`, {
          name: prodName.trim(),
          sku: prodSku.trim(),
          price: parseFloat(prodPrice),
          category: prodCategory,
          description: prodDesc.trim(),
          image_url: prodImageUrl.trim()
        }, {
          headers: { 'x-user-id': auth.user.id }
        });
      } else {
        await axios.post(`${API_BASE}/products`, {
          user_id: auth.user.id,
          name: prodName.trim(),
          sku: prodSku.trim(),
          price: parseFloat(prodPrice),
          category: prodCategory,
          description: prodDesc.trim(),
          image_url: prodImageUrl.trim()
        });
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setProdName('');
      setProdSku('');
      setProdPrice('');
      setProdDesc('');
      setProdImageUrl('');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(editingProduct ? 'Error al actualizar producto' : 'Error al agregar producto');
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await axios.delete(`${API_BASE}/products/${prodId}`, {
        headers: { 'x-user-id': auth.user.id }
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (selectedOrderItems.length === 0) {
      alert('Selecciona al menos un producto para la orden');
      return;
    }

    const total = selectedOrderItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    try {
      await axios.post(`${API_BASE}/orders`, {
        user_id: auth.user.id,
        lead_id: orderLeadId || null,
        total_amount: total,
        items: selectedOrderItems,
        notes: orderNotes
      });

      setShowOrderModal(false);
      setSelectedOrderItems([]);
      setOrderNotes('');
      setOrderLeadId('');
      fetchOrders();
      fetchCrmStats();
    } catch (err) {
      console.error(err);
      alert('Error al crear orden');
    }
  };

  const handleSendOrderSummaryWhatsApp = (order) => {
    let items = [];
    try { items = JSON.parse(order.items_json); } catch(e) {}
    
    let msg = `*RESUMEN DE PEDIDO ${order.order_number}*\nHola! Te compartimos el detalle de tu cotización en ${auth.user.business_name}:\n\n`;
    items.forEach((item, idx) => {
      msg += `• ${item.name} (x${item.quantity}): ${currencySymbol} ${item.price * item.quantity}\n`;
    });
    msg += `\n*TOTAL A PAGAR: ${currencySymbol} ${order.total_amount} ${currencyCode}*\n`;
    if (order.notes) msg += `Notas: ${order.notes}\n`;
    msg += `\n¿Confirmamos tu pedido?`;

    const phone = order.lead_phone ? order.lead_phone.replace(/[^0-9]/g, '') : '';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareFullCatalogWhatsApp = () => {
    if (!products || products.length === 0) {
      alert('Aún no tienes productos registrados en tu catálogo para compartir.');
      return;
    }

    let msg = `🛍️ *CATÁLOGO DE PRODUCTOS & SERVICIOS*\n_${auth?.user?.business_name || 'Alidea'}_\n\n`;
    
    // Group by category
    const categories = {};
    products.forEach(p => {
      const cat = p.category || 'General';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(p);
    });

    Object.keys(categories).forEach(cat => {
      msg += `📦 *${cat.toUpperCase()}*\n`;
      categories[cat].forEach((p) => {
        msg += `• *${p.name}* - ${currencySymbol} ${p.price}\n`;
        if (p.description) msg += `  _${p.description}_\n`;
      });
      msg += `\n`;
    });

    msg += `¿Deseas cotizar o realizar un pedido de alguno de estos productos? ¡Responde a este mensaje y con gusto te atendemos!`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleShareSingleProductWhatsApp = (p) => {
    let msg = `🛍️ *${p.name.toUpperCase()}*\n`;
    msg += `💵 *Precio:* ${currencySymbol} ${p.price} ${currencyCode}\n`;
    if (p.category) msg += `🏷️ *Categoría:* ${p.category}\n`;
    if (p.sku) msg += `🔢 *SKU:* ${p.sku}\n`;
    if (p.description) msg += `📝 *Detalles:* ${p.description}\n`;
    msg += `\n¿Te gustaría adquirirlo o solicitar más información? Escríbenos para confirmar tu pedido.`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // ==========================================
  // CONTABILIDAD & FINANZAS HANDLERS
  // ==========================================
  const fetchAccountingEntries = async () => {
    if (!auth) return;
    setLoadingAccounting(true);
    try {
      const res = await axios.get(`${API_BASE}/accounting/entries`, {
        headers: { 'x-user-id': auth.user.id },
        params: {
          year: accYear,
          month: accMonth || undefined,
          classification: accClassification !== 'all' ? accClassification : undefined,
          entry_type: accType !== 'all' ? accType : undefined,
          search: accSearch.trim() || undefined
        }
      });
      setAccountingEntries(res.data.entries || []);
      setAccountingSummary(res.data.summary || {
        totalIngresos: 0,
        totalEgresos: 0,
        saldoNeto: 0,
        totalNotasCredito: 0,
        totalNotasDebito: 0,
        totalImpuestos: 0,
        count: 0
      });
    } catch (err) {
      console.error('Error fetching accounting entries:', err);
    } finally {
      setLoadingAccounting(false);
    }
  };

  const fetchAccountingLedger = async () => {
    if (!auth) return;
    setLoadingAccounting(true);
    try {
      const res = await axios.get(`${API_BASE}/accounting/ledger`, {
        headers: { 'x-user-id': auth.user.id },
        params: { year: accYear }
      });
      setAccountingLedger(res.data || { accounts: [], totalDebe: 0, totalHaber: 0, diferencia: 0, estaCuadrado: true });
    } catch (err) {
      console.error('Error fetching accounting ledger:', err);
    } finally {
      setLoadingAccounting(false);
    }
  };

  const fetchAnnualBalance = async () => {
    if (!auth) return;
    setLoadingAccounting(true);
    try {
      const res = await axios.get(`${API_BASE}/accounting/annual-balance`, {
        headers: { 'x-user-id': auth.user.id },
        params: { year: accYear }
      });
      setAnnualBalance(res.data || null);
    } catch (err) {
      console.error('Error fetching annual balance:', err);
    } finally {
      setLoadingAccounting(false);
    }
  };

  const fetchTaxSettings = async () => {
    if (!auth) return;
    try {
      const res = await axios.get(`${API_BASE}/accounting/tax-settings`, {
        headers: { 'x-user-id': auth.user.id }
      });
      if (res.data) {
        setTaxSettings(res.data);
        setTaxFormDefault(res.data.default_tax_percentage ?? 18);
        setTaxFormIncomePercent(res.data.income_tax_percentage ?? 29.5);
        setTaxFormIncomeManual(res.data.income_tax_manual_amount ?? 0);
        setTaxFormIncomeMode(res.data.income_tax_mode ?? 'percentage');
      }
    } catch (err) {
      console.error('Error fetching tax settings:', err);
    }
  };

  // Sync accounting queries
  useEffect(() => {
    if (activeTab === 'accounting' && auth) {
      if (accountingSubTab === 'diario') {
        fetchAccountingEntries();
      } else if (accountingSubTab === 'mayor') {
        fetchAccountingLedger();
      } else if (accountingSubTab === 'balance') {
        fetchAnnualBalance();
      }
      fetchTaxSettings();
    }
  }, [activeTab, accountingSubTab, accYear, accMonth, accClassification, accType, accSearch, auth]);

  const handleOpenNewEntryModal = () => {
    setEditingEntryId(null);
    setEntryDate(new Date().toISOString().split('T')[0]);
    setEntryDescription('');
    setEntryReferenceDoc('');
    setEntryType('ingreso');
    setEntryClassification('activo');
    setEntryAmount('');
    setEntryTaxPercentage(taxSettings.default_tax_percentage ?? 18);
    setEntryNotes('');
    setShowEntryModal(true);
  };

  const handleOpenEditEntryModal = (entry) => {
    setEditingEntryId(entry.id);
    setEntryDate(entry.entry_date ? entry.entry_date.split('T')[0] : new Date().toISOString().split('T')[0]);
    setEntryDescription(entry.description || '');
    setEntryReferenceDoc(entry.reference_doc || '');
    setEntryType(entry.entry_type || 'ingreso');
    setEntryClassification(entry.classification || 'activo');
    setEntryAmount(entry.amount || '');
    setEntryTaxPercentage(entry.tax_percentage ?? 18);
    setEntryNotes(entry.notes || '');
    setShowEntryModal(true);
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!entryDescription.trim() || !entryAmount || isNaN(parseFloat(entryAmount))) {
      alert('Por favor completa una descripción y un monto numérico válido.');
      return;
    }

    try {
      const payload = {
        entry_date: entryDate,
        description: entryDescription.trim(),
        reference_doc: entryReferenceDoc.trim(),
        entry_type: entryType,
        classification: entryClassification,
        amount: parseFloat(entryAmount),
        tax_percentage: parseFloat(entryTaxPercentage) || 0,
        notes: entryNotes.trim()
      };

      if (editingEntryId) {
        await axios.put(`${API_BASE}/accounting/entries/${editingEntryId}`, payload, {
          headers: { 'x-user-id': auth.user.id }
        });
      } else {
        await axios.post(`${API_BASE}/accounting/entries`, payload, {
          headers: { 'x-user-id': auth.user.id }
        });
      }

      setShowEntryModal(false);
      fetchAccountingEntries();
      if (accountingSubTab === 'mayor') fetchAccountingLedger();
      if (accountingSubTab === 'balance') fetchAnnualBalance();
    } catch (err) {
      console.error('Error saving entry:', err);
      alert('Error al guardar el asiento contable: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este asiento del Libro Diario?')) return;
    try {
      await axios.delete(`${API_BASE}/accounting/entries/${id}`, {
        headers: { 'x-user-id': auth.user.id }
      });
      fetchAccountingEntries();
      if (accountingSubTab === 'mayor') fetchAccountingLedger();
      if (accountingSubTab === 'balance') fetchAnnualBalance();
    } catch (err) {
      console.error('Error deleting entry:', err);
      alert('Error al eliminar asiento');
    }
  };

  const handleSaveTaxSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSavingTax(true);
    try {
      await axios.put(`${API_BASE}/accounting/tax-settings`, {
        default_tax_percentage: parseFloat(taxFormDefault) || 0,
        income_tax_percentage: parseFloat(taxFormIncomePercent) || 0,
        income_tax_manual_amount: parseFloat(taxFormIncomeManual) || 0,
        income_tax_mode: taxFormIncomeMode
      }, {
        headers: { 'x-user-id': auth.user.id }
      });
      await fetchTaxSettings();
      setShowTaxModal(false);
      if (accountingSubTab === 'balance') fetchAnnualBalance();
    } catch (err) {
      console.error('Error saving tax settings:', err);
      alert('Error al guardar configuración tributaria');
    } finally {
      setIsSavingTax(false);
    }
  };

  const exportAccountingCSV = () => {
    if (!accountingEntries || accountingEntries.length === 0) {
      alert('No hay asientos contables para exportar en este filtro.');
      return;
    }
    const headers = ['ID', 'Fecha', 'Documento/Ref', 'Descripcion', 'Tipo', 'Clasificacion', 'Base_Imponible', 'Pct_Impuesto', 'Monto_Impuesto', 'Total', 'Notas'];
    const rows = accountingEntries.map(e => [
      e.id,
      e.entry_date,
      `"${(e.reference_doc || '').replace(/"/g, '""')}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.entry_type,
      e.classification,
      (e.amount || 0).toFixed(2),
      (e.tax_percentage || 0) + '%',
      (e.tax_amount || 0).toFixed(2),
      (e.total_amount || 0).toFixed(2),
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Libro_Diario_${accYear}_${accMonth || 'Todos'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // BUSINESS ANALYTICS & BI HANDLERS
  // ==========================================
  const fetchBusinessInsights = async () => {
    if (!auth) return;
    setLoadingAnalytics(true);
    try {
      const res = await axios.get(`${API_BASE}/analytics/business-insights`, {
        headers: { 'x-user-id': auth.user.id },
        params: { year: analyticsYear }
      });
      setBusinessInsights(res.data);
    } catch (err) {
      console.error('Error fetching business insights:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard' && auth) {
      fetchBusinessInsights();
    }
  }, [activeTab, analyticsYear, auth]);

  // Bot Actions
  const handleStartBot = async () => {
    setLoadingBot(true);
    try {
      await axios.post(`${API_BASE}/sessions/${auth.sessionId}/start`);
      setTimeout(fetchBotStatus, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBot(false);
    }
  };

  const handleLogoutBot = async () => {
    if (!window.confirm('¿Desconectar la sesión de WhatsApp vinculada?')) return;
    setLoadingBot(true);
    try {
      await axios.post(`${API_BASE}/sessions/${auth.sessionId}/logout`);
      fetchBotStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBot(false);
    }
  };

  // Keyword CRUD (Multiple messages support)
  const handleSaveKeyword = async (e) => {
    e.preventDefault();
    if (!kwWord.trim()) return;

    const validResponses = kwResponses.map(r => r.trim()).filter(Boolean);
    const mainResponse = validResponses.length > 0 ? validResponses[0] : '';
    const responsesJSON = JSON.stringify(validResponses.length > 0 ? validResponses : ['']);

    const formData = new FormData();
    formData.append('keyword', kwWord);
    formData.append('response_text', mainResponse);
    formData.append('response_messages', responsesJSON);
    formData.append('delay_min', kwDelayMin);
    formData.append('delay_max', kwDelayMax);
    formData.append('media_delay_min', kwMediaDelayMin);
    formData.append('media_delay_max', kwMediaDelayMax);

    if (kwFiles.length > 0) {
      for (let i = 0; i < kwFiles.length; i++) {
        formData.append('media', kwFiles[i]);
      }
    }

    try {
      if (editingKwId) {
        formData.append('existing_media', JSON.stringify(existingKwMedia));
        await axios.put(`${API_BASE}/sessions/${auth.sessionId}/keywords/${editingKwId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(`${API_BASE}/sessions/${auth.sessionId}/keywords`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      resetKeywordForm();
      fetchKeywords();
    } catch (err) {
      console.error('Error saving keyword:', err);
      alert('Error al guardar la palabra clave');
    }
  };

  const resetKeywordForm = () => {
    setEditingKwId(null);
    setKwWord('');
    setKwResponses(['']);
    setKwDelayMin(2);
    setKwDelayMax(5);
    setKwMediaDelayMin(2);
    setKwMediaDelayMax(5);
    setKwFiles([]);
    setExistingKwMedia([]);
    const input = document.getElementById('kwFileInput');
    if (input) input.value = '';
  };

  const startEditKeyword = (kw) => {
    setEditingKwId(kw.id);
    setKwWord(kw.keyword);
    
    let msgs = [];
    if (kw.response_messages) {
      try {
        const parsed = JSON.parse(kw.response_messages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          msgs = parsed;
        }
      } catch (e) {}
    }
    if (msgs.length === 0 && kw.response_text) {
      msgs = [kw.response_text];
    }
    if (msgs.length === 0) {
      msgs = [''];
    }
    setKwResponses(msgs);

    setKwDelayMin(kw.delay_min || 2);
    setKwDelayMax(kw.delay_max || 5);
    setKwMediaDelayMin(kw.media_delay_min || 2);
    setKwMediaDelayMax(kw.media_delay_max || 5);
    setKwFiles([]);

    let files = [];
    if (kw.media_files) {
      try { files = JSON.parse(kw.media_files); } catch (e) {}
    } else if (kw.media_path) {
      files = [{ path: kw.media_path, type: kw.media_type, name: kw.media_path.split('/').pop().split('\\').pop() }];
    }
    setExistingKwMedia(files);
  };

  const handleDeleteKeyword = async (kwId) => {
    if (!window.confirm('¿Eliminar esta palabra clave?')) return;
    try {
      await axios.delete(`${API_BASE}/sessions/${auth.sessionId}/keywords/${kwId}`);
      fetchKeywords();
    } catch (err) {
      console.error(err);
    }
  };

  // Bot Simulator with sequential multiple messages animation
  const handleSimulateMessage = async (e) => {
    e.preventDefault();
    if (!simMessage.trim()) return;

    const userText = simMessage.trim();
    const newChat = [...simChat, { sender: 'user', text: userText, time: 'Ahora' }];
    setSimChat(newChat);
    setSimMessage('');
    setIsSimTyping(true);

    try {
      const res = await axios.post(`${API_BASE}/bot/simulate`, {
        sessionId: auth.sessionId,
        messageText: userText
      });

      if (res.data.matched) {
        let msgs = res.data.responseMessages || [];
        if (msgs.length === 0 && res.data.responseText) {
          msgs = [res.data.responseText];
        }

        let currentChatHistory = [...newChat];
        for (let i = 0; i < msgs.length; i++) {
          setIsSimTyping(true);
          const waitMs = i === 0 ? Math.min(res.data.simulatedDelayMs || 1200, 2000) : 1200;
          await new Promise(resolve => setTimeout(resolve, waitMs));
          
          currentChatHistory = [
            ...currentChatHistory,
            {
              sender: 'bot',
              text: msgs[i],
              isAi: Boolean(res.data.isAi),
              isTransferredToHuman: Boolean(res.data.isTransferredToHuman),
              media: (i === msgs.length - 1) ? res.data.mediaFiles : [],
              time: 'Ahora'
            }
          ];
          setSimChat([...currentChatHistory]);
        }
        setIsSimTyping(false);
      } else {
        setTimeout(() => {
          setIsSimTyping(false);
          setSimChat([
            ...newChat,
            {
              sender: 'bot',
              text: '⚠️ No coincide con ninguna palabra clave configurada (Alidea AI desactivado o sin contexto).',
              time: 'Ahora'
            }
          ]);
        }, 1200);
      }
    } catch (err) {
      setIsSimTyping(false);
      console.error(err);
    }
  };

  // Lead CRUD
  const openNewLeadModal = () => {
    setEditingLeadId(null);
    setLeadName('');
    setLeadPhone('');
    setLeadEmail('');
    setLeadStage('nuevo');
    setLeadDealValue(0);
    setLeadSource('manual');
    setLeadTags('Interesado');
    setLeadNotes('');
    setShowLeadModal(true);
  };

  const openEditLeadModal = (lead) => {
    setEditingLeadId(lead.id);
    setLeadName(lead.name);
    setLeadPhone(lead.phone);
    setLeadEmail(lead.email || '');
    setLeadStage(lead.stage || 'nuevo');
    setLeadDealValue(lead.deal_value || 0);
    setLeadSource(lead.source || 'whatsapp');
    setLeadTags(lead.tags || '');
    setLeadNotes(lead.notes || '');
    setShowLeadModal(true);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) {
      alert('Nombre y teléfono son obligatorios');
      return;
    }

    try {
      const payload = {
        name: leadName.trim(),
        phone: leadPhone.trim(),
        email: leadEmail.trim(),
        stage: leadStage,
        deal_value: parseFloat(leadDealValue) || 0,
        source: leadSource,
        tags: leadTags.trim(),
        notes: leadNotes.trim(),
        user_id: auth.user.id
      };

      if (editingLeadId) {
        await axios.put(`${API_BASE}/crm/leads/${editingLeadId}`, payload, {
          headers: { 'x-user-id': auth.user.id }
        });
      } else {
        await axios.post(`${API_BASE}/crm/leads`, payload, {
          headers: { 'x-user-id': auth.user.id }
        });
      }

      setShowLeadModal(false);
      fetchLeads();
      fetchCrmStats();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el lead');
    }
  };

  const handleMoveStage = async (lead, newStage) => {
    try {
      await axios.put(
        `${API_BASE}/crm/leads/${lead.id}`,
        { stage: newStage },
        { headers: { 'x-user-id': auth.user.id } }
      );
      fetchLeads();
      fetchCrmStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('¿Eliminar este lead del CRM?')) return;
    try {
      await axios.delete(`${API_BASE}/crm/leads/${leadId}`, {
        headers: { 'x-user-id': auth.user.id }
      });
      fetchLeads();
      fetchCrmStats();
    } catch (err) {
      console.error(err);
    }
  };

  // Timeline / Activity Modal
  const openLeadTimeline = async (lead) => {
    setTimelineLead(lead);
    setShowTimelineModal(true);
    setNewNoteText('');
    try {
      const res = await axios.get(`${API_BASE}/crm/leads/${lead.id}/activities`);
      setLeadActivities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLeadNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !timelineLead) return;

    try {
      await axios.post(
        `${API_BASE}/crm/leads/${timelineLead.id}/activities`,
        {
          content: newNoteText.trim(),
          type: 'note',
          user_id: auth.user.id
        }
      );
      setNewNoteText('');
      const res = await axios.get(`${API_BASE}/crm/leads/${timelineLead.id}/activities`);
      setLeadActivities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // CSV Export
  const exportLeadsCSV = () => {
    if (leads.length === 0) {
      alert('No hay leads para exportar.');
      return;
    }

    const headers = ['Nombre', 'Telefono', 'Email', 'Etapa', 'Valor USD', 'Origen', 'Etiquetas', 'Ultimo Mensaje', 'Ultimo Contacto'];
    const rows = leads.map(l => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email || ''}"`,
      `"${l.stage}"`,
      l.deal_value || 0,
      `"${l.source || ''}"`,
      `"${(l.tags || '').replace(/"/g, '""')}"`,
      `"${(l.last_message || '').replace(/"/g, '""')}"`,
      `"${l.last_interaction || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_alidea_${auth.user.username}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem('alidea_auth');
    navigate('/login');
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070c18] text-slate-300">
        <div className="inline-block w-8 h-8 rounded-full border-r-2 border-indigo-500 animate-spin mr-3"></div>
        Cargando espacio de trabajo Alidea...
      </div>
    );
  }

  // Stages metadata
  const STAGES = [
    { key: 'nuevo', label: '1. Nuevo Lead', color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400' },
    { key: 'contactado', label: '2. En Conversación', color: 'border-sky-500/50 bg-sky-500/10 text-sky-400' },
    { key: 'propuesta', label: '3. Propuesta Enviada', color: 'border-purple-500/50 bg-purple-500/10 text-purple-400' },
    { key: 'negociacion', label: '4. Negociación', color: 'border-amber-500/50 bg-amber-500/10 text-amber-400' },
    { key: 'ganado', label: '5. Cerrado / Ganado 🏆', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' },
    { key: 'perdido', label: '6. Descartado', color: 'border-slate-600 bg-slate-800 text-slate-400' }
  ];

  return (
    <div className="min-h-screen bg-[#070c18] text-slate-100 font-sans pb-16">
      
      {/* Impersonation Banner if viewing from Admin */}
      {auth.impersonatedFromAdmin && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span><strong>Modo Administrador:</strong> Estás visualizando el espacio de trabajo de <strong>{auth.user.business_name}</strong> (@{auth.user.username}).</span>
          </div>
          <Link to="/admin" className="underline font-bold hover:text-amber-200">
            ← Regresar al Panel Admin
          </Link>
        </div>
      )}

      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#070c18] rounded-[10px] flex items-center justify-center">
                  <Bot className="text-indigo-400" size={20} />
                </div>
              </div>
              <span className="text-xl font-bold font-heading text-white hidden sm:inline">Alidea</span>
            </Link>

            <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

            {/* Business Badge */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-white">{auth.user.business_name}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                {auth.user.plan || 'Plan Pro'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Organized) */}
          <div className="hidden lg:flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-semibold">
            <button 
              onClick={() => setActiveTab('crm')} 
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'crm' 
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban size={14} /> CRM Clientes
            </button>
            <button 
              onClick={() => setActiveTab('chat')} 
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all relative ${
                activeTab === 'chat' 
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageCircle size={14} /> Chat en Vivo
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
            <button 
              onClick={() => setActiveTab('tasks')} 
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'tasks' 
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarCheck size={14} /> Tareas ({tasks.filter(t => t.status === 'pendiente').length})
            </button>
            <button 
              onClick={() => setActiveTab('catalog')} 
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'catalog' 
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package size={14} /> Catálogo & Pedidos
            </button>
            <button 
              onClick={() => {
                setActiveTab('retargeting');
                fetchCampaignHistory();
              }} 
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'retargeting' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio size={14} className="text-purple-300" /> Retargeting
            </button>
            <button 
              onClick={() => setActiveTab('bot')} 
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'bot' 
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot size={14} /> Bot WhatsApp
            </button>
            <button 
              onClick={() => setActiveTab('accounting')} 
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'accounting' 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Landmark size={14} /> Contabilidad
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp size={14} /> Analítica & BI
            </button>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <Power size={14} /> Salir
            </button>
          </div>
        </div>

        {/* Mobile Tab Selector */}
        <div className="lg:hidden flex border-t border-slate-800 bg-slate-950/95 text-[11px] font-semibold overflow-x-auto">
          <button onClick={() => setActiveTab('crm')} className={`px-3 py-2.5 whitespace-nowrap border-b-2 ${activeTab === 'crm' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'}`}>CRM</button>
          <button onClick={() => setActiveTab('chat')} className={`px-3 py-2.5 whitespace-nowrap border-b-2 ${activeTab === 'chat' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'}`}>Chat en Vivo</button>
          <button onClick={() => { setActiveTab('retargeting'); fetchCampaignHistory(); }} className={`px-3 py-2.5 whitespace-nowrap border-b-2 ${activeTab === 'retargeting' ? 'border-purple-400 text-purple-400' : 'border-transparent text-slate-400'}`}>Retargeting</button>
          <button onClick={() => setActiveTab('tasks')} className={`px-3 py-2.5 whitespace-nowrap border-b-2 ${activeTab === 'tasks' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'}`}>Tareas</button>
          <button onClick={() => setActiveTab('catalog')} className={`px-3 py-2.5 whitespace-nowrap border-b-2 ${activeTab === 'catalog' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'}`}>Catálogo & Pedidos</button>
          <button onClick={() => setActiveTab('accounting')} className={`px-3 py-2.5 whitespace-nowrap border-b-2 ${activeTab === 'accounting' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'}`}>Contabilidad</button>
          <button onClick={() => setActiveTab('bot')} className={`px-3 py-2.5 whitespace-nowrap border-b-2 ${activeTab === 'bot' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'}`}>Bot WhatsApp</button>
          <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-2.5 whitespace-nowrap border-b-2 ${activeTab === 'dashboard' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'}`}>Analítica & BI</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ==================================================== */}
        {/* TAB 1: CRM DE CLIENTES (KANBAN & TABLE VIEW) */}
        {/* ==================================================== */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            
            {/* CRM Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
                  <Kanban className="text-indigo-400" />
                  Embudo de Ventas & Clientes
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Gestiona prospectos capturados automáticamente desde WhatsApp y manuales.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar lead o teléfono..."
                    className="w-full glass-input pl-9 pr-3 py-2 rounded-xl text-xs"
                  />
                </div>

                {/* Filter by CRM Tag */}
                <div className="flex items-center gap-1.5 glass-input px-3 py-1.5 rounded-xl text-xs">
                  <Tag size={13} className="text-indigo-400 shrink-0" />
                  <select
                    value={selectedTagFilter}
                    onChange={(e) => setSelectedTagFilter(e.target.value)}
                    className="bg-transparent text-slate-300 text-xs outline-none cursor-pointer max-w-[140px]"
                  >
                    <option value="all" className="bg-slate-900 text-white">Todas las etiquetas</option>
                    {crmTags.map(t => (
                      <option key={t.id} value={t.name} className="bg-slate-900 text-white">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex p-0.5 bg-slate-900 rounded-xl border border-slate-800">
                  <button 
                    onClick={() => setCrmView('kanban')}
                    className={`p-2 rounded-lg text-xs transition-colors ${crmView === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Vista Tablero Kanban"
                  >
                    <Kanban size={15} />
                  </button>
                  <button 
                    onClick={() => setCrmView('table')}
                    className={`p-2 rounded-lg text-xs transition-colors ${crmView === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Vista Lista / Tabla"
                  >
                    <List size={15} />
                  </button>
                </div>

                <button 
                  onClick={() => {
                    setRetargetingTag(selectedTagFilter !== 'all' ? selectedTagFilter : 'all');
                    setShowRetargetingModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                  title="Enviar mensajes y archivos masivos segmentados por etiqueta"
                >
                  <Radio size={14} className="text-purple-200 animate-pulse" />
                  <span>Retargeting</span>
                </button>

                <button 
                  onClick={exportLeadsCSV}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Exportar a Excel / CSV"
                >
                  <Download size={15} />
                  <span className="hidden sm:inline">Exportar CSV</span>
                </button>

                <button 
                  onClick={openNewLeadModal}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  <span>Nuevo Lead</span>
                </button>
              </div>
            </div>

            {/* Totales por Etiquetas Configuradas y Activas */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Totales por Etiquetas & Segmentos ({tagTotals.length} Etiquetas)
                  </span>
                </div>
                {selectedTagFilter !== 'all' && (
                  <button 
                    onClick={() => setSelectedTagFilter('all')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-colors"
                  >
                    <span>Filtro activo: <strong>{selectedTagFilter}</strong></span>
                    <span className="text-[10px] underline">Quitar filtro</span>
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {/* Total Leads Global */}
                <div 
                  onClick={() => setSelectedTagFilter('all')}
                  className={`p-3 rounded-2xl cursor-pointer transition-all border relative group ${
                    selectedTagFilter === 'all'
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                      : 'glass-panel border-slate-800 hover:border-slate-700'
                  }`}
                  title="Ver todos los prospectos sin filtro"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-300 truncate">Total Leads</span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  </div>
                  <div className="text-2xl font-extrabold text-white font-heading">{leads.length}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Todos los contactos</div>
                </div>

                {/* Individual Tag Cards */}
                {tagTotals.map((tagItem) => {
                  const isSelected = selectedTagFilter.toLowerCase() === tagItem.name.toLowerCase();
                  return (
                    <div 
                      key={tagItem.id}
                      onClick={() => setSelectedTagFilter(isSelected ? 'all' : tagItem.name)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border relative overflow-hidden group ${
                        isSelected 
                          ? 'bg-slate-900 border-indigo-400 shadow-lg ring-1 ring-indigo-400' 
                          : 'glass-panel border-slate-800 hover:border-slate-700'
                      }`}
                      style={{
                        borderColor: isSelected ? tagItem.color : undefined,
                        boxShadow: isSelected ? `0 0 15px ${tagItem.color}30` : undefined
                      }}
                      title={`Filtrar por etiqueta "${tagItem.name}"`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span 
                          className="text-[11px] font-bold truncate max-w-[85%]"
                          style={{ color: tagItem.color }}
                        >
                          {tagItem.name}
                        </span>
                        <span 
                          className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: tagItem.color }}
                        />
                      </div>
                      <div className="text-2xl font-extrabold text-white font-heading">
                        {tagItem.count}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {tagItem.count === 1 ? '1 prospecto' : `${tagItem.count} prospectos`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KANBAN BOARD VIEW */}
            {crmView === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
                {STAGES.map((col) => {
                  const stageLeads = leads.filter(l => 
                    l.stage === col.key && 
                    (selectedTagFilter === 'all' || (l.tags && l.tags.toLowerCase().includes(selectedTagFilter.toLowerCase())))
                  );
                  const stageTotalValue = stageLeads.reduce((acc, curr) => acc + (curr.deal_value || 0), 0);

                  return (
                    <div 
                      key={col.key} 
                      className="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5 flex flex-col min-w-[240px] max-h-[750px]"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${col.color}`}>
                            {stageLeads.length}
                          </span>
                          <span className="font-bold text-xs text-white">{col.label}</span>
                        </div>
                        {stageTotalValue > 0 && (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            {currencySymbol} {stageTotalValue.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {stageLeads.length === 0 ? (
                          <div className="h-28 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-[11px] text-slate-500 text-center p-3">
                            Sin prospectos en esta etapa
                          </div>
                        ) : (
                          stageLeads.map((lead) => (
                            <div 
                              key={lead.id} 
                              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 shadow-md transition-all group relative"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                                  {lead.name}
                                </h4>
                                {lead.deal_value > 0 && (
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                    {currencySymbol} {lead.deal_value}
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
                                <Phone size={11} className="text-slate-500" />
                                {lead.phone}
                              </p>

                              {lead.last_message && (
                                <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 mb-2.5 line-clamp-2">
                                  "{lead.last_message}"
                                </p>
                              )}

                              {lead.tags && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {lead.tags.split(',').map((tag, tIdx) => {
                                    const cleanTag = tag.trim();
                                    if (!cleanTag) return null;
                                    const tagDef = crmTags.find(ct => ct.name.toLowerCase() === cleanTag.toLowerCase());
                                    const tagColor = tagDef ? tagDef.color : '#6366f1';
                                    return (
                                      <span 
                                        key={tIdx} 
                                        className="text-[9px] px-2 py-0.5 rounded-md font-medium border flex items-center gap-1"
                                        style={{
                                          backgroundColor: `${tagColor}20`,
                                          borderColor: `${tagColor}50`,
                                          color: tagColor
                                        }}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tagColor }} />
                                        {cleanTag}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Direct Stage Selector Dropdown */}
                              <div className="mb-2.5">
                                <select
                                  value={lead.stage || 'nuevo'}
                                  onChange={(e) => handleMoveStage(lead, e.target.value)}
                                  className="w-full text-[10px] font-semibold py-1 px-2 rounded-lg bg-slate-900 border border-slate-700/80 text-indigo-300 hover:border-indigo-400 focus:border-indigo-500 cursor-pointer outline-none transition-colors"
                                  title="Cambiar etapa del prospecto"
                                >
                                  {STAGES.map(s => (
                                    <option key={s.key} value={s.key} className="bg-slate-950 text-white">
                                      📍 Etapa: {s.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                                <a 
                                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${lead.name}, te escribo de ${auth.user.business_name}`)}`}
                                  target="_blank" 
                                  rel="noreferrer"
                                  title="Chatear por WhatsApp"
                                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20"
                                >
                                  <MessageSquare size={12} /> WhatsApp
                                </a>

                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => openLeadTimeline(lead)}
                                    title="Historial de mensajes y notas"
                                    className="p-1 text-slate-400 hover:text-white"
                                  >
                                    <Clock size={13} />
                                  </button>

                                  <button 
                                    onClick={() => openEditLeadModal(lead)}
                                    title="Editar Lead"
                                    className="p-1 text-slate-400 hover:text-indigo-400"
                                  >
                                    <Edit2 size={13} />
                                  </button>

                                  {col.key !== 'nuevo' && (
                                    <button 
                                      onClick={() => {
                                        const prevIdx = STAGES.findIndex(s => s.key === col.key) - 1;
                                        if (prevIdx >= 0) handleMoveStage(lead, STAGES[prevIdx].key);
                                      }}
                                      title="Mover a etapa anterior"
                                      className="p-1 text-slate-400 hover:text-white"
                                    >
                                      <ChevronLeft size={14} />
                                    </button>
                                  )}
                                  {col.key !== 'ganado' && col.key !== 'perdido' && (
                                    <button 
                                      onClick={() => {
                                        const nextIdx = STAGES.findIndex(s => s.key === col.key) + 1;
                                        if (nextIdx < STAGES.length) handleMoveStage(lead, STAGES[nextIdx].key);
                                      }}
                                      title="Avanzar etapa"
                                      className="p-1 text-slate-400 hover:text-emerald-400"
                                    >
                                      <ChevronRight size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TABLE VIEW */}
            {crmView === 'table' && (
              <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                        <th className="py-3 px-4">Prospecto</th>
                        <th className="py-3 px-4">Teléfono</th>
                        <th className="py-3 px-4">Etapa</th>
                        <th className="py-3 px-4">Valor ($)</th>
                        <th className="py-3 px-4">Último Mensaje</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(() => {
                        const filteredTableLeads = leads.filter(l => 
                          (selectedTagFilter === 'all' || (l.tags && l.tags.toLowerCase().includes(selectedTagFilter.toLowerCase()))) &&
                          (!searchTerm || (
                            (l.name && l.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (l.phone && l.phone.includes(searchTerm)) ||
                            (l.tags && l.tags.toLowerCase().includes(searchTerm.toLowerCase()))
                          ))
                        );

                        if (filteredTableLeads.length === 0) {
                          return (
                            <tr>
                              <td colSpan="6" className="py-8 text-center text-slate-400">
                                No se encontraron leads con los filtros actuales.
                              </td>
                            </tr>
                          );
                        }

                        return filteredTableLeads.map((l) => (
                          <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white">{l.name}</div>
                              {l.tags && <div className="text-[10px] text-slate-400">{l.tags}</div>}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300 font-mono">
                              {l.phone}
                            </td>
                            <td className="py-3.5 px-4">
                              <select 
                                value={l.stage}
                                onChange={(e) => handleMoveStage(l, e.target.value)}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                              >
                                {STAGES.map(s => (
                                  <option key={s.key} value={s.key}>{s.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-emerald-400">
                              {currencySymbol} {l.deal_value || 0}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                              {l.last_message || '—'}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a 
                                  href={`https://wa.me/${l.phone.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                  title="Abrir WhatsApp"
                                >
                                  <MessageSquare size={14} />
                                </a>
                                <button 
                                  onClick={() => openLeadTimeline(l)}
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                                  title="Historial"
                                >
                                  <Clock size={14} />
                                </button>
                                <button 
                                  onClick={() => openEditLeadModal(l)}
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                                  title="Editar"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteLead(l.id)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                                  title="Eliminar"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================================================== */}
        {/* NEW TAB 2: BANDEJA DE CHAT EN VIVO (LIVE CHAT) */}
        {/* ==================================================== */}
        {activeTab === 'chat' && (
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl h-[750px] flex flex-col md:flex-row">
            
            {/* 1. Left Conversations Sidebar */}
            <div className="w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-950/80 shrink-0">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm font-heading flex items-center gap-1.5">
                    <MessageCircle className="text-emerald-400" size={17} /> Chats de Clientes
                  </h3>
                  <span className="text-[11px] text-slate-500">{conversations.length} contactos activos</span>
                </div>
                <button 
                  onClick={fetchChatConversations} 
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Actualizar chats"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {/* Tag Filter Pills Bar in Chat Sidebar */}
              <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setChatTagFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                    chatTagFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({conversations.length})
                </button>
                {crmTags.map(tag => {
                  const count = conversations.filter(c => (c.lead_tags || '').toLowerCase().includes(tag.name.toLowerCase())).length;
                  const isSelected = chatTagFilter.toLowerCase() === tag.name.toLowerCase();
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setChatTagFilter(isSelected ? 'all' : tag.name)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all border flex items-center gap-1 ${
                        isSelected
                          ? 'ring-1 ring-white/50 shadow-sm'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isSelected ? `${tag.color}35` : `${tag.color}15`,
                        borderColor: isSelected ? tag.color : `${tag.color}40`,
                        color: isSelected ? '#ffffff' : tag.color
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name} {count > 0 && <span className="opacity-75 text-[9px]">({count})</span>}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
                {(() => {
                  const filteredConversations = conversations.filter(c => {
                    if (chatTagFilter === 'all') return true;
                    return (c.lead_tags || '').toLowerCase().includes(chatTagFilter.toLowerCase());
                  });

                  if (filteredConversations.length === 0) {
                    return (
                      <div className="p-6 text-center text-xs text-slate-500">
                        {chatTagFilter !== 'all' 
                          ? `No hay conversaciones con la etiqueta "${chatTagFilter}".`
                          : 'No hay conversaciones recientes. Cuando un cliente te escriba por WhatsApp aparecerá aquí automáticamente.'}
                      </div>
                    );
                  }

                  return filteredConversations.map((c) => {
                    const convTags = (c.lead_tags || '').split(',').map(t => t.trim()).filter(Boolean);
                    const isActive = activeChatJid === c.jid;
                    const matchingLead = leads.find(l => (c.lead_id && l.id === c.lead_id) || (c.sender_phone && l.phone === c.sender_phone));
                    const isIndividuallyDisabled = (matchingLead && matchingLead.ai_disabled !== undefined && matchingLead.ai_disabled !== null)
                      ? matchingLead.ai_disabled === 1
                      : (c.lead_ai_disabled === 1);
                    const mutedTagDef = crmTags.find(ct => (ct.ai_disabled === 1 || ct.ai_disabled === true || ct.ai_disabled === '1') && convTags.some(at => at.toLowerCase() === ct.name.toLowerCase()));
                    const isTagDisabled = !isIndividuallyDisabled && !!mutedTagDef;

                    return (
                      <div 
                        key={c.jid}
                        onClick={() => {
                          setActiveChatJid(c.jid);
                          fetchMessagesForJid(c.jid);
                        }}
                        className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 ${
                          isActive 
                            ? 'bg-indigo-600/15 border-l-2 border-indigo-500 shadow-inner' 
                            : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md">
                          {c.sender_name ? c.sender_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-bold text-xs truncate ${isActive ? 'text-indigo-200' : 'text-white'}`}>
                              {c.lead_name || c.sender_name || c.sender_phone}
                            </h4>
                            <span className="text-[10px] text-slate-500">
                              {c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          
                          {/* Real Phone Number & AI status badge in Sidebar */}
                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold truncate">
                              <Phone size={10} className="text-emerald-500 shrink-0" />
                              <span className="truncate">{c.sender_phone || c.jid.split('@')[0]}</span>
                            </div>
                            {isIndividuallyDisabled ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shrink-0 flex items-center gap-1" title="IA Pausada para este chat">
                                <PauseCircle size={10} /> IA Pausa
                              </span>
                            ) : isTagDisabled ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-300 border border-orange-500/30 font-semibold shrink-0 flex items-center gap-1" title={`IA Silenciada por etiqueta: ${mutedTagDef?.name}`}>
                                <ShieldAlert size={10} /> {mutedTagDef?.name}
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0 flex items-center gap-1" title="IA Activa respondiendo automáticamente">
                                <Bot size={10} /> IA On
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-400 truncate mt-1">
                            {c.last_from_me ? '✓ Tú: ' : ''}{c.last_message}
                          </p>

                          {/* Quick Tag Badges in Conversation List */}
                          {convTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {convTags.slice(0, 3).map((t, idx) => {
                                const tagDef = crmTags.find(ct => ct.name.toLowerCase() === t.toLowerCase());
                                const color = tagDef ? tagDef.color : '#6366f1';
                                return (
                                  <span 
                                    key={idx} 
                                    className="text-[9px] px-1.5 py-0.5 rounded font-medium border truncate max-w-[110px]"
                                    style={{
                                      backgroundColor: `${color}18`,
                                      borderColor: `${color}40`,
                                      color: color
                                    }}
                                  >
                                    {t}
                                  </span>
                                );
                              })}
                              {convTags.length > 3 && (
                                <span className="text-[9px] text-slate-500 self-center">+{convTags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* 2. Middle & Right: Active Chat Area */}
            {activeChatJid ? (
              <div className="flex-1 flex flex-col md:flex-row min-w-0 h-full">
                
                {/* 2.1 Chat Center Stream */}
                <div className="flex-1 flex flex-col bg-[#080f18] h-full min-w-0">
                  {/* Chat Top Header */}
                  {(() => {
                    const activeConv = conversations.find(c => c.jid === activeChatJid);
                    const currentLead = leads.find(l => (activeConv?.lead_id && l.id === activeConv.lead_id) || (activeConv?.sender_phone && l.phone === activeConv.sender_phone));
                    const activeDisplayName = currentLead?.name || activeConv?.lead_name || activeConv?.sender_name || 'Contacto';
                    const activeDisplayPhone = currentLead?.phone || activeConv?.sender_phone || activeChatJid.split('@')[0];

                    const isIndividuallyDisabled = (currentLead && currentLead.ai_disabled !== undefined && currentLead.ai_disabled !== null)
                      ? currentLead.ai_disabled === 1
                      : (activeConv?.lead_ai_disabled === 1);

                    const assignedTagsList = (currentLead?.tags || activeConv?.lead_tags || '').split(',').map(t => t.trim()).filter(Boolean);
                    const mutedTagDef = crmTags.find(ct => (ct.ai_disabled === 1 || ct.ai_disabled === true || ct.ai_disabled === '1') && assignedTagsList.some(at => at.toLowerCase() === ct.name.toLowerCase()));
                    const isTagDisabled = !isIndividuallyDisabled && !!mutedTagDef;

                    return (
                      <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                            {activeDisplayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-white truncate">
                                {activeDisplayName}
                              </h4>
                              <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/25 shrink-0 flex items-center gap-1">
                                <Phone size={10} /> {activeDisplayPhone}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Chat en vivo sincronizado
                              </span>
                              {isIndividuallyDisabled ? (
                                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.2 rounded border border-amber-500/20">
                                  <PauseCircle size={10} /> IA Pausada en este chat
                                </span>
                              ) : isTagDisabled ? (
                                <span className="text-[10px] text-orange-400 font-semibold flex items-center gap-1 bg-orange-500/10 px-2 py-0.2 rounded border border-orange-500/20">
                                  <ShieldAlert size={10} /> Silenciada por: {mutedTagDef?.name}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Bot / IA Toggle Quick Action */}
                          <button 
                            type="button"
                            onClick={() => handleToggleChatAi(activeChatJid, isIndividuallyDisabled ? 0 : 1)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                              isIndividuallyDisabled
                                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-sm'
                                : isTagDisabled
                                ? 'bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border-orange-500/40 shadow-sm'
                                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40 shadow-sm'
                            }`}
                            title={
                              isIndividuallyDisabled
                                ? 'IA Pausada para este chat. Clic para reactivar IA'
                                : isTagDisabled
                                ? `IA Silenciada por regla de etiqueta ("${mutedTagDef?.name}"). Clic para pausar individualmente`
                                : 'IA Activa. Clic para pausar IA y atender manualmente este chat'
                            }
                          >
                            {isIndividuallyDisabled ? (
                              <>
                                <PauseCircle size={13} className="text-amber-400" />
                                <span className="hidden sm:inline">IA Pausada</span>
                              </>
                            ) : isTagDisabled ? (
                              <>
                                <ShieldAlert size={13} className="text-orange-400" />
                                <span className="hidden sm:inline">IA Silenciada ({mutedTagDef?.name})</span>
                              </>
                            ) : (
                              <>
                                <Bot size={13} className="text-emerald-400 animate-pulse" />
                                <span className="hidden sm:inline">IA Activa</span>
                              </>
                            )}
                          </button>

                          <button 
                            type="button"
                            onClick={() => setShowChatCrmPanel(!showChatCrmPanel)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                              showChatCrmPanel 
                                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm' 
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                            }`}
                            title="Ver / Ocultar panel de CRM y etiquetas"
                          >
                            <Tag size={13} />
                            <span className="hidden sm:inline">Ficha & Etiquetas</span>
                          </button>

                          <a 
                            href={`https://wa.me/${activeDisplayPhone.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/20 transition-colors"
                          >
                            <ExternalLink size={13} /> <span className="hidden sm:inline">WhatsApp Web</span>
                          </a>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Messages Scroll Thread */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#070d16]/95">
                    {activeChatMessages.map((m) => (
                      <div key={m.id} className={`flex ${m.from_me ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                          m.from_me 
                            ? 'bg-[#005c4b] text-white rounded-tr-none shadow-emerald-950/20' 
                            : 'bg-[#1e293b] text-slate-100 rounded-tl-none border border-slate-700/60 shadow-slate-950/30'
                        }`}>
                          <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                          <span className="text-[9px] text-slate-400 block text-right mt-1">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {m.from_me ? ' ✓✓' : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input Box */}
                  <form onSubmit={handleSendLiveChatMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                    <input 
                      type="text" 
                      value={liveChatInput}
                      onChange={(e) => setLiveChatInput(e.target.value)}
                      placeholder="Escribe un mensaje para responder directo en WhatsApp..."
                      className="flex-1 glass-input px-4 py-2.5 rounded-xl text-xs text-white"
                    />
                    <button 
                      type="submit" 
                      disabled={sendingChat}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      <Send size={15} />
                      <span>{sendingChat ? 'Enviando...' : 'Enviar'}</span>
                    </button>
                  </form>
                </div>

                {/* 2.2 RIGHT PANEL: FICHA CRM & ETIQUETAS AL COSTADO DEL CHAT */}
                {showChatCrmPanel && (() => {
                  const activeConv = conversations.find(c => c.jid === activeChatJid);
                  const currentLead = leads.find(l => (activeConv?.lead_id && l.id === activeConv.lead_id) || (activeConv?.sender_phone && l.phone === activeConv.sender_phone));
                  const assignedTagsList = (currentLead?.tags || activeConv?.lead_tags || '').split(',').map(t => t.trim()).filter(Boolean);
                  const displayPhone = currentLead?.phone || activeConv?.sender_phone || activeChatJid.split('@')[0];
                  const displayName = currentLead?.name || activeConv?.lead_name || activeConv?.sender_name || displayPhone;

                  const isIndividuallyDisabled = (currentLead && currentLead.ai_disabled !== undefined && currentLead.ai_disabled !== null)
                    ? currentLead.ai_disabled === 1
                    : (activeConv?.lead_ai_disabled === 1);
                  const mutedTagDef = crmTags.find(ct => (ct.ai_disabled === 1 || ct.ai_disabled === true || ct.ai_disabled === '1') && assignedTagsList.some(at => at.toLowerCase() === ct.name.toLowerCase()));
                  const isTagDisabled = !isIndividuallyDisabled && !!mutedTagDef;

                  return (
                    <div className="w-full md:w-80 border-l border-slate-800 bg-slate-950/90 flex flex-col p-4 overflow-y-auto shrink-0 animate-fade-in divide-y divide-slate-800/80">
                      {/* Contact Info Header */}
                      <div className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                            <Tag size={12} /> Ficha CRM & Etiquetas
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                            Sincronizado
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-sm truncate">
                          {displayName}
                        </h4>
                        <p className="text-xs text-emerald-400 font-mono font-bold mt-1 flex items-center gap-1.5">
                          <Phone size={12} className="text-emerald-500" /> {displayPhone}
                        </p>
                      </div>

                      {/* AI Control Card for this Lead / Chat */}
                      <div className="py-3.5">
                        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                              <Bot size={14} className={isIndividuallyDisabled ? 'text-amber-400' : isTagDisabled ? 'text-orange-400' : 'text-emerald-400'} />
                              Asesor Inteligente (IA)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleChatAi(activeChatJid, isIndividuallyDisabled ? 0 : 1)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                                isIndividuallyDisabled
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                  : isTagDisabled
                                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              }`}
                            >
                              {isIndividuallyDisabled ? (
                                <>
                                  <PauseCircle size={11} /> Pausada
                                </>
                              ) : isTagDisabled ? (
                                <>
                                  <ShieldAlert size={11} /> Silenciada
                                </>
                              ) : (
                                <>
                                  <Bot size={11} /> Activa
                                </>
                              )}
                            </button>
                          </div>

                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            {isIndividuallyDisabled
                              ? '⏸️ IA pausada para este chat. Puedes chatear sin que el bot interfiera.'
                              : isTagDisabled
                              ? `🛡️ IA silenciada porque el contacto tiene la etiqueta "${mutedTagDef?.name}".`
                              : '🤖 La IA está respondiendo automáticamente según tu catálogo y base de datos.'}
                          </p>

                          <button
                            type="button"
                            onClick={() => handleToggleChatAi(activeChatJid, isIndividuallyDisabled ? 0 : 1)}
                            className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                              isIndividuallyDisabled
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {isIndividuallyDisabled ? (
                              <>
                                <PlayCircle size={14} /> Reactivar Asesor IA
                              </>
                            ) : (
                              <>
                                <PauseCircle size={14} /> Pausar IA (Atender Manual)
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* CRM Stage Selector */}
                      <div className="py-3.5">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                          Etapa Comercial en el CRM
                        </label>
                        <select 
                          value={currentLead?.stage || 'nuevo'}
                          onChange={(e) => handleUpdateChatLeadStage(e.target.value)}
                          className="w-full glass-input text-xs py-2 px-3 rounded-xl bg-slate-900 border-slate-700 text-slate-200"
                        >
                          <option value="nuevo">Nuevo Lead</option>
                          <option value="contactado">Contactado</option>
                          <option value="negociacion">En Negociación</option>
                          <option value="propuesta">Propuesta Enviada</option>
                          <option value="ganado">Cierre Ganado 🏆</option>
                          <option value="perdido">Perdido</option>
                        </select>
                      </div>

                      {/* Assigned Tags Section */}
                      <div className="py-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[11px] font-semibold text-slate-300">
                            Etiquetas Asignadas
                          </label>
                          <span className="text-[10px] text-slate-500">
                            {assignedTagsList.length} activa{assignedTagsList.length === 1 ? '' : 's'}
                          </span>
                        </div>

                        {assignedTagsList.length === 0 ? (
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-center text-[11px] text-slate-500">
                            Sin etiquetas asignadas. Haz clic en las etiquetas de abajo para asignarle una.
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {assignedTagsList.map(tagText => {
                              const tagDef = crmTags.find(t => t.name.toLowerCase() === tagText.toLowerCase());
                              const tagColor = tagDef ? tagDef.color : '#6366f1';
                              return (
                                <span 
                                  key={tagText}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border shadow-sm"
                                  style={{
                                    backgroundColor: `${tagColor}22`,
                                    borderColor: `${tagColor}60`,
                                    color: tagColor
                                  }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tagColor }} />
                                  {tagText}
                                  <button 
                                    type="button"
                                    onClick={() => handleToggleChatTag(tagText)}
                                    className="hover:opacity-75 transition-opacity ml-1 text-xs font-bold"
                                    title="Quitar etiqueta"
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Quick Assign / Toggle Tags */}
                      <div className="py-3.5 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[11px] font-semibold text-slate-300">
                            Asignar Etiqueta Rápida
                          </label>
                          <button 
                            type="button"
                            onClick={() => setShowCreateTagModal(true)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                          >
                            <Plus size={12} /> Crear Etiqueta
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                          {crmTags.map(tag => {
                            const isAssigned = assignedTagsList.some(t => t.toLowerCase() === tag.name.toLowerCase());
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleToggleChatTag(tag.name)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border flex items-center gap-1.5 ${
                                  isAssigned 
                                    ? 'shadow-sm ring-1 ring-white/30 scale-[1.02]' 
                                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                                }`}
                                style={{
                                  backgroundColor: isAssigned ? `${tag.color}35` : `${tag.color}15`,
                                  borderColor: isAssigned ? tag.color : `${tag.color}45`,
                                  color: isAssigned ? '#ffffff' : tag.color
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                                {tag.name}
                                {isAssigned ? <Check size={11} /> : <Plus size={10} className="opacity-60" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* CRM Shortcuts */}
                      <div className="pt-3.5 space-y-2">
                        <button 
                          onClick={() => {
                            if (currentLead) setTaskLeadId(currentLead.id);
                            setShowTaskModal(true);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CalendarCheck size={13} className="text-amber-400" /> Agendar Recordatorio / Tarea
                        </button>
                        <button 
                          onClick={() => {
                            if (currentLead) setOrderLeadId(currentLead.id);
                            setActiveTab('catalog');
                            setCatalogSubTab('orders');
                            setShowOrderModal(true);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <ShoppingCart size={13} className="text-emerald-400" /> Generar Cotización
                        </button>
                      </div>
                    </div>
                  );
                })()}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500 text-center">
                <MessageSquare size={48} className="mb-3 opacity-30 text-indigo-400" />
                <h4 className="font-bold text-slate-300 text-base">Bandeja de Chat en Vivo</h4>
                <p className="text-xs max-w-sm mt-1 text-slate-400">
                  Selecciona una conversación de la izquierda para responder en directo o asignarle etiquetas para el CRM comercial.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* NEW TAB 3: TAREAS Y RECORDATORIOS */}
        {/* ==================================================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
                  <CalendarCheck className="text-amber-400" />
                  Tareas y Recordatorios de Seguimiento
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Organiza llamadas pendientes, confirmaciones y tareas clave vinculadas a tus clientes.
                </p>
              </div>

              <button 
                onClick={() => setShowTaskModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center gap-1.5"
              >
                <Plus size={16} /> Nueva Tarea / Recordatorio
              </button>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Pendientes */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Clock size={16} className="text-amber-400" /> Pendientes
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {tasks.filter(t => t.status === 'pendiente').length}
                  </span>
                </div>

                <div className="space-y-3">
                  {tasks.filter(t => t.status === 'pendiente').length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      ¡Excelente! No tienes tareas pendientes acumuladas.
                    </div>
                  ) : (
                    tasks.filter(t => t.status === 'pendiente').map((t) => (
                      <div key={t.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/40 transition-all flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button 
                            onClick={() => handleToggleTaskStatus(t)}
                            className="mt-0.5 w-5 h-5 rounded-lg border border-slate-600 hover:border-emerald-400 flex items-center justify-center transition-colors"
                            title="Marcar como completada"
                          >
                          </button>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-white">{t.title}</h4>
                            {t.description && <p className="text-xs text-slate-400 mt-1">{t.description}</p>}
                            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                              <span className="text-slate-400">📅 {t.due_date || 'Sin fecha'} {t.due_time}</span>
                              {t.lead_name && <span className="text-indigo-400 font-semibold">• Cliente: {t.lead_name}</span>}
                              <span className={`px-2 py-0.2 rounded font-bold uppercase text-[9px] ${
                                t.priority === 'alta' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400'
                              }`}>{t.priority}</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteTask(t.id)} 
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Completadas */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 opacity-90">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-400" /> Completadas
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {tasks.filter(t => t.status === 'completada').length}
                  </span>
                </div>

                <div className="space-y-3">
                  {tasks.filter(t => t.status === 'completada').length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      Las tareas que completes se archivarán aquí.
                    </div>
                  ) : (
                    tasks.filter(t => t.status === 'completada').map((t) => (
                      <div key={t.id} className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/40 flex items-center justify-between gap-3 text-slate-400">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleToggleTaskStatus(t)}
                            className="w-5 h-5 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 flex items-center justify-center"
                            title="Desmarcar"
                          >
                            <Check size={12} />
                          </button>
                          <div>
                            <span className="text-xs line-through text-slate-500 font-medium">{t.title}</span>
                            <span className="text-[10px] text-slate-600 block">{t.due_date}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteTask(t.id)} className="p-1.5 text-slate-600 hover:text-rose-400">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* NEW TAB 4: CATÁLOGO DE PRODUCTOS Y PEDIDOS */}
        {/* ==================================================== */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
                  <Package className="text-rose-400" />
                  Catálogo de Productos & Pedidos
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Gestiona productos para cotizar y crea órdenes de venta para enviar por WhatsApp.
                </p>
              </div>

              {/* Sub-tab switcher */}
              <div className="flex items-center gap-2">
                <div className="flex p-0.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
                  <button 
                    onClick={() => setCatalogSubTab('products')} 
                    className={`px-3.5 py-1.5 rounded-lg transition-colors ${catalogSubTab === 'products' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Productos ({products.length})
                  </button>
                  <button 
                    onClick={() => setCatalogSubTab('orders')} 
                    className={`px-3.5 py-1.5 rounded-lg transition-colors ${catalogSubTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Pedidos / Cotizaciones ({orders.length})
                  </button>
                </div>

                {catalogSubTab === 'products' ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleShareFullCatalogWhatsApp}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      title="Generar mensaje con todos los productos y enviar por WhatsApp"
                    >
                      <MessageCircle size={15} className="text-emerald-400" />
                      <span>Enviar Catálogo por WhatsApp</span>
                    </button>
                    <button 
                      onClick={openAddProductModal}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-rose-500/20"
                    >
                      <Plus size={15} /> Añadir Producto
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowOrderModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20"
                  >
                    <Plus size={15} /> Crear Pedido
                  </button>
                )}
              </div>
            </div>

            {/* BARRA DE CONFIGURACIÓN DE MONEDA DEL NEGOCIO */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <DollarSign size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Moneda del Negocio:</h4>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {currencySymbol} ({currencyCode})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tus precios, cotizaciones de WhatsApp y balances usarán este símbolo.
                  </p>
                </div>
              </div>

              {currencySuccessMsg && (
                <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 animate-fade-in flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  <span>{currencySuccessMsg}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {[
                  { code: 'PEN', symbol: 'S/', label: '🇵🇪 Soles (S/)' },
                  { code: 'USD', symbol: '$', label: '🇺🇸 Dólares ($)' },
                  { code: 'EUR', symbol: '€', label: '🇪🇺 Euros (€)' },
                  { code: 'COP', symbol: 'COP $', label: '🇨🇴 COP' },
                  { code: 'MXN', symbol: 'MXN $', label: '🇲🇽 MXN' },
                  { code: 'CLP', symbol: 'CLP $', label: '🇨🇱 CLP' }
                ].map((cur) => (
                  <button
                    key={cur.code}
                    type="button"
                    onClick={() => handleSaveCurrencySettings(cur.code, cur.symbol)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      currencyCode === cur.code && currencySymbol === cur.symbol
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    {cur.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCurrencyModal(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors ml-1"
                >
                  Personalizar...
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {catalogSubTab === 'products' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-xs text-slate-500">
                    No tienes productos agregados al catálogo. Haz clic en "Añadir Producto".
                  </div>
                ) : (
                  products.map((p) => (
                    <div key={p.id} className="glass-panel rounded-3xl overflow-hidden border border-slate-800 hover:border-rose-500/40 transition-all flex flex-col justify-between group">
                      <div>
                        <div className="h-44 bg-slate-950 overflow-hidden relative">
                          <img 
                            src={p.image_url || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=500&auto=format&fit=crop&q=80'} 
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-md bg-slate-900/90 text-emerald-400 border border-slate-700">
                            {currencySymbol} {p.price} {currencyCode}
                          </span>
                        </div>
                        <div className="p-4">
                          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">{p.category}</span>
                          <h4 className="font-bold text-white text-sm mt-0.5">{p.name}</h4>
                          {p.sku && <div className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {p.sku}</div>}
                          {p.description && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{p.description}</p>}
                        </div>
                      </div>

                      <div className="p-4 pt-0 border-t border-slate-800/60 mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-400 font-semibold">● En Stock</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                            title="Editar producto"
                          >
                            <Edit2 size={11} /> Editar
                          </button>
                          <button
                            onClick={() => handleShareSingleProductWhatsApp(p)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                            title="Enviar producto individual por WhatsApp"
                          >
                            <Send size={11} /> Enviar
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)} 
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Orders List */}
            {catalogSubTab === 'orders' && (
              <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                        <th className="py-3 px-4">Orden #</th>
                        <th className="py-3 px-4">Cliente / Contacto</th>
                        <th className="py-3 px-4">Detalle Items</th>
                        <th className="py-3 px-4">Total ({currencySymbol})</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4 text-right">Acción WhatsApp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-500">
                            No hay órdenes o cotizaciones creadas.
                          </td>
                        </tr>
                      ) : (
                        orders.map((o) => {
                          let items = [];
                          try { items = JSON.parse(o.items_json); } catch(e) {}

                          return (
                            <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{o.order_number}</td>
                              <td className="py-3.5 px-4 font-medium text-white">{o.lead_name || 'Cliente directo'}</td>
                              <td className="py-3.5 px-4 text-slate-400">
                                {items.map((it, idx) => (
                                  <span key={idx} className="mr-2 inline-block bg-slate-900 px-2 py-0.5 rounded text-[11px]">
                                    {it.name} (x{it.quantity})
                                  </span>
                                ))}
                              </td>
                              <td className="py-3.5 px-4 font-extrabold text-emerald-400 text-sm">{currencySymbol} {o.total_amount}</td>
                              <td className="py-3.5 px-4">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  {o.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => handleSendOrderSummaryWhatsApp(o)}
                                  className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                                >
                                  <Send size={12} /> Enviar Cotización
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: BOT DE WHATSAPP & PALABRAS CLAVE */}
        {/* ==================================================== */}
        {activeTab === 'bot' && (
          <div className="space-y-8">
            
            {/* WhatsApp Connection Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center p-0.5 shadow-xl ${
                    botStatus.status === 'CONNECTED' 
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-emerald-500/20 text-white' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Bot size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-white font-heading">
                        Conexión de WhatsApp para {auth.user.business_name}
                      </h3>
                      {botStatus.status === 'CONNECTED' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          Operativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {botStatus.phone ? `Número conectado: ${botStatus.phone} • Motor Multi-Dispositivo Alidea` : 'Vincula tu WhatsApp escaneando el código QR para activar las respuestas'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {botStatus.status === 'CONNECTED' ? (
                    <button 
                      onClick={handleLogoutBot}
                      disabled={loadingBot}
                      className="px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Desconectar WhatsApp
                    </button>
                  ) : (
                    <button 
                      onClick={handleStartBot}
                      disabled={loadingBot}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <RefreshCw size={14} className={loadingBot ? 'animate-spin' : ''} />
                      {loadingBot ? 'Conectando...' : 'Generar QR de Conexión'}
                    </button>
                  )}
                </div>
              </div>

              {/* QR Display Section if not connected */}
              {botStatus.status !== 'CONNECTED' && (
                <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-10">
                  <div className="p-6 bg-white rounded-3xl shadow-2xl flex flex-col items-center">
                    {botStatus.qr ? (
                      <img src={botStatus.qr} alt="Código QR WhatsApp" className="w-56 h-56 rounded-xl" />
                    ) : (
                      <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-800 text-center p-4">
                        <QrCode size={48} className="text-slate-400 animate-pulse mb-2" />
                        <span className="text-xs font-semibold">Generando código QR...</span>
                        <span className="text-[10px] text-slate-500 mt-1">Presiona "Generar QR" si no aparece.</span>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-600 font-bold mt-2">Alidea WhatsApp Engine</div>
                  </div>

                  <div className="max-w-md space-y-4">
                    <h4 className="text-lg font-bold text-white">Instrucciones para vincular tu WhatsApp:</h4>
                    <ol className="space-y-3 text-sm text-slate-300">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 font-bold text-xs flex items-center justify-center text-white shrink-0 mt-0.5">1</span>
                        <span>Abre la app de WhatsApp en tu teléfono celular.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 font-bold text-xs flex items-center justify-center text-white shrink-0 mt-0.5">2</span>
                        <span>Toca en <strong>Menú (tres puntos)</strong> o <strong>Configuración</strong> y selecciona <strong>Dispositivos vinculados</strong>.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 font-bold text-xs flex items-center justify-center text-white shrink-0 mt-0.5">3</span>
                        <span>Toca <strong>Vincular un dispositivo</strong> y apunta la cámara al código QR de la izquierda.</span>
                      </li>
                    </ol>

                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <ShieldCheck size={18} className="shrink-0" />
                      <span>Conexión 100% segura con protección anti-bloqueo y retardos humanos.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ==================================================== */}
            {/* NEW: ALIDEA GENESIS AI™ ACTIVATION & CONTROL PANEL */}
            {/* ==================================================== */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-purple-900/40 bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center p-3 shadow-lg transition-all ${
                    aiEnabled 
                      ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 shadow-purple-500/25 text-white' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Brain size={26} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg sm:text-xl font-bold text-white font-heading">
                        Alidea Genesis AI™
                      </h3>
                      {aiEnabled ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          Activo & Operativo
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                      {aiEnabled 
                        ? `Atiende consultas de clientes en WhatsApp con lenguaje humano y respuestas certeras basadas en tu contexto (${aiWordCount.toLocaleString()} / 3,000 palabras configuradas).`
                        : 'Activa el motor de Inteligencia Artificial para que responda de forma humana a preguntas de clientes cuando no coincidan con palabras clave.'}
                    </p>
                  </div>
                </div>

                {/* Main Toggle Switch Button */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleToggleAi(!aiEnabled)}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                      aiEnabled
                        ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25 hover:bg-purple-500'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Cpu size={15} />
                    {aiEnabled ? 'Respuestas con IA: ACTIVADAS' : '⚡ Activar Respuestas con IA'}
                  </button>
                </div>
              </div>

              {/* Action Buttons visible only when AI is Enabled */}
              {aiEnabled && (
                <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold font-mono">
                      📝 {aiWordCount.toLocaleString()} / 3,000 palabras de contexto
                    </span>
                    <span className="hidden sm:inline text-slate-500">•</span>
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck size={13} /> Cero alucinaciones (Filtro de seguridad activo)
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setShowAiTestSection(!showAiTestSection)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
                    >
                      <MessageCircle size={13} />
                      {showAiTestSection ? 'Ocultar prueba' : '🧪 Probar IA'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAiConfigModal(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <Sliders size={14} />
                      Configurar Conocimiento del Asesor IA
                    </button>
                  </div>
                </div>
              )}

              {/* Direct AI Test Panel (Collapsible) */}
              {aiEnabled && showAiTestSection && (
                <div className="mt-5 p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 space-y-3 animate-fade-in">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Brain size={14} className="text-purple-400" />
                    Prueba Rápida de Respuesta con Alidea Genesis AI™
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiTestInput}
                      onChange={(e) => setAiTestInput(e.target.value)}
                      placeholder="Escribe una consulta de prueba: ej. ¿Cuál es su dirección y qué métodos de pago reciben?"
                      className="flex-1 glass-input px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTestAiDirect();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleTestAiDirect}
                      disabled={testingAi || !aiTestInput.trim()}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {testingAi ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                      {testingAi ? 'Evaluando...' : 'Probar'}
                    </button>
                  </div>

                  {aiTestOutput && (
                    <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-xl text-xs text-purple-200 whitespace-pre-line leading-relaxed">
                      <div className="text-[10px] uppercase font-bold text-purple-400 mb-1">Resultado de Alidea Genesis AI™:</div>
                      {aiTestOutput}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ==================================================== */}
            {/* MODAL: CONFIGURACIÓN DE CONOCIMIENTO (MÁX 3,000 PALABRAS) */}
            {/* ==================================================== */}
            {showAiConfigModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
                <div className="bg-[#0e1526] border border-purple-500/30 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Modal Header */}
                  <div className="p-6 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <Brain size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white font-heading">
                          Base de Conocimiento • Alidea Genesis AI™
                        </h3>
                        <p className="text-xs text-slate-400">
                          Escribe de forma sintética todo lo que tu asesor debe saber (máximo 3,000 palabras).
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAiConfigModal(false)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto space-y-5 flex-1">
                    
                    {/* Word Counter & Alert Banner */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-400" />
                        <span className="text-xs text-slate-300 font-semibold">Contador de Palabras:</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
                          aiWordCount > 3000
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : aiWordCount > 2500
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        }`}>
                          {aiWordCount.toLocaleString()} / 3,000 palabras
                        </span>
                      </div>
                    </div>

                    {aiWordCount > 3000 && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                        <AlertTriangle size={15} className="shrink-0" />
                        <span>Has superado el límite de 3,000 palabras. Por favor resume el texto para poder guardar.</span>
                      </div>
                    )}

                    {/* Textarea for Business Context */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-200">
                        Texto Sintético del Negocio (Solo escritura manual) *
                      </label>
                      <textarea
                        rows="12"
                        value={aiSystemPrompt}
                        onChange={(e) => setAiSystemPrompt(e.target.value)}
                        placeholder={`Escribe aquí la información completa de tu negocio de forma ordenada y concisa:\n\n1. QUIÉNES SOMOS:\nSomos [Nombre de Negocio], especialistas en [Productos o Servicios] con más de X años de experiencia.\n\n2. PRODUCTOS / SERVICIOS Y PRECIOS:\n- Producto A: $XX (Incluye garantía de 1 año)\n- Producto B: $XX\n- Servicio de Asesoría: $XX\n\n3. HORARIOS Y UBICACIÓN:\n- Atención: Lunes a Sábado de 9:00 AM a 7:00 PM\n- Ubicación: [Dirección física o tienda online]\n\n4. MÉTODOS DE PAGO Y ENVÍOS:\n- Medios de pago: Yape, Plin, Transferencias BCP/BBVA, Tarjetas de crédito/débito.\n- Envíos: Lima el mismo día, Provincias 24-48 horas.\n\n5. POLÍTICAS Y REGLAS DE RESPUESTA:\n- Responde siempre de forma cálida, amable y con emojis.\n- Si un cliente pide algo fuera de este contexto, se le indica que un asesor humano lo contactará en breve.`}
                        className="w-full glass-input px-4 py-3.5 rounded-2xl text-xs sm:text-sm bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-200 leading-relaxed font-sans"
                      />
                    </div>

                    {/* Temperature Slider */}
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Sliders size={14} className="text-purple-400" />
                          Tono de Conversación / Creatividad ({aiTemperature})
                        </label>
                        <span className="text-[11px] text-purple-300 font-mono">
                          {aiTemperature < 0.4 ? 'Estricto y conciso' : aiTemperature > 0.7 ? 'Más conversacional' : 'Equilibrado (Recomendado)'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={aiTemperature}
                        onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    {/* Delay Configuration */}
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Clock size={14} className="text-amber-400" />
                          Delay de Escritura Aleatorio ("Escribiendo...")
                        </label>
                        <span className="text-[11px] text-amber-300 font-mono">
                          {aiDelayMin}s a {aiDelayMax}s
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        El estado "escribiendo..." solo aparecerá en WhatsApp una vez que la IA tenga la respuesta lista, esperando un tiempo aleatorio entre el mínimo y máximo antes de enviar el mensaje para una experiencia 100% humana.
                      </p>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Delay Mínimo (segundos):</label>
                          <input 
                            type="number"
                            min="1"
                            max="30"
                            value={aiDelayMin}
                            onChange={(e) => setAiDelayMin(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-full glass-input px-3 py-1.5 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Delay Máximo (segundos):</label>
                          <input 
                            type="number"
                            min={aiDelayMin}
                            max="60"
                            value={aiDelayMax}
                            onChange={(e) => setAiDelayMax(Math.max(aiDelayMin, parseInt(e.target.value, 10) || aiDelayMin))}
                            className="w-full glass-input px-3 py-1.5 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tag-level AI bulk rules */}
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                          <Tag size={14} className="text-indigo-400" />
                          Reglas de IA por Etiquetas (CRM)
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowCreateTagModal(true)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                        >
                          <Plus size={11} /> Gestionar Etiquetas
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Pausa automáticamente la IA para todos los contactos que contengan etiquetas específicas (ej. <em>Soporte</em>, <em>Cliente VIP</em>, <em>Cerrado / Ganado</em>) para atención 100% humana.
                      </p>
                      
                      {crmTags.length === 0 ? (
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center text-xs text-slate-500">
                          No tienes etiquetas personalizadas aún. Crea etiquetas para configurar reglas en bloque.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
                          {crmTags.map(tag => {
                            const isMuted = tag.ai_disabled === 1 || tag.ai_disabled === true || tag.ai_disabled === '1';
                            return (
                              <div 
                                key={tag.id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/90 gap-2 shadow-sm"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                                  <span className="text-xs font-medium text-slate-200 truncate">{tag.name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleToggleTagAi(tag.id, tag.ai_disabled)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 shrink-0 ${
                                    isMuted
                                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                                  }`}
                                  title={isMuted ? 'Haz clic para ACTIVAR la IA en contactos con esta etiqueta' : 'Haz clic para PAUSAR la IA en contactos con esta etiqueta'}
                                >
                                  {isMuted ? <PauseCircle size={11} /> : <Bot size={11} />}
                                  <span>{isMuted ? 'Pausada' : 'Activa'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Anti-Hallucination Safe Notice */}
                    <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-indigo-200">
                        <ShieldCheck size={14} /> Filtro de Protección y Cero Alucinaciones
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Alidea Genesis AI™ evalúa cada consulta antes de emitir respuesta. Si el cliente pregunta sobre temas que no están descritos en este texto, la IA <strong>no responderá</strong> y transferirá el chat a un asesor humano de tu equipo para garantizar precisión total.
                      </p>
                    </div>

                  </div>

                  {/* Modal Footer */}
                  <div className="p-5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAiConfigModal(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAiSettings}
                      disabled={savingAi || aiWordCount > 3000}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} />
                      {savingAi ? 'Guardando Base de Conocimiento...' : 'Guardar Conocimiento de IA'}
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* Keyword Manager & Live Simulator Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Form: Keywords CRUD (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-indigo-400" size={18} />
                      <h3 className="font-bold text-white text-base">
                        {editingKwId ? 'Editar Respuesta Automática' : 'Nueva Respuesta por Palabra Clave'}
                      </h3>
                    </div>
                    {editingKwId && (
                      <button onClick={resetKeywordForm} className="text-xs text-slate-400 hover:text-white">
                        Cancelar edición
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveKeyword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Palabras Clave Disparadoras (separadas por coma) *
                      </label>
                      <input 
                        type="text" 
                        value={kwWord}
                        onChange={(e) => setKwWord(e.target.value)}
                        placeholder="ej. precio, costo, planes, catalogo, ayuda"
                        className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                        required
                      />
                    </div>

                    {/* Multiple Sequential Messages Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-300">
                          Mensajes de Respuesta de Texto ({kwResponses.length}) *
                        </label>
                        <button
                          type="button"
                          onClick={handleAddResponseBox}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5 transition-all"
                        >
                          <Plus size={13} /> Agregar otro mensaje
                        </button>
                      </div>

                      <div className="space-y-3">
                        {kwResponses.map((msgText, rIdx) => (
                          <div key={rIdx} className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2 relative group">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                {rIdx === 0 ? 'Mensaje #1 (Principal)' : `Mensaje #${rIdx + 1} (Secuencial)`}
                              </span>
                              {kwResponses.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveResponseBox(rIdx)}
                                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Eliminar este mensaje"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                            <textarea 
                              rows="2"
                              value={msgText}
                              onChange={(e) => handleUpdateResponseBox(rIdx, e.target.value)}
                              placeholder={rIdx === 0 ? "Escribe el primer mensaje que enviará el bot..." : `Escribe el mensaje #${rIdx + 1} que enviará a continuación...`}
                              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs sm:text-sm"
                              required={rIdx === 0}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Retardo Mínimo (seg)</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="30"
                          value={kwDelayMin}
                          onChange={(e) => setKwDelayMin(e.target.value)}
                          className="w-full glass-input px-3 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Retardo Máximo (seg)</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="30"
                          value={kwDelayMax}
                          onChange={(e) => setKwDelayMax(e.target.value)}
                          className="w-full glass-input px-3 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                        <span>Adjuntos Multimedia (Imágenes, Audios de Voz PTT, Catálogos PDF, Videos)</span>
                        <Paperclip size={14} className="text-indigo-400" />
                      </label>
                      
                      <input 
                        id="kwFileInput"
                        type="file" 
                        multiple 
                        accept="image/*,audio/*,video/*,application/pdf"
                        onChange={(e) => setKwFiles(Array.from(e.target.files))}
                        className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-300 hover:file:bg-slate-700 cursor-pointer"
                      />

                      {existingKwMedia.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {existingKwMedia.map((m, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                              📎 {m.name || 'Archivo adjunto'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} />
                      {editingKwId ? 'Guardar Cambios' : 'Crear Respuesta Automática'}
                    </button>
                  </form>
                </div>

                {/* Keywords List */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-base">Respuestas Activas ({keywords.length})</h3>
                    <span className="text-xs text-slate-500">Activación por coincidencia</span>
                  </div>

                  <div className="space-y-3">
                    {keywords.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-500">
                        No tienes palabras clave configuradas. Agrega una arriba.
                      </div>
                    ) : (
                      keywords.map((kw) => {
                        let parsedMessages = [];
                        if (kw.response_messages) {
                          try {
                            const p = JSON.parse(kw.response_messages);
                            if (Array.isArray(p) && p.length > 0) {
                              parsedMessages = p.map(m => typeof m === 'string' ? m : (m.text || '')).filter(Boolean);
                            }
                          } catch(e) {}
                        }
                        if (parsedMessages.length === 0 && kw.response_text) {
                          parsedMessages = [kw.response_text];
                        }

                        return (
                          <div 
                            key={kw.id} 
                            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col gap-2.5"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {kw.keyword.split(',').map((word, wIdx) => (
                                  <span key={wIdx} className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                    {word.trim()}
                                  </span>
                                ))}
                                {parsedMessages.length > 1 && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                                    💬 {parsedMessages.length} mensajes
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <button 
                                  onClick={() => startEditKeyword(kw)}
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                                  title="Editar"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteKeyword(kw.id)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                                  title="Eliminar"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Response Messages Sequence */}
                            <div className="space-y-1.5">
                              {parsedMessages.map((msgItem, mIdx) => (
                                <div key={mIdx} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                                    {mIdx + 1}
                                  </span>
                                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line flex-1">
                                    {msgItem}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/40">
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> Pausa entre msgs: {kw.delay_min || 2}s - {kw.delay_max || 5}s
                              </span>
                              {(kw.media_files || kw.media_path) && (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                  <Paperclip size={12} /> Con archivo(s) multimedia
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Right: Live Interactive Bot Simulator (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[650px] sticky top-28">
                <div className="bg-[#121b22] px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center gap-2">
                        Simulador del Bot
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium">
                        {isSimTyping ? 'escribiendo respuesta...' : 'en línea'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700">
                    Test en Vivo
                  </span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a]/95">
                  {simChat.map((m, idx) => (
                    <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                        m.sender === 'user'
                          ? 'bg-[#005c4b] text-white rounded-tr-none'
                          : 'bg-[#202c33] text-slate-200 rounded-tl-none border border-slate-700/40'
                      }`}>
                        {m.isAi && (
                          <div className={`mb-1.5 flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border w-fit ${
                            m.isTransferredToHuman
                              ? 'text-amber-300 bg-amber-950/50 border-amber-500/30'
                              : 'text-purple-300 bg-purple-900/40 border-purple-500/30'
                          }`}>
                            {m.isTransferredToHuman ? (
                              <>
                                <ShieldCheck size={12} className="text-amber-400" />
                                <span>🛡️ Transferido a Asesor Humano</span>
                              </>
                            ) : (
                              <>
                                <Brain size={12} className="text-purple-400" />
                                <span>Alidea Genesis AI™</span>
                              </>
                            )}
                          </div>
                        )}
                        <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                        
                        {m.media && m.media.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-700/60 text-[10px] text-emerald-300 flex items-center gap-1">
                            <Paperclip size={11} /> {m.media.length} archivo(s) multimedia adjuntos
                          </div>
                        )}

                        <span className="text-[9px] text-slate-400 block text-right mt-1">
                          {m.time} {m.sender === 'user' && '✓✓'}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isSimTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] rounded-2xl rounded-tl-none px-3.5 py-2 text-xs text-slate-400 flex items-center gap-1.5 border border-slate-700/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                        <span className="text-[11px]">Escribiendo...</span>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSimulateMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                  <input 
                    type="text" 
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                    placeholder="Prueba una palabra clave o una pregunta para Alidea AI..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    type="submit" 
                    disabled={isSimTyping}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB: RETARGETING & DIFUSIÓN MASIVA */}
        {/* ==================================================== */}
        {activeTab === 'retargeting' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2.5">
                  <Radio className="text-purple-400 animate-pulse" />
                  Módulo de Retargeting & Difusión
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Envía secuencias automáticas de mensajes y archivos a tus prospectos organizados por etiquetas con delays anti-baneo.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button 
                  onClick={fetchCampaignHistory}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Actualizar historial"
                >
                  <RefreshCw size={14} />
                </button>
                <button 
                  onClick={() => {
                    setRetargetingTag('all');
                    setShowRetargetingModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Nueva Campaña de Retargeting</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Total Destinatarios</div>
                <div className="text-2xl font-extrabold text-white mt-1 font-heading">
                  {getAllTargetableContacts().length}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Leads y contactos activos</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Grupos / Etiquetas</div>
                <div className="text-2xl font-extrabold text-purple-400 mt-1 font-heading">
                  {crmTags.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Segmentos configurados</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Campañas Realizadas</div>
                <div className="text-2xl font-extrabold text-indigo-400 mt-1 font-heading">
                  {campaignHistory.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Envíos programados</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">Estado WhatsApp</div>
                <div className="text-base font-bold mt-1.5 flex items-center gap-2">
                  {botStatus.status === 'CONNECTED' ? (
                    <span className="text-emerald-400 flex items-center gap-1.5 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Listo para Difusión
                    </span>
                  ) : (
                    <span className="text-amber-400 text-xs font-semibold">Requiere Conexión</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{botStatus.phone || 'Sin número'}</div>
              </div>
            </div>

            {/* Audience by Tag Quick Launch */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Tag size={16} className="text-purple-400" /> Segmentos por Etiqueta
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Lanza campañas dirigidas a clientes según su estado comercial.</p>
                </div>
                <button
                  onClick={() => setShowCreateTagModal(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                >
                  <Plus size={13} /> Nueva Etiqueta
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {/* All Leads Card */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">Todos los Contactos</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                        {getAllTargetableContacts().length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Difusión masiva a toda la base registrada.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setRetargetingTag('all');
                      setShowRetargetingModal(true);
                    }}
                    className="mt-4 w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send size={12} /> Lanzar a Todos
                  </button>
                </div>

                {/* Specific Tag Cards */}
                {crmTags.map(tag => {
                  const tagCount = getAllTargetableContacts().filter(c => c.tags && c.tags.toLowerCase().includes(tag.name.toLowerCase())).length;
                  return (
                    <div 
                      key={tag.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span 
                            className="text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5"
                            style={{
                              backgroundColor: `${tag.color}18`,
                              borderColor: `${tag.color}45`,
                              color: tag.color
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                            {tag.name}
                          </span>
                          <span className="text-xs font-bold text-slate-300">
                            {tagCount} lead{tagCount === 1 ? '' : 's'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Contactos etiquetados con {tag.name}.</p>
                      </div>

                      <button 
                        onClick={() => {
                          setRetargetingTag(tag.name);
                          setShowRetargetingModal(true);
                        }}
                        className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Radio size={12} className="text-purple-400" /> Lanzar a {tag.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Campaign History Table */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Clock size={16} className="text-indigo-400" /> Historial de Campañas de Retargeting
              </h3>

              {campaignHistory.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  <Radio size={36} className="mx-auto mb-2 opacity-30 text-purple-400" />
                  No se han registrado campañas de retargeting aún. Haz clic en "Nueva Campaña" para empezar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Campaña</th>
                        <th className="p-3">Audiencia / Etiqueta</th>
                        <th className="p-3">Destinatarios</th>
                        <th className="p-3">Enviados</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Fecha</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {campaignHistory.map(camp => (
                        <tr key={camp.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3 font-bold text-white">{camp.name}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {camp.target_tags || 'Todas las etiquetas'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold">{camp.total_contacts || 0}</td>
                          <td className="p-3 text-emerald-400 font-bold">{camp.sent_count || 0}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              camp.status === 'running'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : camp.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {camp.status === 'running' ? 'Enviando...' : camp.status === 'completed' ? 'Completada' : 'Detenida'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">
                            {camp.started_at ? new Date(camp.started_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setActiveCampaignId(camp.id);
                                setShowProgressModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
                            >
                              Ver Monitor
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* ==================================================== */}
        {/* TAB 6: ANALÍTICA DE NEGOCIO & BUSINESS INTELLIGENCE  */}
        {/* ==================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Top Header & Control Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                  <div className="w-full h-full bg-[#070c18] rounded-[14px] flex items-center justify-center">
                    <TrendingUp className="text-indigo-400" size={24} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2">
                    Analítica de Negocio & BI
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-sans font-semibold">
                      Inteligencia Comercial en Vivo
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Seguimiento detallado de la evolución semana a semana y mes a mes de tus ingresos, rentabilidad, embudo de clientes, ticket promedio y días de mayor tráfico.
                  </p>
                </div>
              </div>

              {/* Time Frame & Granularity Controls */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Año:</span>
                  <select
                    value={analyticsYear}
                    onChange={(e) => setAnalyticsYear(parseInt(e.target.value))}
                    className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-900 font-bold"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center p-1 bg-slate-950/90 rounded-xl border border-slate-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setAnalyticsGranularity('monthly')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      analyticsGranularity === 'monthly'
                        ? 'bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Calendar size={13} />
                    <span>Mes a Mes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyticsGranularity('weekly')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      analyticsGranularity === 'weekly'
                        ? 'bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock size={13} />
                    <span>Semana a Semana</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={fetchBusinessInsights}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  title="Actualizar datos de analítica"
                >
                  <RefreshCw size={14} className={loadingAnalytics ? 'animate-spin text-indigo-400' : ''} />
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
              <button
                onClick={() => setAnalyticsCategoryFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap border ${
                  analyticsCategoryFilter === 'all'
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                📊 Todos los Gráficos
              </button>
              <button
                onClick={() => setAnalyticsCategoryFilter('financial')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap border ${
                  analyticsCategoryFilter === 'financial'
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                💰 Finanzas & Rentabilidad
              </button>
              <button
                onClick={() => setAnalyticsCategoryFilter('funnel')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap border ${
                  analyticsCategoryFilter === 'funnel'
                    ? 'bg-sky-600/20 text-sky-300 border-sky-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                👥 Embudo & Conversión de Leads
              </button>
              <button
                onClick={() => setAnalyticsCategoryFilter('products')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap border ${
                  analyticsCategoryFilter === 'products'
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                📦 Pedidos & Ticket Promedio
              </button>
              <button
                onClick={() => setAnalyticsCategoryFilter('traffic')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap border ${
                  analyticsCategoryFilter === 'traffic'
                    ? 'bg-amber-600/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                🔥 Días de Mayor Tráfico
              </button>
            </div>

            {loadingAnalytics && !businessInsights ? (
              <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-3 glass-panel rounded-3xl border border-slate-800">
                <div className="w-6 h-6 rounded-full border-r-2 border-indigo-400 animate-spin"></div>
                <span>Procesando analítica e inteligencia de negocio...</span>
              </div>
            ) : businessInsights ? (
              <>
                {/* 1. TOP EXECUTIVE KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                  {/* Revenue */}
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Ingresos Totales</span>
                      <DollarSign size={15} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-heading">
                      ${(businessInsights.summary?.totalRevenueYear || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <span className={`font-bold ${businessInsights.summary?.revenueGrowthMoM >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {businessInsights.summary?.revenueGrowthMoM >= 0 ? '▲ +' : '▼ '}{businessInsights.summary?.revenueGrowthMoM}%
                      </span>
                      <span>vs mes ant.</span>
                    </div>
                  </div>

                  {/* Net Margin */}
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Margen Neto</span>
                      <Percent size={15} className="text-indigo-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-indigo-400 mt-2 font-heading">
                      {businessInsights.summary?.overallMargin || 0}%
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Utilidad: ${(businessInsights.summary?.totalProfitYear || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Tasa Cierre</span>
                      <Target size={15} className="text-cyan-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-cyan-400 mt-2 font-heading">
                      {businessInsights.summary?.globalConversionRate || 0}%
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {businessInsights.summary?.totalWonLeads || 0} ventas cerradas
                    </div>
                  </div>

                  {/* Average Order Value (AOV) */}
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Ticket Promedio</span>
                      <ShoppingCart size={15} className="text-purple-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-purple-400 mt-2 font-heading">
                      ${businessInsights.summary?.averageOrderValue || 0}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Gasto medio por pedido</div>
                  </div>

                  {/* Total Orders Volume */}
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Total Pedidos</span>
                      <Package size={15} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-amber-400 mt-2 font-heading">
                      {businessInsights.summary?.totalOrders || 0}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      ${(businessInsights.summary?.totalOrdersVolume || 0).toLocaleString()} cotizado
                    </div>
                  </div>

                  {/* Chat Activity */}
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Interacciones</span>
                      <MessageSquare size={15} className="text-sky-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-sky-400 mt-2 font-heading">
                      {businessInsights.summary?.totalMessages || 0}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Mensajes procesados</div>
                  </div>
                </div>

                {/* 2. MAIN EVOLUTION CHART (Ingresos vs Egresos vs Utilidad Neta) */}
                {(analyticsCategoryFilter === 'all' || analyticsCategoryFilter === 'financial') && (
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white text-lg font-heading flex items-center gap-2">
                          <BarChart3 className="text-emerald-400" size={20} />
                          Evolución Financiera {analyticsGranularity === 'monthly' ? 'Mes a Mes' : 'Semana a Semana'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Comparativa de volumen de ingresos (facturación), egresos operativos y rentabilidad neta generada.
                        </p>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
                          <span className="text-slate-300">Ingresos ($)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-md bg-rose-500"></span>
                          <span className="text-slate-300">Egresos ($)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
                          <span className="text-slate-300">Utilidad Neta ($)</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Visual Bar & Line Chart Container */}
                    {(() => {
                      const data = analyticsGranularity === 'monthly' 
                        ? businessInsights.monthlyData 
                        : businessInsights.weeklyData;

                      const maxVal = Math.max(
                        ...data.map(d => Math.max(d.ingresos || 0, d.egresos || 0, Math.abs(d.utilidad || 0))),
                        100
                      );

                      return (
                        <div className="space-y-4">
                          <div className="h-64 sm:h-72 flex items-end gap-2 sm:gap-4 pt-6 pb-2 px-2 bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-x-auto relative">
                            {data.map((item, idx) => {
                              const label = analyticsGranularity === 'monthly' ? item.monthName : item.weekLabel;
                              const subLabel = analyticsGranularity === 'weekly' ? item.dateRange : '';
                              const ingresoH = Math.min(100, Math.round(((item.ingresos || 0) / maxVal) * 100));
                              const egresoH = Math.min(100, Math.round(((item.egresos || 0) / maxVal) * 100));
                              const isProfitable = (item.utilidad || 0) >= 0;

                              return (
                                <div key={idx} className="flex-1 min-w-[48px] h-full flex flex-col justify-end items-center group relative">
                                  
                                  {/* Tooltip on Hover */}
                                  <div className="absolute -top-16 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-30 bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 shadow-xl text-[11px] whitespace-nowrap flex flex-col gap-0.5">
                                    <span className="font-bold text-indigo-300">{label} {subLabel && `(${subLabel})`}</span>
                                    <span className="text-emerald-400">Ingresos: ${(item.ingresos || 0).toFixed(2)}</span>
                                    <span className="text-rose-400">Egresos: ${(item.egresos || 0).toFixed(2)}</span>
                                    <span className={`font-bold ${isProfitable ? 'text-indigo-400' : 'text-amber-400'}`}>
                                      Utilidad: ${(item.utilidad || 0).toFixed(2)} ({item.margenNeto}%)
                                    </span>
                                  </div>

                                  {/* Bars Container */}
                                  <div className="w-full flex justify-center items-end gap-1 h-[80%] pb-1">
                                    {/* Ingreso Bar */}
                                    <div 
                                      className="w-3 sm:w-5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 group-hover:brightness-125 shadow-sm"
                                      style={{ height: `${Math.max(4, ingresoH)}%` }}
                                      title={`Ingresos: $${item.ingresos}`}
                                    />
                                    {/* Egreso Bar */}
                                    <div 
                                      className="w-3 sm:w-5 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-500 group-hover:brightness-125 shadow-sm"
                                      style={{ height: `${Math.max(4, egresoH)}%` }}
                                      title={`Egresos: $${item.egresos}`}
                                    />
                                  </div>

                                  {/* Net Profit Dot / Indicator */}
                                  <div className={`text-[10px] font-mono font-bold mt-1 px-1.5 py-0.2 rounded ${
                                    item.utilidad > 0 
                                      ? 'text-emerald-300 bg-emerald-500/10' 
                                      : item.utilidad < 0 
                                      ? 'text-rose-300 bg-rose-500/10' 
                                      : 'text-slate-500'
                                  }`}>
                                    {item.utilidad !== 0 ? `$${Math.round(item.utilidad)}` : '-'}
                                  </div>

                                  {/* Period Label */}
                                  <span className="text-[11px] font-semibold text-slate-400 mt-1 truncate max-w-[50px] text-center">
                                    {label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Insights Highlight Footer */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                              <span className="text-slate-400 block text-[11px]">Periodo con Mayor Facturación:</span>
                              <span className="font-bold text-white text-sm mt-0.5 block">
                                {(() => {
                                  const best = [...data].sort((a,b) => (b.ingresos || 0) - (a.ingresos || 0))[0];
                                  return best ? `${analyticsGranularity === 'monthly' ? best.monthName : best.weekLabel} ($${(best.ingresos || 0).toLocaleString()})` : 'N/A';
                                })()}
                              </span>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                              <span className="text-slate-400 block text-[11px]">Periodo Más Rentable:</span>
                              <span className="font-bold text-emerald-400 text-sm mt-0.5 block">
                                {(() => {
                                  const bestP = [...data].sort((a,b) => (b.utilidad || 0) - (a.utilidad || 0))[0];
                                  return bestP ? `${analyticsGranularity === 'monthly' ? bestP.monthName : bestP.weekLabel} (+$${(bestP.utilidad || 0).toLocaleString()})` : 'N/A';
                                })()}
                              </span>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                              <span className="text-slate-400 block text-[11px]">Promedio Facturado por Periodo:</span>
                              <span className="font-bold text-indigo-300 text-sm mt-0.5 block">
                                ${data.length > 0 ? (data.reduce((acc, d) => acc + (d.ingresos || 0), 0) / data.length).toFixed(2) : 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 3. GRID: FUNNEL + WEEKDAY HEATMAP */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* CHART 2: EMBUDO DE CONVERSIÓN DE CLIENTES */}
                  {(analyticsCategoryFilter === 'all' || analyticsCategoryFilter === 'funnel') && (
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                          <div>
                            <h3 className="font-bold text-white text-base font-heading flex items-center gap-2">
                              <Target className="text-indigo-400" size={18} />
                              Embudo de Conversión de Clientes (Funnel)
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Paso a paso de prospectos capturados hasta el cierre de venta.
                            </p>
                          </div>
                          <span className="text-xs font-mono font-bold text-indigo-300 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                            {businessInsights.summary?.totalLeads || 0} Leads
                          </span>
                        </div>

                        <div className="space-y-3.5">
                          {businessInsights.funnelStages?.map((stage, idx) => {
                            const totalLeads = businessInsights.summary?.totalLeads || 1;
                            const widthPct = Math.max(8, Math.round((stage.count / totalLeads) * 100));

                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }}></span>
                                    <span className="text-white">{stage.label}</span>
                                  </div>
                                  <div className="flex items-center gap-2 font-mono">
                                    <span className="text-slate-400">{stage.count} ({stage.percentage}%)</span>
                                    {stage.value > 0 && (
                                      <span className="text-emerald-400 font-bold">${stage.value.toLocaleString()}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                  <div 
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                      width: `${widthPct}%`,
                                      backgroundColor: stage.color
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Eficiencia Global de Cierre:</span>
                        <span className="font-bold text-emerald-400 font-mono text-sm">
                          {businessInsights.summary?.globalConversionRate || 0}% de conversión efectiva
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CHART 3: MAPA DE CALOR / DÍAS DE MAYOR TRÁFICO */}
                  {(analyticsCategoryFilter === 'all' || analyticsCategoryFilter === 'traffic') && (
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                          <div>
                            <h3 className="font-bold text-white text-base font-heading flex items-center gap-2">
                              <Flame className="text-amber-400" size={18} />
                              Días de Mayor Actividad & Ventas
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Distribución semanal de consultas, nuevos prospectos y cotizaciones.
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Semana
                          </span>
                        </div>

                        {/* Weekday Visual Bars */}
                        {(() => {
                          const maxActivity = Math.max(
                            ...businessInsights.weekdayStats?.map(w => w.totalActivity || 0),
                            1
                          );

                          const peakDay = [...(businessInsights.weekdayStats || [])].sort((a,b) => b.totalActivity - a.totalActivity)[0];

                          return (
                            <div className="space-y-4">
                              <div className="grid grid-cols-7 gap-2 h-44 items-end bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                                {businessInsights.weekdayStats?.map((w, wIdx) => {
                                  const heightPct = Math.max(8, Math.round((w.totalActivity / maxActivity) * 100));
                                  const isPeak = peakDay && peakDay.dayName === w.dayName && w.totalActivity > 0;

                                  return (
                                    <div key={wIdx} className="flex flex-col items-center justify-end h-full group relative">
                                      {/* Tooltip */}
                                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-20 bg-slate-900 text-white p-2 rounded-lg border border-slate-700 text-[10px] shadow-lg whitespace-nowrap">
                                        <div className="font-bold text-amber-300">{w.dayName}</div>
                                        <div>{w.leadCount} leads · {w.msgCount} msgs</div>
                                      </div>

                                      <div 
                                        className={`w-full rounded-t-lg transition-all duration-500 ${
                                          isPeak 
                                            ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-md shadow-amber-500/20' 
                                            : 'bg-slate-800 hover:bg-slate-700'
                                        }`}
                                        style={{ height: `${heightPct}%` }}
                                      />

                                      <span className={`text-[10px] mt-1.5 font-bold ${isPeak ? 'text-amber-300' : 'text-slate-400'}`}>
                                        {w.dayName.substring(0, 3)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Peak Day Recommendation Box */}
                              {peakDay && peakDay.totalActivity > 0 && (
                                <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center gap-3">
                                  <Flame className="text-amber-400 shrink-0" size={20} />
                                  <div className="text-xs">
                                    <span className="font-bold text-amber-300 block">
                                      ¡Tu día pico de mayor rendimiento es el {peakDay.dayName}!
                                    </span>
                                    <span className="text-slate-400 text-[11px]">
                                      Se registran más consultas y capturas de clientes. Recomendamos programar tus campañas de WhatsApp en este día.
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                </div>

                {/* 4. GRID: TOP PRODUCTS + AVERAGE ORDER VALUE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* TOP PRODUCTS & ITEMS */}
                  {(analyticsCategoryFilter === 'all' || analyticsCategoryFilter === 'products') && (
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <h3 className="font-bold text-white text-base font-heading flex items-center gap-2">
                          <Package className="text-purple-400" size={18} />
                          Productos & Servicios Más Cotizados
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">Ranking de Ventas</span>
                      </div>

                      {(!businessInsights.topProducts || businessInsights.topProducts.length === 0) ? (
                        <div className="p-8 text-center text-slate-500 text-xs">
                          Aún no hay cotizaciones o pedidos registrados para calcular el ranking de productos.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {businessInsights.topProducts.map((prod, pIdx) => {
                            const maxRev = Math.max(...businessInsights.topProducts.map(p => p.revenue), 1);
                            const revPct = Math.round((prod.revenue / maxRev) * 100);

                            return (
                              <div key={pIdx} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-white truncate max-w-[200px]">
                                    #{pIdx + 1} {prod.name}
                                  </span>
                                  <div className="flex items-center gap-2 font-mono">
                                    <span className="text-slate-400">{prod.quantity} unid.</span>
                                    <span className="font-bold text-purple-300">${prod.revenue.toFixed(2)}</span>
                                  </div>
                                </div>

                                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full"
                                    style={{ width: `${Math.max(5, revPct)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* FLUX CLASSIFICATION BREAKDOWN */}
                  {(analyticsCategoryFilter === 'all' || analyticsCategoryFilter === 'financial') && (
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <h3 className="font-bold text-white text-base font-heading flex items-center gap-2">
                          <PieChart className="text-cyan-400" size={18} />
                          Distribución de Flujos Contables
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">Clasificación</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/20">
                          <span className="text-[10px] text-blue-300 font-bold uppercase">Activos Operativos</span>
                          <div className="text-lg font-black text-blue-400 mt-1 font-heading font-mono">
                            ${(businessInsights.classificationBreakdown?.activo || 0).toFixed(2)}
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                          <span className="text-[10px] text-amber-300 font-bold uppercase">Pasivos & Deudas</span>
                          <div className="text-lg font-black text-amber-400 mt-1 font-heading font-mono">
                            ${(businessInsights.classificationBreakdown?.pasivo || 0).toFixed(2)}
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20">
                          <span className="text-[10px] text-purple-300 font-bold uppercase">Patrimonio</span>
                          <div className="text-lg font-black text-purple-400 mt-1 font-heading font-mono">
                            ${(businessInsights.classificationBreakdown?.patrimonio || 0).toFixed(2)}
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20">
                          <span className="text-[10px] text-rose-300 font-bold uppercase">Notas de Crédito</span>
                          <div className="text-lg font-black text-rose-400 mt-1 font-heading font-mono">
                            -${(businessInsights.classificationBreakdown?.nota_credito || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* 5. DETAILED EXECUTIVE EVOLUTION TABLE */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-bold text-white text-base font-heading">
                        Tabla Comparativa de Rendimiento ({analyticsGranularity === 'monthly' ? 'Mes a Mes' : 'Semana a Semana'})
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Registro exhaustivo de métricas clave por periodo.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Periodo</th>
                          <th className="py-3 px-4 text-right">Ingresos ($)</th>
                          <th className="py-3 px-4 text-right">Egresos ($)</th>
                          <th className="py-3 px-4 text-right">Utilidad ($)</th>
                          <th className="py-3 px-4 text-center">Margen %</th>
                          <th className="py-3 px-4 text-center">Nuevos Leads</th>
                          <th className="py-3 px-4 text-center">Ventas Ganadas</th>
                          <th className="py-3 px-4 text-right">Ticket Prom. ($)</th>
                          <th className="py-3 px-4 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {(analyticsGranularity === 'monthly' ? businessInsights.monthlyData : businessInsights.weeklyData)?.map((item, idx) => {
                          const isProfitable = (item.utilidad || 0) >= 0;
                          const hasMovement = (item.ingresos || 0) > 0 || (item.egresos || 0) > 0 || (item.leadsNuevos || 0) > 0;

                          return (
                            <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                              <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                                {analyticsGranularity === 'monthly' ? item.monthName : item.weekLabel}
                                {analyticsGranularity === 'weekly' && (
                                  <span className="text-[10px] text-slate-500 font-normal block">{item.dateRange}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-emerald-400 font-semibold">
                                ${(item.ingresos || 0).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-rose-400 font-semibold">
                                ${(item.egresos || 0).toFixed(2)}
                              </td>
                              <td className={`py-3 px-4 text-right font-mono font-bold ${
                                isProfitable ? 'text-indigo-300' : 'text-rose-400'
                              }`}>
                                ${(item.utilidad || 0).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-center font-mono text-slate-300 font-semibold">
                                {item.margenNeto || 0}%
                              </td>
                              <td className="py-3 px-4 text-center font-mono text-cyan-400">
                                {item.leadsNuevos || 0}
                              </td>
                              <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">
                                {item.leadsGanados || 0}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-purple-300">
                                ${(item.ticketPromedio || 0).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  !hasMovement
                                    ? 'bg-slate-800 text-slate-500'
                                    : isProfitable
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {!hasMovement ? 'Sin actividad' : isProfitable ? 'Rentable' : 'Déficit'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: CONTABILIDAD & LIBROS FINANCIEROS */}
        {/* ==================================================== */}
        {activeTab === 'accounting' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Top Accounting Banner & Subtab Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                  <div className="w-full h-full bg-[#070c18] rounded-[14px] flex items-center justify-center">
                    <Landmark className="text-emerald-400" size={24} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2">
                    Contabilidad & Libros Financieros
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-sans font-semibold">
                      Partida Doble & Tributos
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Registro de Libro Diario con discriminación de impuestos, Libro Mayor con Cuentas T, y Balance Anual con cálculo de Impuesto a la Renta configurable.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTaxModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Configurar tasa de IVA/IGV e Impuesto a la Renta"
                >
                  <Percent size={14} className="text-amber-400" />
                  <span>Config. Impuestos</span>
                </button>

                {accountingSubTab === 'diario' && (
                  <button
                    type="button"
                    onClick={exportAccountingCSV}
                    className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Download size={14} className="text-cyan-400" />
                    <span>Exportar CSV</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenNewEntryModal}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>+ Nuevo Asiento</span>
                </button>
              </div>
            </div>

            {/* Subtabs Selector */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs font-semibold w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setAccountingSubTab('diario')}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                  accountingSubTab === 'diario'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Receipt size={14} />
                <span>1. Libro Diario</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                  {accountingEntries.length}
                </span>
              </button>

              <button
                onClick={() => setAccountingSubTab('mayor')}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                  accountingSubTab === 'mayor'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Scale size={14} />
                <span>2. Libro Mayor (Cuentas T)</span>
              </button>

              <button
                onClick={() => setAccountingSubTab('balance')}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                  accountingSubTab === 'balance'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <TrendingUp size={14} />
                <span>3. Balance Anual & Estado de Resultados</span>
              </button>
            </div>

            {/* ========================================================= */}
            {/* SUBTAB 1: LIBRO DIARIO                                    */}
            {/* ========================================================= */}
            {accountingSubTab === 'diario' && (
              <div className="space-y-6">
                
                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Total Ingresos</span>
                      <ArrowUpRight size={16} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-emerald-400 mt-2 font-heading">
                      ${(accountingSummary.totalIngresos || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Ventas brutas y cobros</div>
                  </div>

                  <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Total Egresos</span>
                      <ArrowDownRight size={16} className="text-rose-400" />
                    </div>
                    <div className="text-2xl font-black text-rose-400 mt-2 font-heading">
                      ${(accountingSummary.totalEgresos || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Compras y gastos operativos</div>
                  </div>

                  <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Notas de Crédito</span>
                      <FileText size={16} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-400 mt-2 font-heading">
                      ${(accountingSummary.totalNotasCredito || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Deducciones a ventas</div>
                  </div>

                  <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Total Impuestos</span>
                      <Percent size={16} className="text-cyan-400" />
                    </div>
                    <div className="text-2xl font-black text-cyan-400 mt-2 font-heading">
                      ${(accountingSummary.totalImpuestos || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">IGV / IVA discriminado</div>
                  </div>

                  <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Saldo Operativo</span>
                      <Scale size={16} className={accountingSummary.saldoNeto >= 0 ? 'text-indigo-400' : 'text-rose-400'} />
                    </div>
                    <div className={`text-2xl font-black mt-2 font-heading ${
                      accountingSummary.saldoNeto >= 0 ? 'text-indigo-400' : 'text-rose-400'
                    }`}>
                      ${(accountingSummary.saldoNeto || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Ingresos - Egresos</div>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Año:</span>
                    <select
                      value={accYear}
                      onChange={(e) => setAccYear(parseInt(e.target.value))}
                      className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-900 font-semibold"
                    >
                      {[2024, 2025, 2026, 2027, 2028].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Mes:</span>
                    <select
                      value={accMonth}
                      onChange={(e) => setAccMonth(e.target.value)}
                      className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-900"
                    >
                      <option value="">Todos los meses</option>
                      <option value="01">Enero</option>
                      <option value="02">Febrero</option>
                      <option value="03">Marzo</option>
                      <option value="04">Abril</option>
                      <option value="05">Mayo</option>
                      <option value="06">Junio</option>
                      <option value="07">Julio</option>
                      <option value="08">Agosto</option>
                      <option value="09">Setiembre</option>
                      <option value="10">Octubre</option>
                      <option value="11">Noviembre</option>
                      <option value="12">Diciembre</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Tipo:</span>
                    <select
                      value={accType}
                      onChange={(e) => setAccType(e.target.value)}
                      className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-900"
                    >
                      <option value="all">Todos los tipos</option>
                      <option value="ingreso">Ingresos (+)</option>
                      <option value="egreso">Egresos (-)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Clasificación:</span>
                    <select
                      value={accClassification}
                      onChange={(e) => setAccClassification(e.target.value)}
                      className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-900"
                    >
                      <option value="all">Todas las clasificaciones</option>
                      <option value="activo">Activo (Cuentas, Cobros, Inventario)</option>
                      <option value="pasivo">Pasivo (Deudas, Proveedores)</option>
                      <option value="patrimonio">Patrimonio (Capital, Aportes)</option>
                      <option value="nota_credito">Nota de Crédito (Devolución/Descuento)</option>
                      <option value="nota_debito">Nota de Débito (Recargo/Ajuste)</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                      type="text"
                      value={accSearch}
                      onChange={(e) => setAccSearch(e.target.value)}
                      placeholder="Buscar por concepto o documento..."
                      className="w-full glass-input pl-9 pr-3 py-1.5 rounded-xl text-xs"
                    />
                  </div>

                  {(accMonth || accType !== 'all' || accClassification !== 'all' || accSearch) && (
                    <button
                      onClick={() => {
                        setAccMonth('');
                        setAccType('all');
                        setAccClassification('all');
                        setAccSearch('');
                      }}
                      className="text-xs text-rose-400 hover:underline px-2"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>

                {/* Entries Table */}
                <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-slate-800/80 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                        <Receipt className="text-emerald-400" size={18} />
                        Asientos Registrados en Libro Diario
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Registro cronológico de partida doble con desglose de base imponible e impuestos.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-400 font-semibold">
                      {accountingEntries.length} asiento{accountingEntries.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {loadingAccounting ? (
                    <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                      <div className="w-5 h-5 rounded-full border-r-2 border-emerald-400 animate-spin"></div>
                      Cargando asientos contables...
                    </div>
                  ) : accountingEntries.length === 0 ? (
                    <div className="p-12 text-center">
                      <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-slate-300">No hay asientos contables registrados</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Comienza registrando tus ventas, gastos, compras, notas de crédito o de débito para generar tus libros contables automáticamente.
                      </p>
                      <button
                        onClick={handleOpenNewEntryModal}
                        className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        + Registrar Primer Asiento
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Fecha</th>
                            <th className="py-3 px-4">Doc / Ref</th>
                            <th className="py-3 px-4">Concepto / Descripción</th>
                            <th className="py-3 px-4">Tipo</th>
                            <th className="py-3 px-4">Clasificación</th>
                            <th className="py-3 px-4 text-right">Base Imponible</th>
                            <th className="py-3 px-4 text-center">% Imp.</th>
                            <th className="py-3 px-4 text-right">Impuesto</th>
                            <th className="py-3 px-4 text-right">Total</th>
                            <th className="py-3 px-4 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {accountingEntries.map((e) => {
                            const isIngreso = e.entry_type === 'ingreso';
                            const classBadge = {
                              activo: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                              pasivo: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                              patrimonio: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                              nota_credito: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                              nota_debito: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            }[e.classification] || 'bg-slate-800 text-slate-300 border-slate-700';

                            const classLabel = {
                              activo: 'Activo',
                              pasivo: 'Pasivo',
                              patrimonio: 'Patrimonio',
                              nota_credito: 'Nota de Crédito',
                              nota_debito: 'Nota de Débito'
                            }[e.classification] || e.classification;

                            return (
                              <tr key={e.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">
                                  {e.entry_date}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  {e.reference_doc ? (
                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">
                                      {e.reference_doc}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600 italic">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-white">{e.description}</div>
                                  {e.notes && <div className="text-[11px] text-slate-500 mt-0.5">{e.notes}</div>}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    isIngreso
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}>
                                    {isIngreso ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {isIngreso ? 'Ingreso' : 'Egreso'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${classBadge}`}>
                                    {classLabel}
                                  </span>
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-slate-300">
                                  ${(e.amount || 0).toFixed(2)}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap text-center font-mono text-slate-400">
                                  {e.tax_percentage || 0}%
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-cyan-400">
                                  ${(e.tax_amount || 0).toFixed(2)}
                                </td>
                                <td className={`py-3 px-4 whitespace-nowrap text-right font-mono font-bold ${
                                  isIngreso ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  ${(e.total_amount || 0).toFixed(2)}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleOpenEditEntryModal(e)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                      title="Editar asiento"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEntry(e.id)}
                                      className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                      title="Eliminar asiento"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* SUBTAB 2: LIBRO MAYOR (CUENTAS T)                         */}
            {/* ========================================================= */}
            {accountingSubTab === 'mayor' && (
              <div className="space-y-6">
                
                {/* Balance & Year Selector Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">Año contable:</span>
                      <select
                        value={accYear}
                        onChange={(e) => setAccYear(parseInt(e.target.value))}
                        className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-900 font-bold"
                      >
                        {[2024, 2025, 2026, 2027, 2028].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

                    <span className="text-xs text-slate-400">
                      Total Cuentas T generadas: <strong>{accountingLedger.accounts?.length || 0}</strong>
                    </span>
                  </div>

                  {/* Cuadre Status Badge */}
                  <div>
                    {accountingLedger.estaCuadrado ? (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 size={15} />
                        <span>Partida Doble Cuadrada (Debe = Haber)</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                        <AlertTriangle size={15} />
                        <span>Diferencia de Cuadre: ${(accountingLedger.diferencia || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ledger Totals Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 bg-blue-950/20">
                    <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Total Sumas DEBE (Cargos)</span>
                    <div className="text-3xl font-black text-blue-400 mt-2 font-heading">
                      ${(accountingLedger.totalDebe || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Incrementos de activo, gastos y notas de débito</div>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20">
                    <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Total Sumas HABER (Abonos)</span>
                    <div className="text-3xl font-black text-purple-400 mt-2 font-heading">
                      ${(accountingLedger.totalHaber || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Incrementos de pasivo, ventas y notas de crédito</div>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                    <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Diferencia Neta de Balance</span>
                    <div className="text-3xl font-black text-emerald-400 mt-2 font-heading">
                      ${(accountingLedger.diferencia || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {accountingLedger.estaCuadrado ? 'Balance perfecto en cero' : 'Ajustes requeridos'}
                    </div>
                  </div>
                </div>

                {/* Cuentas T Grid */}
                {loadingAccounting ? (
                  <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                    <div className="w-5 h-5 rounded-full border-r-2 border-emerald-400 animate-spin"></div>
                    Calculando Libro Mayor...
                  </div>
                ) : !accountingLedger.accounts || accountingLedger.accounts.length === 0 ? (
                  <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800">
                    <Scale className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-300">No hay movimientos para el año {accYear}</h4>
                    <p className="text-xs text-slate-500 mt-1">Registra asientos en el Libro Diario para ver tus Cuentas T agrupadas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {accountingLedger.accounts.map((acc, idx) => {
                      const isDeudor = acc.saldoTipo === 'DEUDOR';
                      const isAcreedor = acc.saldoTipo === 'ACREEDOR';

                      return (
                        <div key={idx} className="glass-panel rounded-3xl border border-slate-800 overflow-hidden flex flex-col">
                          {/* Account Header */}
                          <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {acc.group}
                              </span>
                              <h4 className="text-base font-bold text-white font-heading mt-0.5">
                                {acc.name}
                              </h4>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              isDeudor
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                : isAcreedor
                                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              Saldo {acc.saldoTipo}
                            </span>
                          </div>

                          {/* Classic "T" Table */}
                          <div className="grid grid-cols-2 divide-x divide-slate-800 flex-1 min-h-[160px] text-xs">
                            {/* DEBE (Izquierda) */}
                            <div className="p-3 bg-blue-950/10 flex flex-col justify-between">
                              <div>
                                <div className="text-center font-bold uppercase text-[10px] text-blue-300 pb-2 border-b border-slate-800/80 mb-2">
                                  DEBE (Cargos)
                                </div>
                                <div className="space-y-1.5">
                                  {acc.debe.length === 0 ? (
                                    <div className="text-[11px] text-slate-600 text-center italic py-2">Sin cargos</div>
                                  ) : (
                                    acc.debe.map((item, dIdx) => (
                                      <div key={dIdx} className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-400 truncate max-w-[120px]" title={item.concept}>
                                          {item.concept}
                                        </span>
                                        <span className="font-mono font-semibold text-blue-300">${item.amount.toFixed(2)}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                              <div className="pt-3 border-t border-slate-800 mt-3 flex justify-between items-center font-bold">
                                <span className="text-slate-400 text-[11px]">Total Debe:</span>
                                <span className="font-mono text-blue-400">${(acc.totalDebe || 0).toFixed(2)}</span>
                              </div>
                            </div>

                            {/* HABER (Derecha) */}
                            <div className="p-3 bg-purple-950/10 flex flex-col justify-between">
                              <div>
                                <div className="text-center font-bold uppercase text-[10px] text-purple-300 pb-2 border-b border-slate-800/80 mb-2">
                                  HABER (Abonos)
                                </div>
                                <div className="space-y-1.5">
                                  {acc.haber.length === 0 ? (
                                    <div className="text-[11px] text-slate-600 text-center italic py-2">Sin abonos</div>
                                  ) : (
                                    acc.haber.map((item, hIdx) => (
                                      <div key={hIdx} className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-400 truncate max-w-[120px]" title={item.concept}>
                                          {item.concept}
                                        </span>
                                        <span className="font-mono font-semibold text-purple-300">${item.amount.toFixed(2)}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                              <div className="pt-3 border-t border-slate-800 mt-3 flex justify-between items-center font-bold">
                                <span className="text-slate-400 text-[11px]">Total Haber:</span>
                                <span className="font-mono text-purple-400">${(acc.totalHaber || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Footer: Saldo Final de la Cuenta */}
                          <div className="p-3 bg-slate-950/95 border-t border-slate-800 flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-400">Saldo Final de Cuenta:</span>
                            <span className={`font-mono text-sm ${
                              isDeudor ? 'text-blue-400' : isAcreedor ? 'text-purple-400' : 'text-slate-400'
                            }`}>
                              ${(acc.saldo || 0).toFixed(2)} ({acc.saldoTipo})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* ========================================================= */}
            {/* SUBTAB 3: BALANCE ANUAL & ESTADO DE RESULTADOS            */}
            {/* ========================================================= */}
            {accountingSubTab === 'balance' && (
              <div className="space-y-6">
                
                {/* Year Selector Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">Año fiscal de balance:</span>
                      <select
                        value={accYear}
                        onChange={(e) => setAccYear(parseInt(e.target.value))}
                        className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-900 font-bold"
                      >
                        {[2024, 2025, 2026, 2027, 2028].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowTaxModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
                  >
                    <Percent size={14} />
                    <span>Modificar Impuesto a la Renta</span>
                  </button>
                </div>

                {loadingAccounting || !annualBalance ? (
                  <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                    <div className="w-5 h-5 rounded-full border-r-2 border-emerald-400 animate-spin"></div>
                    Generando balance general anual...
                  </div>
                ) : (
                  <>
                    {/* Top 5 KPI Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Ventas Brutas</span>
                        <div className="text-2xl font-black text-white mt-1.5 font-heading">
                          ${(annualBalance.incomeStatement.ventasBrutas || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Facturado en el año</div>
                      </div>

                      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                        <span className="text-[11px] font-semibold text-emerald-400 uppercase">Ventas Netas</span>
                        <div className="text-2xl font-black text-emerald-400 mt-1.5 font-heading">
                          ${(annualBalance.incomeStatement.ventasNetas || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Brutas - NC + ND</div>
                      </div>

                      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                        <span className="text-[11px] font-semibold text-indigo-400 uppercase">Utilidad Operativa</span>
                        <div className="text-2xl font-black text-indigo-400 mt-1.5 font-heading">
                          ${(annualBalance.incomeStatement.utilidadAntesImpuestos || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Antes de impuestos (UAI)</div>
                      </div>

                      <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-amber-400 uppercase">Imp. a la Renta</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                            {annualBalance.incomeStatement.impuestoRentaMode === 'manual' ? 'Manual' : `${annualBalance.incomeStatement.impuestoRentaPercentage}%`}
                          </span>
                        </div>
                        <div className="text-2xl font-black text-amber-400 mt-1.5 font-heading">
                          ${(annualBalance.incomeStatement.impuestoRenta || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Deducción fiscal</div>
                      </div>

                      <div className="glass-panel p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-emerald-300 uppercase">Utilidad Neta</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-200">
                            {annualBalance.incomeStatement.margenNetoPorcentaje}% Margen
                          </span>
                        </div>
                        <div className="text-2xl font-black text-emerald-300 mt-1.5 font-heading">
                          ${(annualBalance.incomeStatement.utilidadNetaFinal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Ganancia neta final</div>
                      </div>
                    </div>

                    {/* 3 Deep Breakdown Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* 1. Estado de Resultados (P&L) */}
                      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
                            <TrendingUp className="text-emerald-400" size={16} />
                            Estado de Resultados (P&L)
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400 font-bold">Año {accYear}</span>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between items-center text-slate-300">
                            <span>(+) Ventas Brutas Totales</span>
                            <span className="font-mono font-semibold">${(annualBalance.incomeStatement.ventasBrutas || 0).toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between items-center text-rose-400">
                            <span>(-) Notas de Crédito emitidas</span>
                            <span className="font-mono font-semibold">-${(annualBalance.incomeStatement.notasCreditoVentas || 0).toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between items-center text-emerald-400">
                            <span>(+) Notas de Débito aplicadas</span>
                            <span className="font-mono font-semibold">+${(annualBalance.incomeStatement.notasDebitoVentas || 0).toFixed(2)}</span>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-white">
                            <span>(=) Ventas Netas Totales</span>
                            <span className="font-mono text-emerald-400">${(annualBalance.incomeStatement.ventasNetas || 0).toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between items-center text-rose-400">
                            <span>(-) Gastos y Costos Operativos</span>
                            <span className="font-mono font-semibold">-${(annualBalance.incomeStatement.egresosOperativos || 0).toFixed(2)}</span>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-indigo-300">
                            <span>(=) Utilidad Antes de Impuestos</span>
                            <span className="font-mono">${(annualBalance.incomeStatement.utilidadAntesImpuestos || 0).toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between items-center text-amber-400">
                            <div className="flex items-center gap-1.5">
                              <span>(-) Impuesto a la Renta</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                {annualBalance.incomeStatement.impuestoRentaMode === 'manual' ? 'Manual' : `${annualBalance.incomeStatement.impuestoRentaPercentage}%`}
                              </span>
                            </div>
                            <span className="font-mono font-semibold">-${(annualBalance.incomeStatement.impuestoRenta || 0).toFixed(2)}</span>
                          </div>

                          <div className="pt-3 border-t-2 border-emerald-500/50 flex justify-between items-center font-extrabold text-sm text-emerald-300 bg-emerald-950/30 p-3 rounded-2xl">
                            <span>(=) UTILIDAD NETA DEL EJERCICIO</span>
                            <span className="font-mono text-base">${(annualBalance.incomeStatement.utilidadNetaFinal || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Balance General (Activo / Pasivo / Patrimonio) */}
                      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
                            <Scale className="text-blue-400" size={16} />
                            Balance General Simplificado
                          </h3>
                          <span className="text-[11px] font-mono text-emerald-400 font-bold">Activo = Pasivo + Patrim.</span>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/20">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-blue-300">TOTAL ACTIVOS</span>
                              <span className="font-mono font-black text-blue-400 text-sm">
                                ${(annualBalance.balanceSheet.totalActivos || 0).toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Caja, bancos, cuentas por cobrar e inventarios</p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-amber-300">TOTAL PASIVOS</span>
                              <span className="font-mono font-black text-amber-400 text-sm">
                                ${(annualBalance.balanceSheet.totalPasivos || 0).toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Obligaciones, proveedores y tributos por pagar</p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-purple-300">PATRIMONIO TOTAL AJUSTADO</span>
                              <span className="font-mono font-black text-purple-400 text-sm">
                                ${(annualBalance.balanceSheet.totalPatrimonio || 0).toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Capital inicial aportado + Utilidad neta del ejercicio</p>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-slate-300">
                            <span>Pasivo + Patrimonio Total:</span>
                            <span className="font-mono text-white">
                              ${((annualBalance.balanceSheet.totalPasivos || 0) + (annualBalance.balanceSheet.totalPatrimonio || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Liquidación Tributaria Anual (IVA / IGV & Renta) */}
                      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
                            <Percent className="text-cyan-400" size={16} />
                            Resumen Tributario Anual
                          </h3>
                          <span className="text-[11px] font-mono text-cyan-400 font-bold">IVA / IGV</span>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center text-slate-300">
                            <span>Débito Fiscal (IVA cobrado en ventas)</span>
                            <span className="font-mono font-semibold text-cyan-300">${(annualBalance.taxSummary.ivaDebitoFiscal || 0).toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between items-center text-slate-300">
                            <span>Crédito Fiscal (IVA pagado en compras)</span>
                            <span className="font-mono font-semibold text-cyan-300">${(annualBalance.taxSummary.ivaCreditoFiscal || 0).toFixed(2)}</span>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold">
                            <span className="text-white">Saldo Neto de IVA / IGV:</span>
                            <span className={`font-mono ${
                              annualBalance.taxSummary.saldoNetoIva >= 0 ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              ${(annualBalance.taxSummary.saldoNetoIva || 0).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {annualBalance.taxSummary.saldoNetoIva >= 0
                              ? 'Monto acumulado a favor de la administración tributaria.'
                              : 'Saldo acumulado a favor de la empresa para compensar periodos siguientes.'}
                          </p>

                          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                            <span className="text-slate-400">Provisión Anual Impuesto a la Renta:</span>
                            <span className="font-mono font-bold text-amber-400">
                              ${(annualBalance.taxSummary.impuestoRenta || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Monthly Performance Table */}
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                      <h3 className="font-bold text-white text-base mb-4 font-heading">
                        Evolución Mensual del Ejercicio Fiscal {accYear}
                      </h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                            <tr>
                              <th className="py-3 px-4">Mes</th>
                              <th className="py-3 px-4 text-right">Ingresos ($)</th>
                              <th className="py-3 px-4 text-right">Egresos ($)</th>
                              <th className="py-3 px-4 text-right">Utilidad Mensual ($)</th>
                              <th className="py-3 px-4 text-right">Impuestos Generados ($)</th>
                              <th className="py-3 px-4 text-center">Rendimiento</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-sans">
                            {annualBalance.monthlyData.map((m) => {
                              const isPositive = m.utilidad >= 0;
                              return (
                                <tr key={m.month} className="hover:bg-slate-900/40 transition-colors">
                                  <td className="py-3 px-4 font-bold text-white">
                                    {m.monthName} ({String(m.month).padStart(2, '0')})
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono text-emerald-400">
                                    ${m.ingresos.toFixed(2)}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono text-rose-400">
                                    ${m.egresos.toFixed(2)}
                                  </td>
                                  <td className={`py-3 px-4 text-right font-mono font-bold ${
                                    isPositive ? 'text-indigo-300' : 'text-rose-400'
                                  }`}>
                                    ${m.utilidad.toFixed(2)}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono text-cyan-400">
                                    ${m.impuestos.toFixed(2)}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      m.ingresos === 0 && m.egresos === 0
                                        ? 'bg-slate-800 text-slate-500'
                                        : isPositive
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                                    }`}>
                                      {m.ingresos === 0 && m.egresos === 0 ? 'Sin movimientos' : isPositive ? 'Superávit' : 'Déficit'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* ==================================================== */}
      {/* MODAL: CREATE / EDIT LEAD */}
      {/* ==================================================== */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowLeadModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white font-heading mb-4">
              {editingLeadId ? 'Editar Prospecto' : 'Registrar Nuevo Prospecto'}
            </h3>

            <form onSubmit={handleSaveLead} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                <input 
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="ej. Juan Pérez (Empresa XYZ)"
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono WhatsApp *</label>
                  <input 
                    type="text"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="+51 987 654 321"
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                  <input 
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Etapa del Embudo</label>
                  <select 
                    value={leadStage}
                    onChange={(e) => setLeadStage(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm bg-slate-900"
                  >
                    {STAGES.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor Estimado ({currencySymbol} {currencyCode})
                  </label>
                  <input 
                    type="number"
                    min="0"
                    step="10"
                    value={leadDealValue}
                    onChange={(e) => setLeadDealValue(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Etiquetas del Lead</label>
                <input 
                  type="text"
                  value={leadTags}
                  onChange={(e) => setLeadTags(e.target.value)}
                  placeholder="ej. VIP, Interesado, Cotización Enviada"
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm mb-2"
                />
                {crmTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 self-center mr-1">Sugerencias:</span>
                    {crmTags.map(tag => {
                      const tagsArr = leadTags.split(',').map(t => t.trim().toLowerCase());
                      const isSelected = tagsArr.includes(tag.name.toLowerCase());
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            let curr = leadTags.split(',').map(t => t.trim()).filter(Boolean);
                            if (isSelected) {
                              curr = curr.filter(t => t.toLowerCase() !== tag.name.toLowerCase());
                            } else {
                              curr.push(tag.name);
                            }
                            setLeadTags(curr.join(', '));
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 transition-all ${
                            isSelected ? 'ring-1 ring-white/50 scale-105' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{
                            backgroundColor: isSelected ? `${tag.color}35` : `${tag.color}15`,
                            borderColor: isSelected ? tag.color : `${tag.color}40`,
                            color: isSelected ? '#ffffff' : tag.color
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                          {tag.name}
                          {isSelected ? <Check size={10} /> : <Plus size={9} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notas Comerciales</label>
                <textarea 
                  rows="3"
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="Detalles sobre lo que busca el cliente, acuerdos o presupuesto..."
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => setShowLeadModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25">
                  Guardar Prospecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: TIMELINE & ACTIVITY HISTORY */}
      {/* ==================================================== */}
      {showTimelineModal && timelineLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
            <button onClick={() => setShowTimelineModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X size={20} />
            </button>

            <div className="mb-5 pb-3 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white font-heading">{timelineLead.name}</h3>
              <p className="text-xs text-slate-400">{timelineLead.phone} • {timelineLead.email || 'Sin correo'}</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-5">
              {leadActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Sin interacciones previas registradas.
                </div>
              ) : (
                leadActivities.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-semibold uppercase text-indigo-400">{act.type}</span>
                      <span>{new Date(act.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{act.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddLeadNote} className="pt-3 border-t border-slate-800 flex gap-2">
              <input 
                type="text" 
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Añadir una nota interna comercial..."
                className="flex-1 glass-input px-4 py-2.5 rounded-xl text-xs"
              />
              <button type="submit" className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* NEW MODAL: CREATE TASK */}
      {/* ==================================================== */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in">
            <button onClick={() => setShowTaskModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white font-heading mb-4 flex items-center gap-2">
              <CalendarCheck className="text-amber-400" /> Nueva Tarea de Seguimiento
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título de la Tarea *</label>
                <input 
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="ej. Llamar para confirmar pago, enviar catálogo..."
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Vincular a Cliente (Opcional)</label>
                <select 
                  value={taskLeadId}
                  onChange={(e) => setTaskLeadId(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs bg-slate-900"
                >
                  <option value="">-- Sin cliente asignado --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
                  <input 
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hora</label>
                  <input 
                    type="text"
                    value={taskDueTime}
                    onChange={(e) => setTaskDueTime(e.target.value)}
                    placeholder="11:30 AM"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prioridad</label>
                <select 
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs bg-slate-900"
                >
                  <option value="baja">Baja 🟢</option>
                  <option value="media">Media 🟡</option>
                  <option value="alta">Alta 🔴</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold text-xs shadow-md">
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* NEW MODAL: CREATE / EDIT PRODUCT */}
      {/* ==================================================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in">
            <button 
              onClick={() => { setShowProductModal(false); setEditingProduct(null); }} 
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white font-heading mb-4 flex items-center gap-2">
              <Package className="text-rose-400" />
              <span>{editingProduct ? 'Editar Producto del Catálogo' : 'Añadir Producto al Catálogo'}</span>
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Producto o Servicio *</label>
                <input 
                  type="text" 
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="ej. Pack Automatización Pro, Vestido Fiesta..."
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Precio ({currencySymbol} {currencyCode}) *
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="99.00"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                  <input 
                    type="text"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    placeholder="ej. Servicios, Ropa..."
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">SKU / Código (Opcional)</label>
                <input 
                  type="text" 
                  value={prodSku}
                  onChange={(e) => setProdSku(e.target.value)}
                  placeholder="ej. PROD-001"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL de Imagen del Producto</label>
                <input 
                  type="url" 
                  value={prodImageUrl}
                  onChange={(e) => setProdImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción Breve</label>
                <textarea 
                  rows="2"
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Características del producto..."
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => { setShowProductModal(false); setEditingProduct(null); }} 
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-600/20"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Añadir al Catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* NEW MODAL: CUSTOMIZE BUSINESS CURRENCY */}
      {/* ==================================================== */}
      {showCurrencyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in">
            <button onClick={() => setShowCurrencyModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white font-heading mb-4 flex items-center gap-2">
              <DollarSign className="text-amber-400" /> Configurar Moneda del Negocio
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveCurrencySettings(currencyCode, currencySymbol); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Código de Moneda (ISO)</label>
                <input 
                  type="text" 
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                  placeholder="PEN, USD, EUR, COP, MXN..."
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Símbolo de la Moneda</label>
                <input 
                  type="text" 
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="S/, $, €, COP $, MXN $..."
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  required
                />
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Ejemplo en Catálogo:</span>
                <span className="font-bold text-emerald-400 font-mono">{currencySymbol} 150.00 {currencyCode}</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCurrencyModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={savingCurrency}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {savingCurrency ? 'Guardando...' : 'Guardar Moneda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* NEW MODAL: CREATE ORDER */}
      {/* ==================================================== */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowOrderModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white font-heading mb-4 flex items-center gap-2">
              <ShoppingCart className="text-emerald-400" /> Crear Pedido / Cotización
            </h3>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cliente Vinculado</label>
                <select 
                  value={orderLeadId}
                  onChange={(e) => setOrderLeadId(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs bg-slate-900"
                >
                  <option value="">-- Seleccionar cliente del CRM --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Selecciona los Productos a Cotizar:</label>
                <div className="max-h-44 overflow-y-auto space-y-2 p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                  {products.map(p => {
                    const selected = selectedOrderItems.find(it => it.id === p.id);
                    return (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 text-xs">
                        <div>
                          <span className="font-semibold text-white block">{p.name}</span>
                          <span className="text-emerald-400 font-bold">{currencySymbol} {p.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selected ? (
                            <div className="flex items-center gap-2">
                              <button 
                                type="button" 
                                onClick={() => {
                                  if (selected.quantity > 1) {
                                    setSelectedOrderItems(selectedOrderItems.map(it => it.id === p.id ? { ...it, quantity: it.quantity - 1 } : it));
                                  } else {
                                    setSelectedOrderItems(selectedOrderItems.filter(it => it.id !== p.id));
                                  }
                                }}
                                className="w-6 h-6 rounded bg-slate-800 text-white font-bold"
                              >-</button>
                              <span className="font-bold text-white">{selected.quantity}</span>
                              <button 
                                type="button" 
                                onClick={() => setSelectedOrderItems(selectedOrderItems.map(it => it.id === p.id ? { ...it, quantity: it.quantity + 1 } : it))}
                                className="w-6 h-6 rounded bg-slate-800 text-white font-bold"
                              >+</button>
                            </div>
                          ) : (
                            <button 
                              type="button" 
                              onClick={() => setSelectedOrderItems([...selectedOrderItems, { id: p.id, name: p.name, price: p.price, quantity: 1 }])}
                              className="px-2.5 py-1 rounded bg-indigo-600 text-white text-xs font-bold"
                            >
                              Agregar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedOrderItems.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-sm font-bold text-emerald-400">
                  <span>Total Cotización:</span>
                  <span>{currencySymbol} {selectedOrderItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)} {currencyCode}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notas de la Orden</label>
                <textarea 
                  rows="2"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Detalles de pago o entrega..."
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowOrderModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs shadow-md">
                  Generar Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CREAR NUEVA ETIQUETA CRM */}
      {/* ==================================================== */}
      {showCreateTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 shadow-2xl relative animate-fade-in">
            <button 
              onClick={() => setShowCreateTagModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <Tag size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading">Nueva Etiqueta CRM</h3>
                <p className="text-xs text-slate-400">Crea una etiqueta interna compatible con el CRM y Chat en vivo</p>
              </div>
            </div>

            <form onSubmit={handleCreateCrmTag} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nombre de la Etiqueta *
                </label>
                <input 
                  type="text" 
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="ej. VIP, Cotización Enviada, Alta Prioridad..."
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs text-white"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Color Identificador
                </label>
                <div className="grid grid-cols-8 gap-2 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                  {[
                    { label: 'Índigo', hex: '#6366f1' },
                    { label: 'Azul', hex: '#3b82f6' },
                    { label: 'Esmeralda', hex: '#10b981' },
                    { label: 'Ámbar', hex: '#f59e0b' },
                    { label: 'Púrpura', hex: '#8b5cf6' },
                    { label: 'Rosa', hex: '#ec4899' },
                    { label: 'Cian', hex: '#06b6d4' },
                    { label: 'Rojo', hex: '#ef4444' }
                  ].map(colorOpt => (
                    <button
                      key={colorOpt.hex}
                      type="button"
                      onClick={() => setNewTagColor(colorOpt.hex)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        newTagColor === colorOpt.hex ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: colorOpt.hex }}
                      title={colorOpt.label}
                    >
                      {newTagColor === colorOpt.hex && <Check size={12} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Preview */}
              {newTagName.trim() && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Vista previa:</span>
                  <span 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border"
                    style={{
                      backgroundColor: `${newTagColor}22`,
                      borderColor: `${newTagColor}60`,
                      color: newTagColor
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: newTagColor }} />
                    {newTagName.trim()}
                  </span>
                </div>
              )}

              {/* Existing tags list */}
              {crmTags.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                    Etiquetas creadas actualmente ({crmTags.length}) y Regla de IA:
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    {crmTags.map(t => {
                      const isMuted = t.ai_disabled === 1 || t.ai_disabled === true || t.ai_disabled === '1';
                      return (
                        <div 
                          key={t.id} 
                          className="flex items-center justify-between p-1.5 rounded-lg border text-[11px] bg-slate-900/60"
                          style={{
                            borderColor: `${t.color}35`
                          }}
                        >
                          <span 
                            className="inline-flex items-center gap-1.5 font-medium truncate min-w-0"
                            style={{ color: t.color }}
                          >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                            <span className="truncate">{t.name}</span>
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleTagAi(t.id, t.ai_disabled)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all flex items-center gap-1 ${
                                isMuted
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                              }`}
                              title={isMuted ? 'IA desactivada para chats con esta etiqueta. Clic para activar' : 'IA activa para chats con esta etiqueta. Clic para desactivar'}
                            >
                              {isMuted ? <PauseCircle size={10} /> : <Bot size={10} />}
                              <span>{isMuted ? 'IA Pausada' : 'IA Activa'}</span>
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteCrmTag(t.id)}
                              className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors font-bold text-xs"
                              title="Eliminar etiqueta"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateTagModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Guardar Etiqueta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CONFIGURAR & LANZAR RETARGETING */}
      {/* ==================================================== */}
      {showRetargetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in my-8 max-h-[92vh] flex flex-col">
            <button 
              onClick={() => setShowRetargetingModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-5 shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
                <Radio size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">
                  Campaña de Retargeting por Etiquetas
                </h3>
                <p className="text-xs text-slate-400">
                  Envía secuencias de mensajes + archivos multimedia a contactos específicos con pausas anti-bloqueo.
                </p>
              </div>
            </div>

            <form onSubmit={handleStartRetargeting} className="space-y-5 overflow-y-auto flex-1 pr-1">
              
              {/* Campaign Name & Audience Segment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nombre de la Campaña
                  </label>
                  <input 
                    type="text"
                    value={retargetingName}
                    onChange={(e) => setRetargetingName(e.target.value)}
                    placeholder={`Retargeting ${new Date().toLocaleDateString('es-ES')}`}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Segmentar por Etiqueta</span>
                    <span className="text-purple-400 font-bold">{getTargetContactsCount()} contactos</span>
                  </label>
                  <select 
                    value={retargetingTag}
                    onChange={(e) => setRetargetingTag(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 text-slate-200 border-slate-700"
                  >
                    <option value="all">Todas las etiquetas ({getAllTargetableContacts().length} contactos)</option>
                    {crmTags.map(tag => {
                      const count = getAllTargetableContacts().filter(c => c.tags && c.tags.toLowerCase().includes(tag.name.toLowerCase())).length;
                      return (
                        <option key={tag.id} value={tag.name}>
                          Etiqueta: {tag.name} ({count} contactos)
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Sequential Messages Builder */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-purple-400" /> Secuencia de Mensajes y Archivos ({retargetingMessages.length})
                  </label>
                  <span className="text-[11px] text-slate-400">Se enviarán en orden a cada contacto</span>
                </div>

                <div className="space-y-3.5">
                  {retargetingMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 transition-all relative group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-purple-300 bg-purple-500/15 px-2.5 py-0.5 rounded-lg border border-purple-500/25">
                          Mensaje #{idx + 1}
                        </span>

                        {retargetingMessages.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveRetargetingMessage(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1 text-xs flex items-center gap-1 transition-colors"
                            title="Eliminar este mensaje"
                          >
                            <Trash2 size={13} /> Quitar
                          </button>
                        )}
                      </div>

                      {/* Text Input */}
                      <textarea 
                        rows="3"
                        value={msg.text}
                        onChange={(e) => handleUpdateRetargetingText(idx, e.target.value)}
                        placeholder={`Escribe el texto del mensaje #${idx + 1}...`}
                        className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white resize-none"
                      />

                      {/* Attached Media List */}
                      {msg.mediaFiles && msg.mediaFiles.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {msg.mediaFiles.map((file, fIdx) => (
                            <div 
                              key={fIdx} 
                              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] flex items-center gap-1.5 text-slate-200"
                            >
                              {file.type === 'image' && <ImageIcon size={12} className="text-emerald-400" />}
                              {file.type === 'audio' && <Volume2 size={12} className="text-amber-400" />}
                              {file.type === 'video' && <Video size={12} className="text-purple-400" />}
                              {file.type === 'document' && <FileText size={12} className="text-sky-400" />}
                              <span className="max-w-[150px] truncate">{file.originalName || file.filename}</span>
                              <button 
                                type="button"
                                onClick={() => handleRemoveRetargetingMedia(idx, fIdx)}
                                className="text-slate-400 hover:text-rose-400 font-bold ml-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Media File Button */}
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-900">
                        <label className="cursor-pointer text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors">
                          <Paperclip size={13} />
                          <span>Adjuntar Foto, Audio PTT, Video o PDF</span>
                          <input 
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleAttachFilesToRetargetingMsg(idx, e.target.files);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  type="button"
                  onClick={handleAddRetargetingMessage}
                  className="w-full py-2.5 rounded-xl border border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus size={14} /> Añadir Siguiente Mensaje a la Secuencia
                </button>
              </div>

              {/* Delays & Anti-Ban Configuration */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Sliders size={14} className="text-amber-400" />
                  <span>Configuración de Delays y Bloques de Seguridad</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Delay between messages */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Delay entre mensajes (seg)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="number"
                        min="1"
                        max="30"
                        value={retargetingSettings.msgDelayMin}
                        onChange={(e) => setRetargetingSettings({ ...retargetingSettings, msgDelayMin: Number(e.target.value) })}
                        className="w-14 glass-input text-center py-1.5 text-xs text-white"
                      />
                      <span className="text-xs text-slate-500">a</span>
                      <input 
                        type="number"
                        min="1"
                        max="60"
                        value={retargetingSettings.msgDelayMax}
                        onChange={(e) => setRetargetingSettings({ ...retargetingSettings, msgDelayMax: Number(e.target.value) })}
                        className="w-14 glass-input text-center py-1.5 text-xs text-white"
                      />
                      <span className="text-[11px] text-slate-400">seg</span>
                    </div>
                  </div>

                  {/* Batch Size */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Tamaño de bloque
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="number"
                        min="1"
                        max="50"
                        value={retargetingSettings.batchSize}
                        onChange={(e) => setRetargetingSettings({ ...retargetingSettings, batchSize: Number(e.target.value) })}
                        className="w-16 glass-input text-center py-1.5 text-xs text-white"
                      />
                      <span className="text-[11px] text-slate-400">contactos/lote</span>
                    </div>
                  </div>

                  {/* Delay between batches */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Pausa entre bloques
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="number"
                        min="5"
                        max="300"
                        value={retargetingSettings.batchDelaySeconds}
                        onChange={(e) => setRetargetingSettings({ ...retargetingSettings, batchDelaySeconds: Number(e.target.value) })}
                        className="w-16 glass-input text-center py-1.5 text-xs text-white"
                      />
                      <span className="text-[11px] text-slate-400">segundos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Banner */}
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs text-purple-200">
                <span>
                  🎯 Audiencia: <strong>{getTargetContactsCount()} contacto(s)</strong> • Envíos en lotes de <strong>{retargetingSettings.batchSize}</strong>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Simulación de escritura activa</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setShowRetargetingModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isStartingRetargeting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>{isStartingRetargeting ? 'Iniciando...' : 'Lanzar Campaña Ahora'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: MONITOR EN VIVO DE RETARGETING */}
      {/* ==================================================== */}
      {showProgressModal && campaignProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setShowProgressModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Cerrar monitor (la campaña continuará en segundo plano)"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                campaignProgress.status === 'running' 
                  ? 'bg-purple-600 animate-pulse' 
                  : campaignProgress.status === 'completed'
                  ? 'bg-emerald-600'
                  : 'bg-amber-600'
              }`}>
                <Radio size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  Monitor de Retargeting en Vivo
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    campaignProgress.status === 'running'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : campaignProgress.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {campaignProgress.status === 'running' ? 'Enviando...' : campaignProgress.status === 'completed' ? 'Completada' : 'Detenida'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Progreso en tiempo real de la secuencia de mensajes</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Progreso general</span>
                <span className="text-purple-300 font-bold">
                  {campaignProgress.total > 0 ? Math.round(((campaignProgress.sent || 0) / campaignProgress.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{
                    width: `${campaignProgress.total > 0 ? Math.min(100, Math.round(((campaignProgress.sent || 0) / campaignProgress.total) * 100)) : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Total</span>
                <div className="text-xl font-bold text-white mt-0.5">{campaignProgress.total || 0}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] font-semibold text-emerald-400 uppercase">Enviados</span>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">{campaignProgress.sent || 0}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] font-semibold text-rose-400 uppercase">Fallidos</span>
                <div className="text-xl font-bold text-rose-400 mt-0.5">{campaignProgress.failed || 0}</div>
              </div>
            </div>

            {/* Live Terminal Log Stream */}
            <div className="flex-1 flex flex-col min-h-0 mb-5">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                Registro en vivo de eventos:
              </label>
              <div className="flex-1 bg-black/90 p-3.5 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-y-auto max-h-48 space-y-1.5 shadow-inner">
                {(!campaignProgress.logs || campaignProgress.logs.length === 0) ? (
                  <div className="text-slate-600 italic">Iniciando envíos...</div>
                ) : (
                  campaignProgress.logs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                      <span className="text-purple-400">›</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              {campaignProgress.status === 'running' && (
                <button 
                  type="button"
                  onClick={handleStopCampaign}
                  className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <StopCircle size={14} /> Pausar / Detener Campaña
                </button>
              )}
              {campaignProgress.status !== 'running' && <div />}

              <button 
                type="button"
                onClick={() => setShowProgressModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Cerrar Monitor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: NUEVO / EDITAR ASIENTO CONTABLE              */}
      {/* ==================================================== */}
      {showEntryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEntryModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white font-heading mb-1 flex items-center gap-2">
              <Receipt className="text-emerald-400" size={22} />
              {editingEntryId ? 'Editar Asiento Contable' : 'Nuevo Asiento en Libro Diario'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Registra una operación financiera con partida doble y cálculo de impuestos.
            </p>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              
              {/* Row 1: Fecha y Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha del Asiento *</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs bg-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Movimiento *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEntryType('ingreso')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                        entryType === 'ingreso'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <ArrowUpRight size={14} /> Ingreso (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryType('egreso')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                        entryType === 'egreso'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <ArrowDownRight size={14} /> Egreso (-)
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Clasificación Contable */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Clasificación Contable *</label>
                <select
                  value={entryClassification}
                  onChange={(e) => setEntryClassification(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 font-semibold"
                  required
                >
                  <option value="activo">Activo (Caja, Banco, Cuentas por Cobrar, Inventarios, Equipos)</option>
                  <option value="pasivo">Pasivo (Cuentas por Pagar, Proveedores, Préstamos, Deudas)</option>
                  <option value="patrimonio">Patrimonio (Capital Social, Aportes, Reservas)</option>
                  <option value="nota_credito">Nota de Crédito (Devolución, Descuento sobre Venta/Compra)</option>
                  <option value="nota_debito">Nota de Débito (Recargo de precio, Intereses, Ajuste)</option>
                </select>
              </div>

              {/* Row 3: Referencia / Doc */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Documento de Referencia / Comprobante
                </label>
                <input
                  type="text"
                  value={entryReferenceDoc}
                  onChange={(e) => setEntryReferenceDoc(e.target.value)}
                  placeholder="ej. Factura F001-00342, Boleta B002-1200, Recibo 45"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>

              {/* Row 4: Descripción */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Concepto / Descripción del Asiento *
                </label>
                <input
                  type="text"
                  value={entryDescription}
                  onChange={(e) => setEntryDescription(e.target.value)}
                  placeholder="ej. Cobro de servicios de marketing, Compra de computadoras, etc."
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              {/* Row 5: Monto Base e Impuestos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monto Base Imponible ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={entryAmount}
                      onChange={(e) => setEntryAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full glass-input pl-7 pr-3 py-2.5 rounded-xl text-xs font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    % Impuesto (IGV / IVA)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={entryTaxPercentage}
                      onChange={(e) => setEntryTaxPercentage(e.target.value)}
                      placeholder="18"
                      className="w-full glass-input pr-7 pl-3 py-2.5 rounded-xl text-xs font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">%</span>
                  </div>
                </div>
              </div>

              {/* Live Preview calculation */}
              {entryAmount && !isNaN(parseFloat(entryAmount)) && parseFloat(entryAmount) > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Imponible:</span>
                    <span>${parseFloat(entryAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cyan-400">
                    <span>Impuesto ({parseFloat(entryTaxPercentage || 0)}%):</span>
                    <span>${((parseFloat(entryAmount) * parseFloat(entryTaxPercentage || 0)) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800 text-sm">
                    <span>Total del Asiento:</span>
                    <span className={entryType === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}>
                      ${(parseFloat(entryAmount) + ((parseFloat(entryAmount) * parseFloat(entryTaxPercentage || 0)) / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Row 6: Notas */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notas u Observaciones Adicionales
                </label>
                <textarea
                  rows="2"
                  value={entryNotes}
                  onChange={(e) => setEntryNotes(e.target.value)}
                  placeholder="Detalles sobre forma de pago, banco de transferencia, etc."
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEntryModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{editingEntryId ? 'Actualizar Asiento' : 'Guardar en Libro Diario'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CONFIGURACIÓN TRIBUTARIA & RENTA             */}
      {/* ==================================================== */}
      {showTaxModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowTaxModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white font-heading mb-1 flex items-center gap-2">
              <Percent className="text-amber-400" size={22} />
              Configuración Tributaria
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Configura tus tasas de impuestos para el Libro Diario y el cálculo de Impuesto a la Renta en el Balance Anual.
            </p>

            <form onSubmit={handleSaveTaxSettings} className="space-y-5">
              
              {/* 1. Tasa Default IVA / IGV */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Tasa por Defecto de IVA / IGV (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={taxFormDefault}
                    onChange={(e) => setTaxFormDefault(e.target.value)}
                    placeholder="18"
                    className="w-full glass-input pr-7 pl-3 py-2.5 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Se autocompletará en los nuevos asientos contables (ej. 18% Perú, 19% Chile/Colombia, 16% México).
                </p>
              </div>

              {/* 2. Régimen de Impuesto a la Renta */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-amber-300">
                  Impuesto a la Renta en Balance Anual
                </label>
                
                {/* Selector de modo */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTaxFormIncomeMode('percentage')}
                    className={`p-3 rounded-xl text-xs font-bold border transition-all text-left flex flex-col gap-1 ${
                      taxFormIncomeMode === 'percentage'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-wider">Modo Porcentaje (%)</span>
                    <span className="text-[10px] font-normal text-slate-300">Tasa fija calculada sobre utilidad</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaxFormIncomeMode('manual')}
                    className={`p-3 rounded-xl text-xs font-bold border transition-all text-left flex flex-col gap-1 ${
                      taxFormIncomeMode === 'manual'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-wider">Modo Monto Manual ($)</span>
                    <span className="text-[10px] font-normal text-slate-300">Detallado libremente por ti</span>
                  </button>
                </div>

                {/* Input según modo */}
                {taxFormIncomeMode === 'percentage' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Porcentaje de Impuesto a la Renta (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={taxFormIncomePercent}
                        onChange={(e) => setTaxFormIncomePercent(e.target.value)}
                        placeholder="29.5"
                        className="w-full glass-input pr-7 pl-3 py-2.5 rounded-xl text-xs font-mono font-bold"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Porcentaje que se deducirá de la Utilidad Antes de Impuestos (ej. 29.5% General, 10% MYPE).
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Monto Fijo de Impuesto a la Renta ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={taxFormIncomeManual}
                        onChange={(e) => setTaxFormIncomeManual(e.target.value)}
                        placeholder="0.00"
                        className="w-full glass-input pl-7 pr-3 py-2.5 rounded-xl text-xs font-mono font-bold"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Monto monetario exacto que se aplicará en el Balance Anual como provisión de Impuesto a la Renta.
                    </p>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTaxModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingTax}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check size={14} />
                  <span>{isSavingTax ? 'Guardando...' : 'Guardar Configuración'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
