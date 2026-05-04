"use client";
import React from "react";
import Link from "next/link";

export default function TerminosCondiciones() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1E293B] font-sans selection:bg-[#D4AF37] selection:text-[#0F172A]">
      
      <nav className="w-full bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-4 cursor-pointer">
          <img src="/logo.png" alt="Logo Actarium" className="w-8 h-8 object-contain drop-shadow-sm" />
          <span className="font-serif text-xl tracking-[0.15em] text-[#0F172A] font-bold mt-1">ACTARIUM</span>
        </Link>
        <Link href="/" className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#D4AF37] transition-colors">
          ← Volver al Inicio
        </Link>
      </nav>

      <header className="bg-[#0F172A] pt-24 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Términos y Condiciones</h1>
        <p className="text-[#D4AF37] text-sm uppercase tracking-widest font-bold">Acuerdo de Licencia de Usuario Final (EULA)</p>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 text-gray-600 leading-relaxed space-y-10">
        
        <section>
          <p className="font-medium text-[#0F172A]">
            El presente Acuerdo de Términos y Condiciones ("Acuerdo") rige el acceso y uso de la plataforma de software como servicio (SaaS) Actarium. Al adquirir una licencia, registrarse o utilizar el sistema, usted acepta estar legalmente vinculado a las presentes disposiciones.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">1. Naturaleza del Servicio</h2>
          <p>
            Actarium proporciona una herramienta tecnológica asistida por Inteligencia Artificial diseñada para optimizar la extracción de datos y la estructuración de Avisos de Transmisión Patrimonial. <strong>Actarium es una herramienta informática, no un despacho de abogados.</strong> El servicio no constituye asesoría legal, notarial, ni fiscal.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">2. Responsabilidad del Notario Público</h2>
          <div className="bg-[#FEFCE8] p-6 rounded-xl border border-[#D4AF37]/30 text-[#854D0E]">
            <strong>CLÁUSULA DE RESPONSABILIDAD:</strong> La inteligencia artificial puede, por naturaleza, presentar variaciones en el análisis de textos complejos. El usuario (El Notario Titular y/o sus abogados proyectistas) asume la responsabilidad <strong>única, total y absoluta</strong> de validar, revisar y aprobar los datos extraídos en la interfaz de auditoría de Actarium antes de generar, firmar y presentar cualquier documento legal ante autoridades municipales o gubernamentales. Actarium no se hace responsable por multas, recargos o rechazos derivados de información incorrecta en los documentos finales.
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">3. Licencias y Acceso</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Las licencias de acceso son corporativas, intransferibles y están atadas al RFC o a la Notaría registrada en el momento de la compra.</li>
            <li>Está estrictamente prohibido compartir claves de acceso (Serial Keys) o cuentas de usuario con notarías distintas a la titular.</li>
            <li>Actarium se reserva el derecho de revocar el acceso sin reembolso en caso de detectar abuso, reventa del servicio o violación de seguridad.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">4. Propiedad Intelectual</h2>
          <p>
            El código fuente, diseño, algoritmos, logotipos y la marca "Actarium" son propiedad exclusiva de R. Lizárraga Developing. El acceso al servicio se otorga como un derecho de uso (Licencia SaaS) y en ningún caso constituye una venta o transferencia de derechos de propiedad intelectual sobre el software.
          </p>
        </section>

      </main>

      <footer className="bg-[#0F172A] py-8 text-center text-gray-500 text-xs tracking-widest uppercase mt-20 border-t border-[#D4AF37]/20">
        © {new Date().getFullYear()} Actarium. Todos los derechos reservados.
      </footer>
    </div>
  );
}