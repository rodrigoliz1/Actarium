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

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") setIsDarkMode(true);

    const revisarLicencia = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/terminal");
      else setVerificandoAcceso(false);
    };
    revisarLicencia();
  }, [router]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("darkMode", !isDarkMode);
  };

  const manejarSubida = (e) => {
    if (e.target.files) {
      const nuevosArchivos = Array.from(e.target.files);
      setArchivos((prevArchivos) => {
        const listaActualizada = [...prevArchivos];
        nuevosArchivos.forEach(nuevo => {
          if (!listaActualizada.some(a => a.name === nuevo.name)) listaActualizada.push(nuevo);
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

    const mensajes = ["Escaneando lote de documentos...", "Extrayendo datos de múltiples escrituras...", "Estructurando paquetes zip en la nube...", "Asignando plantillas municipales por documento..."];
    let i = 0;
    const intervaloCarga = setInterval(() => { setMensajeCarga(mensajes[i]); i = (i + 1) % mensajes.length; }, 2000);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const formData = new FormData();
      archivos.forEach((archivo) => formData.append("archivos", archivo));
      formData.append("user_id", user?.id || "");
      formData.append("fecha_cierre", fechaGlobal);

      const respuesta = await fetch("https://actarium-yqof.onrender.com/procesar-masivo", {
        method: "POST", body: formData,
      });

      if (respuesta.ok) {
        const blob = await respuesta.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "Paquete_Avisos_Actarium.zip";
        document.body.appendChild(a); a.click(); a.remove();

        setArchivos([]); setFechaGlobal("");
        alert("¡Paquete generado con éxito!");
      } else {
        const errorData = await respuesta.json().catch(() => ({}));
        alert(errorData.detail || "Error procesando el lote de escrituras.");
      }
    } catch (error) { alert("Error de conexión con el servidor Actarium."); }

    clearInterval(intervaloCarga);
    setProcesando(false);
  };

  const bgApp = isDarkMode ? "bg-[#0A0F1D] text-gray-200" : "bg-[#FDFDFD] text-[#334155]";
  const textTitle = isDarkMode ? "text-white" : "text-[#0F172A]";
  const bgPanel = isDarkMode ? "bg-[#121B30] border-gray-800" : "bg-white border-gray-200";

  if (verificandoAcceso) return null;

  return (
    <div className={`min-h-screen ${bgApp} font-sans pb-20 relative transition-colors duration-500`}>

      {procesando && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/95 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center mb-8">
            <div className="absolute inset-0 border-[4px] border-t-[#D4AF37] border-r-[#D4AF37] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-3 border-[4px] border-b-white border-l-white border-t-transparent border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <img src="/logo.png" className="w-16 h-16 object-contain animate-pulse" alt="Logo" />
          </div>
          <h3 className="text-3xl font-serif text-[#D4AF37] mb-3">ACTARIUM AI</h3>
          <p className="text-gray-300 tracking-[0.2em] uppercase text-xs font-bold animate-pulse">{mensajeCarga}</p>
        </div>
      )}

      <nav className={`py-4 px-10 flex justify-between items-center shadow-lg border-b ${isDarkMode ? 'bg-[#0F172A] border-gray-800' : 'bg-[#0F172A] border-[#D4AF37]/20'} text-white`}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo Actarium" className="w-8 h-8 object-contain" />
          <h1 className="font-serif tracking-widest text-[#D4AF37]">ACTARIUM</h1>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={toggleDarkMode} className="text-xl hover:scale-110 transition-transform" title="Cambiar Tema">{isDarkMode ? "☀️" : "🌙"}</button>
          <Link href="/terminal" className="text-xs uppercase tracking-widest text-gray-400 hover:text-white">← Salir al Lobby</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-16 px-6">
        <div className="text-center mb-10">
          <h2 className={`text-4xl font-serif ${textTitle} mb-4`}>Producción Masiva (Lote)</h2>
          <p className="text-gray-400 text-lg">Agregue escrituras a la bandeja. El sistema empaquetará los avisos en un archivo ZIP.</p>
        </div>

        <div className={`${bgPanel} border-2 border-dashed py-10 rounded-2xl relative hover:border-[#D4AF37] transition-all text-center mb-8`}>
          <input type="file" accept=".docx" multiple onChange={manejarSubida} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="w-16 h-16 bg-[#0F172A] rounded-full flex items-center justify-center mx-auto mb-4 text-[#D4AF37]">📂</div>
          <h3 className={`text-lg font-medium ${textTitle}`}>Haga clic aquí para agregar escrituras</h3>
        </div>

        {archivos.length > 0 && (
          <div className={`${bgPanel} shadow-md border rounded-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4 border-b border-gray-700/30 pb-3">
              Bandeja de Entrada ({archivos.length} documentos)
            </h4>

            <ul className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2">
              {archivos.map((archivo, index) => (
                <li key={index} className={`flex justify-between items-center p-4 rounded border transition-colors group ${isDarkMode ? 'bg-[#18243E] border-gray-700 hover:border-gray-500' : 'bg-gray-50 border-gray-100 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-xl">📄</span>
                    <span className={`text-sm font-medium ${textTitle}`}>{archivo.name}</span>
                  </div>
                  <button onClick={() => eliminarArchivo(archivo.name)} className="text-gray-400 hover:text-red-500 transition-colors p-2 text-xl">✖</button>
                </li>
              ))}
            </ul>

            <div className="mb-8 p-6 bg-[#0F172A] rounded-xl flex flex-col md:flex-row items-end gap-4 shadow-inner border border-[#D4AF37]/30">
              <div className="flex-1 w-full">
                <label className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest mb-2 block">Fecha de Cierre (Aplica a todo el lote)</label>
                <input type="text" value={fechaGlobal} onChange={e => setFechaGlobal(e.target.value)} placeholder="Ej. Zapopan, Jalisco a 15 de Mayo de 2026" className="w-full p-3 rounded bg-white/10 text-white outline-none focus:border-[#D4AF37] border border-transparent text-sm placeholder-gray-500" />
              </div>
            </div>

            <div className="text-center border-t border-gray-700/30 pt-8">
              <button onClick={enviarAlServidorMasivo} disabled={procesando} className="bg-[#D4AF37] text-[#0F172A] px-12 py-4 rounded font-bold shadow-lg hover:bg-white transition-all w-full md:w-auto">
                Generar {archivos.length} Avisos y Descargar ZIP
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}