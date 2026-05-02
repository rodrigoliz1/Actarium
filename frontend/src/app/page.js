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
    fetch("http://localhost:8000/historial")
      .then(res => res.json())
      .then(data => setHistorial(data))
      .catch(err => console.error("No se pudo cargar el historial", err));
  };

  const manejarLogin = (e) => {
    e.preventDefault();
    // CLAVE DE ACCESO MAESTRA (Puedes cambiarla aquí)
    if (password === "NOTARIA1") {
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
      const res = await fetch(`http://localhost:8000/descargar-historial/${id}`);
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
  if (cargando) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>;

  // --- PANTALLA DE LOGIN (SEGURIDAD) ---
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center font-sans relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 opacity-5 rounded-full blur-3xl"></div>

        <div className="z-10 w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl text-center">
          <div className="w-16 h-16 border-2 border-[#D4AF37] flex items-center justify-center rounded mx-auto mb-6">
            <span className="text-[#D4AF37] font-serif font-bold text-3xl">A</span>
          </div>
          <h1 className="text-3xl font-serif tracking-widest text-[#0F172A] mb-2">ACTARIUM</h1>
          <p className="text-gray-400 text-sm mb-10">Sistema de Automatización Registral</p>

          <form onSubmit={manejarLogin}>
            <div className="text-left mb-6">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Clave de Acceso</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full p-4 border rounded outline-none text-center tracking-widest text-lg transition-colors ${errorLogin ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 focus:border-[#D4AF37] bg-gray-50'}`}
              />
              {errorLogin && <p className="text-red-500 text-xs mt-2 text-center">Clave incorrecta. Intente de nuevo.</p>}
            </div>
            <button type="submit" className="w-full bg-[#0F172A] text-white py-4 rounded font-bold tracking-wide hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg">
              INGRESAR AL SISTEMA
            </button>
          </form>
          <p className="mt-8 text-xs text-gray-400">Notaría Pública No. 1 • Lic. César Alejandro Uribe</p>
        </div>
      </div>
    );
  }

  // --- PANTALLA DEL LOBBY (EL CÓDIGO QUE YA TENÍAS) ---
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#334155] font-sans pb-20 animate-in fade-in duration-700">
      <nav className="bg-[#0F172A] text-white py-6 px-10 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D4AF37] flex items-center justify-center rounded-sm">
            <span className="text-[#D4AF37] font-serif font-bold">A</span>
          </div>
          <h1 className="text-2xl font-serif tracking-widest text-[#D4AF37]">ACTARIUM</h1>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-sm tracking-wide font-light hidden md:block">Lic. César Alejandro Uribe Vázquez</p>
          <div className="w-10 h-10 bg-[#334155] rounded-full flex items-center justify-center border border-[#D4AF37]">
            <span className="text-sm font-bold">CU</span>
          </div>
          <button onClick={cerrarSesion} className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors border-l border-gray-600 pl-6">
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
            <div className="bg-white h-full p-10 rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-[#D4AF37] transition-all duration-300 cursor-pointer flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-[#0F172A] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#D4AF37] transition-colors duration-300 shadow-md">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-2xl font-serif text-[#0F172A] mb-3">Producción Individual</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Auditoría minuciosa de los datos extraídos antes de generar un solo aviso.</p>
            </div>
          </Link>

          <Link href="/masiva">
            <div className="bg-white h-full p-10 rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-[#D4AF37] transition-all duration-300 cursor-pointer flex flex-col items-center text-center group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#D4AF37]"></div>
              <div className="w-20 h-20 bg-[#0F172A] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#D4AF37] transition-colors duration-300 shadow-md">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
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
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0F172A] text-white">
                  <tr>
                    <th className="p-4 font-medium tracking-wide">ID</th>
                    <th className="p-4 font-medium tracking-wide">Fecha y Hora</th>
                    <th className="p-4 font-medium tracking-wide">Escritura</th>
                    <th className="p-4 font-medium tracking-wide">Vendedor</th>
                    <th className="p-4 font-medium tracking-wide">Comprador</th>
                    <th className="p-4 font-medium tracking-wide text-center">Documento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historial.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-400 italic">No hay operaciones registradas aún. Genere un aviso para comenzar a nutrir el historial.</td>
                    </tr>
                  ) : (
                    historial.map((fila) => (
                      <tr key={fila.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-400 font-mono">#{fila.id}</td>
                        <td className="p-4 text-gray-500">{fila.fecha}</td>
                        <td className="p-4 font-bold text-[#0F172A]">{fila.escritura}</td>
                        <td className="p-4 truncate max-w-[200px]" title={fila.vendedor}>{fila.vendedor}</td>
                        <td className="p-4 truncate max-w-[200px]" title={fila.comprador}>{fila.comprador}</td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => descargarDelHistorial(fila.id, fila.archivo)}
                            className="bg-[#FEFCE8] text-[#A16207] border border-[#FEF08A] hover:bg-[#D4AF37] hover:text-white px-3 py-2 rounded text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
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