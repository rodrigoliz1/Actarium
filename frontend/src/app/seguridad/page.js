"use client";
import React from "react";
import Link from "next/link";

export default function PoliticaSeguridad() {
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 relative z-10">Infraestructura y Seguridad</h1>
        <p className="text-[#D4AF37] text-sm uppercase tracking-widest font-bold relative z-10">Seguridad Criptográfica a Nivel Bancario</p>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 text-gray-600 leading-relaxed space-y-10">

        <section className="text-center mb-12">
          <div className="text-6xl mb-6">🛡️</div>
          <p className="text-xl text-[#0F172A] font-serif">En Actarium sabemos que el secreto profesional es la esencia de la función notarial. Por ello, nuestra arquitectura se construyó priorizando la invulnerabilidad de sus documentos.</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="p-8 border border-gray-200 rounded-3xl bg-white shadow-sm hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Encriptación End-to-End</h3>
            <p className="text-sm">
              Toda la comunicación entre su navegador, nuestros servidores en Render y la bóveda en Supabase se transmite a través de túneles seguros utilizando encriptación <strong>TLS 1.2+ (Transport Layer Security)</strong>. Además, la información alojada en la base de datos se encuentra cifrada en reposo utilizando <strong>AES-256</strong>.
            </p>
          </div>

          <div className="p-8 border border-gray-200 rounded-3xl bg-white shadow-sm hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Row Level Security (RLS)</h3>
            <p className="text-sm">
              Nuestra base de datos no es plana; utiliza Políticas de Seguridad a Nivel de Fila (RLS) nativas de PostgreSQL. Esto asegura criptográficamente que <strong>cada Notaría solo tenga acceso a sus propios datos y documentos</strong>. Es matemáticamente imposible que un usuario vea el historial de otra cuenta.
            </p>
          </div>

          <div className="md:col-span-2 p-8 border border-gray-200 rounded-3xl bg-[#0F172A] text-white shadow-xl">
            <h3 className="text-xl font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Acat (Zero Data Retention)</h3>
            <p className="text-sm text-gray-300">
              Actarium es socio tecnológico de OpenAI (Enterprise API). Esto significa que las escrituras enviadas para su análisis están amparadas por un contrato que garantiza que <strong>OpenAI NO utilizará los datos de la notaría, ni los nombres, ni los montos para entrenar o mejorar sus modelos de inteligencia artificial</strong>. Los documentos se procesan en memoria (RAM) y se descartan inmediatamente después de extraer la información requerida.
            </p>
          </div>

        </div>

      </main>

      <footer className="bg-[#0F172A] py-8 text-center text-gray-500 text-xs tracking-widest uppercase mt-20 border-t border-[#D4AF37]/20">
        © {new Date().getFullYear()} Actarium. Todos los derechos reservados.
      </footer>
    </div>
  );
}