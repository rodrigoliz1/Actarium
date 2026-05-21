"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProduccionMasiva() {
  const router = useRouter();
  const [verificandoAcceso, setVerificandoAcceso] = useState(true);

  const [archivos, setArchivos] = useState([]);
  const [procesando, setProcesando] = useState(false);
  const [mensajeCarga, setMensajeCarga] = useState("Preparando lote de escrituras...");
  const [fechaGlobal, setFechaGlobal] = useState("");

  useEffect(() => {
    const revisarLicencia = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/terminal");
      } else {
        setVerificandoAcceso(false);
      }
    };
    revisarLicencia();
  }, [router]);

  if (verificandoAcceso) {
    return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const manejarSubida = (e) => {
    if (e.target.files) {
      const nuevosArchivos = Array.from(e.target.files);

      setArchivos((prevArchivos) => {
        const listaActualizada = [...prevArchivos];
        nuevosArchivos.forEach(nuevo => {
          if (!listaActualizada.some(a => a.name === nuevo.name)) {
            listaActualizada.push(nuevo);
          }
        });
        return listaActualizada;
      });
      e.target.value = null;
    }
  };

  const eliminarArchivo = (nombreArchivo) => {
    setArchivos(archivos.filter((archivo) => archivo.name !== nombreArchivo));
  };

  const enviarAlServidorMasivo = async () => {
    if (archivos.length === 0) return;
    setProcesando(true);

    const mensajes = [
      "Escaneando lote de documentos...",
      "Extrayendo datos de múltiples escrituras...",
      "Estructurando paquetes zip en la nube...",
      "Asignando plantillas municipales por documento..."
    ];
    let i = 0;
    const intervaloCarga = setInterval(() => {
      setMensajeCarga(mensajes[i]);
      i = (i + 1) % mensajes.length;
    }, 2000);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const formData = new FormData();
      archivos.forEach((archivo) => {
        formData.append("archivos", archivo);
      });
      formData.append("user_id", user?.id || "");
      formData.append("fecha_cierre", fechaGlobal);

      const respuesta = await fetch("https://actarium-yqof.onrender.com/procesar-masivo", {
        method: "POST",
        body: formData,
      });

      if (respuesta.ok) {
        const blob = await respuesta.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Paquete_Avisos_Actarium.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();

        setArchivos([]);
        setFechaGlobal("");
        alert("¡Paquete generado con éxito!");
      } else {
        // NUEVO: ATRAPAMOS EL ERROR HTTP DEL CEREBRO SI LLEGÓ AL LÍMITE
        const errorData = await respuesta.json().catch(() => ({}));
        alert(errorData.detail || "Error procesando el lote de escrituras.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor Actarium.");
    }

    clearInterval(intervaloCarga);
    setProcesando(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#334155] font-sans pb-20 relative">

      {/* PANTALLA DE CARGA ÉPICA (OVERLAY) */}
      {procesando && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/95 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center mb-8">
            <div className="absolute inset-0 border-[4px] border-t-[#D4AF37] border-r-[#D4AF37] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-3 border-[4px] border-b-white border-l-white border-t-transparent border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <img src="/logo.png" className="w-16 h-16 object-contain animate-pulse" alt="Logo" />
          </div>
          <h3 className="text-3xl font-serif text-[#D4AF37] mb-3">ACTARIUM</h3>
          <p className="text-gray-300 tracking-[0.2em] uppercase text-xs font-bold animate-pulse">{mensajeCarga}</p>
        </div>
      )}

      <nav className="bg-[#0F172A] text-white py-4 px-10 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo Actarium" className="w-8 h-8 object-contain" />
          <h1 className="font-serif tracking-widest text-[#D4AF37]">ACTARIUM</h1>
        </div>
        <Link href="/terminal" className="text-xs uppercase tracking-widest text-gray-400 hover:text-white">← Salir al Lobby</Link>
      </nav>

      <main className="max-w-4xl mx-auto py-16 px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif text-[#0F172A] mb-4">Producción Masiva (Lote)</h2>
          <p className="text-gray-400 text-lg">
            Agregue múltiples escrituras a la bandeja. El sistema automatizará la extracción y empaquetará los avisos en un archivo ZIP.
          </p>
        </div>

        <div className="bg-white border-2 border-dashed border-gray-300 py-10 rounded-2xl relative hover:border-[#D4AF37] transition-all text-center mb-8">
          <input type="file" accept=".docx" multiple onChange={manejarSubida} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Haz clic para agregar escrituras" />
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#FEFCE8]">
            <svg className="w-8 h-8 text-[#0F172A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-[#0F172A]">Haz clic aquí para agregar escrituras a la bandeja</h3>
        </div>

        {archivos.length > 0 && (
          <div className="bg-white shadow-md border border-gray-200 rounded-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4 border-b pb-3">
              Bandeja de Entrada ({archivos.length} documentos)
            </h4>

            <ul className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2">
              {archivos.map((archivo, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded border border-gray-100 hover:border-[#0F172A] transition-colors group">
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-[#D4AF37] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <span className="text-sm font-medium text-[#0F172A]">{archivo.name}</span>
                  </div>
                  <button onClick={() => eliminarArchivo(archivo.name)} className="text-gray-400 hover:text-red-500 transition-colors p-2" title="Quitar de la bandeja">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mb-8 p-6 bg-[#0F172A] rounded-xl flex flex-col md:flex-row items-end gap-4 shadow-inner">
              <div className="flex-1 w-full">
                <label className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest mb-2 block">Fecha de Cierre (Aplica a todo el lote)</label>
                <input type="text" value={fechaGlobal} onChange={e => setFechaGlobal(e.target.value)} placeholder="Ej. Zapopan, Jalisco a 15 de Mayo de 2026" className="w-full p-3 rounded bg-white/10 text-white outline-none focus:border-[#D4AF37] border border-transparent text-sm placeholder-gray-500" />
              </div>
            </div>

            <div className="text-center border-t pt-8">
              <button onClick={enviarAlServidorMasivo} disabled={procesando} className="bg-[#0F172A] text-white px-12 py-4 rounded font-bold shadow-lg hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all w-full md:w-auto">
                Generar {archivos.length} Avisos y Descargar ZIP
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}