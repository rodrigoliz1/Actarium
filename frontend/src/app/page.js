"use client";
import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1E293B] font-sans">
      {/* NAVBAR COMERCIAL */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-serif text-xl tracking-widest text-[#0F172A] font-bold">ACTARIUM</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-wider text-gray-500">
          <a href="#solucion" className="hover:text-[#D4AF37] transition-colors">Solución</a>
          <a href="#beneficios" className="hover:text-[#D4AF37] transition-colors">Beneficios</a>
          <Link href="/pricing" className="hover:text-[#D4AF37] transition-colors">Precios</Link>
        </div>
        <Link href="/terminal" className="bg-[#0F172A] text-[#D4AF37] px-6 py-2 rounded-full text-xs font-bold tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-md">
          ACCESO CLIENTES
        </Link>
      </nav>

      {/* HERO SECTION - EL IMPACTO INICIAL */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#D4AF37] rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-serif text-[#0F172A] mb-8 leading-tight">
            El Futuro de la <br /> 
            <span className="italic text-[#D4AF37]">Eficiencia Notarial</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto mb-12 leading-relaxed">
            Automatice la generación de Avisos de Transmisión Patrimonial con Inteligencia Artificial. Precisión absoluta en segundos, no en horas.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/pricing" className="bg-[#0F172A] text-white px-10 py-5 rounded-xl font-bold text-lg shadow-2xl hover:scale-105 transition-transform">
              Comenzar ahora
            </Link>
            <button className="bg-white border-2 border-[#0F172A] text-[#0F172A] px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all">
              Agendar Demo
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CARACTERÍSTICAS */}
      <section id="solucion" className="py-24 bg-[#0F172A] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
              <div className="text-[#D4AF37] mb-6 text-3xl">🧠</div>
              <h3 className="text-2xl font-serif mb-4 text-[#D4AF37]">Extracción Cognitiva</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Nuestro motor IA lee y comprende sus escrituras identificando partes, montos y descripciones sin importar el formato.</p>
            </div>
            <div className="p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
              <div className="text-[#D4AF37] mb-6 text-3xl">⚡</div>
              <h3 className="text-2xl font-serif mb-4 text-[#D4AF37]">Producción Masiva</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Procese lotes enteros de avisos en un solo clic. Entregamos un paquete ZIP listo para su presentación.</p>
            </div>
            <div className="p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
              <div className="text-[#D4AF37] mb-6 text-3xl">🛡️</div>
              <h3 className="text-2xl font-serif mb-4 text-[#D4AF37]">Auditoría Integral</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Validación visual de alta densidad para asegurar que cada dato sea exacto antes de la impresión final.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-serif text-lg tracking-widest text-[#0F172A] font-bold uppercase">Actarium</span>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">© 2026 R. Lizárraga Developing • Zapopan, Jalisco</p>
        </div>
      </footer>
    </div>
  );
}