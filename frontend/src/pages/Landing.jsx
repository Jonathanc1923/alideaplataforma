import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  ShieldCheck, 
  Lock, 
  Award, 
  QrCode, 
  Laptop, 
  Star, 
  Camera, 
  Share2, 
  Layers, 
  ChevronRight, 
  Clock, 
  Users, 
  BadgePercent, 
  Check, 
  Smartphone, 
  ExternalLink,
  MessageCircle,
  HelpCircle,
  PlayCircle,
  BookOpen,
  Download,
  CheckCircle,
  Play,
  FileText
} from 'lucide-react';

export default function Landing() {
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('yape'); // 'yape' | 'tarjeta' | 'wsp'

  // Smooth scroll handler
  const scrollToOffer = () => {
    const el = document.getElementById('oferta');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCheckoutModalOpen(true);
    }
  };

  const handleOpenCheckout = () => {
    setCheckoutModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070c18] text-[#f3f6fc] font-sans selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/15 via-teal-500/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -right-40 w-[550px] h-[550px] bg-gradient-to-bl from-emerald-500/15 via-cyan-500/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-[700px] h-[500px] bg-gradient-to-t from-blue-700/10 via-indigo-600/10 to-transparent rounded-full blur-[160px]" />
      </div>

      {/* TOP NOTIFICATION / URGENCY BAR */}
      <div className="relative z-50 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-b border-emerald-500/20 py-2.5 px-4 text-center text-xs sm:text-sm font-medium text-emerald-300 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>⚡ <strong>Convocatoria Abierta:</strong> Precio promocional de prelanzamiento por tiempo limitado (Solo S/ 49).</span>
          <button 
            onClick={scrollToOffer}
            className="hidden sm:inline-flex items-center gap-1 text-emerald-200 hover:text-white underline ml-2 cursor-pointer font-semibold"
          >
            Asegurar mi cupo <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#070c18]/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
              <div className="w-full h-full bg-[#090f20] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-heading">
                ALIDEA <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-extrabold">ACADEMIA</span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase block -mt-1">
                Formación en Inteligencia Artificial & Ventas
              </span>
            </div>
          </a>

          {/* Nav links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#problema" className="hover:text-emerald-400 transition-colors">¿Para quién es?</a>
            <a href="#metodo" className="hover:text-emerald-400 transition-colors">El Método</a>
            <a href="#curriculum" className="hover:text-emerald-400 transition-colors">Módulos</a>
            <a href="#certificacion" className="hover:text-emerald-400 transition-colors">Certificación</a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={scrollToOffer}
              className="relative group overflow-hidden rounded-xl p-px font-semibold text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 group-hover:opacity-100 transition-opacity" />
              <span className="relative px-5 py-2.5 rounded-[11px] bg-[#091024] group-hover:bg-[#091024]/80 flex items-center gap-2 text-white font-medium transition-all">
                <span>Inscribirme (S/ 49)</span>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          1. HERO SECTION
          ======================================================== */}
      <section className="relative z-10 pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          
          {/* Badge Superior */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold mb-8 shadow-lg shadow-emerald-950/50 backdrop-blur-md animate-fade-in">
            <span>🔥 Nivel: Principiantes | 100% Práctico</span>
          </div>

          {/* H1 Principal */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[64px] font-extrabold tracking-tight text-white leading-[1.12] mb-6 max-w-5xl mx-auto font-heading">
            Conviértete en <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Especialista en Creación de Negocios Digitales</span> con Inteligencia Artificial
          </h1>

          {/* Subtítulo */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
            Deja de perder ventas por no saber de tecnología. Aprende a crear tu marca, diseñar publicidad de nivel profesional y lanzar campañas rentables en redes sociales usando IA. <span className="text-white font-semibold">Sin saber programar y sin pagar agencias caras.</span>
          </p>

          {/* CTA Principal y Prueba Social */}
          <div className="flex flex-col items-center justify-center gap-4 mb-16">
            <button
              onClick={scrollToOffer}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-base sm:text-lg tracking-wide shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-1 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 border border-emerald-300/40"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>¡Quiero ingresar al curso hoy! (Solo S/ 49)</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>

            {/* Prueba Social */}
            <div className="flex items-center gap-2 text-sm text-slate-300 pt-2 font-medium">
              <div className="flex text-amber-400 text-base">
                ⭐⭐⭐⭐⭐
              </div>
              <span className="text-slate-200 font-semibold">Más de 500 emprendedores ya están vendiendo.</span>
            </div>
          </div>

          {/* MOCKUP VISUAL (Laptop con Aula Virtual del Curso + Certificado Digital) */}
          <div className="relative mx-auto max-w-5xl">
            {/* Glow Aura */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-cyan-500/20 to-blue-600/30 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

            {/* Laptop Frame Mockup */}
            <div className="relative rounded-2xl border border-slate-700/80 bg-[#0c1326] shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl">
              
              {/* Window Bar */}
              <div className="h-10 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-xs text-slate-400 font-mono flex items-center gap-2 bg-slate-950/60 px-4 py-1 rounded-md border border-slate-800">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>academia.alidea.pe/curso-especialista-ia</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Aula Virtual Activa</span>
                </div>
              </div>

              {/* Course Platform Mockup Content */}
              <div className="p-4 sm:p-8 bg-gradient-to-b from-[#090f20] to-[#070c18] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left">
                
                {/* Panel Izquierdo: Reproductor de Clases y Materiales */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Video Lesson Screen */}
                  <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl aspect-video flex flex-col justify-between p-4 group">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        Clase 02 • En Vivo / Grabada
                      </span>
                      <span className="text-slate-400">Duración: 24m 15s</span>
                    </div>

                    {/* Center Play Button Graphic */}
                    <div className="self-center flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 ml-0.5 fill-current" />
                      </div>
                      <span className="text-xs font-bold text-white tracking-wide">
                        "Creación de Fotos Hiper-Realistas con Prompts de IA"
                      </span>
                    </div>

                    {/* Video Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full w-[68%]" />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>16:30 / 24:15</span>
                        <span className="text-emerald-400 font-medium">100% Práctico</span>
                      </div>
                    </div>
                  </div>

                  {/* Modules Syllabus Checklist inside Course */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300 truncate">Módulo 1: Identidad & Nicho IA</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                      <span className="text-emerald-200 truncate font-semibold">Módulo 2: Estudio de Fotos</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-400 truncate">Módulo 3: Anuncios en Redes</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center gap-2">
                      <Download className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-slate-300 truncate">Recurso: Plantillas de Prompts</span>
                    </div>
                  </div>

                </div>

                {/* Panel Derecho: Preview del Certificado Digital del Curso */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-xl p-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 shadow-2xl shadow-amber-500/10">
                    
                    {/* Certificate Top Banner */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">Certificado del Curso</span>
                      </div>
                      <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <QrCode className="w-3 h-3" /> Verificable
                      </div>
                    </div>

                    {/* Certificate Content Preview */}
                    <div className="space-y-2 text-center py-2">
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Alidea Academia Certifica que:</div>
                      <div className="text-base font-bold text-white font-heading underline decoration-amber-400/50 underline-offset-4">
                        Tu Nombre Aquí
                      </div>
                      <p className="text-xs text-slate-300 leading-tight">
                        Ha completado satisfactoriamente los módulos del programa práctico:
                      </p>
                      <div className="py-1 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                        Especialista en Creación de Negocios Digitales con IA
                      </div>
                    </div>

                    {/* Certificate Footer Mockup */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <div>
                        <span className="block font-mono text-slate-300">Folio: ALD-2026-X99</span>
                        <span className="text-[9px] text-emerald-400">Estado: Emitido al Culminar</span>
                      </div>
                      <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          2. SECCIÓN DE PROBLEMA / AGITACIÓN (Fondo ligeramente más claro)
          ======================================================== */}
      <section id="problema" className="relative z-10 py-20 bg-slate-900/50 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-red-400 bg-red-950/40 border border-red-800/40 px-3 py-1 rounded-full inline-block mb-4">
              La Cruda Realidad del Emprendedor
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-heading">
              ¿Sientes que tu negocio está estancado porque no dominas lo digital?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mt-4">
              El 92% de los dueños de negocios cometen los mismos 3 errores desgastantes antes de aprender a utilizar la Inteligencia Artificial.
            </p>
          </div>

          {/* 3 Tarjetas con Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Tarjeta 1 */}
            <div className="rounded-2xl p-6 sm:p-8 bg-slate-900/70 border border-slate-800/90 hover:border-red-500/40 transition-all duration-300 backdrop-blur-xl shadow-xl hover:shadow-red-500/5 group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform">
                  <XCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Diseño Amateur y Agotamiento
                </h3>
                <p className="text-slate-300 text-base leading-relaxed">
                  "Pierdes horas intentando diseñar en Canva y se ve poco profesional."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 font-medium">
                ❌ Pierdes tiempo que deberías usar en vender.
              </div>
            </div>

            {/* Tarjeta 2 */}
            <div className="rounded-2xl p-6 sm:p-8 bg-slate-900/70 border border-slate-800/90 hover:border-amber-500/40 transition-all duration-300 backdrop-blur-xl shadow-xl hover:shadow-amber-500/5 group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Tráfico de Pésima Calidad
                </h3>
                <p className="text-slate-300 text-base leading-relaxed">
                  "Tus campañas de Facebook solo traen curiosos que preguntan 'precio' y no compran."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 font-medium">
                ❌ Gastas presupuesto publicitario sin retorno real.
              </div>
            </div>

            {/* Tarjeta 3 */}
            <div className="rounded-2xl p-6 sm:p-8 bg-slate-900/70 border border-slate-800/90 hover:border-red-500/40 transition-all duration-300 backdrop-blur-xl shadow-xl hover:shadow-red-500/5 group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform">
                  <BadgePercent className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Agencias Excesivamente Costosas
                </h3>
                <p className="text-slate-300 text-base leading-relaxed">
                  "Pagarle a una agencia de marketing te deja sin margen de ganancia."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 font-medium">
                ❌ Dependes de terceros que no entienden tu producto.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          3. SECCIÓN DE SOLUCIÓN / LA ACADEMIA (El alivio)
          ======================================================== */}
      <section id="metodo" className="relative z-10 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          <div className="rounded-3xl p-8 sm:p-12 md:p-16 bg-gradient-to-br from-slate-900/90 via-[#0a1226]/80 to-slate-900/90 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            
            {/* Subtle decorative glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-4 py-1.5 rounded-full inline-block">
                El Alivio para tu Negocio
              </span>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight font-heading">
                El método definitivo para dueños de negocio.
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-slate-200 leading-relaxed font-normal">
                No necesitas un título universitario de 5 años. Necesitas resultados hoy. <strong className="text-emerald-400">Alidea Academia</strong> ha diseñado un programa 100% práctico donde tú mismo construirás la presencia digital y las ventas de tu negocio en un fin de semana.
              </p>

              {/* 3 Pilares Rápido */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" /> 0% Código
                  </div>
                  <p className="text-xs text-slate-400">Todo con herramientas visuales guiadas paso a paso.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" /> 100% Práctico
                  </div>
                  <p className="text-xs text-slate-400">Implementas directamente sobre tu negocio real.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" /> En 1 Fin de Semana
                  </div>
                  <p className="text-xs text-slate-400">Sin teoría aburrida ni rellenos innecesarios.</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          4. SECCIÓN DE CURRÍCULUM (Tarjetas modernas con efecto hover)
          ======================================================== */}
      <section id="curriculum" className="relative z-10 py-20 bg-slate-950/60 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-full inline-block mb-4">
              Plan de Estudios Acelerado
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-heading">
              Currículum de Alta Conversión
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mt-4">
              Tres módulos directos al grano estructurados para que pases de principiante a especialista operativo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Módulo 1 */}
            <div className="rounded-2xl p-7 bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-emerald-500/10 group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold font-mono tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-lg">
                    MÓDULO 01
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                  La Creación de tu Marca con IA
                </h3>

                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Encuentra tu nicho, crea tu logo y define a tu cliente en minutos.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Identidad visual profesional con generadores IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Segmentación y arquetipo del cliente ideal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Propuesta única de valor irresistible</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 100% Práctico</span>
                <span className="text-emerald-400 font-semibold">Paso a Paso</span>
              </div>
            </div>

            {/* Módulo 2 */}
            <div className="rounded-2xl p-7 bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-cyan-500/10 group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold font-mono tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 rounded-lg">
                    MÓDULO 02
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                  El Estudio Fotográfico IA
                </h3>

                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Crea imágenes publicitarias hiper-realistas para tus productos con herramientas gratuitas.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Fotos de producto con calidad de catálogo comercial</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Fondos dinámicos y modelos virtuales sin contratar sesiones</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Uso de herramientas 100% gratuitas y accesibles</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Sin Diseñador</span>
                <span className="text-cyan-400 font-semibold">Cero Costo Extra</span>
              </div>
            </div>

            {/* Módulo 3 */}
            <div className="rounded-2xl p-7 bg-slate-900/60 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900/90 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-teal-500/10 group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold font-mono tracking-widest text-teal-400 bg-teal-950/80 border border-teal-500/30 px-3 py-1 rounded-lg">
                    MÓDULO 03
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                    <Share2 className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors">
                  La Máquina de Ventas en Redes
                </h3>

                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Lanza tus primeros anuncios rentables en Facebook/Instagram y configura tu WhatsApp para no perder clientes.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span>Estructura de anuncios que filtran clientes con dinero</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span>Conexión directa a WhatsApp con respuestas automáticas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span>Monitoreo de métricas para no quemar tu dinero</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Alta Conversión</span>
                <span className="text-teal-400 font-semibold">Ventas Reales</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          5. SECCIÓN DE AUTORIDAD Y CERTIFICACIÓN
          ======================================================== */}
      <section id="certificacion" className="relative z-10 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-slate-900/90 via-[#0a142c] to-slate-900/90 border border-amber-500/40 backdrop-blur-2xl shadow-2xl relative">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Columna Izquierda: Texto y Explicación de Autoridad */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <Award className="w-4 h-4" />
                  <span>Certificación Profesional Oficial</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-heading">
                  Respaldo y Certificación Verificable
                </h2>

                <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                  Al finalizar, recibe tu certificado oficial como <strong className="text-emerald-400">"Especialista en Creación de Negocios Digitales con IA"</strong>. Incluye un código QR y número de folio único verificable en nuestra plataforma tecnológica. Ideal para validar tus habilidades ante el mercado.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <QrCode className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Código QR de Autenticidad en Tiempo Real</h4>
                      <p className="text-xs text-slate-400">Cualquier cliente, socio o empleador puede escanear tu certificado para confirmar su validez instantánea.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Número de Folio Único Registrado</h4>
                      <p className="text-xs text-slate-400">Acreditación intransferible emitida por Alidea Academia y protegida contra falsificaciones.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Render Mockup del Certificado Físico/Digital */}
              <div className="lg:col-span-5">
                <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#0e172e] to-[#070c18] border-2 border-amber-400/40 shadow-[0_20px_50px_rgba(245,158,11,0.15)] text-center space-y-4">
                  
                  {/* Watermark / Seal */}
                  <div className="mx-auto w-16 h-16 rounded-full bg-amber-400/10 border-2 border-amber-400/50 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-400/10">
                    <Award className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold tracking-[0.25em] text-slate-400 uppercase">
                      REPÚBLICA DE ALIDEA ACADEMIA
                    </span>
                    <h3 className="text-xl font-black text-white font-heading mt-1">
                      CERTIFICADO OFICIAL
                    </h3>
                  </div>

                  <div className="py-2 border-y border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Se otorga con mención de honor a:</span>
                    <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-heading">
                      [Nombre del Estudiante]
                    </div>
                    <span className="text-[11px] text-slate-300 block">
                      Por haber aprobado los exámenes prácticos y proyectos del curso.
                    </span>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3">
                    <span className="text-xs font-bold text-emerald-300">
                      Especialista en Creación de Negocios Digitales con IA
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-left border-t border-slate-800 text-[10px] text-slate-400">
                    <div>
                      <div className="font-mono text-slate-300">ID: ALD-2026-REG</div>
                      <div className="text-emerald-400 font-semibold">100% Verificado</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-white text-slate-950">
                        <QrCode className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          6. SECCIÓN DE OFERTA IRRESISTIBLE (Tabla de precios)
          ======================================================== */}
      <section id="oferta" className="relative z-10 py-20 md:py-28 bg-gradient-to-b from-slate-900/60 via-slate-950 to-[#070c18] border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-4 py-1.5 rounded-full inline-block mb-4">
            Inscripción Inmediata al Curso
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4 font-heading">
            Acceso Completo con 80% de Descuento
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-12">
            Todo lo que necesitas para dominar la IA aplicada a negocios, empaquetado en una oferta irrepetible.
          </p>

          {/* Pricing Box con Glassmorphism */}
          <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-slate-900/90 to-[#091022] border-2 border-emerald-500/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(16,185,129,0.12)] text-left">
            
            {/* Top Ribbon */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg">
              Cupos con Tarifa Promocional
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8 mb-8">
              <div>
                <h3 className="text-2xl font-black text-white font-heading">
                  Curso: Especialista en Negocios Digitales con IA
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Acceso de por vida a las clases + Certificación Oficial con QR + Plantillas
                </p>
              </div>

              {/* Price display */}
              <div className="text-left md:text-right">
                <div className="text-sm font-semibold text-slate-400 line-through">
                  Precio Regular: S/ 250.00
                </div>
                <div className="flex items-baseline gap-2 md:justify-end mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono">
                    S/ 49.00
                  </span>
                  <span className="text-sm font-bold text-slate-300 uppercase">
                    (Pago Único)
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 block mt-1 font-semibold">
                  Sin mensualidades ni pagos adicionales
                </span>
              </div>
            </div>

            {/* Beneficios con Checks */}
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3 text-sm sm:text-base text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div>
                <span><strong>Acceso de por vida:</strong> Mira las lecciones a tu propio ritmo, 24/7 sin límite de tiempo.</span>
              </div>

              <div className="flex items-center gap-3 text-sm sm:text-base text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div>
                <span><strong>Plantillas de Prompts copiables:</strong> Instrucciones exactas para que la IA cree tus textos, imágenes y estrategias.</span>
              </div>

              <div className="flex items-center gap-3 text-sm sm:text-base text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div>
                <span><strong>Guía de Anuncios:</strong> Fórmulas comprobadas para Facebook, Instagram y WhatsApp que sí generan ventas.</span>
              </div>

              <div className="flex items-center gap-3 text-sm sm:text-base text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div>
                <span><strong>Certificado con tecnología QR:</strong> Acreditación oficial con folio verificable en internet.</span>
              </div>
            </div>

            {/* CTA Grande */}
            <button
              onClick={handleOpenCheckout}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-lg sm:text-xl tracking-wide shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/60 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 border border-emerald-300/40 group active:scale-[0.99]"
            >
              <span>Ingresar al Programa Ahora ➔</span>
            </button>

            {/* Garantía */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Lock className="w-4 h-4" />
                <span>Garantía de 7 días. Compra 100% segura.</span>
              </div>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span>Si el curso no supera tus expectativas, solicitas el reembolso total sin preguntas.</span>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          7. FOOTER
          ======================================================== */}
      <footer className="relative z-10 bg-[#050914] border-t border-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5">
              <div className="w-full h-full bg-[#090f20] rounded-[6px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <span className="text-base font-bold text-white font-heading tracking-tight">
              ALIDEA <span className="text-emerald-400 font-extrabold">ACADEMIA</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/terms" className="hover:text-emerald-400 transition-colors">
              Términos del Servicio y Privacidad
            </Link>
            <span>•</span>
            <a 
              href="https://wa.me/51961817457?text=Hola,%20deseo%20informaci%C3%B3n%20sobre%20el%20curso%20de%20Alidea%20Academia" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> Soporte WhatsApp
            </a>
          </div>

          {/* Texto Legal Exacto Solicitado */}
          <p className="max-w-2xl text-slate-500 leading-relaxed text-[11px]">
            Este sitio no es parte del sitio web de Facebook o Meta. Todos los derechos reservados 2026-2027.
          </p>

        </div>
      </footer>

      {/* ========================================================
          CHECKOUT / MODAL DE INSCRIPCIÓN RÁPIDA (ALTA CONVERSIÓN)
          ======================================================== */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#091024] border border-emerald-500/40 p-6 sm:p-8 shadow-2xl text-left overflow-hidden">
            
            {/* Close button */}
            <button 
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">
                  Inscripción al Curso
                </h3>
                <span className="text-xs text-emerald-400 font-semibold">Tarifa Promocional: S/ 49.00 (Pago Único)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6">
              Selecciona tu medio preferido para activar tu acceso inmediato a las clases y los prompts:
            </p>

            {/* Tabs de Pago */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('yape')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  paymentMethod === 'yape'
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-lg shadow-purple-900/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                💜 Yape / Plin
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('wsp')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  paymentMethod === 'wsp'
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-900/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                💬 Asesor WhatsApp
              </button>
            </div>

            {/* Content according to selected payment */}
            {paymentMethod === 'yape' ? (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-500/30 space-y-3 text-center">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block">
                  Pago Directo por Yape o Plin
                </span>
                <div className="text-2xl font-black text-white font-mono">
                  961 817 457
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  Titular: <span className="text-white font-semibold">Alidea Academia / Jonathan A.</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Monto exacto: <strong className="text-emerald-400 font-mono">S/ 49.00</strong>
                </div>
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  Envía la captura de tu pago a nuestro WhatsApp oficial para recibir tu acceso al curso al instante.
                </p>
                <a
                  href={`https://wa.me/51961817457?text=${encodeURIComponent('¡Hola Alidea Academia! Acabo de transferir los S/ 49.00 de la promoción para el curso Especialista en Negocios Digitales con IA. Adjunto mi comprobante para que me activen el acceso.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Comprobante por WhatsApp</span>
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-3 text-center">
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                  Atención Inmediata por WhatsApp
                </span>
                <p className="text-xs text-slate-300">
                  Un asesor te guiará para realizar tu pago por transferencia bancaria (BCP, BBVA, Interbank) o tarjeta, y te dará de alta en el curso.
                </p>
                <a
                  href={`https://wa.me/51961817457?text=${encodeURIComponent('¡Hola! Deseo inscribirme al curso Especialista en Creación de Negocios Digitales con IA por S/ 49.00. ¿Cuáles son las cuentas disponibles?')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chatear con un Asesor Ahora</span>
                </a>
              </div>
            )}

            <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garantía de satisfacción de 7 días garantizada.</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
