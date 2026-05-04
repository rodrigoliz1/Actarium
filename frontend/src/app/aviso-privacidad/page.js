"use client";
import React from "react";
import Link from "next/link";

export default function AvisoPrivacidad() {
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
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Aviso de Privacidad Integral</h1>
        <p className="text-[#D4AF37] text-sm uppercase tracking-widest font-bold">Última actualización: Mayo 2026</p>
      </header>

      {/* CONTENIDO LEGAL */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-gray-600 leading-relaxed space-y-10">
        
        <section>
          <p>
            En cumplimiento a lo dispuesto por la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong>, su Reglamento y los Lineamientos del Aviso de Privacidad, <strong>Actarium (R. Lizárraga Developing)</strong>, con domicilio en Zapopan, Jalisco, México, informa a sus usuarios, clientes y titulares de datos personales sobre el tratamiento, confidencialidad y seguridad que se le dará a su información.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">I. Identidad y Domicilio del Responsable</h2>
          <p>
            Actarium, operado por R. Lizárraga Developing (en adelante "El Responsable"), es el ente encargado de recabar, resguardar y tratar los datos personales y patrimoniales que sean ingresados a través de nuestra plataforma tecnológica de automatización notarial y registral.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">II. Datos Personales Sometidos a Tratamiento</h2>
          <p>Para brindar los servicios de automatización (SaaS), El Responsable tratará las siguientes categorías de datos:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Datos de Identificación y Contacto del Usuario (Notaría):</strong> Nombre del Titular, número de Notaría, correo electrónico, y datos de facturación.</li>
            <li><strong>Datos Sensibles y Patrimoniales (Terceros):</strong> Información extraída temporalmente de las escrituras cargadas en la plataforma, incluyendo nombres de transmitentes y adquirentes, RFC, CURP, estado civil, montos de operación, valores catastrales y descripciones de inmuebles.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">III. Finalidades del Tratamiento</h2>
          <p>Los datos recabados serán utilizados para las siguientes <strong>finalidades primarias</strong>:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Ejecutar el procesamiento de documentos legales y notariales a través de Inteligencia Artificial para la extracción de información.</li>
            <li>Generar y autocompletar Avisos de Transmisión Patrimonial (Plantillas Oficiales).</li>
            <li>Almacenamiento seguro en la "Bóveda Inmortal" para el resguardo histórico de los documentos generados por la Notaría titular de la cuenta.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">IV. Transferencia de Datos y Proveedores Tecnológicos</h2>
          <p>
            Al utilizar Actarium, el usuario reconoce y acepta que la información es procesada mediante infraestructuras seguras de terceros bajo estrictos acuerdos de confidencialidad y nula retención de datos (Zero-Data Retention Policy):
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>OpenAI, LLC:</strong> Se utiliza exclusivamente vía API como motor cognitivo de extracción. OpenAI <em>no retiene, no almacena y no utiliza</em> los datos de sus escrituras para entrenar modelos lingüísticos.</li>
            <li><strong>Supabase:</strong> Infraestructura de base de datos en la nube (Bóveda) que emplea encriptación AES-256 en reposo y TLS en tránsito.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-[#0F172A] border-l-4 border-[#D4AF37] pl-4">V. Ejercicio de Derechos ARCO</h2>
          <p>
            Usted o su representante legal tienen derecho a <strong>Acceder, Rectificar, Cancelar u Oponerse (Derechos ARCO)</strong> al tratamiento de sus datos personales. Para ejercer dichos derechos, deberá enviar una solicitud al correo <strong>soporte@actarium.com</strong>, acreditando su identidad e indicando el derecho que desea ejercer. El tiempo de respuesta no excederá de 20 días hábiles.
          </p>
        </section>

      </main>

      {/* FOOTER SIMPLE */}
      <footer className="bg-[#0F172A] py-8 text-center text-gray-500 text-xs tracking-widest uppercase mt-20 border-t border-[#D4AF37]/20">
        © {new Date().getFullYear()} Actarium. Todos los derechos reservados.
      </footer>
    </div>
  );
}