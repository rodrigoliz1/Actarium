"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Ocultamos las llaves usando variables de entorno públicas de Next.js
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProduccionIndividual() {
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);

  const manejarSubida = async (e) => {
    if (!e.target.files[0]) return;
    setCargando(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch("https://actarium-yqof.onrender.com/extraer-datos", { method: "POST", body: formData });
      const data = await res.json();
      setDatos(data);
      setPaso(2);
    } catch (err) { alert("Error de conexión"); }
    setCargando(false);
  };

  const handleChange = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor });
  };

  const descargar = async () => {
    setCargando(true);
    
    try {
      // Obtenemos al usuario que inició sesión
      const { data: { user } } = await supabase.auth.getUser();
      const datosFinales = { ...datos, user_id: user?.id }; // Añadimos su ID secreto

      const res = await fetch("https://actarium-yqof.onrender.com/generar-final", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datosFinales),
      });
      
      const respuestaBackend = await res.json();
      
      if(respuestaBackend.success) {
        // Como ya está en la Bóveda, lo descargamos directo de Supabase
        const { data, error } = await supabase.storage.from('avisos_generados').download(respuestaBackend.archivo);
        
        if (!error) {
          const url = window.URL.createObjectURL(data);
          const a = document.createElement("a");
          a.href = url; a.download = respuestaBackend.archivo; a.click();
          
          // Le damos 2 segundos al navegador para descargar antes de sacarnos al lobby
          setTimeout(() => {
            window.location.href = "/terminal";
          }, 2000);

        } else {
          alert("El archivo se generó, pero no se pudo descargar automáticamente.");
          window.location.href = "/terminal";
        }
      } else {
        alert("Hubo un error al generar el archivo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor en la nube.");
    }
    
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#334155]">
      <nav className="bg-[#0F172A] text-white py-4 px-10 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Actarium" className="w-8 h-8 object-contain" />
            <h1 className="font-serif tracking-widest text-[#D4AF37]">ACTARIUM</h1>
        </div>
        <Link href="/terminal" className="text-xs uppercase tracking-widest text-gray-400 hover:text-white">← Salir al Lobby</Link>
      </nav>

      <main className="max-w-[1400px] mx-auto py-10 px-6">
        {paso === 1 ? (
          <div className="text-center mt-20 max-w-3xl mx-auto">
             <h2 className="text-4xl font-serif text-[#0F172A] mb-4">Cargar Escritura</h2>
             <p className="text-gray-400 mb-10 text-lg">Inicie el proceso arrastrando el documento .docx</p>
             <div className="bg-white border-2 border-dashed border-gray-200 p-24 rounded-2xl relative hover:border-[#D4AF37] transition-all">
                <input type="file" accept=".docx" onChange={manejarSubida} className="absolute inset-0 opacity-0 cursor-pointer" />
                <p className="text-gray-400 font-medium">{cargando ? "Extrayendo más de 30 variables legales..." : "Arrastre aquí el archivo"}</p>
             </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <header className="flex justify-between items-end mb-8 border-b pb-6">
              <div>
                <h2 className="text-3xl font-serif text-[#0F172A]">Auditoría Integral del Aviso</h2>
                <p className="text-sm text-gray-500 mt-1">Valide la información extraída. Los campos en <span className="text-orange-500 font-bold">naranja</span> requieren su revisión manual.</p>
              </div>
              <button onClick={descargar} className="bg-[#0F172A] text-white px-8 py-3 rounded font-bold shadow-lg hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all">
                {cargando ? "Procesando..." : "Generar Archivo Oficial"}
              </button>
            </header>

            {/* Layout de 3 Columnas para Alta Densidad de Datos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* COLUMNA 1: ADMINISTRATIVO Y NOTARÍA */}
              <div className="space-y-6">
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4">I. Administrativo</h3>
                  <div className="space-y-3">
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">Escritura Número</label><input type="text" value={datos?.escritura_numero || ""} onChange={e => handleChange("escritura_numero", e.target.value)} className="w-full p-2 border-b outline-none focus:border-[#D4AF37] bg-gray-50" /></div>
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">Lugar y Fecha de Firma</label><input type="text" value={datos?.lugar_fecha_firma || ""} onChange={e => handleChange("lugar_fecha_firma", e.target.value)} className={`w-full p-2 border-b outline-none ${!datos?.lugar_fecha_firma ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`} /></div>
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">Naturaleza del Acto</label><input type="text" value={datos?.naturaleza_acto || ""} onChange={e => handleChange("naturaleza_acto", e.target.value)} className="w-full p-2 border-b outline-none focus:border-[#D4AF37] bg-gray-50" /></div>
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-[10px] uppercase font-bold text-gray-400">Cuenta Predial</label><input type="text" value={datos?.cuenta_predial || ""} onChange={e => handleChange("cuenta_predial", e.target.value)} className="w-full p-2 border-b outline-none bg-gray-50" /></div>
                        <div><label className="text-[10px] uppercase font-bold text-gray-400">Folio Real RPP</label><input type="text" value={datos?.folio_real || ""} onChange={e => handleChange("folio_real", e.target.value)} className={`w-full p-2 border-b outline-none ${!datos?.folio_real ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`} /></div>
                    </div>
                  </div>
                  
                  {/* NUEVA SECCIÓN: DATOS DE LA NOTARÍA */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="text-[10px] uppercase font-bold text-[#D4AF37] mb-3">Datos del Fedatario</h4>
                    <div className="space-y-3">
                      <div><label className="text-[10px] uppercase font-bold text-gray-400">Nombre del Notario</label><input type="text" value={datos?.nombre_notario || ""} onChange={e => handleChange("nombre_notario", e.target.value)} className={`w-full p-2 border-b outline-none ${!datos?.nombre_notario ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`} /></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-[10px] uppercase font-bold text-gray-400">Notaría No.</label><input type="text" value={datos?.notaria_numero || ""} onChange={e => handleChange("notaria_numero", e.target.value)} className={`w-full p-2 border-b outline-none ${!datos?.notaria_numero ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`} /></div>
                        <div><label className="text-[10px] uppercase font-bold text-gray-400">Correo Electrónico</label><input type="text" value={datos?.correo_notario || ""} onChange={e => handleChange("correo_notario", e.target.value)} className="w-full p-2 border-b outline-none bg-gray-50" /></div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4">IV. Liquidación</h3>
                  <div className="space-y-3">
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">Valor de Operación</label><input type="text" value={datos?.valor_operacion || ""} onChange={e => handleChange("valor_operacion", e.target.value)} className="w-full p-2 bg-[#0F172A] text-[#D4AF37] font-mono rounded" /></div>
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">Impuesto a Pagar</label><input type="text" value={datos?.impuesto_monto || ""} onChange={e => handleChange("impuesto_monto", e.target.value)} className="w-full p-2 border rounded bg-gray-100 font-mono" /></div>
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">Total Liquidación</label><input type="text" value={datos?.total_liquidacion || ""} onChange={e => handleChange("total_liquidacion", e.target.value)} className="w-full p-2 border border-[#D4AF37] rounded font-mono font-bold" /></div>
                  </div>
                </section>
              </div>

              {/* COLUMNA 2: LAS PARTES */}
              <div className="space-y-6">
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4">II. Transmitente (Vendedor)</h3>
                  <div className="space-y-3">
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">Nombre(s) Completo(s)</label><textarea rows="2" value={datos?.nombre_vendedor || ""} onChange={e => handleChange("nombre_vendedor", e.target.value)} className={`w-full p-2 border-b outline-none resize-none ${!datos?.nombre_vendedor ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}></textarea></div>
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">CURP(s) / RFC(s)</label><textarea rows="2" value={datos?.curp_vendedor || ""} onChange={e => handleChange("curp_vendedor", e.target.value)} className={`w-full p-2 border-b outline-none resize-none ${!datos?.curp_vendedor ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}></textarea></div>
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">Estado Civil</label><input type="text" value={datos?.estado_civil_vendedor || ""} onChange={e => handleChange("estado_civil_vendedor", e.target.value)} className={`w-full p-2 border-b outline-none ${!datos?.estado_civil_vendedor ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`} /></div>
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">Domicilio</label><textarea rows="2" value={datos?.domicilio_vendedor || ""} onChange={e => handleChange("domicilio_vendedor", e.target.value)} className={`w-full p-2 border-b outline-none resize-none ${!datos?.domicilio_vendedor ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}></textarea></div>
                  </div>
                </section>

                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4">II. Adquirente (Comprador)</h3>
                  <div className="space-y-3">
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">Nombre(s) Completo(s)</label><textarea rows="2" value={datos?.nombre_comprador || ""} onChange={e => handleChange("nombre_comprador", e.target.value)} className={`w-full p-2 border-b outline-none resize-none ${!datos?.nombre_comprador ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}></textarea></div>
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">CURP(s) / RFC(s)</label><textarea rows="2" value={datos?.curp_comprador || ""} onChange={e => handleChange("curp_comprador", e.target.value)} className={`w-full p-2 border-b outline-none resize-none ${!datos?.curp_comprador ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}></textarea></div>
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">Estado Civil</label><input type="text" value={datos?.estado_civil_comprador || ""} onChange={e => handleChange("estado_civil_comprador", e.target.value)} className={`w-full p-2 border-b outline-none ${!datos?.estado_civil_comprador ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`} /></div>
                    <div><label className="text-[10px] uppercase font-bold text-gray-400">Lugar y Fecha de Nacimiento</label><input type="text" value={datos?.nacimiento_comprador || ""} onChange={e => handleChange("nacimiento_comprador", e.target.value)} className={`w-full p-2 border-b outline-none ${!datos?.nacimiento_comprador ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`} /></div>
                  </div>
                </section>
              </div>

              {/* COLUMNA 3: INMUEBLE Y ANTECEDENTES */}
              <div className="space-y-6">
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                  <h3 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4">III. El Inmueble</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400">Ubicación, Medidas y Linderos</label>
                      <textarea rows="6" value={datos?.ubicacion_inmueble || ""} onChange={e => handleChange("ubicacion_inmueble", e.target.value)} className="w-full mt-1 p-3 bg-gray-50 border rounded outline-none focus:border-[#D4AF37] text-sm"></textarea>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400">Antecedentes de Adquisición (RPP)</label>
                      <textarea rows="6" value={datos?.antecedentes_registro || ""} onChange={e => handleChange("antecedentes_registro", e.target.value)} placeholder="Ej. Adquirido mediante Escritura 1234, Folio Real 56789..." className={`w-full mt-1 p-3 border rounded outline-none text-sm ${!datos?.antecedentes_registro ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}></textarea>
                    </div>
                  </div>
                </section>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}