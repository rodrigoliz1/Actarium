"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [historial, setHistorial] = useState([]);
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState("");
  const [errorLogin, setErrorLogin] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Verificamos si ya había iniciado sesión antes
  useEffect(() => {
    const sesion = localStorage.getItem("actarium_auth");
    if (sesion === "true") {
      setAutenticado(true);
      cargarHistorial();
    }
    setCargando(false);
  }, []);

  const cargarHistorial = () => {
    fetch("https://actarium-yqof.onrender.com/historial")
      .then(res => res.json())
      .then(data => setHistorial(data))
      .catch(err => console.error("No se pudo cargar el historial", err));
  };

  const manejarLogin = (e) => {
    e.preventDefault();
    // CLAVE DE ACCESO MAESTRA
    if (password === "PRUEBA") {
      localStorage.setItem("actarium_auth", "true");
      setAutenticado(true);
      setErrorLogin(false);
      cargarHistorial();
    } else {
      setErrorLogin(true);
      setPassword("");
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("actarium_auth");
    setAutenticado(false);
  };

  const descargarDelHistorial = async (id, nombreArchivo) => {
    if (!nombreArchivo) return alert("Este registro no tiene archivo guardado.");
    try {
      const res = await fetch(`https://actarium-yqof.onrender.com/descargar-historial/${id}`);
      if (!res.ok) throw new Error("Error en el servidor");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("No se pudo descargar. Puede que el archivo físico ya no exista.");
    }
  };

  // --- PANTALLA DE CARGA INICIAL ---
  if (cargando) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>;

  // --- PANTALLA DE LOGIN (DISEÑO PREMIUM) ---
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center font-sans relative overflow-hidden">
        {/* Iluminación Ambiental (Efecto Glow) */}
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-[#D4AF37] opacity-10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-blue-600 opacity-10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Tarjeta Principal de Login */}
        <div className="z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 text-center transform transition-all">
          
          {/* Tu Logo Oficial */}
          <div className="flex justify-center mb-8">
            <img 
              src="/logo.png" 
              alt="Logo Actarium" 
              className="w-32 h-32 object-contain drop-shadow-xl"
            />
          </div>
          
          <h1 className="text-4xl font-serif tracking-widest text-[#0F172A] mb-2">ACTARIUM</h1>
          <p className="text-gray-400 text-xs font-bold tracking-[0.2em] mb-10 uppercase">Sistema de Automatización Registral</p>

          <form onSubmit={manejarLogin} className="space-y-6">
            <div className="text-left">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block ml-1">Clave de Acceso</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full p-4 border-2 rounded-xl outline-none text-center tracking-[0.5em] text-xl transition-all duration-300 ${errorLogin ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/20 bg-white'}`}
              />
              {errorLogin && <p className="text-red-500 text-xs mt-3 text-center font-medium animate-bounce">Clave incorrecta. Intente de nuevo.</p>}
            </div>
            
            <button type="submit" className="w-full bg-[#0F172A] text-[#D4AF37] py-4 rounded-xl font-bold tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all duration-500 shadow-xl hover:shadow-[#D4AF37]/40 mt-4">
              INGRESAR AL SISTEMA
            </button>
          </form>
          
          <div className="mt-12 pt-6 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 tracking-widest uppercase">R. Lizárraga Developing</p>
          </div>
        </div>
      </div>
    );
  }

  // --- PANTALLA DEL LOBBY ---
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#334155] font-sans pb-20 animate-in fade-in duration-700">
      {/* Barra de Navegación */}
      <nav className="bg-[#0F172A] text-white py-4 px-10 flex justify-between items-center shadow-xl border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo Actarium" className="w-10 h-10 object-contain drop-shadow-md" />
          <h1 className="text-xl font-serif tracking-widest text-[#D4AF37] mt-1">ACTARIUM</h1>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-sm tracking-wide font-light hidden md:block">Lic. Rodrigo Lizárraga Camacho</p>
          <div className="w-10 h-10 bg-[#334155] rounded-full flex items-center justify-center border border-[#D4AF37] shadow-inner">
            <span className="text-sm font-bold text-[#D4AF37]">RL</span>
          </div>
          <button onClick={cerrarSesion} className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors border-l border-gray-600 pl-6 h-6">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto mt-16 px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-[#0F172A] mb-4">Lobby de Producción</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Seleccione el modo de operación para comenzar a procesar escrituras y generar los Avisos de Transmisión Patrimonial.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          <Link href="/individual">
            <div className="bg-white h-full p-10 rounded-2xl shadow-sm border border-gray-200 hover:shadow-2xl hover:border-[#D4AF37] transition-all duration-500 cursor-pointer flex flex-col items-center text-center group transform hover:-translate-y-1">
              <div className="w-24 h-24 bg-[#0F172A] rounded-full flex items-center justify-center mb-8 group-hover:bg-[#D4AF37] transition-colors duration-500 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-2xl font-serif text-[#0F172A] mb-3">Producción Individual</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Auditoría minuciosa de los datos extraídos antes de generar un solo aviso.</p>
            </div>
          </Link>

          <Link href="/masiva">
            <div className="bg-white h-full p-10 rounded-2xl shadow-sm border border-gray-200 hover:shadow-2xl hover:border-[#D4AF37] transition-all duration-500 cursor-pointer flex flex-col items-center text-center group relative overflow-hidden transform hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-24 h-24 bg-[#0F172A] rounded-full flex items-center justify-center mb-8 group-hover:bg-[#D4AF37] transition-colors duration-500 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-2xl font-serif text-[#0F172A] mb-3">Producción Masiva (Lotes)</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Subir múltiples documentos y empaquetar los avisos exitosos automáticamente en ZIP.</p>
            </div>
          </Link>
        </div>

        <div>
          <h3 className="text-2xl font-serif text-[#0F172A] mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Archivo Maestro (Últimas Operaciones)
          </h3>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0F172A] text-white">
                  <tr>
                    <th className="p-5 font-medium tracking-wider text-xs uppercase">ID</th>
                    <th className="p-5 font-medium tracking-wider text-xs uppercase">Fecha y Hora</th>
                    <th className="p-5 font-medium tracking-wider text-xs uppercase">Escritura</th>
                    <th className="p-5 font-medium tracking-wider text-xs uppercase">Vendedor</th>
                    <th className="p-5 font-medium tracking-wider text-xs uppercase">Comprador</th>
                    <th className="p-5 font-medium tracking-wider text-xs uppercase text-center">Documento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historial.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-gray-400 italic">No hay operaciones registradas aún. Genere un aviso para comenzar a nutrir el historial.</td>
                    </tr>
                  ) : (
                    historial.map((fila) => (
                      <tr key={fila.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-5 text-gray-400 font-mono">#{fila.id}</td>
                        <td className="p-5 text-gray-500">{fila.fecha}</td>
                        <td className="p-5 font-bold text-[#0F172A]">{fila.escritura}</td>
                        <td className="p-5 truncate max-w-[200px]" title={fila.vendedor}>{fila.vendedor}</td>
                        <td className="p-5 truncate max-w-[200px]" title={fila.comprador}>{fila.comprador}</td>
                        <td className="p-5 text-center">
                          <button 
                            onClick={() => descargarDelHistorial(fila.id, fila.archivo)}
                            className="bg-[#FEFCE8] text-[#A16207] border border-[#FEF08A] hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37] px-4 py-2 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            {fila.acto || "DESCARGAR"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}