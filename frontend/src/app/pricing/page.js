"use client";
import React from "react";
import Link from "next/link";

export default function PricingPage() {
  const planes = [
    {
      nombre: "Firma Individual",
      precio: "990",
      desc: "Perfecto para notarios independientes.",
      features: ["Procesamiento Individual", "Extracción Estándar", "Historial de 30 días", "Soporte Vía Email"],
      cta: "Comenzar gratis"
    },
    {
      nombre: "Notaría Premium",
      precio: "2,450",
      popular: true,
      desc: "Para notarías con alto volumen de operaciones.",
      features: ["Producción Masiva ilimitada", "Extracción Avanzada", "Historial Permanente", "Cuentas para 5 abogados", "Soporte Prioritario"],
      cta: "Contratar Plan"
    },
    {
      nombre: "Corporativo",
      precio: "Consultar",
      desc: "Solución a medida para redes de notarías.",
      features: ["API Personalizada", "Integración con su ERP", "Seguridad Nivel Bancario", "Entrenamiento de IA a medida"],
      cta: "Contactar Ventas"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans">
      <nav className="p-6">
        <Link href="/" className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-[#0F172A]">← Volver al inicio</Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 text-center mt-10">
        <h2 className="text-4xl md:text-6xl font-serif text-[#0F172A] mb-4 text-balance italic">Planes diseñados para la <span className="text-[#D4AF37]">Excelencia Jurídica</span></h2>
        <p className="text-gray-500 text-lg mb-16 uppercase tracking-[0.2em] font-medium">Invierta en tiempo, gane en precisión</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {planes.map((plan, i) => (
            <div key={i} className={`relative p-10 rounded-[2.5rem] border transition-all hover:shadow-2xl ${plan.popular ? 'bg-[#0F172A] text-white border-[#D4AF37] scale-105 z-10' : 'bg-white text-[#0F172A] border-gray-100 shadow-xl'}`}>
              {plan.popular && <span className="absolute top-0 right-10 -translate-y-1/2 bg-[#D4AF37] text-[#0F172A] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Lo más elegido</span>}
              <h3 className="text-xl font-bold mb-2 uppercase tracking-widest text-[#D4AF37]">{plan.nombre}</h3>
              <p className={`text-sm mb-8 ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>{plan.desc}</p>
              <div className="mb-10 flex items-baseline gap-1">
                <span className="text-4xl font-serif font-bold">${plan.precio}</span>
                {plan.precio !== "Consultar" && <span className="text-xs opacity-60">MXN / mes</span>}
              </div>
              <ul className="space-y-4 mb-12 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex gap-3 text-sm font-medium">
                    <span className="text-[#D4AF37]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-2xl font-bold tracking-widest transition-all ${plan.popular ? 'bg-[#D4AF37] text-[#0F172A] hover:bg-white' : 'bg-[#0F172A] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F172A]'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}