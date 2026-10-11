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
  Star, 
  Camera, 
  Share2, 
  Layers, 
  ChevronRight, 
  ChevronDown,
  Clock, 
  Users, 
  BadgePercent, 
  Check, 
  Smartphone, 
  ExternalLink,
  MessageCircle,
  HelpCircle,
  BookOpen,
  Download,
  CheckCircle,
  FileText,
  Gift,
  Target,
  Palette,
  MessageSquare,
  TrendingUp,
  Flame,
  CheckCheck
} from 'lucide-react';

export default function Landing() {
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('yape'); // 'yape' | 'wsp'
  const [openModule, setOpenModule] = useState(1); // default active module in syllabus accordion

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

  const toggleModule = (id) => {
    setOpenModule(openModule === id ? null : id);
  };

  // Syllabus Data (Módulos 1 al 6 con todas sus clases y regalos)
  const syllabusData = [
    {
      id: 1,
      badge: "Módulo 1",
      title: "Los Primeros Pasos de tu Negocio",
      subtitle: "(Sin complicaciones)",
      tag: "4 Clases Prácticas",
      icon: Target,
      color: "emerald",
      classes: [
        {
          num: "Clase 1",
          title: "Descubre qué vender",
          desc: "Cómo pedirle a la Inteligencia Artificial (IA) que te dé ideas de negocios rentables que puedes empezar hoy mismo."
        },
        {
          num: "Clase 2",
          title: "El nombre perfecto",
          desc: "Un método fácil para que la IA invente un nombre atractivo para tu negocio en menos de 5 minutos."
        },
        {
          num: "Clase 3",
          title: "Tu logotipo profesional",
          desc: "Crea el logo de tu marca usando herramientas gratuitas en internet, sin necesidad de saber dibujar ni usar programas difíciles."
        },
        {
          num: "Clase 4",
          title: "Tu vitrina en internet",
          desc: "El paso a paso, desde cero, para crear tu página de Facebook y tu perfil de Instagram para negocios."
        }
      ]
    },
    {
      id: 2,
      badge: "Módulo 2",
      title: "Fotos que Venden",
      subtitle: "(Tu estudio fotográfico en el celular)",
      tag: "4 Clases Prácticas",
      icon: Camera,
      color: "cyan",
      classes: [
        {
          num: "Clase 1",
          title: "El truco de la foto casera",
          desc: "Cómo tomar buenas fotos a tus productos usando solo la cámara de tu celular y la luz de una ventana."
        },
        {
          num: "Clase 2",
          title: "Magia con IA",
          desc: "Te enseño cómo borrar fondos feos de tus fotos y colocar tus productos en escenarios de lujo con un solo clic."
        },
        {
          num: "Clase 3",
          title: "Textos llamativos",
          desc: "Cómo ponerle el precio, tu logo y letras atractivas a tus fotos para que parezcan hechas por un diseñador profesional."
        },
        {
          num: "Clase 4",
          title: "Videos fáciles",
          desc: "Cómo hacer tu primer video corto para historias o Reels usando imágenes, sin necesidad de hablar frente a la cámara."
        }
      ]
    },
    {
      id: 3,
      badge: "Módulo 3",
      title: "Qué Decir para Convencer a tus Clientes",
      subtitle: "(Persuasión y Copywriting con IA)",
      tag: "3 Clases Prácticas",
      icon: MessageSquare,
      color: "teal",
      classes: [
        {
          num: "Clase 1",
          title: "Textos que dan ganas de comprar",
          desc: "El secreto para pedirle a la Inteligencia Artificial que escriba las publicaciones de tu Facebook por ti."
        },
        {
          num: "Clase 2",
          title: "Todo un mes de ideas",
          desc: "Cómo hacer que la IA te arme un calendario con ideas sobre qué publicar cada día de la semana para que nunca te quedes sin inspiración."
        },
        {
          num: "Clase 3",
          title: "Romper el hielo",
          desc: "Qué escribirle a los clientes en tus publicaciones para que no solo den \"me gusta\", sino que te pregunten cómo comprar."
        }
      ]
    },
    {
      id: 4,
      badge: "Módulo 4",
      title: "Cómo Conseguir Clientes",
      subtitle: "(Publicidad Básica en Redes)",
      tag: "3 Clases Prácticas",
      icon: TrendingUp,
      color: "blue",
      classes: [
        {
          num: "Clase 1",
          title: "Lo básico de los anuncios",
          desc: "Cómo funciona la publicidad pagada en Facebook e Instagram para que no pierdas tu dinero al empezar."
        },
        {
          num: "Clase 2",
          title: "Tu primer anuncio",
          desc: "Botón por botón: cómo subir tu foto y poner a rodar tu primer anuncio invirtiendo poco dinero."
        },
        {
          num: "Clase 3",
          title: "Que suene el celular",
          desc: "Cómo configurar tu anuncio para que las personas interesadas te envíen un mensaje directo a tu WhatsApp."
        }
      ]
    },
    {
      id: 5,
      badge: "Módulo 5",
      title: "Atención Rápida por WhatsApp",
      subtitle: "(Organización y Cierre de Ventas)",
      tag: "3 Clases Prácticas",
      icon: Smartphone,
      color: "emerald",
      classes: [
        {
          num: "Clase 1",
          title: "El cambio a WhatsApp Business",
          desc: "Cómo pasar tu WhatsApp normal a la versión de negocios de forma gratuita."
        },
        {
          num: "Clase 2",
          title: "Organización total",
          desc: "Cómo usar etiquetas de colores para saber quién ya pagó, quién preguntó precio y a quién le debes enviar el producto."
        },
        {
          num: "Clase 3",
          title: "Respuestas automáticas",
          desc: "Cómo configurar mensajes de bienvenida y respuestas rápidas para que el cliente no espere cuando tú estás ocupado."
        }
      ]
    },
    {
      id: 6,
      badge: "Módulo 6 (Regalos Incluidos)",
      title: "Tus Herramientas de Trabajo",
      subtitle: "(Bonos de Regalo 100% Gratis)",
      tag: "🎁 3 Regalos Exclusivos",
      isBonus: true,
      icon: Gift,
      color: "amber",
      classes: [
        {
          num: "Regalo 1",
          title: "El documento \"Copiar y Pegar\"",
          desc: "Una lista con todos los textos y órdenes que yo uso con la IA para que tú solo tengas que copiarlos y cambiarle el nombre de tu producto."
        },
        {
          num: "Regalo 2",
          title: "Plantillas de venta",
          desc: "Qué responder exactamente cuando un cliente te dice \"solo dime el precio\" o \"luego te aviso\"."
        },
        {
          num: "Regalo 3",
          title: "Tu Certificado Oficial",
          desc: "Pasos para descargar e imprimir tu certificado oficial del curso con código QR verificable."
        }
      ]
    }
  ];

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

      {/* NAVIGATION BAR CON LOGO OFICIAL */}
      <header className="sticky top-0 z-40 bg-[#070c18]/90 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Oficial de Alidea Online Courses */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-xl bg-white p-1 shadow-lg shadow-emerald-500/10 border border-slate-200/20 group-hover:shadow-emerald-500/30 transition-all flex items-center justify-center overflow-hidden">
              <img 
                src="/alidea-logo.jpg" 
                alt="Alidea Online Courses" 
                className="h-full w-full object-contain group-hover:scale-105 transition-transform" 
              />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-heading">
                ALIDEA <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-extrabold">ACADEMIA</span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase block -mt-0.5">
                Online Courses & Certificación IA
              </span>
            </div>
          </a>

          {/* Nav links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#problema" className="hover:text-emerald-400 transition-colors">¿Para quién es?</a>
            <a href="#metodo" className="hover:text-emerald-400 transition-colors">El Método</a>
            <a href="#temario" className="hover:text-emerald-400 transition-colors font-semibold text-emerald-400">Temario Completo</a>
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
          1. HERO SECTION (SIN VIDEO DE MUESTRA, CON CERTIFICADO Y BENEFICIOS)
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

          {/* HERO VISUAL: PAQUETE FORMATIVO DEL CURSO + CERTIFICADO OFICIAL (SIN VIDEO) */}
          <div className="relative mx-auto max-w-5xl">
            {/* Glow Aura */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-cyan-500/20 to-blue-600/30 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

            <div className="relative rounded-3xl border border-slate-700/80 bg-[#0c1326] shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl p-6 sm:p-10">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
                
                {/* Panel Izquierdo: Qué obtendrás en el programa */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white p-1 border border-slate-300 flex items-center justify-center">
                      <img src="/alidea-logo.jpg" alt="Alidea" className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                        Programa de Especialización Práctica
                      </span>
                      <h3 className="text-xl font-extrabold text-white font-heading">
                        Kit de Formación Digital con IA
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Todo lo que necesitas para levantar tu negocio digital desde cero, dominar el diseño fotográfico y recibir pedidos automáticos por WhatsApp.
                  </p>

                  {/* 4 Feature Highlights */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" /> 6 Módulos
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Estructura paso a paso para no perderte.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" /> 17 Clases
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Directas al grano y sin relleno teórico.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                        <Gift className="w-4 h-4" /> 3 Bonos Gratis
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Documento Copiar y Pegar + Respuestas.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <QrCode className="w-4 h-4" /> Certificado QR
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Acreditación oficial verificable.</p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" /> Acceso 24/7 de por vida
                    </span>
                    <span className="text-emerald-300 font-semibold">
                      Garantía de Satisfacción 7 días
                    </span>
                  </div>
                </div>

                {/* Panel Derecho: Preview del Certificado Oficial con el Logo */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-2xl p-6 bg-gradient-to-br from-[#0c142c] via-[#080d1d] to-[#0a1226] border-2 border-amber-400/40 shadow-2xl text-center space-y-3">
                    
                    {/* Header del Certificado con Logo Oficial */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-white p-0.5 border border-slate-200 flex items-center justify-center">
                          <img src="/alidea-logo.jpg" alt="Alidea" className="h-full w-full object-contain" />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-black tracking-widest text-white uppercase block leading-none">
                            ALIDEA ONLINE COURSES
                          </span>
                          <span className="text-[9px] text-amber-400 font-semibold">ACREDITACIÓN OFICIAL</span>
                        </div>
                      </div>
                      <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <QrCode className="w-3 h-3" /> Verificable
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">
                        Certifica que el estudiante ha completado:
                      </span>
                      <div className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 font-heading leading-tight">
                        Especialista en Creación de Negocios Digitales con IA
                      </div>
                      <span className="text-[10px] text-slate-400 block pt-1">
                        6 Módulos • 17 Clases • Prompts y Campañas Reales
                      </span>
                    </div>

                    {/* Footer del Certificado */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-left text-[10px]">
                      <div>
                        <span className="block font-mono text-slate-300">Folio: ALD-2026-REG-8492</span>
                        <span className="text-[9px] text-emerald-400 font-medium">Estado: Emitido con Honores</span>
                      </div>
                      <div className="h-8 w-8 rounded bg-white p-0.5 border border-slate-300 flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-slate-950" />
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
          4. SECCIÓN DE TEMARIO COMPLETO (LOS 6 MÓDULOS DETALLADOS)
          ======================================================== */}
      <section id="temario" className="relative z-10 py-20 md:py-28 bg-slate-950/70 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-4 py-1.5 rounded-full inline-block mb-4">
              Plan de Estudio Completo • Paso a Paso
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-heading">
              Temario Oficial del Curso
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mt-4">
              Descubre exactamente todo lo que aprenderás en cada módulo para convertirte en especialista operativo desde el primer día.
            </p>
          </div>

          {/* Acordeón / Tarjetas de los 6 Módulos */}
          <div className="space-y-4">
            {syllabusData.map((mod) => {
              const IconComponent = mod.icon;
              const isOpen = openModule === mod.id;
              
              return (
                <div 
                  key={mod.id}
                  className={`rounded-2xl transition-all duration-300 border overflow-hidden backdrop-blur-xl ${
                    mod.isBonus 
                      ? 'bg-gradient-to-r from-amber-950/30 via-slate-900/80 to-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : isOpen
                        ? 'bg-slate-900/90 border-emerald-500/50 shadow-xl shadow-emerald-500/5'
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  {/* Header del Módulo (Clickeable) */}
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between text-left gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        mod.isBonus 
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            mod.isBonus 
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {mod.badge}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {mod.tag}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white font-heading">
                          {mod.title} <span className="text-slate-400 text-sm font-normal">{mod.subtitle}</span>
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-transform duration-300 ${
                        isOpen 
                          ? 'rotate-180 bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Lista de Clases desplegable */}
                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-slate-800/80 animate-fade-in">
                      <div className="grid grid-cols-1 gap-3 pt-3">
                        {mod.classes.map((cls, idx) => (
                          <div 
                            key={idx}
                            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-start gap-3 transition-colors ${
                              mod.isBonus
                                ? 'bg-amber-950/20 border-amber-500/20 hover:border-amber-500/40'
                                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                                mod.isBonus 
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {cls.num}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-sm sm:text-base font-bold text-white">
                                {cls.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                                {cls.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Callout de Certificación y Acceso Rápido */}
          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <CheckCheck className="w-5 h-5 text-emerald-400" />
                <span>Todo incluido en el pago único de S/ 49.00</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Accedes a los 6 módulos, las 17 clases, los 3 bonos de regalo y el certificado oficial.
              </p>
            </div>
            <button
              onClick={scrollToOffer}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 flex-shrink-0 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Empezar Ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================
          5. SECCIÓN DE AUTORIDAD Y CERTIFICACIÓN OFICIAL (CON EL LOGO CARGADO)
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

              {/* Columna Derecha: Render Mockup del Certificado con el Logo Oficial */}
              <div className="lg:col-span-5">
                <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#0e172e] to-[#070c18] border-2 border-amber-400/50 shadow-[0_20px_50px_rgba(245,158,11,0.18)] text-center space-y-4">
                  
                  {/* Logo Oficial de Alidea en el Certificado */}
                  <div className="mx-auto h-20 w-20 rounded-2xl bg-white p-2 shadow-xl border-2 border-amber-400/60 flex items-center justify-center">
                    <img 
                      src="/alidea-logo.jpg" 
                      alt="Alidea Online Courses" 
                      className="h-full w-full object-contain" 
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-black tracking-[0.25em] text-slate-300 uppercase block">
                      ALIDEA ONLINE COURSES
                    </span>
                    <h3 className="text-xl font-black text-white font-heading mt-0.5">
                      CERTIFICADO OFICIAL
                    </h3>
                  </div>

                  <div className="py-2 border-y border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Se otorga con mención de honor a:</span>
                    <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-heading">
                      [Nombre del Estudiante]
                    </div>
                    <span className="text-[11px] text-slate-300 block">
                      Por haber aprobado los exámenes prácticos y proyectos del curso:
                    </span>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3">
                    <span className="text-xs font-bold text-emerald-300">
                      Especialista en Creación de Negocios Digitales con IA
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-left border-t border-slate-800 text-[10px] text-slate-400">
                    <div>
                      <div className="font-mono text-slate-300">ID: ALD-2026-REG-8492</div>
                      <div className="text-emerald-400 font-semibold">100% Verificado</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-white text-slate-950 border border-slate-300">
                        <QrCode className="w-7 h-7" />
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
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-white p-1 border border-slate-300 items-center justify-center flex-shrink-0">
                  <img src="/alidea-logo.jpg" alt="Alidea" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-heading">
                    Curso: Especialista en Negocios Digitales con IA
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Los 6 Módulos completos + 17 Clases + 3 Regalos + Certificado Oficial con QR
                  </p>
                </div>
              </div>

              {/* Price display */}
              <div className="text-left md:text-right flex-shrink-0">
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
                <span><strong>Acceso de por vida:</strong> Mira las 17 lecciones a tu propio ritmo, 24/7 sin límite de tiempo.</span>
              </div>

              <div className="flex items-center gap-3 text-sm sm:text-base text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div>
                <span><strong>Regalo 1: Documento "Copiar y Pegar":</strong> Textos y órdenes exactas de IA listos para tu producto.</span>
              </div>

              <div className="flex items-center gap-3 text-sm sm:text-base text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div>
                <span><strong>Regalo 2: Plantillas de Venta:</strong> Respuestas infalibles para clientes que solo preguntan "precio".</span>
              </div>

              <div className="flex items-center gap-3 text-sm sm:text-base text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div>
                <span><strong>Regalo 3: Certificado con tecnología QR:</strong> Acreditación oficial emitida por Alidea Online Courses.</span>
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
          7. FOOTER (CON LOGO OFICIAL)
          ======================================================== */}
      <footer className="relative z-10 bg-[#050914] border-t border-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
          
          {/* Logo Oficial en Footer */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white p-1 border border-slate-300 flex items-center justify-center shadow-md">
              <img src="/alidea-logo.jpg" alt="Alidea Online Courses" className="h-full w-full object-contain" />
            </div>
            <div className="text-left">
              <span className="text-base font-bold text-white font-heading tracking-tight block leading-tight">
                ALIDEA <span className="text-emerald-400 font-extrabold">ACADEMIA</span>
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                Online Courses
              </span>
            </div>
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
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white p-1 border border-slate-300 flex items-center justify-center flex-shrink-0 shadow">
                <img src="/alidea-logo.jpg" alt="Alidea Online Courses" className="h-full w-full object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">
                  Inscripción al Curso Oficial
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
