"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Terminal() {
  const [session, setSession] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Flujo de UI: 'login' | 'opciones-registro' | 'validar-licencia' | 'formulario-registro'
  const [vista, setVista] = useState("login");
  
  // Estados de Formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [licencia, setLicencia] = useState("");
  
  // UI Auxiliar
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authMsg, setAuthMsg] = useState({ text: "", type: "" });
  const [estadoLicencia, setEstadoLicencia] = useState("idle"); // idle | checking | valid | invalid | used
  const [detallesLicencia, setDetallesLicencia] = useState(null);

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
    const { data } = await supabase.from('historial').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setHistorial(data);
  };

  // 1. INICIAR SESIÓN
  const hacerLogin = async (e) => {
    e.preventDefault();
    setAuthMsg({ text: "Autenticando...", type: "info" });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthMsg({ text: "Correo o contraseña incorrectos.", type: "error" });
    else setAuthMsg({ text: "", type: "" });
  };

  // 2. VALIDAR LICENCIA EN BASE DE DATOS
  const validarLicencia = async (e) => {
    e.preventDefault();
    setEstadoLicencia("checking");
    setAuthMsg({ text: "Verificando licencia en el servidor...", type: "info" });

    const { data, error } = await supabase.from('licencias').select('*').eq('codigo', licencia).single();
    
    if (error || !data) {
      setEstadoLicencia("invalid");
      setAuthMsg({ text: "La licencia ingresada es inválida o no existe.", type: "error" });
      return;
    }
    if (data.estado === 'usada') {
      setEstadoLicencia("used");
      setAuthMsg({ text: "Esta licencia ya fue registrada por otra notaría.", type: "error" });
      return;
    }

    setDetallesLicencia(data);
    setEstadoLicencia("valid");
    setAuthMsg({ text: `¡Licencia Válida! Plan corporativo de ${data.duracion_meses} meses.`, type: "success" });
    
    // Transición suave al formulario de registro
    setTimeout(() => {
      setVista("formulario-registro");
      setAuthMsg({ text: "", type: "" });
    }, 2000);
  };

  // 3. REGISTRAR USUARIO
  const registrarCuenta = async (e) => {
    e.preventDefault();
    setAuthMsg({ text: "Creando cuenta en bóveda segura...", type: "info" });

    // Validaciones de Contraseña
    if (password !== confirmPassword) {
      return setAuthMsg({ text: "Las contraseñas no coinciden.", type: "error" });
    }
    const regexPwd = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regexPwd.test(password)) {
      return setAuthMsg({ text: "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.", type: "error" });
    }

    // Registrar en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email, password, options: { data: { nombre_notaria: nombre } }
    });

    if (authError) {
      return setAuthMsg({ text: authError.message, type: "error" });
    }

    // Quemar la licencia (Marcarla como usada)
    if (authData.user) {
      await supabase.from('licencias').update({ 
        estado: 'usada', 
        usada_por: authData.user.id, 
        fecha_activacion: new Date() 
      }).eq('codigo', licencia);
    }

    setAuthMsg({ text: "¡Cuenta creada con éxito! Redirigiendo al Lobby...", type: "success" });
  };

  const cerrarSesion = async () => await supabase.auth.signOut();

  const descargarArchivo = async (nombreArchivo) => {
    if (!nombreArchivo) return alert("Sin archivo adjunto.");
    const { data, error } = await supabase.storage.from('avisos_generados').download(nombreArchivo);
    if (!error) {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url; a.download = nombreArchivo; a.click();
    } else {
      alert("Error al descargar archivo.");
    }
  };

  if (cargando) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>;

  // --- PANTALLA DE SISTEMA DE ACCESO Y LICENCIAS ---
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center font-sans relative overflow-hidden px-4">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-[#D4AF37] opacity-10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-blue-600 opacity-10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 transition-all duration-500 overflow-hidden">
          
          <div className="flex justify-center mb-6"><img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain drop-shadow-xl" /></div>
          
          {/* VISTA 1: LOGIN */}
          {vista === "login" && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 text-center">
              <h1 className="text-3xl font-serif tracking-widest text-[#0F172A] mb-1">ACTARIUM</h1>
              <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] mb-8 uppercase">Acceso Corporativo</p>
              <form onSubmit={hacerLogin} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Correo Institucional</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-[#D4AF37] bg-white transition-colors" placeholder="notaria@ejemplo.com"/>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Contraseña</label>
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-[#D4AF37] bg-white transition-colors pr-12" placeholder="••••••••"/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] text-gray-400 hover:text-[#D4AF37] focus:outline-none">
                    {showPassword ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.188-1.556c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29"></path></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>}
                  </button>
                </div>
                {authMsg.text && <p className={`text-xs text-center font-medium ${authMsg.type === 'error' ? 'text-red-500' : 'text-[#D4AF37]'}`}>{authMsg.text}</p>}
                <button type="submit" className="w-full bg-[#0F172A] text-[#D4AF37] py-4 rounded-xl font-bold tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg mt-2">INGRESAR</button>
              </form>
              
              <div className="mt-8 flex flex-col items-center gap-4">
                <button onClick={() => {setVista("opciones-registro"); setAuthMsg({text:"", type:""});}} className="text-xs text-gray-400 hover:text-[#D4AF37] transition-colors border-b border-transparent hover:border-[#D4AF37] pb-1">
                  ¿No tienes cuenta? Crear una Notaría
                </button>
                <Link href="/" className="text-xs text-gray-500 hover:text-[#0F172A] transition-colors font-medium">
                  ← Volver a la página principal
                </Link>
              </div>
            </div>
          )}

          {/* VISTA 2: OPCIONES DE REGISTRO */}
          {vista === "opciones-registro" && (
            <div className="animate-in slide-in-from-right fade-in duration-300 text-center">
              <h2 className="text-2xl font-serif text-[#0F172A] mb-2">Crear Cuenta</h2>
              <p className="text-gray-500 text-sm mb-8">El acceso a Actarium requiere una licencia corporativa válida.</p>
              
              <div className="space-y-4">
                <button onClick={() => setVista("validar-licencia")} className="w-full flex items-center justify-between p-5 border-2 border-gray-100 rounded-2xl hover:border-[#D4AF37] hover:bg-[#FEFCE8] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-white text-xl">🔑</div>
                    <div className="text-left"><p className="font-bold text-[#0F172A]">Registrar Licencia</p><p className="text-[10px] text-gray-400 uppercase tracking-widest">Ya tengo un código</p></div>
                  </div>
                  <span className="text-gray-300 group-hover:text-[#D4AF37]">→</span>
                </button>

                <Link href="/pricing" className="w-full flex items-center justify-between p-5 border-2 border-gray-100 rounded-2xl hover:border-[#D4AF37] hover:bg-[#FEFCE8] transition-all group cursor-pointer block">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-white text-xl">💳</div>
                    <div className="text-left"><p className="font-bold text-[#0F172A]">Comprar Licencia</p><p className="text-[10px] text-gray-400 uppercase tracking-widest">Ver planes de precios</p></div>
                  </div>
                  <span className="text-gray-300 group-hover:text-[#D4AF37]">→</span>
                </Link>
              </div>
              <button onClick={() => setVista("login")} className="mt-8 text-xs text-gray-400 hover:text-[#0F172A]">← Volver al login</button>
            </div>
          )}

          {/* VISTA 3: VALIDAR LICENCIA */}
          {vista === "validar-licencia" && (
            <div className="animate-in slide-in-from-right fade-in duration-300 text-center">
              <h2 className="text-2xl font-serif text-[#0F172A] mb-2">Activación</h2>
              <p className="text-gray-500 text-sm mb-6">Ingrese su código de licencia oficial (Ej. ACT-XXXXX).</p>
              
              <form onSubmit={validarLicencia} className="text-left space-y-4">
                <div>
                  <input type="text" required value={licencia} onChange={(e) => setLicencia(e.target.value.toUpperCase())} className={`w-full p-4 border-2 rounded-xl outline-none text-center font-mono text-lg tracking-widest transition-colors uppercase ${estadoLicencia === 'invalid' || estadoLicencia === 'used' ? 'border-red-400 bg-red-50 text-red-700' : estadoLicencia === 'valid' ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 focus:border-[#D4AF37]'}`} placeholder="ACT-XXXX-XXXX"/>
                </div>
                {authMsg.text && <p className={`text-xs text-center font-medium ${authMsg.type === 'error' ? 'text-red-500' : authMsg.type === 'success' ? 'text-green-600' : 'text-[#D4AF37]'}`}>{authMsg.text}</p>}
                
                <button type="submit" disabled={estadoLicencia === 'checking'} className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-bold tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                  {estadoLicencia === 'checking' ? "VERIFICANDO..." : "VALIDAR CÓDIGO"}
                </button>
              </form>
              <button onClick={() => {setVista("opciones-registro"); setAuthMsg({text:"", type:""}); setEstadoLicencia("idle");}} className="mt-8 text-xs text-gray-400 hover:text-[#0F172A]">← Volver atrás</button>
            </div>
          )}

          {/* VISTA 4: FORMULARIO DE REGISTRO (Solo se muestra tras validar licencia) */}
          {vista === "formulario-registro" && (
            <div className="animate-in slide-in-from-right fade-in duration-500 text-center">
              <div className="bg-green-50 text-green-700 p-2 rounded-lg text-xs font-bold uppercase tracking-widest mb-6 border border-green-200">
                ✓ Licencia {licencia} Activa
              </div>
              <h2 className="text-2xl font-serif text-[#0F172A] mb-6">Datos de la Notaría</h2>
              
              <form onSubmit={registrarCuenta} className="text-left space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block ml-1">Titular o Notaría</label>
                  <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#D4AF37] text-sm" placeholder="Ej. Notaría Pública No. 1"/>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block ml-1">Correo Administrador</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#D4AF37] text-sm" placeholder="contacto@notaria.com"/>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block ml-1">Contraseña</label>
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#D4AF37] text-sm pr-10"/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[28px] text-gray-400 hover:text-[#D4AF37]">
                      {showPassword ? <span className="text-[10px] uppercase font-bold">Ocultar</span> : <span className="text-[10px] uppercase font-bold">Ver</span>}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block ml-1">Confirmar</label>
                    <input type={showConfirm ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#D4AF37] text-sm pr-10"/>
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-[28px] text-gray-400 hover:text-[#D4AF37]">
                       {showConfirm ? <span className="text-[10px] uppercase font-bold">Ocultar</span> : <span className="text-[10px] uppercase font-bold">Ver</span>}
                    </button>
                  </div>
                </div>

                <p className="text-[9px] text-gray-400 px-1">* Mínimo 8 caracteres. Debe incluir al menos una letra mayúscula y un número.</p>

                {authMsg.text && <p className={`text-xs text-center font-medium p-2 rounded ${authMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-[#FEFCE8] text-[#A16207]'}`}>{authMsg.text}</p>}
                
                <button type="submit" className="w-full bg-[#D4AF37] text-[#0F172A] py-4 rounded-xl font-bold tracking-widest hover:bg-[#0F172A] hover:text-[#D4AF37] transition-all shadow-lg mt-2">
                  FINALIZAR REGISTRO
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- PANTALLA DEL LOBBY DE LA NOTARÍA (Una vez que inician sesión) ---
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#334155] font-sans pb-20 animate-in fade-in duration-700">
      <nav className="bg-[#0F172A] text-white py-4 px-10 flex justify-between items-center shadow-xl border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo Actarium" className="w-10 h-10 object-contain drop-shadow-md" />
          <h1 className="text-xl font-serif tracking-widest text-[#D4AF37] mt-1">ACTARIUM</h1>
        </div>
        <div className="flex items-center gap-6">
          {/* Mostramos el nombre de la notaría que guardamos al registrar */}
          <p className="text-sm tracking-wide font-light hidden md:block text-[#D4AF37] font-bold">
            {session.user.user_metadata?.nombre_notaria || session.user.email}
          </p>
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
          <Link href="/masiva">
            <div className="bg-white h-full p-10 rounded-2xl shadow-sm border border-gray-200 hover:shadow-2xl hover:border-[#D4AF37] transition-all duration-500 cursor-pointer flex flex-col items-center text-center group transform hover:-translate-y-1">
              <div className="w-24 h-24 bg-[#0F172A] rounded-full flex items-center justify-center mb-8 group-hover:bg-[#D4AF37] transition-colors duration-500 shadow-lg"><span className="text-3xl">📂</span></div>
              <h3 className="text-2xl font-serif text-[#0F172A] mb-3">Producción Masiva</h3>
              <p className="text-sm text-gray-500">Subir múltiples documentos y empaquetar los avisos en ZIP.</p>
            </div>
          </Link>
        </div>

        <div>
          <h3 className="text-2xl font-serif text-[#0F172A] mb-6 flex items-center gap-3">
            <span className="text-[#D4AF37] text-2xl">🗄️</span> Archivo Maestro (Bóveda de la Notaría)
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