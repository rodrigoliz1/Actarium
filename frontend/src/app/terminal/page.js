"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Terminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [pestanaActiva, setPestanaActiva] = useState("produccion");
  const [vista, setVista] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [licencia, setLicencia] = useState("");

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarNuevaContrasena, setConfirmarNuevaContrasena] = useState("");
  const [pwdMsg, setPwdMsg] = useState({ text: "", type: "" });

  const [licenciaInfo, setLicenciaInfo] = useState(null);
  const [authMsg, setAuthMsg] = useState({ text: "", type: "" });
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") setIsDarkMode(true);

    const pagoEstatus = searchParams.get("pago");
    if (pagoEstatus === "exito") alert("¡Pago procesado con éxito! Tu plan ha sido actualizado.");
    if (pagoEstatus === "cancelado") alert("El pago fue cancelado.");

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        cargarHistorial();
        cargarDatosSuscripcion(session.user.id);
      }
      setCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        cargarHistorial();
        cargarDatosSuscripcion(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [searchParams]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("darkMode", !isDarkMode);
  };

  const cargarHistorial = async () => {
    const { data } = await supabase.from('historial').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setHistorial(data);
  };

  const cargarDatosSuscripcion = async (userId) => {
    const { data } = await supabase.from('licencias').select('*').eq('usada_por', userId).single();
    if (data) setLicenciaInfo(data);
  };

  const hacerLogin = async (e) => {
    e.preventDefault();
    setAuthMsg({ text: "Autenticando...", type: "info" });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthMsg({ text: "Correo o contraseña incorrectos.", type: "error" });
    else setAuthMsg({ text: "", type: "" });
  };

  const validarLicencia = async (e) => {
    e.preventDefault();
    setAuthMsg({ text: "Verificando licencia...", type: "info" });
    const { data, error } = await supabase.from('licencias').select('*').eq('codigo', licencia).single();

    if (error || !data) {
      setAuthMsg({ text: "La licencia ingresada es inválida o no existe.", type: "error" });
      return;
    }
    if (data.estado === 'usada') {
      setAuthMsg({ text: "Esta licencia ya fue registrada por otra notaría.", type: "error" });
      return;
    }
    setAuthMsg({ text: `¡Licencia Válida! Plan ${data.plan || 'Corporativo'}.`, type: "success" });
    setTimeout(() => { setVista("formulario-registro"); setAuthMsg({ text: "", type: "" }); }, 2000);
  };

  const registrarCuenta = async (e) => {
    e.preventDefault();
    setAuthMsg({ text: "Creando cuenta en bóveda segura...", type: "info" });
    if (password !== confirmPassword) return setAuthMsg({ text: "Las contraseñas no coinciden.", type: "error" });
    const regexPwd = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regexPwd.test(password)) return setAuthMsg({ text: "Mínimo 8 caracteres, una mayúscula y un número.", type: "error" });

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email, password, options: { data: { nombre_notaria: nombre } }
    });
    if (authError) return setAuthMsg({ text: authError.message, type: "error" });

    if (authData.user) {
      if (licencia) {
        // Si viene con un código manual
        await supabase.from('licencias').update({ estado: 'usada', usada_por: authData.user.id, fecha_activacion: new Date() }).eq('codigo', licencia);
      } else {
        // Si no trae código, le damos el plan prueba por default para que compre adentro
        await supabase.from('licencias').insert({
          codigo: "FREE-" + Math.floor(Math.random() * 10000), plan: 'Prueba', limite_mensual: 3, estado: 'activa', usada_por: authData.user.id, fecha_activacion: new Date()
        });
      }
    }
    setAuthMsg({ text: "¡Cuenta creada con éxito! Redirigiendo...", type: "success" });
  };

  const actualizarContrasena = async (e) => {
    e.preventDefault();
    setPwdMsg({ text: "Actualizando contraseña...", type: "info" });
    if (nuevaContrasena !== confirmarNuevaContrasena) return setPwdMsg({ text: "Las contraseñas no coinciden.", type: "error" });

    const regexPwd = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regexPwd.test(nuevaContrasena)) return setPwdMsg({ text: "Debe cumplir con: 8+ caracteres, 1 mayúscula y 1 número.", type: "error" });

    const { error } = await supabase.auth.updateUser({ password: nuevaContrasena });
    if (error) setPwdMsg({ text: error.message, type: "error" });
    else {
      setPwdMsg({ text: "¡Contraseña actualizada con éxito!", type: "success" });
      setNuevaContrasena(""); setConfirmarNuevaContrasena("");
    }
  };

  const iniciarPago = async (nombrePlan) => {
    try {
      const payload = { plan: nombrePlan, user_id: session.user.id, email: session.user.email };
      const res = await fetch("https://actarium-yqof.onrender.com/create-checkout-session", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.url;
      } else {
        alert("Integración de pagos en mantenimiento. " + (data.error || ""));
      }
    } catch (e) { alert("Error conectando con la pasarela financiera."); }
  };

  const descargarArchivo = async (nombreArchivo) => {
    if (!nombreArchivo) return alert("Sin archivo adjunto.");
    const { data, error } = await supabase.storage.from('avisos_generados').download(nombreArchivo);
    if (!error) {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url; a.download = nombreArchivo; a.click();
    } else alert("Error al descargar archivo.");
  };

  const reEditar = (datosJsonStr) => {
    if (!datosJsonStr) return alert("No hay datos guardados para este aviso antiguo.");
    localStorage.setItem("aviso_editar", datosJsonStr);
    router.push("/individual");
  };

  if (cargando) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>;

  const bgPrincipal = isDarkMode ? "bg-[#0A0F1D]" : "bg-[#FAFAFA]";
  const textPrincipal = isDarkMode ? "text-gray-200" : "text-[#334155]";
  const textTitulo = isDarkMode ? "text-white" : "text-[#0F172A]";
  const bgCard = isDarkMode ? "bg-[#121B30] border-gray-800/80 shadow-2xl" : "bg-white border-gray-200 shadow-sm";
  const bgTableHead = isDarkMode ? "bg-[#090E1A] text-gray-400" : "bg-[#0F172A] text-white";
  const tableRowHover = isDarkMode ? "hover:bg-[#18233C]" : "hover:bg-gray-50";
  const borderBline = isDarkMode ? "border-gray-800" : "border-gray-100";
  const inputClass = isDarkMode ? "bg-[#18243E] border-gray-700 text-white focus:border-[#D4AF37]" : "bg-gray-50 border-gray-200 text-[#334155] focus:border-[#D4AF37]";

  // --- PANTALLA DE ACCESO PARA NO LOGEADOS ---
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center font-sans relative overflow-hidden px-4 py-10">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-[#D4AF37] opacity-10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="z-10 w-full max-w-md bg-white/95 p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-white/20 text-[#334155]">
          <div className="flex justify-center mb-6"><img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" /></div>

          {vista === "login" && (
            <div className="text-center animate-in fade-in">
              <h1 className="text-3xl font-serif tracking-widest text-[#0F172A] mb-1">ACTARIUM</h1>
              <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] mb-8 uppercase">Acceso Corporativo</p>

              <form onSubmit={hacerLogin} className="space-y-4 text-left">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-[#D4AF37] bg-white text-sm" placeholder="Correo institucional" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-[#D4AF37] bg-white text-sm" placeholder="Contraseña" />
                {authMsg.text && <p className={`text-xs text-center font-medium ${authMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{authMsg.text}</p>}
                <button type="submit" className="w-full bg-[#0F172A] text-[#D4AF37] py-4 rounded-xl font-bold tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all mt-2">INGRESAR</button>
              </form>

              {/* BOTONES CLAROS SOLICITADOS POR EL USUARIO */}
              <div className="mt-8 flex flex-col gap-3">
                <button onClick={() => { setVista("formulario-registro"); setAuthMsg({ text: "", type: "" }); setLicencia(""); }} className="w-full border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                  Crear Cuenta / Comprar Licencia
                </button>
                <button onClick={() => { setVista("validar-licencia"); setAuthMsg({ text: "", type: "" }); }} className="text-xs text-gray-400 hover:text-[#0F172A] font-medium underline underline-offset-4">
                  Tengo un código (Registrar Licencia manual)
                </button>
              </div>

              {/* BOTÓN REGRESAR AL INICIO */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link href="/" className="text-xs text-gray-400 hover:text-[#0F172A] flex items-center justify-center gap-2 font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  Volver a la página principal
                </Link>
              </div>
            </div>
          )}

          {vista === "validar-licencia" && (
            <div className="text-center animate-in slide-in-from-right-4 fade-in">
              <h2 className="text-2xl font-serif text-[#0F172A] mb-2">Activación Manual</h2>
              <p className="text-gray-500 text-xs mb-6">Ingrese su código si adquirió su licencia por transferencia o a través de un distribuidor.</p>
              <form onSubmit={validarLicencia} className="space-y-4">
                <input type="text" required value={licencia} onChange={(e) => setLicencia(e.target.value.toUpperCase())} className="w-full p-4 border-2 border-gray-200 rounded-xl text-center font-mono text-lg tracking-widest outline-none focus:border-[#D4AF37]" placeholder="ACT-XXXX-XXXX" />
                {authMsg.text && <p className={`text-xs text-center font-medium ${authMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{authMsg.text}</p>}
                <button type="submit" className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-bold tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all">VALIDAR CÓDIGO</button>
              </form>
              <button onClick={() => { setVista("login"); setAuthMsg({ text: "", type: "" }); }} className="mt-6 text-xs text-gray-400 hover:text-[#0F172A]">← Cancelar y volver al login</button>
            </div>
          )}

          {vista === "formulario-registro" && (
            <form onSubmit={registrarCuenta} className="space-y-4 text-left animate-in slide-in-from-right-4 fade-in">
              <h2 className="text-2xl font-serif text-[#0F172A] text-center mb-1">Registro de Notaría</h2>
              <p className="text-gray-500 text-xs mb-6 text-center">{licencia ? `Registrando la licencia: ${licencia}` : "Cree su cuenta gratuita. Podrá adquirir su plan dentro de la plataforma."}</p>

              <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm" placeholder="Nombre de la Notaría (Ej. Notaría No. 1)" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm" placeholder="Correo Administrador" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm" placeholder="Contraseña" />
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm" placeholder="Confirmar Contraseña" />

              {authMsg.text && <p className={`text-xs text-center font-medium ${authMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{authMsg.text}</p>}

              <button type="submit" className="w-full bg-[#D4AF37] text-[#0F172A] py-3 rounded-xl font-bold tracking-widest hover:bg-black hover:text-white transition-all shadow-lg">FINALIZAR REGISTRO</button>
              <div className="text-center mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setVista("login"); setAuthMsg({ text: "", type: "" }); setLicencia(""); }} className="text-xs text-gray-500 hover:text-[#0F172A]">← Volver al login</button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- LOBBY DE USUARIO LOGEADO (Mantenido intacto) ---
  const avisosConsumidos = licenciaInfo?.usos_mes || 0;
  const limiteAvisos = licenciaInfo?.limite_mensual || 3;
  const porcentajeUso = Math.min((avisosConsumidos / limiteAvisos) * 100, 100);

  return (
    <div className={`min-h-screen ${bgPrincipal} ${textPrincipal} font-sans pb-20 transition-colors duration-500`}>
      <nav className="bg-[#0F172A] text-white py-4 px-6 md:px-10 flex justify-between items-center shadow-xl border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo Actarium" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-lg md:text-xl font-serif tracking-widest text-[#D4AF37]">ACTARIUM</h1>
            <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold hidden sm:block">Notary Management Ecosystem</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-[#1E293B] p-1 rounded-xl border border-gray-700">
            <button onClick={() => setPestanaActiva("produccion")} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${pestanaActiva === 'produccion' ? 'bg-[#D4AF37] text-[#0F172A] shadow-md' : 'text-gray-400 hover:text-white'}`}>Producción</button>
            <button onClick={() => setPestanaActiva("cuenta")} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${pestanaActiva === 'cuenta' ? 'bg-[#D4AF37] text-[#0F172A] shadow-md' : 'text-gray-400 hover:text-white'}`}>Mi Cuenta</button>
          </div>
          <button onClick={toggleDarkMode} className="text-xl hover:scale-110 transition-transform hidden sm:block">{isDarkMode ? "☀️" : "🌙"}</button>
          <button onClick={async () => await supabase.auth.signOut()} className="text-xs uppercase tracking-widest text-gray-400 hover:text-white border-l border-gray-700 pl-4">Salir</button>
        </div>
      </nav>

      {pestanaActiva === "produccion" && (
        <main className="max-w-6xl mx-auto mt-12 px-6 animate-in fade-in duration-300">

          {avisosConsumidos >= limiteAvisos && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center justify-between animate-pulse">
              <p className="text-red-500 font-bold text-sm">⚠️ Has alcanzado el límite de tu plan actual ({limiteAvisos} Avisos). Tus funciones de generación están bloqueadas.</p>
              <button onClick={() => setPestanaActiva("cuenta")} className="bg-red-500 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-widest">Renovar ahora</button>
            </div>
          )}

          <div className="text-center mb-12">
            <h2 className={`text-4xl font-serif ${textTitulo} mb-2`}>Consola Notarial</h2>
            <p className="text-sm text-gray-400 font-light">Conectado a la Bóveda de {session.user.user_metadata?.nombre_notaria || session.user.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Link href={avisosConsumidos >= limiteAvisos ? "#" : "/individual"}>
              <div className={`${bgCard} p-8 rounded-2xl border ${avisosConsumidos >= limiteAvisos ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#D4AF37] cursor-pointer'} transition-all duration-300 flex flex-col items-center text-center group`}>
                <div className="w-16 h-16 bg-[#0F172A] rounded-full flex items-center justify-center mb-4 text-2xl group-hover:bg-[#D4AF37] text-[#D4AF37] group-hover:text-[#0F172A] transition-all">📄</div>
                <h3 className={`text-xl font-serif ${textTitulo} mb-2`}>Producción Individual</h3>
                <p className="text-xs text-gray-400 font-light">Auditoría minuciosa y ruteo automatizado por municipio.</p>
              </div>
            </Link>
            <Link href={avisosConsumidos >= limiteAvisos ? "#" : "/masiva"}>
              <div className={`${bgCard} p-8 rounded-2xl border ${avisosConsumidos >= limiteAvisos ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#D4AF37] cursor-pointer'} transition-all duration-300 flex flex-col items-center text-center group`}>
                <div className="w-16 h-16 bg-[#0F172A] rounded-full flex items-center justify-center mb-4 text-2xl group-hover:bg-[#D4AF37] text-[#D4AF37] group-hover:text-[#0F172A] transition-all">📂</div>
                <h3 className={`text-xl font-serif ${textTitulo} mb-2`}>Producción Masiva</h3>
                <p className="text-xs text-gray-400 font-light">Procesamiento por lote de alta velocidad estructurado en carpetas ZIP.</p>
              </div>
            </Link>
          </div>

          <h3 className={`text-xl font-serif ${textTitulo} mb-4 flex items-center gap-2`}><span>🗄️</span> Bóveda Inmortal de Avisos</h3>
          <div className={`${bgCard} rounded-2xl border overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className={bgTableHead}>
                  <tr>
                    <th className="p-4 font-bold text-xs uppercase">Fecha</th>
                    <th className="p-4 font-bold text-xs uppercase">Escritura</th>
                    <th className="p-4 font-bold text-xs uppercase">Vendedor</th>
                    <th className="p-4 font-bold text-xs uppercase text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/10">
                  {historial.length === 0 ? (
                    <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">No hay registros guardados en esta cuenta.</td></tr>
                  ) : (
                    historial.map((fila) => (
                      <tr key={fila.id} className={`${tableRowHover} transition-colors border-b ${borderBline}`}>
                        <td className="p-4 text-gray-400">{new Date(fila.created_at).toLocaleDateString()}</td>
                        <td className={`p-4 font-bold ${textTitulo}`}>{fila.escritura}</td>
                        <td className="p-4 truncate max-w-[200px]" title={fila.vendedor}>{fila.vendedor}</td>
                        <td className="p-4 flex items-center justify-center gap-2">
                          <button onClick={() => {
                            if (avisosConsumidos >= limiteAvisos) alert("Renueva tu plan para re-editar");
                            else reEditar(fila.datos_json);
                          }} className="bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-800 hover:text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all">✏️ Re-editar</button>
                          <button onClick={() => descargarArchivo(fila.archivo)} className="bg-[#FEFCE8] text-[#A16207] border border-[#FEF08A] hover:bg-[#D4AF37] hover:text-[#0F172A] px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all">📥 Descargar</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {pestanaActiva === "cuenta" && (
        <main className="max-w-5xl mx-auto mt-12 px-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className={`${bgCard} p-6 rounded-2xl border text-center relative overflow-hidden`}>
                <div className="absolute top-0 right-0 bg-[#0F172A] text-[#D4AF37] font-black uppercase tracking-widest text-[9px] px-4 py-1 rounded-bl-xl shadow">
                  Plan {licenciaInfo?.plan || "Prueba"}
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 mt-2">Uso Mensual</h3>

                <div className="relative pt-4">
                  <div className="w-full bg-gray-200/20 rounded-full h-2 mb-4 overflow-hidden">
                    <div className={`h-2 rounded-full transition-all duration-1000 ${porcentajeUso >= 100 ? 'bg-red-500' : 'bg-[#D4AF37]'}`} style={{ width: `${porcentajeUso}%` }}></div>
                  </div>
                  <p className={`text-4xl font-serif font-black mb-1 ${isDarkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                    {avisosConsumidos} <span className="text-lg font-sans font-light text-gray-400">/ {limiteAvisos}</span>
                  </p>
                  <p className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Avisos Generados</p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200/10 text-left text-xs space-y-3">
                  <div className="flex justify-between"><span className="text-gray-400">Estado:</span><span className={`font-bold uppercase ${porcentajeUso >= 100 ? 'text-red-500' : 'text-green-500'}`}>{porcentajeUso >= 100 ? 'Agotado' : 'Activo'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Vence / Renueva:</span><span className="font-medium text-gray-400">{licenciaInfo?.fecha_renovacion ? new Date(licenciaInfo.fecha_renovacion).toLocaleDateString() : "Ilimitado en prueba"}</span></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className={`${bgCard} p-8 rounded-2xl border`}>
                <h3 className={`text-xl font-serif ${textTitulo} mb-1 flex items-center gap-2`}><span>🚀</span> Mejora tu Productividad</h3>
                <p className="text-xs text-gray-400 mb-6">Desbloquea límites superiores para tu Notaría al instante con nuestra pasarela segura.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`border rounded-xl p-5 text-center flex flex-col justify-between transition-transform hover:scale-105 ${isDarkMode ? 'border-[#D4AF37]/30 bg-[#0F172A]' : 'border-[#D4AF37]/50 bg-[#FEFCE8]/30'}`}>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#D4AF37]">Plan ORO</h4>
                      <p className={`text-2xl font-black my-2 ${textTitulo}`}>$999 <span className="text-[10px] font-light text-gray-500">MXN/mes</span></p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 border-t border-b border-gray-500/20 py-2 my-4">10 Avisos Mensuales</p>
                    </div>
                    <button onClick={() => iniciarPago("Oro")} className="w-full bg-[#0F172A] text-white text-xs py-2 rounded-lg font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors">Adquirir</button>
                  </div>

                  <div className={`border rounded-xl p-5 text-center flex flex-col justify-between transition-transform hover:scale-105 shadow-xl relative ${isDarkMode ? 'border-gray-500 bg-[#1E293B]' : 'border-gray-300 bg-white'}`}>
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#0F172A] text-white text-[8px] font-bold uppercase px-3 py-1 rounded-full tracking-widest">Popular</div>
                    <div>
                      <h4 className={`font-serif text-lg font-bold ${textTitulo}`}>PLATINO</h4>
                      <p className={`text-2xl font-black my-2 ${textTitulo}`}>$1,899 <span className="text-[10px] font-light text-gray-500">MXN/mes</span></p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 border-t border-b border-gray-500/20 py-2 my-4">20 Avisos Mensuales</p>
                    </div>
                    <button onClick={() => iniciarPago("Platino")} className="w-full bg-[#D4AF37] text-[#0F172A] text-xs py-2 rounded-lg font-bold uppercase tracking-widest hover:bg-[#0F172A] hover:text-[#D4AF37] transition-colors">Adquirir</button>
                  </div>

                  <div className={`border rounded-xl p-5 text-center flex flex-col justify-between transition-transform hover:scale-105 ${isDarkMode ? 'border-gray-800 bg-black' : 'border-gray-800 bg-[#0F172A]'}`}>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-white">BLACK</h4>
                      <p className="text-2xl font-black my-2 text-white">$3,999 <span className="text-[10px] font-light text-gray-400">MXN/mes</span></p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 border-t border-b border-gray-700 py-2 my-4">50 Avisos Mensuales</p>
                    </div>
                    <button onClick={() => iniciarPago("Black")} className="w-full bg-white text-[#0F172A] text-xs py-2 rounded-lg font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">Adquirir</button>
                  </div>
                </div>
              </div>

              <div className={`${bgCard} p-8 rounded-2xl border`}>
                <h3 className={`text-xl font-serif ${textTitulo} mb-1`}>Seguridad de la Cuenta</h3>
                <p className="text-xs text-gray-400 mb-6">Actualice las credenciales de acceso institucional.</p>
                <form onSubmit={actualizarContrasena} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 block">Nueva Contraseña</label><input type="password" required value={nuevaContrasena} onChange={e => setNuevaContrasena(e.target.value)} className={`w-full p-3 rounded-lg border outline-none text-sm transition-colors ${inputClass}`} placeholder="••••••••" /></div>
                    <div><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 block">Confirmar Contraseña</label><input type="password" required value={confirmarNuevaContrasena} onChange={e => setConfirmarNuevaContrasena(e.target.value)} className={`w-full p-3 rounded-lg border outline-none text-sm transition-colors ${inputClass}`} placeholder="••••••••" /></div>
                  </div>
                  {pwdMsg.text && <p className={`text-xs p-2.5 rounded font-medium text-center ${pwdMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{pwdMsg.text}</p>}
                  <div className="flex justify-end pt-2"><button type="submit" className="bg-[#0F172A] text-[#D4AF37] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors shadow-md">Guardar Cambios</button></div>
                </form>
              </div>
            </div>

          </div>
        </main>
      )}
    </div>
  );
}