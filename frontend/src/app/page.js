"use client";
import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1E293B] font-sans selection:bg-[#D4AF37] selection:text-[#0F172A]">

      {/* NAVBAR COMERCIAL PREMIUM (Optimizado) */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100/50 px-4 md:px-6 py-4 md:py-5 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2 md:gap-4 cursor-pointer">
          <img src="/logo.png" alt="Logo Actarium" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-sm" />
          <span className="font-serif text-lg md:text-2xl tracking-[0.15em] text-[#0F172A] font-bold mt-1">ACTARIUM</span>
        </div>

        <div className="hidden lg:flex gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
          <a href="#plataforma" className="hover:text-[#D4AF37] transition-colors duration-300">Plataforma</a>
          <a href="#inteligencia" className="hover:text-[#D4AF37] transition-colors duration-300">Actarium AI</a>
          <a href="#flujo" className="hover:text-[#D4AF37] transition-colors duration-300">Cómo Funciona</a>
          <Link href="/pricing" className="hover:text-[#D4AF37] transition-colors duration-300">Licencias</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/terminal" className="hidden md:block text-[11px] font-bold uppercase tracking-[0.15em] text-[#0F172A] hover:text-[#D4AF37] transition-colors">
            Iniciar Sesión
          </Link>
          <Link href="/terminal" className="bg-[#0F172A] text-[#D4AF37] px-4 py-2 md:px-8 md:py-3 rounded-full text-[9px] md:text-[11px] font-bold tracking-[0.1em] md:tracking-[0.2em] hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all duration-500 shadow-[0_8px_20px_rgb(15,23,42,0.2)] hover:shadow-[#D4AF37]/30 whitespace-nowrap">
            ACCESO CLIENTES
          </Link>
        </div>
      </nav>

      {/* HERO SECTION - MAJESTUOSIDAD Y AUTORIDAD (Optimizado) */}
      <section className="relative pt-36 md:pt-48 pb-20 md:pb-32 px-6 overflow-hidden flex flex-col items-center text-center">
        {/* Luces de fondo estilo aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-40 pointer-events-none">
          <div className="absolute top-[-10%] md:top-[-20%] right-[-10%] md:right-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#D4AF37]/20 rounded-full blur-[100px] md:blur-[150px] animate-pulse duration-[10000ms]"></div>
          <div className="absolute bottom-[10%] md:bottom-[20%] left-[-10%] md:left-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-400/10 rounded-full blur-[100px] md:blur-[150px]"></div>
        </div>

        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] mb-6 md:mb-8">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping"></span>
            La Nueva Era del Derecho Notarial
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-serif text-[#0F172A] mb-6 md:mb-8 leading-[1.2] md:leading-[1.1] tracking-tight">
            El Futuro de la <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#C5A028] to-[#E8C550] italic">
              Eficiencia Notarial.
            </span>
          </h1>

          <p className="text-base md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed font-light px-2">
            Automatice la extracción de datos y la generación de Avisos de Transmisión Patrimonial con precisión algorítmica. Transforme horas de auditoría en segundos de validación.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4 md:px-0">
            <Link href="/pricing" className="w-full sm:w-auto bg-[#0F172A] text-[#D4AF37] px-8 md:px-12 py-4 md:py-5 rounded-full font-bold text-xs md:text-sm uppercase tracking-widest shadow-[0_10px_40px_rgba(15,23,42,0.3)] hover:scale-105 hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all duration-500 text-center">
              Adquirir Licencia
            </Link>
            <button className="w-full sm:w-auto bg-transparent border border-gray-300 text-[#0F172A] px-8 md:px-12 py-4 md:py-5 rounded-full font-bold text-xs md:text-sm uppercase tracking-widest hover:border-[#0F172A] hover:bg-gray-50 transition-all duration-300">
              Agendar Demostración
            </button>
          </div>
        </div>

        {/* Banderas de Autoridad */}
        <div className="mt-20 md:mt-32 pt-10 md:pt-12 border-t border-gray-200/60 w-full max-w-4xl mx-auto">
          <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] mb-6 md:mb-8 px-4">Tecnología de grado empresarial para Notarías de vanguardia</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-50 grayscale px-4">
            <div className="text-lg md:text-xl font-serif font-bold text-gray-600">LEX<span className="italic">Corp</span></div>
            <div className="text-lg md:text-xl font-serif font-bold text-gray-600">García&Asociados</div>
            <div className="text-lg md:text-xl font-serif font-bold text-gray-600 tracking-widest">NOTARIALIS</div>
            <div className="hidden sm:block text-xl font-serif font-bold text-gray-600">JURIS<span className="text-gray-400">Tech</span></div>
          </div>
        </div>
      </section>

      {/* SECCIÓN OSCURA - LA MAGIA DE LA IA */}
      <section id="inteligencia" className="py-20 md:py-32 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-[#D4AF37]/5 rounded-full blur-[80px] md:blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-12 md:mb-20 md:w-2/3 text-center md:text-left">
            <h2 className="text-xs md:text-sm font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-4">Motor Cognitivo Actarium AI</h2>
            <h3 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">No es una plantilla. <br className="hidden md:block" /><span className="italic text-gray-400">Es comprensión lectora real.</span></h3>
            <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed">
              Actarium no busca palabras clave. Nuestro motor de Inteligencia Artificial lee la escritura completa, comprende el contexto, identifica a los actores (por más complejos que sean los nombres o estados civiles) y extrae las métricas exactas.
            </p>
          </div>

          {/* Bento Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-[#D4AF37]/50 transition-colors duration-500 group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h4 className="text-xl md:text-2xl font-serif mb-3">Producción Individual o Masiva (Lotes)</h4>
              <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed">
                Suba 1, 50, 100 o 500 escrituras simultáneamente. Actarium las procesa en segundo plano y le entrega un archivo ZIP perfectamente estructurado y listo para presentar en el archivo de instrumentos públicos.
              </p>
            </div>

            <div className="p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-[#D4AF37]/50 transition-colors duration-500 group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h4 className="text-xl md:text-2xl font-serif mb-3">Archivo Seguro</h4>
              <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed">
                Cada aviso generado se encripta y se resguarda en nuestra base de datos, con seguridad a nivel bancario. Acceda a su historial desde cualquier lugar, para siempre.
              </p>
            </div>

            <div className="p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-[#D4AF37]/50 transition-colors duration-500 group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h4 className="text-xl md:text-2xl font-serif mb-3">Auditoría Visual</h4>
              <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed">
                Interfaz de validación humana. El sistema resalta los campos críticos para asegurar cero margen de error antes de la generación del documento oficial.
              </p>
            </div>

            <div className="md:col-span-2 p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-center items-center text-center">
              <h4 className="text-4xl md:text-5xl font-serif text-[#D4AF37] mb-2">-80%</h4>
              <p className="text-gray-300 font-bold uppercase tracking-widest text-[10px] md:text-xs">Reducción en tiempos de redacción y captura</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN CLARA - CÓMO FUNCIONA */}
      <section id="flujo" className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Flujo de Trabajo</h2>
          <h3 className="text-3xl md:text-4xl font-serif text-[#0F172A] mb-12 md:mb-20">Integración sin fricción a su Notaría</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 relative">
            {/* Línea conectora invisible en móvil, visible en desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

            <div className="relative flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xl md:text-2xl font-serif text-[#0F172A] mb-6 md:mb-8 z-10 shadow-sm">1</div>
              <h4 className="text-lg md:text-xl font-bold text-[#0F172A] mb-2 md:mb-3">Carga el Documento</h4>
              <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed">Arrastre su escritura en formato Word (.docx). El sistema acepta múltiples documentos simultáneamente.</p>
            </div>

            <div className="relative flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#0F172A] border border-[#0F172A] flex items-center justify-center text-xl md:text-2xl font-serif text-[#D4AF37] mb-6 md:mb-8 z-10 shadow-xl scale-110">2</div>
              <h4 className="text-lg md:text-xl font-bold text-[#0F172A] mb-2 md:mb-3">Actarium IA Extrae</h4>
              <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed">El motor analiza partes, inmuebles, valores y antecedentes, rellenando el formato oficial en 4 segundos.</p>
            </div>

            <div className="relative flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xl md:text-2xl font-serif text-[#0F172A] mb-6 md:mb-8 z-10 shadow-sm">3</div>
              <h4 className="text-lg md:text-xl font-bold text-[#0F172A] mb-2 md:mb-3">Valida y Descarga</h4>
              <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed">Revise los datos en la interfaz. Con un clic, obtenga su aviso perfecto y guardado en la bóveda inmutable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION ANTES DEL FOOTER */}
      <section className="py-16 md:py-24 bg-[#FDFDFD] border-t border-gray-100 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center bg-[#0F172A] rounded-[2rem] md:rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif text-white mb-4 md:mb-6 relative z-10 leading-tight">Lista para transformar su práctica.</h2>
          <p className="text-sm md:text-base text-gray-400 mb-8 md:mb-10 relative z-10 max-w-xl mx-auto">Únase a las notarías que ya automatizaron sus procesos de transmisión patrimonial.</p>
          <Link href="/pricing" className="relative z-10 bg-[#D4AF37] text-[#0F172A] px-8 md:px-10 py-3 md:py-4 rounded-full font-bold text-xs md:text-sm uppercase tracking-widest hover:bg-white transition-colors duration-300 inline-block">
            Ver Licencias
          </Link>
        </div>
      </section>

      {/* FOOTER CORPORATIVO Y MEGA ELEGANTE */}
      <footer className="bg-[#080d1a] text-white pt-16 md:pt-24 pb-8 md:pb-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 mb-12 md:mb-16 text-center sm:text-left">

            {/* Columna 1: Marca */}
            <div className="md:col-span-1 flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain brightness-0 invert opacity-80" />
                <span className="font-serif text-lg md:text-xl tracking-[0.2em] font-bold text-gray-200">ACTARIUM</span>
              </div>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-light mb-4 md:mb-6">
                Software de automatización registral y notarial potenciado por Inteligencia Artificial para el mercado mexicano.
              </p>
              <div className="text-gray-600 text-xs md:text-sm">
                Desarrollado en Zapopan, Jalisco.
              </div>
            </div>

            {/* Columna 2: Plataforma */}
            <div>
              <h4 className="text-white font-bold uppercase tracking-[0.2em] text-[10px] mb-4 md:mb-6">Plataforma</h4>
              <ul className="space-y-3 md:space-y-4 text-xs md:text-sm font-light text-gray-400">
                <li><Link href="/terminal" className="hover:text-[#D4AF37] transition-colors">Iniciar Sesión</Link></li>
                <li><Link href="/pricing" className="hover:text-[#D4AF37] transition-colors">Comprar Licencia</Link></li>
                <li><a href="#inteligencia" className="hover:text-[#D4AF37] transition-colors">Tecnología IA</a></li>
                <li><a href="#flujo" className="hover:text-[#D4AF37] transition-colors">Flujo de Trabajo</a></li>
              </ul>
            </div>

            {/* Columna 3: Legal */}
            <div>
              <h4 className="text-white font-bold uppercase tracking-[0.2em] text-[10px] mb-4 md:mb-6">Legal y Políticas</h4>
              <ul className="space-y-3 md:space-y-4 text-xs md:text-sm font-light text-gray-400">
                <li><Link href="/aviso-privacidad" className="hover:text-[#D4AF37] transition-colors">Aviso de Privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-[#D4AF37] transition-colors">Términos y Condiciones</Link></li>
                <li><Link href="/licencia" className="hover:text-[#D4AF37] transition-colors">Acuerdo de Licencia (EULA)</Link></li>
                <li><Link href="/seguridad" className="hover:text-[#D4AF37] transition-colors">Política de Seguridad</Link></li>
              </ul>
            </div>

            {/* Columna 4: Contacto */}
            <div>
              <h4 className="text-white font-bold uppercase tracking-[0.2em] text-[10px] mb-4 md:mb-6">Contacto y Soporte</h4>
              <ul className="space-y-3 md:space-y-4 text-xs md:text-sm font-light text-gray-400">
                <li><a href="mailto:soporte@actarium.com" className="hover:text-[#D4AF37] transition-colors flex items-center justify-center sm:justify-start gap-2 md:gap-3"><span className="text-[#D4AF37]">✉</span> soporte@actarium.com</a></li>
                <li><a href="mailto:ventas@actarium.com" className="hover:text-[#D4AF37] transition-colors flex items-center justify-center sm:justify-start gap-2 md:gap-3"><span className="text-[#D4AF37]">🏢</span> ventas@actarium.com</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-800 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-[9px] md:text-[10px] text-gray-600 uppercase tracking-widest font-bold">
              © {new Date().getFullYear()} Actarium por Rodrigo Lizárraga Developing. Todos los derechos reservados.
            </p>
            <div className="flex gap-4 opacity-40 mt-2 md:mt-0">
              <span className="text-[10px] md:text-xs tracking-widest uppercase font-bold">Stripe</span>
              <span className="text-[10px] md:text-xs tracking-widest uppercase font-bold">OpenAI</span>
              <span className="text-[10px] md:text-xs tracking-widest uppercase font-bold">Supabase</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}