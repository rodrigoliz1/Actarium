"use client";
import React from "react";
import Link from "next/link";

export default function AcuerdoLicencia() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1E293B] font-sans selection:bg-[#D4AF37] selection:text-[#0F172A]">
      
      {/* NAVBAR MINIMALISTA */}
      <nav className="w-full bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-4 cursor-pointer">
          <img src="/logo.png" alt="Logo Actarium" className="w-8 h-8 object-contain drop-shadow-sm" />
          <span className="font-serif text-xl tracking-[0.15em] text-[#0F172A] font-bold mt-1">ACTARIUM</span>
        </Link>
        <Link href="/" className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#D4AF37] transition-colors">
          ← Volver al Inicio
        </Link>
      </nav>

      {/* HEADER LEGAL */}
      <header className="bg-[#0F172A] pt-24 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 relative z-10">Acuerdo de Licencia (EULA)</h1>
        <p className="text-[#D4AF37] text-sm uppercase tracking-widest font-bold relative z-10">Contrato de Licenciamiento de Software como Servicio (SaaS)</p>
      </header>

      {/* CONTENIDO LEGAL */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-gray-600 leading-relaxed space-y-10">
        
        <section className="bg-gray-50 p-8 rounded-2xl border border-gray-100 italic text-sm">
          <p>
            Este documento constituye un contrato legal entre usted (en adelante "El Licenciatario") y Actarium, operado por R. Lizárraga Developing (en adelante "El Licenciante"). Al activar una licencia o utilizar el software, usted manifiesta su aceptación incondicional a los términos aquí descritos.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">1. Concesión de la Licencia</h2>
          <p>
            Sujeto al pago de la suscripción correspondiente, El Licenciante otorga al Licenciatario una licencia de uso <strong>no exclusiva, intransferible y limitada</strong> para acceder y utilizar la plataforma Actarium con fines estrictamente profesionales dentro de la función notarial y registral.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">2. Restricciones de Uso</h2>
          <p>El Licenciatario se obliga a no realizar, ni permitir que terceros realicen, las siguientes actividades:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Ingeniería inversa, descompilación o intentos de extraer el código fuente de los algoritmos de extracción.</li>
            <li>Subarrendar, vender o distribuir el acceso a la plataforma a otras notarías o despachos ajenos al titular de la licencia.</li>
            <li>Utilizar el sistema para procesar documentos que contengan información obtenida de manera ilícita.</li>
            <li>Burlar los sistemas de seguridad de la Bóveda Criptográfica o de las Políticas de Seguridad a Nivel de Fila (RLS).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">3. Soporte y Mantenimiento</h2>
          <p>
            La licencia incluye el derecho a recibir actualizaciones tecnológicas y soporte técnico vía remota durante la vigencia de la suscripción. El Licenciante se reserva el derecho de suspender temporalmente el servicio para labores de mantenimiento preventivo, notificando al usuario mediante la plataforma.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">4. Propiedad Intelectual</h2>
          <p>
            Usted reconoce que todos los derechos de propiedad intelectual sobre el software Actarium, incluyendo sus algoritmos de IA, la interfaz gráfica, el diseño de la base de datos y las marcas asociadas, pertenecen exclusivamente a <strong>R. Lizárraga Developing</strong>. El uso del software no le otorga ningún derecho de propiedad sobre el mismo.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">5. Limitación de Responsabilidad</h2>
          <p>
            El software se proporciona "tal cual". El Licenciante no garantiza que el sistema sea infalible dado que depende de modelos probabilísticos de Inteligencia Artificial. En ningún caso El Licenciante será responsable por daños indirectos, lucro cesante o pérdidas derivadas de errores en la captura de datos que no hayan sido validados por el Licenciatario en la etapa de auditoría visual.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">6. Jurisdicción y Ley Aplicable</h2>
          <p>
            Para la interpretación y cumplimiento del presente contrato, las partes se someten a las leyes aplicables en el Estado de Jalisco, México, y a la jurisdicción de los tribunales competentes en la ciudad de <strong>Zapopan, Jalisco</strong>, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
          </p>
        </section>

      </main>

      {/* FOOTER SIMPLE */}
      <footer className="bg-[#0F172A] py-8 text-center text-gray-500 text-xs tracking-widest uppercase mt-20 border-t border-[#D4AF37]/20">
        © {new Date().getFullYear()} Actarium. Acuerdo de Licencia de Usuario Final.
      </footer>
    </div>
  );
}