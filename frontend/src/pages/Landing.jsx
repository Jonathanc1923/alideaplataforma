import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  Headphones, 
  BarChart3, 
  ChevronRight, 
  DollarSign, 
  Play, 
  Layers, 
  Building2, 
  ShoppingBag, 
  Stethoscope, 
  GraduationCap, 
  UtensilsCrossed, 
  Send, 
  Star,
  Package,
  CalendarCheck,
  CheckCircle,
  Award,
  Radio,
  Dumbbell,
  Scissors,
  Wrench,
  Hammer,
  Pill,
  Dog,
  Hotel,
  Scale,
  Briefcase,
  Boxes,
  Store,
  HelpCircle,
  Gift
} from 'lucide-react';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

export default function Landing() {
  // Interactive Simulator State
  const [botName, setBotName] = useState('Alidea Bot Asistente');
  const [simMessage, setSimMessage] = useState('');
  const [simChat, setSimChat] = useState([
    { sender: 'bot', text: '¡Hola! Bienvenido a Alidea 🚀. Automatizamos tus ventas en WhatsApp y organizamos tus clientes en un CRM inteligente.', time: '10:42 AM' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [kanbanStage, setKanbanStage] = useState('Nuevo Lead');
  const [simLeadTag, setSimLeadTag] = useState('Nuevo Lead');
  const [simCatalog, setSimCatalog] = useState([]);
  const [simCurrencySymbol, setSimCurrencySymbol] = useState('S/');
  const [simDelayMin, setSimDelayMin] = useState(2);
  const [simDelayMax, setSimDelayMax] = useState(5);
  const [simKeywords, setSimKeywords] = useState([]);

  // Tag & Stage progression score (No-downgrading rule)
  const getSimProgressionLevel = (t) => {
    if (!t) return 0;
    const l = t.toLowerCase();
    if (l.includes('ganad') || l.includes('cerrad') || l.includes('vip') || l.includes('comprador')) return 5;
    if (l.includes('caliente') || l.includes('negocia')) return 4;
    if (l.includes('cotiz') || l.includes('propuest') || l.includes('precio')) return 3;
    if (l.includes('catalogo') || l.includes('catálogo') || l.includes('producto') || l.includes('servicio')) return 2;
    if (l.includes('interesad') || l.includes('conversac') || l.includes('contacto')) return 1;
    return 0;
  };

  const updateSimTagAndStage = (newTag, newStage) => {
    if (newTag) {
      setSimLeadTag((prevTag) => {
        const prevLevel = getSimProgressionLevel(prevTag);
        const nextLevel = getSimProgressionLevel(newTag);
        return nextLevel >= prevLevel ? newTag : prevTag;
      });
    }
    if (newStage) {
      setKanbanStage((prevStage) => {
        const prevLevel = getSimProgressionLevel(prevStage);
        const nextLevel = getSimProgressionLevel(newStage);
        return nextLevel >= prevLevel ? newStage : prevStage;
      });
    }
  };

  // Load simulator configuration from backend
  useEffect(() => {
    const loadSimConfig = async () => {
      try {
        const res = await axios.get(`${API_BASE}/public/simulator-config`);
        if (res.data) {
          if (res.data.bot_name) setBotName(res.data.bot_name);
          if (res.data.welcome_message) {
            setSimChat([
              { sender: 'bot', text: res.data.welcome_message, time: 'Ahora' }
            ]);
          }
          if (Array.isArray(res.data.catalog)) setSimCatalog(res.data.catalog);
          if (res.data.currency_symbol) setSimCurrencySymbol(res.data.currency_symbol);
          if (res.data.delay_min !== undefined) setSimDelayMin(res.data.delay_min);
          if (res.data.delay_max !== undefined) setSimDelayMax(res.data.delay_max);
          if (Array.isArray(res.data.keywords)) setSimKeywords(res.data.keywords);
        }
      } catch (err) {
        console.warn('Usando configuración por defecto del simulador:', err.message);
      }
    };
    loadSimConfig();
  }, []);

  // ROI Calculator State
  const [monthlyChats, setMonthlyChats] = useState(600);
  const [averageTicket, setAverageTicket] = useState(80);

  const estimatedExtraSales = Math.round((monthlyChats * 0.15) * averageTicket);
  const hoursSaved = Math.round((monthlyChats * 4) / 60);

  const WHATSAPP_NUMBER = '51907318642';
  const WHATSAPP_BUY_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('¡Hola! Deseo adquirir el Paquete Completo de Alidea (S/ 350 Anual) con el curso de anuncios y consultar por las promociones y descuentos disponibles.')}`;
  const WHATSAPP_CONSULT_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, deseo más información y consultar promociones para mi negocio sobre la plataforma Alidea.')}`;

  const handleSimSend = async (textToSend) => {
    const text = textToSend || simMessage;
    if (!text.trim() || isTyping) return;

    const newChat = [...simChat, { sender: 'client', text, time: 'Ahora' }];
    setSimChat(newChat);
    setSimMessage('');
    setIsTyping(true);

    const minD = Math.max(1, parseInt(simDelayMin, 10) || 2);
    const maxD = Math.max(minD, parseInt(simDelayMax, 10) || 5);
    const simulatedDelayMs = (Math.floor(Math.random() * (maxD - minD + 1)) + minD) * 1000;

    const lower = text.toLowerCase().trim();
    const isCatalog = /(catalogo|cat[aá]logo|pedir cat[aá]logo|enviar cat[aá]logo|ver cat[aá]logo|productos|servicios|lista de precios|precios|menu|menú|carta)/i.test(lower);

    const getFormattedCatalog = () => {
      const items = simCatalog && simCatalog.length > 0 ? simCatalog : [
        { name: 'Plan Acceso Total Anual (Bot 24/7 + CRM)', price: '350.00', description: 'Sistema WhatsApp automático, CRM Kanban, Retargeting y Curso de Anuncios' },
        { name: 'Pack Anuncios Ganadores Meta & TikTok', price: '120.00', description: 'Estrategias y plantillas para captar clientes todos los días' },
        { name: 'Módulo de Facturación & Finanzas Pro', price: '99.00', description: 'Libro diario, mayor, balance y control de impuestos' }
      ];
      let msg = `📁 *CATÁLOGO DE PRODUCTOS & SERVICIOS:*\n\n`;
      items.forEach((p, idx) => {
        msg += `*${idx + 1}. ${p.name}* ➔ *${simCurrencySymbol || 'S/'} ${Number(p.price || 0).toFixed(2)}*\n${p.description ? `_${p.description}_\n` : ''}\n`;
      });
      msg += `¿Deseas cotizar o realizar un pedido de alguno de estos productos?`;
      return msg;
    };

    try {
      const [res] = await Promise.all([
        axios.post(`${API_BASE}/public/simulator-chat`, {
          message: text,
          history: newChat
        }),
        new Promise((resolve) => setTimeout(resolve, simulatedDelayMs))
      ]);

      setIsTyping(false);
      if (res.data && res.data.text) {
        let replyText = res.data.text;
        if (isCatalog && (!replyText.includes('1.') && !replyText.includes('➔') && !replyText.includes(simCurrencySymbol || 'S/'))) {
          replyText = getFormattedCatalog();
        }
        setSimChat([...newChat, { sender: 'bot', text: replyText, time: 'Ahora' }]);
        updateSimTagAndStage(res.data.assignedTag || (isCatalog ? 'Catálogo Enviado' : null), res.data.stage || (isCatalog ? 'Negociación' : null));
      }
    } catch(e) {
      await new Promise((resolve) => setTimeout(resolve, simulatedDelayMs));
      setIsTyping(false);

      let reply = 'Gracias por escribirnos. Nuestro equipo comercial de Alidea ya tiene tus datos registrados.';
      let newStage = 'En Conversación';
      let newTag = 'Interesado';

      if (isCatalog) {
        reply = getFormattedCatalog();
        newStage = 'Negociación';
        newTag = 'Catálogo Enviado';
      } else if (lower.includes('precio') || lower.includes('costo') || lower.includes('plan') || lower.includes('cuanto cuesta')) {
        reply = `💳 Contamos con el Plan Acceso Total Anual por solo ${simCurrencySymbol || 'S/'} 350 que incluye Bot 24/7, CRM Kanban, Retargeting Masivo y Curso de Anuncios en Meta y TikTok.`;
        newStage = 'Propuesta Enviada';
        newTag = 'Cotización Enviada';
      } else if (lower.includes('comprar') || lower.includes('cerrar') || lower.includes('asesor') || lower.includes('pedido') || lower.includes('adquirir')) {
        reply = '🎉 ¡Excelente decisión! Tu asesor asignado se pondrá en contacto contigo de inmediato al WhatsApp 907318642.';
        newStage = 'Cerrado / Ganado';
        newTag = 'Cerrado / Ganado';
      } else {
        for (const kw of simKeywords) {
          const list = (kw.keyword || '').toLowerCase().split(',').map(k => k.trim()).filter(Boolean);
          if (list.some(k => lower.includes(k))) {
            reply = kw.response;
            if (kw.stage) newStage = kw.stage;
            newTag = kw.stage || 'Interesado';
            break;
          }
        }
      }

      setSimChat([...newChat, { sender: 'bot', text: reply, time: 'Ahora' }]);
      updateSimTagAndStage(newTag, newStage);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#070c18]/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#070c18] rounded-[10px] flex items-center justify-center">
                <Bot className="text-indigo-400" size={24} />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300 font-heading">
                Alidea
              </span>
              <span className="hidden sm:inline-block ml-2.5 px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase tracking-wider">
                WhatsApp + CRM Suite
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#testimonios-top" className="hover:text-indigo-400 transition-colors">Casos de Éxito</a>
            <a href="#caracteristicas" className="hover:text-indigo-400 transition-colors">Módulos</a>
            <a href="#simulador" className="hover:text-indigo-400 transition-colors">Simulador</a>
            <a href="#industrias" className="hover:text-indigo-400 transition-colors">Sectores</a>
            <a href="#precios" className="hover:text-indigo-400 transition-colors">Plan & Precios</a>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href={WHATSAPP_BUY_LINK}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
            >
              <MessageSquare size={14} /> Chatear al 907318642
            </a>
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Ingresar</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[480px] bg-indigo-600/15 blur-[150px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[380px] h-[380px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-md">
            <Sparkles size={14} className="text-indigo-400 animate-pulse" />
            <span>La Plataforma #1 de Automatización Comercial para Todo Tipo de Negocio</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.08] mb-6 font-heading">
            Multiplica tus Ventas con <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
              Respuestas en WhatsApp 24/7
            </span> <br />
            y CRM de Clientes Integrado
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Atiende consultas al instante con audios de voz y catálogos, captura cada contacto en tu embudo Kanban y lanza campañas de retargeting masivo. <strong className="text-emerald-400">Incluye curso para generar anuncios rentables en Facebook, Instagram y TikTok.</strong>
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-14">
            <a 
              href={WHATSAPP_BUY_LINK}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-extrabold text-base shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} />
              <span>Comprar Paquete Completo (S/ 350)</span>
            </a>
            
            <a 
              href="#simulador" 
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <Play size={16} className="text-indigo-400" />
              <span>Probar Simulador en Vivo</span>
            </a>
          </div>

          {/* Hero Visual Showcase */}
          <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            <img 
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1600&auto=format&fit=crop&q=80" 
              alt="Atención Comercial y Ventas con Alidea"
              className="w-full h-72 sm:h-96 lg:h-[460px] object-cover filter brightness-[0.75] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070c18] via-transparent to-transparent"></div>

            {/* Floating Glassmorphism Badge 1 (WhatsApp) */}
            <div className="absolute top-6 left-6 sm:top-10 sm:left-10 p-4 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-emerald-500/40 text-left shadow-2xl max-w-xs hidden sm:block animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <Bot size={16} /> Bot WhatsApp Alidea Activo
              </div>
              <p className="text-xs text-slate-200 font-medium">"¡Hola! Te adjunto nuestro catálogo con precios y fotos..."</p>
              <span className="text-[10px] text-emerald-400 font-bold mt-1 block">✓ Enviado con simulación de audio y retardo</span>
            </div>

            {/* Floating Glassmorphism Badge 2 (CRM Deal) */}
            <div className="absolute bottom-8 right-6 sm:bottom-12 sm:right-10 p-4 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-indigo-500/40 text-left shadow-2xl max-w-xs animate-fade-in">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-white">Rodrigo Silva (Tech Store)</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">S/ 2,400</span>
              </div>
              <div className="text-[11px] text-indigo-300 font-semibold flex items-center gap-1">
                <TrendingUp size={12} /> Etapa: Negociación Cerrada
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. TESTIMONIOS Y CASOS DE ÉXITO (Digitales, Tienda Física y Empresas) */}
      <section id="testimonios-top" className="py-20 bg-slate-950/70 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              Historias de Éxito Reales
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-2 text-white font-heading">
              Negocios Digitales, Tiendas Físicas y Empresas que Escalaron con Alidea
            </h2>
            <p className="text-slate-400 text-sm">
              Casos reales de negocios que automatizaron su atención y multiplicaron sus ingresos mensuales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Caso Digital 1: Cursos Online e Infoproductos */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between border-slate-800/80 hover:border-indigo-500/40 transition-all bg-slate-900/80">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Negocio Digital
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-6 font-medium">
                  "Vendemos cursos online a toda Latinoamérica con anuncios en TikTok y Meta. Con el bot de Alidea respondiendo 24/7 y enviando temarios con audios simulados, <strong>escalamos de 40 a más de 120 ventas diarias en automático</strong>."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80" 
                  alt="Kevin Ramos" 
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
                <div>
                  <div className="font-bold text-white text-xs">Kevin Ramos</div>
                  <div className="text-[11px] text-indigo-400 font-medium">Academia Digital Pro</div>
                  <div className="text-[10px] text-emerald-400 font-bold">+120 ventas diarias automáticas</div>
                </div>
              </div>
            </div>

            {/* Caso Digital 2: Agencia de Servicios & Marketing */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between border-slate-800/80 hover:border-indigo-500/40 transition-all bg-slate-900/80">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Agencia Digital
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-6 font-medium">
                  "Manejamos clientes B2B. El embudo Kanban y el retargeting segmentado por etiquetas nos permitieron reactivar cotizaciones frías y <strong>cerrar un 45% más de propuestas comerciales</strong>."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80" 
                  alt="Lucía Salazar" 
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/40"
                />
                <div>
                  <div className="font-bold text-white text-xs">Lucía Salazar</div>
                  <div className="text-[11px] text-purple-400 font-medium">Growth Studio Digital</div>
                  <div className="text-[10px] text-emerald-400 font-bold">+45% propuestas cerradas</div>
                </div>
              </div>
            </div>

            {/* Caso Digital 3: E-commerce & Tienda Online Tech */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between border-slate-800/80 hover:border-indigo-500/40 transition-all bg-slate-900/80">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    E-Commerce Tech
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-6 font-medium">
                  "Lanzamos campañas de Facebook Ads directo al WhatsApp de Alidea. El catálogo integrado con fotos y respuestas inmediatas <strong>redujo el costo por cliente a la mitad</strong>."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" 
                  alt="Javier Paredes" 
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/40"
                />
                <div>
                  <div className="font-bold text-white text-xs">Javier Paredes</div>
                  <div className="text-[11px] text-emerald-400 font-medium">NextGen Tech Perú</div>
                  <div className="text-[10px] text-emerald-400 font-bold">-50% Costo de Adquisición</div>
                </div>
              </div>
            </div>

            {/* Caso 4: Tienda Física de Abarrotes y Minimarket */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between border-emerald-500/40 shadow-xl bg-slate-900/95">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Tienda Física de Abarrotes
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-6 font-medium">
                  "En nuestra tienda física los clientes nos escribían por WhatsApp y era un caos tomar pedidos. Ahora el bot manda la lista de abarrotes, ofertas del día y toma los pedidos de delivery en segundos. <strong>Aumentamos las ventas un 60% sin contratar más personal</strong>."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80" 
                  alt="Don Lucho" 
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-500/40"
                />
                <div>
                  <div className="font-bold text-white text-xs">Don Lucho (Minimarket)</div>
                  <div className="text-[11px] text-amber-400 font-medium">Abarrotes & Market San Martín</div>
                  <div className="text-[10px] text-emerald-400 font-bold">+60% en ventas por delivery</div>
                </div>
              </div>
            </div>

            {/* Caso 5: Moda y Retail */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between border-slate-800/80 hover:border-indigo-500/40 transition-all bg-slate-900/80">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Moda & Calzado
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-6 font-medium">
                  "Antes perdíamos clientes porque tardábamos horas en mandar el catálogo. Con Alidea el bot responde en 3 segundos con audios reales y fotos, y los organiza en el Kanban. Triplicamos ventas el primer mes."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" 
                  alt="Mariana Ríos" 
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
                <div>
                  <div className="font-bold text-white text-xs">Mariana Ríos</div>
                  <div className="text-[11px] text-indigo-400 font-medium">Directora, Moda Express</div>
                  <div className="text-[10px] text-emerald-400 font-bold">+180% ventas en WhatsApp</div>
                </div>
              </div>
            </div>

            {/* Caso 6: Inmobiliarias */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between border-slate-800/80 hover:border-emerald-500/40 transition-all bg-slate-900/80">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Inmobiliarias
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-6 font-medium">
                  "El bot envía fichas técnicas en PDF de inmediato y califica si el prospecto tiene presupuesto. Mi equipo solo habla con clientes listos para comprar."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" 
                  alt="Carlos Mendoza" 
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/40"
                />
                <div>
                  <div className="font-bold text-white text-xs">Carlos Mendoza</div>
                  <div className="text-[11px] text-emerald-400 font-medium">Inmobiliaria Horizonte</div>
                  <div className="text-[10px] text-emerald-400 font-bold">S/ 450,000 en cierres</div>
                </div>
              </div>
            </div>

            {/* Caso 7: Salud y Odontología */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between border-slate-800/80 hover:border-purple-500/40 transition-all bg-slate-900/80">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Clínica & Salud
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed mb-6 font-medium">
                  "El chat en vivo y los recordatorios de tareas son una maravilla. El bot agenda pacientes de madrugada y al día siguiente tenemos la agenda completa."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80" 
                  alt="Dra. Patricia Valdivia" 
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/40"
                />
                <div>
                  <div className="font-bold text-white text-xs">Dra. Patricia Valdivia</div>
                  <div className="text-[11px] text-purple-400 font-medium">Clínica Dental Sonrisas</div>
                  <div className="text-[10px] text-emerald-400 font-bold">+95 citas semanales</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. MÓDULOS DE ALIDEA */}
      <section id="caracteristicas" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              Todo en un Solo Lugar
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold mt-3 mb-4 text-white font-heading">
              La Suite Comercial Completa para tu Empresa
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              No necesitas contratar múltiples herramientas caras. Alidea unifica todas las operaciones de venta por WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: Bot WhatsApp */}
            <div className="glass-card-hover p-8 rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                <Bot size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading">Bot de WhatsApp Autónomo</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Respuestas 24/7 con simulación humana: tiempos de lectura y pausas aleatorias para una atención fluida y sin riesgos.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Vinculación por código QR en 10 segundos</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Audios de voz PTT, imágenes, videos y PDFs</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Secuencias de múltiples mensajes continuos</li>
              </ul>
            </div>

            {/* Feature 2: Bandeja de Chat en Vivo */}
            <div className="glass-card-hover p-8 rounded-3xl border-indigo-500/30">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading">Bandeja de Chat en Vivo</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Chatea con tus clientes en tiempo real desde la plataforma web sin tener que mirar el celular. Responde al instante.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-indigo-400" /> Conversaciones unificadas en pantalla</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-indigo-400" /> Envío directo a WhatsApp del cliente</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-indigo-400" /> Asignación de etiquetas en vivo con 1 clic</li>
              </ul>
            </div>

            {/* Feature 3: CRM Kanban */}
            <div className="glass-card-hover p-8 rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading">CRM de Ventas Kanban</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Cada mensaje entrante se convierte automáticamente en un lead. Mueve prospectos entre etapas y proyecta tus ventas.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-400" /> 6 Etapas comerciales con valor monetario</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-400" /> Totales en vivo segmentados por etiqueta</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-400" /> Exportación a Excel / CSV en un clic</li>
              </ul>
            </div>

            {/* Feature 4: Retargeting & Difusión */}
            <div className="glass-card-hover p-8 rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-6">
                <Radio size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading">Retargeting Masivo Segmentado</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Envía secuencias de mensajes y archivos multimedia a listas específicas de clientes según su etiqueta comercial.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-fuchsia-400" /> Filtros por etiquetas (VIP, Cotización, etc.)</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-fuchsia-400" /> Delays configurables y pausas por lotes</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-fuchsia-400" /> Monitoreo de progreso y tasa de entrega</li>
              </ul>
            </div>

            {/* Feature 5: Catálogo y Pedidos */}
            <div className="glass-card-hover p-8 rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
                <Package size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading">Catálogo de Productos y Pedidos</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Gestiona tus productos con fotos, precios y stock. Genera pedidos o cotizaciones formales para enviar al cliente por WhatsApp.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-rose-400" /> Catálogo visual con fotos y categorías</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-rose-400" /> Creación de órdenes y cálculo de totales</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-rose-400" /> Envío de resumen con 1 clic a WhatsApp</li>
              </ul>
            </div>

            {/* Feature 6: Tareas y Recordatorios */}
            <div className="glass-card-hover p-8 rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
                <CalendarCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading">Tareas y Recordatorios</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Programa llamadas, envíos de cotizaciones y seguimientos con fecha, hora y nivel de prioridad para nunca olvidar un cliente.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-400" /> Vinculación directa con cada lead</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-400" /> Filtros por tareas pendientes y completadas</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-400" /> Alertas visuales de prioridad alta</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SIMULADOR INTERACTIVO */}
      <section id="simulador" className="py-20 bg-slate-950/70 border-y border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              Demostración en Vivo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-2 text-white font-heading">
              Prueba la Simulación de Atención y CRM
            </h2>
            <p className="text-slate-400 text-sm">
              Escribe cualquier mensaje de prueba en el chat y observa cómo el bot responde y sincroniza el embudo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            
            {/* WhatsApp Phone Mockup (Left: 6 cols) */}
            <div className="lg:col-span-6 bg-[#121b22] rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[520px]">
              <div className="bg-[#202c33] px-4 py-3.5 flex items-center gap-3 border-b border-slate-700/60">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-base">
                  A
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{botName}</div>
                  <div className="text-[11px] text-emerald-400 font-medium">en línea las 24 horas</div>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a]">
                {simChat.map((m, idx) => (
                  <div key={idx} className={`flex ${m.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                      m.sender === 'client' 
                        ? 'bg-[#005c4b] text-white rounded-tr-none' 
                        : 'bg-[#202c33] text-slate-200 rounded-tl-none border border-slate-700/40'
                    }`}>
                      <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                      <span className="text-[9px] text-slate-400 block text-right mt-1">
                        {m.time} {m.sender === 'client' && '✓✓'}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#202c33] rounded-2xl rounded-tl-none px-4 py-2 text-xs text-slate-400 flex items-center gap-2 border border-slate-700/40">
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                      <span>Simulando escritura humana...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-2 overflow-x-auto text-xs">
                <button 
                  onClick={() => handleSimSend('¿Qué precio tienen los planes?')} 
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 whitespace-nowrap transition-colors"
                >
                  💰 Preguntar Precios
                </button>
                <button 
                  onClick={() => handleSimSend('Envíame el catálogo de productos')} 
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 whitespace-nowrap transition-colors"
                >
                  📁 Pedir Catálogo
                </button>
                <button 
                  onClick={() => handleSimSend('Quiero cerrar un pedido con un asesor')} 
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 whitespace-nowrap transition-colors"
                >
                  🤝 Hablar con Asesor
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                <input 
                  type="text" 
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSimSend()}
                  placeholder="Escribe un mensaje de prueba..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button 
                  onClick={() => handleSimSend()}
                  disabled={isTyping}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>

            {/* CRM Kanban Card Sync (Right: 6 cols) */}
            <div className="lg:col-span-6 flex flex-col h-[520px] justify-between">
              <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-emerald-400" size={20} />
                    <h3 className="font-bold text-white text-lg font-heading">Ficha en tu Embudo CRM</h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Lead Capturado
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Cada consulta se registra automáticamente. Mira cómo se actualiza la tarjeta según avanza la conversación:
                </p>

                {/* Simulated Kanban Card */}
                <div className="p-5 rounded-2xl bg-slate-950/90 border border-indigo-500/40 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400"></div>
                  
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">Prospecto Web</h4>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 shadow-sm">
                          🏷️ {simLeadTag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">+51 987 654 321 • Origen: WhatsApp</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                        {simCurrencySymbol} 350
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="text-xs font-medium text-slate-400 mb-2 flex justify-between">
                      <span>Etapa Actual:</span>
                      <strong className="text-indigo-400 font-bold">{kanbanStage}</strong>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
                      <div className={`p-2 rounded-lg transition-all ${kanbanStage === 'Nuevo Lead' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400'}`}>
                        1. Nuevo Lead
                      </div>
                      <div className={`p-2 rounded-lg transition-all ${kanbanStage === 'En Conversación' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400'}`}>
                        2. Contacto
                      </div>
                      <div className={`p-2 rounded-lg transition-all ${kanbanStage === 'Propuesta Enviada' || kanbanStage === 'Negociación' ? 'bg-purple-600 text-white shadow' : 'bg-slate-800 text-slate-400'}`}>
                        3. Propuesta
                      </div>
                      <div className={`p-2 rounded-lg transition-all ${kanbanStage === 'Cerrado / Ganado' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-400'}`}>
                        4. Ganado 🎉
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                    <span className="truncate">
                      Último mensaje: <em className="text-slate-400">"{simChat[simChat.length - 1].text}"</em>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Auto-Guardado</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="text-indigo-400 font-bold text-sm flex items-center gap-2 mb-1">
                    <Zap size={16} /> Respuestas en Segundos
                  </div>
                  <p className="text-xs text-slate-400">
                    Tu bot califica al cliente y entrega respuestas multimedia mientras descansas.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="text-emerald-400 font-bold text-sm flex items-center gap-2 mb-1">
                    <TrendingUp size={16} /> Aumento en Ventas
                  </div>
                  <p className="text-xs text-slate-400">
                    Tu equipo toma el control con un clic directo a WhatsApp cuando el lead está listo.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 6. INDUSTRIAS Y 16+ SECTORES COMERCIALES + TARJETA UNIVERSAL */}
      <section id="industrias" className="py-24 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
              Solución 100% Universal
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold mt-3 mb-4 text-white font-heading">
              Adaptable a Todo Tipo de Negocios y Servicios
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Alidea potencia las ventas de comercios, tiendas físicas, empresas de servicios y negocios digitales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            
            {/* 1. Tiendas de Abarrotes y Minimarkets */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <Store size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Tienda Física de Abarrotes & Minimarkets</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Envío automático de lista de productos, ofertas del día, toma de pedidos para delivery y confirmación de pago.
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 mt-4 block">✓ Pedidos rápidos sin esperas</span>
            </div>

            {/* 2. E-commerce & Tiendas de Ropa */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-indigo-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Moda, Calzado & Tiendas Online</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Envío de fotos de prendas, tallas, catálogo PDF y carrito de compras directo a WhatsApp.
                </p>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 mt-4 block">✓ Catálogo y tallas 24/7</span>
            </div>

            {/* 3. Inmobiliarias */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-sky-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition-transform">
                  <Building2 size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Inmobiliarias & Bienes Raíces</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Envío instantáneo de fichas técnicas en PDF, planos, ubicación GPS y agendamiento de visitas.
                </p>
              </div>
              <span className="text-[10px] font-bold text-sky-400 mt-4 block">✓ Fichas y planos en PDF</span>
            </div>

            {/* 4. Clínicas y Salud */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-purple-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                  <Stethoscope size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Clínicas, Médicos & Dentistas</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Agendamiento automático de citas, precios de consultas y recordatorios de asistencia por WhatsApp.
                </p>
              </div>
              <span className="text-[10px] font-bold text-purple-400 mt-4 block">✓ Recordatorio de citas</span>
            </div>

            {/* 5. Restaurantes y Delivery */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-amber-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                  <UtensilsCrossed size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Restaurantes, Pizzerías & Cafeterías</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Envío de carta/menú del día, toma de pedidos con dirección de envío y reservas de mesas.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-400 mt-4 block">✓ Carta interactiva y delivery</span>
            </div>

            {/* 6. Gimnasios y Fitness */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-rose-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                  <Dumbbell size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Gimnasios, Fitness & Entrenadores</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Información de membresías, horarios de clases, promociones mensuales y pase de prueba gratis.
                </p>
              </div>
              <span className="text-[10px] font-bold text-rose-400 mt-4 block">✓ Membresías y horarios</span>
            </div>

            {/* 7. Salones de Belleza y Spas */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-pink-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                  <Scissors size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Salones de Belleza, Barberías & Spa</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Catálogo de servicios, precios de tintes/cortes, agendamiento de turnos y promociones 2x1.
                </p>
              </div>
              <span className="text-[10px] font-bold text-pink-400 mt-4 block">✓ Reserva de turnos online</span>
            </div>

            {/* 8. Talleres Mecánicos y Repuestos */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-orange-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                  <Wrench size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Talleres Mecánicos & Repuestos</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cotización de repuestos por modelo/marca de auto, citas de mantenimiento y diagnósticos.
                </p>
              </div>
              <span className="text-[10px] font-bold text-orange-400 mt-4 block">✓ Cotización por modelo</span>
            </div>

            {/* 9. Academias y Cursos Online */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-blue-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Academias, Cursos & Educación</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Envío de temarios, costos de matrícula, audios explicativos del docente y links de pago.
                </p>
              </div>
              <span className="text-[10px] font-bold text-blue-400 mt-4 block">✓ Temarios y matrículas</span>
            </div>

            {/* 10. Ferreterías y Construcción */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-amber-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                  <Hammer size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Ferreterías & Construcción</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cotizaciones de materiales por mayor, fichas técnicas de herramientas y despacho a obra.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-400 mt-4 block">✓ Cotizaciones por volumen</span>
            </div>

            {/* 11. Farmacias y Boticas */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-teal-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                  <Pill size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Farmacias & Boticas</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Consulta de stock de medicamentos, recepción de recetas médicas y pedidos a domicilio.
                </p>
              </div>
              <span className="text-[10px] font-bold text-teal-400 mt-4 block">✓ Consulta de stock express</span>
            </div>

            {/* 12. Veterinarias y Mascotas */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <Dog size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Veterinarias & Pet Shops</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Citas de baño y vacunación, catálogo de alimentos y accesorios para mascotas.
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 mt-4 block">✓ Citas y alimentos</span>
            </div>

            {/* 13. Hoteles y Turismo */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-cyan-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                  <Hotel size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Hoteles, Alojamientos & Turismo</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tarifas por noche, fotos de habitaciones, paquetes turísticos y confirmación de reserva.
                </p>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 mt-4 block">✓ Tarifas y paquetes</span>
            </div>

            {/* 14. Estudios Contables y Legales */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-indigo-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  <Scale size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Estudios Contables & Jurídicos</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Recepción de consultas, requisitos para constitución de empresas y agendamiento de asesorías.
                </p>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 mt-4 block">✓ Calificación y citas</span>
            </div>

            {/* 15. Agencias de Marketing & B2B */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-violet-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                  <Briefcase size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Agencias & Servicios B2B</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Calificación de prospectos, envío de portafolio y propuesta comercial en PDF al instante.
                </p>
              </div>
              <span className="text-[10px] font-bold text-violet-400 mt-4 block">✓ Portafolio y cierre</span>
            </div>

            {/* 16. Distribuidores y Mayoristas */}
            <div className="glass-panel p-5 rounded-3xl border-slate-800 hover:border-yellow-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mb-4 group-hover:scale-110 transition-transform">
                  <Boxes size={24} />
                </div>
                <h4 className="font-bold text-white text-base mb-1">Venta Mayorista & Distribuidores</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Listas de precios por volumen, toma de pedidos por caja/bulto y facturación rápida.
                </p>
              </div>
              <span className="text-[10px] font-bold text-yellow-400 mt-4 block">✓ Precios mayoristas</span>
            </div>

          </div>

          {/* 17. TARJETA UNIVERSAL ABIERTA PARA CUALQUIER NEGOCIO */}
          <div className="mt-8 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-emerald-950/90 border-2 border-indigo-500/50 shadow-2xl text-center relative overflow-hidden">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow">
                <Sparkles size={14} /> 100% Adaptable y Personalizable
              </div>
              
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-heading">
                ¿Tu rubro o tipo de negocio es diferente? ¡Funciona para Absolutamente Cualquier Giro!
              </h3>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                No importa qué producto vendas ni qué servicio ofrezcas. Si tus clientes te escriben por WhatsApp para pedir precios, fotos, cotizaciones, información o hacer pedidos, <strong>Alidea se adapta a la medida exacta de tu negocio en minutos</strong>.
              </p>

              <div className="pt-2">
                <a 
                  href={WHATSAPP_CONSULT_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-bold text-sm shadow-xl hover:scale-105 transition-all"
                >
                  <MessageSquare size={16} />
                  <span>Consultar cómo aplicarlo a mi negocio (WhatsApp 907318642)</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. CALCULADORA DE ROI */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <div className="text-center mb-10">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                Calculadora de Impacto
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 mb-2 text-white font-heading">
                Calcula cuánto dinero extra ganarás con Alidea
              </h2>
              <p className="text-slate-400 text-sm">
                Al responder en segundos y organizar cada contacto en tu CRM, tus ventas aumentan entre un 15% y 30%.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">
                  Mensajes de WhatsApp recibidos al mes: <span className="text-indigo-400 font-bold">{monthlyChats}</span>
                </label>
                <input 
                  type="range" 
                  min="100" 
                  max="3000" 
                  step="50" 
                  value={monthlyChats}
                  onChange={(e) => setMonthlyChats(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>100 chats</span>
                  <span>1,500 chats</span>
                  <span>3,000+ chats</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">
                  Ticket promedio por cliente (S/): <span className="text-emerald-400 font-bold">S/ {averageTicket}</span>
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="500" 
                  step="10" 
                  value={averageTicket}
                  onChange={(e) => setAverageTicket(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>S/ 10</span>
                  <span>S/ 250</span>
                  <span>S/ 500</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div>
                <div className="text-3xl sm:text-5xl font-extrabold text-emerald-400 font-heading">
                  +S/ {estimatedExtraSales.toLocaleString()} <span className="text-sm font-medium text-slate-400">/ mes</span>
                </div>
                <div className="text-xs text-slate-300 mt-2 font-medium">
                  Ventas adicionales estimadas gracias a respuesta rápida y seguimiento CRM
                </div>
              </div>
              <div className="sm:border-l sm:border-slate-800 pt-4 sm:pt-0">
                <div className="text-3xl sm:text-5xl font-extrabold text-indigo-400 font-heading">
                  ~{hoursSaved} <span className="text-sm font-medium text-slate-400">horas/mes</span>
                </div>
                <div className="text-xs text-slate-300 mt-2 font-medium">
                  Tiempo ahorrado al responder preguntas repetitivas y enviar catálogos
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <a 
                href={WHATSAPP_BUY_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:scale-105 transition-all"
              >
                <MessageSquare size={16} />
                <span>Comenzar a Automatizar Ahora por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ÚNICO PLAN ANUAL S/ 350 CON CURSO DE ANUNCIOS */}
      <section id="precios" className="py-24 bg-slate-950/80 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              Oferta Todo Incluido
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold mt-3 mb-4 text-white font-heading">
              Plan Acceso Total Anual
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Un único pago al año. Acceso completo a toda la suite tecnológica + Curso Profesional de Publicidad Digital.
            </p>
          </div>

          <div className="glass-panel p-8 sm:p-12 rounded-3xl border-2 border-indigo-500/60 shadow-[0_0_50px_rgba(99,102,241,0.2)] relative bg-slate-900/95 overflow-hidden">
            
            {/* Top Ribbon Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-teal-500 text-white text-xs font-bold px-6 py-2 rounded-bl-2xl uppercase tracking-wider shadow">
              ★ Paquete Completo + Curso Incluido
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Price & Value (5 cols) */}
              <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Suscripción Todo Incluido</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-1">
                    Ecosistema Comercial Alidea
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Sin mensualidades sorpresa. Acceso total por 1 año completo para hacer crecer tu negocio.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center lg:text-left">
                  <div className="text-xs text-slate-400 line-through">Precio Regular: S/ 890</div>
                  <div className="flex items-baseline justify-center lg:justify-start gap-2 mt-1">
                    <span className="text-5xl sm:text-6xl font-black text-emerald-400 font-heading">S/ 350</span>
                    <span className="text-sm font-bold text-slate-300">/ único pago anual</span>
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-1 font-semibold">
                    ✓ Equivale a menos de S/ 1 al día
                  </div>
                </div>

                {/* Promo notice box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-left">
                  <div className="flex items-start gap-2.5">
                    <Gift className="text-amber-400 shrink-0 mt-0.5" size={18} />
                    <div className="text-xs">
                      <strong className="text-amber-300 font-bold block">¿Consultar Descuentos o Promociones Especiales?</strong>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        Escríbenos directamente al WhatsApp <strong>907318642</strong> para consultar promociones y formas de pago (Yape, Plin, Transferencia o Tarjeta).
                      </p>
                    </div>
                  </div>
                </div>

                <a 
                  href={WHATSAPP_BUY_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 text-center rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={18} />
                  <span>Comprar Paquete por WhatsApp (S/ 350)</span>
                </a>
              </div>

              {/* Right Column: Full Feature Breakdown + Ads Course (7 cols) */}
              <div className="lg:col-span-7 bg-slate-950/70 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                <div>
                  <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="text-emerald-400" size={18} />
                    Todo lo que incluye tu acceso:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>WhatsApp Bot 24/7</strong> con multi-respuestas y pausas humanas</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Multimedia ilimitada:</strong> Audios PTT, fotos, videos y catálogos PDF</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>CRM de Ventas Kanban</strong> con embudos y sincronización automática</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Bandeja de Chat en Vivo</strong> multi-agente en tiempo real</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Retargeting Masivo</strong> segmentado por etiquetas y con seguridad anti-bloqueo</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Catálogo de Productos</strong> y creador de órdenes/pedidos por WhatsApp</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Gestor de Tareas</strong> y recordatorios comerciales con prioridades</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Exportación a Excel / CSV</strong> y soporte dedicado</span>
                    </div>
                  </div>
                </div>

                {/* Course Highlight Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/90 to-purple-950/80 border border-indigo-500/40 relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                      <GraduationCap size={22} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
                        ★ Módulo Formativo Exclusivo Incluido
                      </div>
                      <h5 className="font-extrabold text-white text-sm">
                        Curso: Configuración de Anuncios Directos y Rentables en Redes Sociales
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Aprende paso a paso desde cero a pautar anuncios que venden en <strong>Facebook Ads, Instagram Ads y TikTok Ads</strong> directo a tu WhatsApp. No más presupuesto desperdiciado en curiosos: aprenderás a segmentar clientes calificados y con dinero en mano listos para comprar.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 9. FINAL CTA BANNER */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-indigo-900/80 via-slate-900/90 to-emerald-950/80 border border-indigo-500/30 text-center relative shadow-2xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 font-heading">
              ¿Listo para que tu negocio nunca deje de vender?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Únete a las empresas y emprendimientos que automatizan su atención con Alidea. Respuestas inmediatas, clientes organizados y más ventas cerradas todos los días.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href={WHATSAPP_BUY_LINK}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-9 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-base shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                <span>Comprar Paquete Completo (S/ 350)</span>
              </a>
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-base border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Acceso Clientes</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-[#050811] border-t border-slate-800/80 py-12 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-bold text-white text-base">Alidea</span>
            <span className="text-xs text-slate-500">| Plataforma de Automatización WhatsApp & CRM</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <a href="#testimonios-top" className="hover:text-white transition-colors">Casos de Éxito</a>
            <a href="#caracteristicas" className="hover:text-white transition-colors">Módulos</a>
            <a href="#simulador" className="hover:text-white transition-colors">Simulador</a>
            <a href="#industrias" className="hover:text-white transition-colors">Sectores</a>
            <a href="#precios" className="hover:text-white transition-colors">Plan S/ 350</a>
            <a href={WHATSAPP_CONSULT_LINK} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">WhatsApp: 907318642</a>
          </div>

          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} Alidea. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* 11. BOTÓN FLOTANTE DE WHATSAPP EN TODA LA PÁGINA DE INICIO */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <a 
          href={WHATSAPP_BUY_LINK}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-3 p-3.5 sm:px-5 sm:py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:scale-110 active:scale-95 transition-all border border-emerald-400/40"
          title="Chatear por WhatsApp para comprar o consultar promociones"
        >
          <div className="relative">
            <MessageSquare size={22} className="text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
          </div>
          <span className="hidden sm:inline font-bold text-xs">
            ¿Dudas o Comprar? Chatea al 907318642
          </span>
        </a>
      </div>

    </div>
  );
}
