"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// CONEXIÓN DIRECTA A TU BÓVEDA (Reemplaza aquí)

// Ocultamos las llaves usando variables de entorno públicas de Next.js
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Terminal() {
  const [session, setSession] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados del Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [authMsg, setAuthMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) cargarHistorial();
      setCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) cargarHistorial();
    });

    return () => subscription.unsubscribe();
  }, []);

  const cargarHistorial = async () => {
    const { data, error } = await supabase.from('historial').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setHistorial(data);
  };

  const autenticar = async (e) => {
    e.preventDefault();
    setAuthMsg({ text: "Procesando...", type: "info" });
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthMsg({ text: "Credenciales incorrectas.", type: "error" });
      else setAuthMsg({ text: "", type: "" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthMsg({ text: error.message, type: "error" });
      else setAuthMsg({ text: "¡Cuenta creada! Ya puedes iniciar sesión.", type: "success" });
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
  };

  const descargarArchivo = async (nombreArchivo) => {
    if (!nombreArchivo) return alert("Sin archivo adjunto.");
    setAuthMsg({ text: "Descargando desde la bóveda...", type: "info" });
    
    const { data, error } = await supabase.storage.from('avisos_generados').download(nombreArchivo);
    if (error) {
      alert("Error al descargar el archivo físico.");
    } else {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo;
      a.click();
    }
    setAuthMsg({ text: "", type: "" });
  };

  if (cargando) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>;

  // --- PANTALLA DE LOGIN COMERCIAL ---
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center font-sans relative overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-[#D4AF37] opacity-10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-blue-600 opacity-10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 text-center">
          <div className="flex justify-center mb-6"><img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain drop-shadow-xl" /></div>
          <h1 className="text-3xl font-serif tracking-widest text-[#0F172A] mb-1">ACTARIUM</h1>
          <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] mb-8 uppercase">Acceso Corporativo</p>

          <form onSubmit={autenticar} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Correo Institucional</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-[#D4AF37] transition-all bg-white" placeholder="notaria@ejemplo.com"/>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Contraseña</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-[#D4AF37] transition-all bg-white" placeholder="••••••••"/>
            </div>
            
            {authMsg.text && (
              <p className={`text-xs text-center font-medium ${authMsg.type === 'error' ? 'text-red-500' : 'text-[#D4AF37]'}`}>{authMsg.text}</p>
            )}

            <button type="submit" className="w-full bg-[#0F172A] text-[#D4AF37] py-4 rounded-xl font-bold tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all duration-300 shadow-xl mt-2">
              {isLogin ? "INGRESAR AL SISTEMA" : "CREAR MI CUENTA"}
            </button>
          </form>
          
          <button onClick={() => setIsLogin(!isLogin)} className="mt-6 text-xs text-gray-400 hover:text-[#D4AF37] transition-colors">
            {isLogin ? "¿No tienes cuenta? Registra tu Notaría aquí" : "Ya tengo cuenta. Iniciar Sesión"}
          </button>
        </div>
      </div>
    );
  }

  // --- PANTALLA DEL LOBBY DE LA NOTARÍA ---
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#334155] font-sans pb-20 animate-in fade-in duration-700">
      <nav className="bg-[#0F172A] text-white py-4 px-10 flex justify-between items-center shadow-xl border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo Actarium" className="w-10 h-10 object-contain drop-shadow-md" />
          <h1 className="text-xl font-serif tracking-widest text-[#D4AF37] mt-1">ACTARIUM</h1>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-sm tracking-wide font-light hidden md:block">{session.user.email}</p>
          <div className="w-10 h-10 bg-[#334155] rounded-full flex items-center justify-center border border-[#D4AF37] shadow-inner">
            <span className="text-sm font-bold text-[#D4AF37]">{session.user.email.charAt(0).toUpperCase()}</span>
          </div>
          <button onClick={cerrarSesion} className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors border-l border-gray-600 pl-6 h-6">Cerrar Sesión</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto mt-16 px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-[#0F172A] mb-4">Lobby de Producción</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Conectado a Bóveda Criptográfica y Motor Cognitivo OpenAI.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          <Link href="/individual">
            <div className="bg-white h-full p-10 rounded-2xl shadow-sm border border-gray-200 hover:shadow-2xl hover:border-[#D4AF37] transition-all duration-500 cursor-pointer flex flex-col items-center text-center group transform hover:-translate-y-1">
              <div className="w-24 h-24 bg-[#0F172A] rounded-full flex items-center justify-center mb-8 group-hover:bg-[#D4AF37] transition-colors duration-500 shadow-lg"><span className="text-3xl">📄</span></div>
              <h3 className="text-2xl font-serif text-[#0F172A] mb-3">Producción Individual</h3>
              <p className="text-sm text-gray-500">Auditoría minuciosa de los datos extraídos por IA antes de generar el aviso.</p>
            </div>
          </Link>
          <div className="bg-white/50 h-full p-10 rounded-2xl border border-gray-200 flex flex-col items-center text-center opacity-60 cursor-not-allowed">
             <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mb-8"><span className="text-3xl">🔒</span></div>
             <h3 className="text-2xl font-serif text-gray-500 mb-3">Producción Masiva</h3>
             <p className="text-sm text-gray-400">Requiere Plan Premium. Contacte a ventas.</p>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-serif text-[#0F172A] mb-6 flex items-center gap-3">
            <span className="text-[#D4AF37] text-2xl">🗄️</span> Archivo Maestro (Bóveda en la Nube)
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0F172A] text-white">
                  <tr>
                    <th className="p-5 font-medium tracking-wider text-xs uppercase">Fecha</th>
                    <th className="p-5 font-medium tracking-wider text-xs uppercase">Escritura</th>
                    <th className="p-5 font-medium tracking-wider text-xs uppercase">Vendedor</th>
                    <th className="p-5 font-medium tracking-wider text-xs uppercase text-center">Bóveda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historial.length === 0 ? (
                    <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">No hay operaciones registradas en su cuenta.</td></tr>
                  ) : (
                    historial.map((fila) => (
                      <tr key={fila.id} className="hover:bg-gray-50">
                        <td className="p-5 text-gray-500">{new Date(fila.created_at).toLocaleDateString()}</td>
                        <td className="p-5 font-bold text-[#0F172A]">{fila.escritura}</td>
                        <td className="p-5 truncate max-w-[200px]" title={fila.vendedor}>{fila.vendedor}</td>
                        <td className="p-5 text-center">
                          <button onClick={() => descargarArchivo(fila.archivo)} className="bg-[#FEFCE8] text-[#A16207] border border-[#FEF08A] hover:bg-[#D4AF37] hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
                            DESCARGAR
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