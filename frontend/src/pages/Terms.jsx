import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, FileText, CheckCircle2, Lock, Sparkles, Scale, RefreshCw } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 selection:bg-indigo-500/30 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              A
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white font-heading">
              Alidea<span className="text-indigo-400">.</span>
            </span>
          </Link>

          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-bold text-slate-200 border border-slate-700/60 inline-flex items-center gap-2 transition-all"
          >
            <ArrowLeft size={14} /> Volver al Inicio de Sesión
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <ShieldCheck size={14} className="text-indigo-400" />
            Marco Legal y Normativa de Uso
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
            Términos y Condiciones del Servicio
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Última actualización: Octubre 2026. Al iniciar sesión en la plataforma Alidea, usted acepta y se compromete a cumplir las siguientes disposiciones de servicio.
          </p>
        </div>

        {/* Highlight Card */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60 space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <Scale size={18} />
            <span>Aceptación Expresa del Servicio</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            El acceso y uso continuo de la suite tecnológica Alidea (incluyendo herramientas de automatización de WhatsApp, CRM comercial y motor de Inteligencia Artificial Alidea Genesis AI™) implica la conformidad y aceptación total de los presentes términos por parte del usuario o titular de la cuenta comercial.
          </p>
        </div>

        {/* Terms Clauses List */}
        <div className="space-y-6">
          
          {/* Clause 1 */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-extrabold flex items-center justify-center border border-indigo-500/30">1</span>
              Naturaleza del Software y Compromiso Operativo
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Alidea provee una plataforma tecnológica en la nube diseñada para optimizar la gestión comercial, automatizar la atención a clientes en WhatsApp, procesar flujos de mensajes y suministrar soporte con inteligencia artificial basada en contextos definidos. Nuestro equipo mantiene un monitoreo permanente y estándares de ingeniería avanzados para procurar la máxima estabilidad y fluidez en todos los módulos.
            </p>
          </div>

          {/* Clause 2 - Shield */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-extrabold flex items-center justify-center border border-indigo-500/30">2</span>
              Continuidad Técnica y Exclusión de Responsabilidad
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              La correcta operatividad del servicio depende de diversos factores e infraestructuras ajenas al control directo de Alidea, tales como redes públicas de telecomunicaciones, servidores de proveedores externos, fluctuaciones de conectividad de internet del usuario y actualizaciones técnicas o normativas de terceros (incluyendo protocolos de Meta y WhatsApp).
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              En consecuencia, el software se suministra "tal como está" y "según disponibilidad". En el caso imprevisto de contingencias técnicas, interrupciones parciales o latencias temporales, el equipo técnico de Alidea desplegará con diligencia sus mejores recursos para restablecer el servicio a la brevedad; no obstante, Alidea queda exenta de responsabilidad patrimonial, civil o comercial por eventuales pérdidas de oportunidad, lucros cesantes o desajustes operativos derivados de tales eventos tecnológicos externos.
            </p>
          </div>

          {/* Clause 3 - Updates */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-extrabold flex items-center justify-center border border-indigo-500/30">3</span>
              Actualización y Evolución Continua de las Condiciones
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Con el propósito de incorporar nuevas tecnologías, mejoras de seguridad y adecuaciones normativas, Alidea se reserva el derecho de modificar y actualizar los presentes Términos y Condiciones en cualquier momento sin necesidad de notificación individual previa. Las versiones vigentes estarán siempre publicadas de forma transparente en este apartado, siendo responsabilidad del usuario revisarlas periódicamente al hacer uso de la plataforma.
            </p>
          </div>

          {/* Clause 4 - Data Isolation */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-extrabold flex items-center justify-center border border-indigo-500/30">4</span>
              Privacidad, Aislamiento y Confidencialidad de Datos
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              La arquitectura de Alidea garantiza el estricto aislamiento de datos entre cuentas comerciales. Toda la información suministrada por cada usuario —incluyendo la base de conocimiento de negocio para el motor de IA, historial de mensajes, datos de contactos y registros del CRM— es de exclusiva propiedad del titular y no es comercializada, transferida ni expuesta a otros usuarios bajo ninguna circunstancia.
            </p>
          </div>

          {/* Clause 5 - Ethical use */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-extrabold flex items-center justify-center border border-indigo-500/30">5</span>
              Uso Ético y Buenas Prácticas de Comunicación
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              El usuario asume el compromiso de utilizar los módulos de difusión y retargeting de conformidad con las buenas prácticas comerciales, respetando a sus prospectos y clientes y absteniéndose de remitir contenido fraudulento o comunicaciones masivas no consentidas (spam).
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="text-center pt-6 border-t border-slate-800">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-all inline-flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Entendido y de Acuerdo • Iniciar Sesión
          </Link>
        </div>

      </main>
    </div>
  );
}
