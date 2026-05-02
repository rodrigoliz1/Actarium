"use client";
import { useState } from "react";
import Link from "next/link";

export default function ProduccionMasiva() {
  const [archivos, setArchivos] = useState([]);
  const [procesando, setProcesando] = useState(false);

  const manejarSubida = (e) => {
    if (e.target.files) {
      const nuevosArchivos = Array.from(e.target.files);
      
      // La magia: acumulamos los archivos nuevos sin borrar los que ya estaban
      setArchivos((prevArchivos) => {
        const listaActualizada = [...prevArchivos];
        
        // Verificamos que no se agregue el mismo archivo dos veces
        nuevosArchivos.forEach(nuevo => {
          if (!listaActualizada.some(a => a.name === nuevo.name)) {
            listaActualizada.push(nuevo);
          }
        });
        return listaActualizada;
      });
      
      // Reseteamos el input para que permita volver a seleccionar el mismo archivo si lo borramos y lo volvemos a subir
      e.target.value = null; 
    }
  };

  const eliminarArchivo = (nombreArchivo) => {
    // Filtramos la lista para quitar el archivo que el usuario quiere borrar
    setArchivos(archivos.filter((archivo) => archivo.name !== nombreArchivo));
  };

  const enviarAlServidorMasivo = async () => {
    if (archivos.length === 0) return;
    setProcesando(true);

    const formData = new FormData();
    archivos.forEach((archivo) => {
      formData.append("archivos", archivo);
    });

    try {
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
        
        // Limpiamos la lista al terminar con éxito
        setArchivos([]);
        alert("¡Paquete generado con éxito!");
      } else {
        alert("Error procesando el lote de escrituras.");
      }
    } catch (error) {
      alert("Error de conexión con el servidor Actarium.");
    }
    setProcesando(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#334155] font-sans">
      <nav className="bg-[#0F172A] text-white py-4 px-10 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Actarium" className="w-8 h-8 object-contain" />
            <h1 className="font-serif tracking-widest text-[#D4AF37]">ACTARIUM</h1>
        </div>
        <Link href="/" className="text-xs uppercase tracking-widest text-gray-400 hover:text-white">← Salir al Lobby</Link>
      </nav>

      <main className="max-w-4xl mx-auto py-16 px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif text-[#0F172A] mb-4">Producción Masiva (Lote)</h2>
          <p className="text-gray-400 text-lg">
            Agregue múltiples escrituras a la bandeja. El sistema automatizará el proceso de extracción y empaquetará los avisos en un archivo ZIP.
          </p>
        </div>

        {/* ZONA DE CARGA */}
        <div className="bg-white border-2 border-dashed border-gray-300 py-10 rounded-2xl relative hover:border-[#D4AF37] transition-all text-center mb-8">
          <input 
            type="file" 
            accept=".docx" 
            multiple 
            onChange={manejarSubida} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            title="Haz clic para agregar escrituras"
          />
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#FEFCE8]">
            <svg className="w-8 h-8 text-[#0F172A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-[#0F172A]">
            Haz clic aquí para agregar escrituras a la bandeja
          </h3>
        </div>

        {/* LISTA VISUAL DE ARCHIVOS SELECCIONADOS */}
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
                  
                  {/* BOTÓN DE BORRAR */}
                  <button 
                    onClick={() => eliminarArchivo(archivo.name)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    title="Quitar de la bandeja"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </li>
              ))}
            </ul>

            <div className="text-center border-t pt-8">
              <button 
                onClick={enviarAlServidorMasivo}
                disabled={procesando}
                className="bg-[#0F172A] text-white px-12 py-4 rounded font-bold shadow-lg hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all w-full md:w-auto"
              >
                {procesando ? "Procesando Lote en Segundo Plano..." : `Generar ${archivos.length} Avisos y Descargar ZIP`}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}