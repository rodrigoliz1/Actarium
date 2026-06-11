"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// --- COMPONENTE INTERNO CON LA LÓGICA CORE ---
function TerminalContent() {
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
  const [otp, setOtp] = useState("");
  const [licencia, setLicencia] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0); // ESTADO DEL TEMPORIZADOR

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarNuevaContrasena, setConfirmarNuevaContrasena] = useState("");
  const [pwdMsg, setPwdMsg] = useState({ text: "", type: "" });

  const [licenciaInfo, setLicenciaInfo] = useState(null);
  const [authMsg, setAuthMsg] = useState({ text: "", type: "" });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // States para Popups Elegantes
  const [showNoSubPopup, setShowNoSubPopup] = useState(false);
  const [showNoCreditsPopup, setShowNoCreditsPopup] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") setIsDarkMode(true);

    const pagoEstatus = searchParams.get("pago");
    if (pagoEstatus === "exito") alert("¡Pago procesado con éxito! Tu plan ha sido actualizado.");
    if (pagoEstatus === "cancelado") alert("El pago fue cancelado.");

    const tabParam = searchParams.get("tab");
    const vistaParam = searchParams.get("vista");
    if (tabParam) setPestanaActiva(tabParam);
    if (vistaParam) setVista(vistaParam);

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

  // LOGICA DE LA CUENTA REGRESIVA
  useEffect(() => {
    let interval;
    if (vista === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [vista, timer]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("darkMode", !isDarkMode);
  };

  const cargarHistorial = async () => {
    const { data } = await supabase.from('historial').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setHistorial(data);
  };

  const cargarDatosSuscripcion = async (userId) => {
    const { data } = await supabase.from('licencias').select('*').eq('usada_por', userId).maybeSingle();
    if (data) {
      setLicenciaInfo(data);
    } else {
      setLicenciaInfo({ plan: 'Ninguno', usos_mes: 0, limite_mensual: 0, estado: 'inactiva' });
    }
  };

  const hacerLogin = async (e) => {
    e.preventDefault();
    setAuthMsg({ text: "Autenticando...", type: "info" });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthMsg({ text: "Correo o contraseña incorrectos.", type: "error" });
    else setAuthMsg({ text: "", type: "" });
  };

  const registrarCuenta = async (e) => {
    e.preventDefault();
    setAuthMsg({ text: "Generando entorno y vinculando correo...", type: "info" });
    if (password !== confirmPassword) return setAuthMsg({ text: "Las contraseñas no coinciden.", type: "error" });
    const regexPwd = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regexPwd.test(password)) return setAuthMsg({ text: "Mínimo 8 caracteres, una mayúscula y un número.", type: "error" });

    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { nombre_notaria: nombre } }
    });

    if (error) {
      setAuthMsg({ text: error.message, type: "error" });
    } else {
      setAuthMsg({ text: "Código enviado a tu correo.", type: "success" });
      setVista("otp");
      setTimer(45); // INICIA EL TEMPORIZADOR
    }
  };

  const reenviarCodigo = async () => {
    if (timer > 0) return;
    setAuthMsg({ text: "Reenviando código...", type: "info" });
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      setAuthMsg({ text: error.message, type: "error" });
    } else {
      setAuthMsg({ text: "Nuevo código enviado con éxito.", type: "success" });
      setTimer(45); // REINICIA EL TEMPORIZADOR
    }
  };

  const verificarOTP = async (e) => {
    e.preventDefault();
    setAuthMsg({ text: "Verificando código...", type: "info" });
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' });

    if (error) {
      setAuthMsg({ text: "Código inválido o expirado.", type: "error" });
    } else {
      setAuthMsg({ text: "¡Cuenta confirmada!", type: "success" });
    }
  };

  const validarLicencia = async (e) => {
    e.preventDefault();
    setAuthMsg({ text: "Verificando licencia en el servidor...", type: "info" });
    const { data, error } = await supabase.from('licencias').select('*').eq('codigo', licencia).maybeSingle();

    if (error || !data) return setAuthMsg({ text: "La licencia ingresada es inválida o no existe.", type: "error" });
    if (data.estado === 'usada') return setAuthMsg({ text: "Esta licencia ya fue registrada.", type: "error" });

    await supabase.from('licencias').update({ estado: 'usada', usada_por: session.user.id, fecha_activacion: new Date() }).eq('codigo', licencia);
    setAuthMsg({ text: `¡Licencia Válida! Tu plan ha sido actualizado.`, type: "success" });
    cargarDatosSuscripcion(session.user.id);
    setTimeout(() => { setVista("tienda"); setAuthMsg({ text: "", type: "" }); }, 2000);
  };

  const iniciarPago = async (nombrePlan) => {
    try {
      const payload = { plan: nombrePlan, user_id: session.user.id, email: session.user.email };
      const res = await fetch("https://actarium-yqof.onrender.com/create-checkout-session", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) window.location.href = data.url;
      else alert("Integración de pagos en mantenimiento.");
    } catch (e) { alert("Error conectando con la pasarela financiera."); }
  };

  const cancelarSuscripcion = () => {
    if (confirm("¿Estás seguro de que deseas cancelar tu suscripción? Perderás acceso a tus beneficios al finalizar el periodo actual.")) {
      alert("Solicitud de cancelación recibida. (Integración con Stripe Portal pendiente)");
    }
  };

  const verificarAcceso = (callback) => {
    const consumidos = licenciaInfo?.usos_mes || 0;
    const limite = licenciaInfo?.limite_mensual || 0;
    const plan = licenciaInfo?.plan || 'Ninguno';

    if (plan === 'Ninguno' || licenciaInfo?.estado !== 'activa') {
      setShowNoSubPopup(true);
      return false;
    }
    if (consumidos >= limite) {
      setShowNoCreditsPopup(true);
      return false;
    }
    if (callback) callback();
    return true;
  };

  const descargarArchivo = async (nombreArchivo) => {
    verificarAcceso(async () => {
      if (!nombreArchivo) return alert("Sin archivo adjunto.");
      const { data, error } = await supabase.storage.from('avisos_generados').download(nombreArchivo);
      if (!error) {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url; a.download = nombreArchivo; a.click();
      } else alert("Error al descargar archivo.");
    });
  };

  const reEditar = (datosJsonStr) => {
    verificarAcceso(() => {
      if (!datosJsonStr) return alert("No hay datos guardados para este aviso.");
      localStorage.setItem("aviso_editar", datosJsonStr);
      router.push("/individual");
    });
  };

  const bgPrincipal = isDarkMode ? "bg-[#0A0F1D]" : "bg-[#FAFAFA]";
  const textPrincipal = isDarkMode ? "text-gray-200" : "text-[#334155]";
  const textTitulo = isDarkMode ? "text-white" : "text-[#0F172A]";
  const bgCard = isDarkMode ? "bg-[#121B30] border-gray-800/80" : "bg-white border-gray-200 shadow-sm";
  const bgTableHead = isDarkMode ? "bg-[#090E1A] text-gray-400" : "bg-[#0F172A] text-white";
  const tableRowHover = isDarkMode ? "hover:bg-[#18233C]" : "hover:bg-gray-50";
  const borderBline = isDarkMode ? "border-gray-800" : "border-gray-100";
  const inputClass = isDarkMode ? "bg-[#18243E] border-gray-700 text-white focus:border-[#D4AF37]" : "bg-gray-50 border-gray-200 text-[#334155] focus:border-[#D4AF37]";

  // Iconos SVG para Contraseña
  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
  );
  const EyeSlashIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.978 9.978 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
  );

  if (cargando) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>;

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
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-[#D4AF37] bg-white text-sm pr-12" placeholder="Contraseña" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors">
                    {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                  </button>
                </div>
                {authMsg.text && <p className={`text-xs text-center font-medium ${authMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{authMsg.text}</p>}
                <button type="submit" className="w-full bg-[#0F172A] text-[#D4AF37] py-4 rounded-xl font-bold tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all mt-2 shadow-lg">INGRESAR</button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-4">
                <button onClick={() => { setVista("formulario-registro"); setAuthMsg({ text: "", type: "" }); }} className="w-full border-2 border-gray-200 text-[#0F172A] py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                  Crear Cuenta Nueva
                </button>
                <Link href="/" className="text-xs text-gray-400 hover:text-[#0F172A] flex items-center justify-center gap-2 font-medium transition-colors">
                  ← Volver a la página principal
                </Link>
              </div>
            </div>
          )}

          {vista === "formulario-registro" && (
            <form onSubmit={registrarCuenta} className="space-y-4 text-left animate-in slide-in-from-right-4 fade-in">
              <h2 className="text-2xl font-serif text-[#0F172A] text-center mb-1">Registro de Notaría</h2>
              <p className="text-gray-500 text-[10px] mb-6 text-center uppercase tracking-widest font-bold">Cree su ecosistema de trabajo</p>

              <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D4AF37]" placeholder="Nombre de la Notaría (Ej. Notaría No. 1)" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D4AF37]" placeholder="Correo Administrador" />

              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D4AF37] pr-10" placeholder="Contraseña" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors">
                  {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </button>
              </div>
              <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D4AF37]" placeholder="Confirmar Contraseña" />

              {authMsg.text && <p className={`text-xs text-center font-medium ${authMsg.type === 'error' ? 'text-red-500' : 'text-[#D4AF37]'}`}>{authMsg.text}</p>}

              <button type="submit" className="w-full bg-[#D4AF37] text-[#0F172A] py-3 rounded-xl font-bold tracking-widest hover:bg-black hover:text-white transition-all shadow-lg mt-2">CONTINUAR</button>
              <div className="text-center mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setVista("login"); setAuthMsg({ text: "", type: "" }); }} className="text-xs text-gray-500 hover:text-[#0F172A]">← Ya tengo cuenta</button>
              </div>
            </form>
          )}

          {vista === "otp" && (
            <form onSubmit={verificarOTP} className="space-y-4 text-center animate-in slide-in-from-right-4 fade-in">
              <h2 className="text-2xl font-serif text-[#0F172A] mb-2">Verifica tu Correo</h2>
              <p className="text-gray-500 text-xs mb-6">Hemos enviado un código de seguridad a <b>{email}</b>. Ingrésalo para activar tu bóveda.</p>

              <input
                type="text"
                required
                maxLength="8"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-center font-mono text-2xl tracking-[0.4em] outline-none focus:border-[#D4AF37]"
                placeholder="00000000"
              />
              {authMsg.text && <p className={`text-xs text-center font-medium ${authMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{authMsg.text}</p>}

              <button type="submit" className="w-full bg-[#0F172A] text-[#D4AF37] py-4 rounded-xl font-bold tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg">VERIFICAR CÓDIGO</button>

              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={reenviarCodigo}
                  disabled={timer > 0}
                  className={`text-xs font-bold uppercase tracking-widest transition-colors ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#D4AF37] hover:text-[#0F172A]'}`}
                >
                  {timer > 0 ? `Reenviar código en ${timer}s` : "¿No recibiste el código? Reenviar"}
                </button>
                <button type="button" onClick={() => { setVista("login"); setAuthMsg({ text: "", type: "" }); }} className="text-xs text-gray-400 hover:text-[#0F172A]">← Cancelar</button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  const avisosConsumidos = licenciaInfo?.usos_mes || 0;
  const limiteAvisos = licenciaInfo?.limite_mensual || 0;
  const porcentajeUso = limiteAvisos === 0 ? 100 : Math.min((avisosConsumidos / limiteAvisos) * 100, 100);
  const planActual = licenciaInfo?.plan || 'Ninguno';

  return (
    <div className={`min-h-screen ${bgPrincipal} ${textPrincipal} font-sans pb-20 transition-colors duration-500 relative`}>

      {/* GLOBAL POP UP: NO SUBSCRIPTION */}
      {showNoSubPopup && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
          <div className={`${bgCard} p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border border-[#D4AF37]/30 relative`}>
            <button onClick={() => setShowNoSubPopup(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <div className="w-16 h-16 bg-[#0F172A] rounded-full mx-auto flex items-center justify-center text-3xl mb-4 border border-[#D4AF37]">✨</div>
            <h2 className={`text-2xl font-serif ${textTitulo} mb-2`}>¡Únete a Actarium!</h2>
            <p className="text-sm text-gray-400 mb-6">Para generar Avisos de Transmisión Patrimonial y acceder a la Bóveda, suscríbete a uno de nuestros planes.</p>
            <div className="space-y-3">
              <button onClick={() => { setShowNoSubPopup(false); setPestanaActiva("cuenta"); setVista("tienda"); }} className="w-full bg-[#D4AF37] text-[#0F172A] py-3 rounded-xl font-bold tracking-widest shadow-lg hover:scale-105 transition-transform">VER PLANES</button>
              <button onClick={() => { setShowNoSubPopup(false); setPestanaActiva("cuenta"); setVista("registrar-licencia"); }} className="w-full border border-gray-600 text-gray-400 py-3 rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-gray-800 transition-colors">Tengo un código de licencia</button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL POP UP: NO CREDITS */}
      {showNoCreditsPopup && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
          <div className={`${bgCard} p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border border-red-500/30 relative`}>
            <button onClick={() => setShowNoCreditsPopup(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <div className="w-16 h-16 bg-red-500/10 rounded-full mx-auto flex items-center justify-center text-3xl mb-4 text-red-500">⚠️</div>
            <h2 className={`text-2xl font-serif ${textTitulo} mb-2`}>Límite Agotado</h2>
            <p className="text-sm text-gray-400 mb-6">Has agotado tu límite mensual de {limiteAvisos} avisos del plan {planActual}. Actualiza tu suscripción para continuar operando sin interrupciones.</p>
            <div className="space-y-3 flex gap-2">
              <button onClick={() => setShowNoCreditsPopup(false)} className="flex-1 border border-gray-600 text-gray-400 py-3 rounded-xl font-bold text-xs uppercase hover:bg-gray-800 transition-colors">Rechazar</button>
              <button onClick={() => { setShowNoCreditsPopup(false); setPestanaActiva("cuenta"); setVista("tienda"); }} className="flex-1 bg-[#D4AF37] text-[#0F172A] py-3 rounded-xl font-bold text-xs tracking-widest shadow-lg hover:scale-105 transition-transform">Mejorar Plan</button>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-[#0F172A] text-white py-4 px-6 md:px-10 flex justify-between items-center shadow-xl border-b border-[#D4AF37]/20 sticky top-0 z-40">
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
            <button onClick={() => { setPestanaActiva("cuenta"); setVista("tienda"); }} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${pestanaActiva === 'cuenta' ? 'bg-[#D4AF37] text-[#0F172A] shadow-md' : 'text-gray-400 hover:text-white'}`}>Mi Cuenta</button>
          </div>
          <button onClick={toggleDarkMode} className="text-xl hover:scale-110 transition-transform hidden sm:block">{isDarkMode ? "☀️" : "🌙"}</button>
          <button onClick={async () => await supabase.auth.signOut()} className="text-xs uppercase tracking-widest text-gray-400 hover:text-white border-l border-gray-700 pl-4">Salir</button>
        </div>
      </nav>

      {pestanaActiva === "produccion" && (
        <main className="max-w-6xl mx-auto mt-12 px-6 animate-in fade-in duration-300">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-serif ${textTitulo} mb-2`}>Consola Notarial</h2>
            <p className="text-sm text-gray-400 font-light">Bóveda Operativa de {session.user.user_metadata?.nombre_notaria || session.user.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Link href="/individual">
              <div className={`${bgCard} p-8 rounded-2xl border hover:border-[#D4AF37] transition-all duration-300 flex flex-col items-center text-center group cursor-pointer shadow-lg`}>
                <div className="w-16 h-16 bg-[#0F172A] rounded-full flex items-center justify-center mb-4 text-2xl group-hover:bg-[#D4AF37] text-[#D4AF37] group-hover:text-[#0F172A] transition-all">📄</div>
                <h3 className={`text-xl font-serif ${textTitulo} mb-2`}>Producción Individual</h3>
                <p className="text-xs text-gray-400 font-light">Auditoría minuciosa y ruteo automatizado por municipio.</p>
              </div>
            </Link>
            <Link href="/masiva">
              <div className={`${bgCard} p-8 rounded-2xl border hover:border-[#D4AF37] transition-all duration-300 flex flex-col items-center text-center group cursor-pointer shadow-lg`}>
                <div className="w-16 h-16 bg-[#0F172A] rounded-full flex items-center justify-center mb-4 text-2xl group-hover:bg-[#D4AF37] text-[#D4AF37] group-hover:text-[#0F172A] transition-all">📂</div>
                <h3 className={`text-xl font-serif ${textTitulo} mb-2`}>Producción Masiva</h3>
                <p className="text-xs text-gray-400 font-light">Procesamiento por lote de alta velocidad estructurado en ZIP.</p>
              </div>
            </Link>
          </div>

          <h3 className={`text-xl font-serif ${textTitulo} mb-4 flex items-center gap-2`}><span>🗄️</span> Bóveda Inmortal de Avisos</h3>
          <div className={`${bgCard} rounded-2xl border overflow-hidden shadow-lg`}>
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
                    <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">Tu bóveda está vacía. Inicia una producción.</td></tr>
                  ) : (
                    historial.map((fila) => (
                      <tr key={fila.id} className={`${tableRowHover} transition-colors border-b ${borderBline}`}>
                        <td className="p-4 text-gray-400">{new Date(fila.created_at).toLocaleDateString()}</td>
                        <td className={`p-4 font-bold ${textTitulo}`}>{fila.escritura}</td>
                        <td className="p-4 truncate max-w-[200px]" title={fila.vendedor}>{fila.vendedor}</td>
                        <td className="p-4 flex items-center justify-center gap-2">
                          <button onClick={() => reEditar(fila.datos_json)} className="bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-800 hover:text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all">✏️ Editar</button>
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className={`${bgCard} p-6 rounded-2xl border text-center shadow-lg relative overflow-hidden`}>
                <div className="absolute top-0 right-0 bg-[#0F172A] text-[#D4AF37] font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-bl-xl">
                  {planActual}
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 mt-2">Uso Mensual</h3>
                <div className="relative pt-2">
                  <div className="w-full bg-gray-200/20 rounded-full h-2 mb-4 overflow-hidden">
                    <div className={`h-2 rounded-full transition-all duration-1000 ${porcentajeUso >= 100 ? 'bg-red-500' : 'bg-[#D4AF37]'}`} style={{ width: `${porcentajeUso}%` }}></div>
                  </div>
                  <p className={`text-4xl font-serif font-black mb-1 ${isDarkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                    {avisosConsumidos} <span className="text-lg font-sans font-light text-gray-400">/ {limiteAvisos}</span>
                  </p>
                </div>
              </div>

              <div className={`${bgCard} rounded-2xl border overflow-hidden flex flex-col shadow-lg`}>
                <button onClick={() => setVista("tienda")} className={`p-4 text-left text-xs uppercase tracking-widest font-bold border-b ${borderBline} transition-colors ${vista === 'tienda' ? 'bg-[#0F172A] text-[#D4AF37]' : 'text-gray-400 hover:bg-gray-100/10'}`}>💳 Mi Suscripción</button>
                <button onClick={() => setVista("registrar-licencia")} className={`p-4 text-left text-xs uppercase tracking-widest font-bold border-b ${borderBline} transition-colors ${vista === 'registrar-licencia' ? 'bg-[#0F172A] text-[#D4AF37]' : 'text-gray-400 hover:bg-gray-100/10'}`}>🎟️ Registrar Código</button>
                <button onClick={() => setVista("seguridad")} className={`p-4 text-left text-xs uppercase tracking-widest font-bold transition-colors ${vista === 'seguridad' ? 'bg-[#0F172A] text-[#D4AF37]' : 'text-gray-400 hover:bg-gray-100/10'}`}>🔒 Seguridad</button>
              </div>
            </div>

            <div className="lg:col-span-3">
              {vista === "tienda" && (
                <div className={`${bgCard} p-8 rounded-2xl border shadow-xl animate-in fade-in`}>
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h3 className={`text-2xl font-serif ${textTitulo} mb-1 flex items-center gap-2`}><span>🏛️</span> Tienda de Planes Actarium</h3>
                      <p className="text-xs text-gray-400">Adquiere o mejora tu plan para potenciar el flujo de tu Notaría.</p>
                    </div>
                    {planActual !== 'Ninguno' && (
                      <button onClick={cancelarSuscripcion} className="text-[10px] uppercase font-bold tracking-widest text-red-500 hover:text-red-700 underline underline-offset-4">Cancelar Plan Actual</button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className={`border rounded-xl p-6 text-center flex flex-col justify-between transition-transform hover:scale-105 shadow-md ${isDarkMode ? 'border-[#D4AF37]/30 bg-[#0F172A]' : 'border-[#D4AF37]/50 bg-[#FEFCE8]/30'}`}>
                      <div>
                        <h4 className="font-serif text-lg font-bold text-[#D4AF37]">Plan ORO</h4>
                        <p className={`text-3xl font-black my-2 ${textTitulo}`}>$999 <span className="text-[10px] font-light text-gray-500">/mes</span></p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 border-t border-b border-gray-500/20 py-2 my-4">10 Avisos Mensuales</p>
                      </div>
                      <button onClick={() => iniciarPago("Oro")} className="w-full bg-[#0F172A] text-white text-xs py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors shadow-md">{planActual === 'Oro' ? 'Suscrito' : (planActual === 'Ninguno' ? 'Adquirir' : 'Cambiar a Oro')}</button>
                    </div>

                    <div className={`border rounded-xl p-6 text-center flex flex-col justify-between transition-transform hover:scale-105 shadow-2xl relative ${isDarkMode ? 'border-gray-500 bg-[#1E293B]' : 'border-gray-300 bg-white'}`}>
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#0F172A] text-[#D4AF37] text-[8px] font-bold uppercase px-4 py-1.5 rounded-full tracking-widest shadow-lg">Notaría Estándar</div>
                      <div>
                        <h4 className={`font-serif text-lg font-bold ${textTitulo} mt-2`}>PLATINO</h4>
                        <p className={`text-3xl font-black my-2 ${textTitulo}`}>$1,899 <span className="text-[10px] font-light text-gray-500">/mes</span></p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 border-t border-b border-gray-500/20 py-2 my-4">20 Avisos Mensuales</p>
                      </div>
                      <button onClick={() => iniciarPago("Platino")} className="w-full bg-[#D4AF37] text-[#0F172A] text-xs py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-[#0F172A] hover:text-[#D4AF37] transition-colors shadow-md">{planActual === 'Platino' ? 'Suscrito' : (planActual === 'Ninguno' ? 'Adquirir' : 'Cambiar a Platino')}</button>
                    </div>

                    <div className={`border rounded-xl p-6 text-center flex flex-col justify-between transition-transform hover:scale-105 shadow-md ${isDarkMode ? 'border-gray-800 bg-black' : 'border-gray-800 bg-[#0F172A]'}`}>
                      <div>
                        <h4 className="font-serif text-lg font-bold text-white">BLACK</h4>
                        <p className="text-3xl font-black my-2 text-white">$3,999 <span className="text-[10px] font-light text-gray-400">/mes</span></p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 border-t border-b border-gray-700 py-2 my-4">50 Avisos Mensuales</p>
                      </div>
                      <button onClick={() => iniciarPago("Black")} className="w-full bg-white text-[#0F172A] text-xs py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors shadow-md">{planActual === 'Black' ? 'Suscrito' : (planActual === 'Ninguno' ? 'Adquirir' : 'Cambiar a Black')}</button>
                    </div>
                  </div>
                </div>
              )}

              {vista === "registrar-licencia" && (
                <div className={`${bgCard} p-10 rounded-2xl border shadow-xl animate-in slide-in-from-right-4 fade-in max-w-lg mx-auto`}>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#0F172A] rounded-full mx-auto flex items-center justify-center text-2xl mb-4">🎟️</div>
                    <h3 className={`text-2xl font-serif ${textTitulo} mb-2`}>Registrar Licencia</h3>
                    <p className="text-xs text-gray-400">Si un asesor te otorgó un código corporativo, ingrésalo aquí para desbloquear tus beneficios.</p>
                  </div>

                  <form onSubmit={validarLicencia} className="space-y-4">
                    <input type="text" required value={licencia} onChange={(e) => setLicencia(e.target.value.toUpperCase())} className="w-full p-4 border-2 border-gray-200 rounded-xl text-center font-mono text-xl tracking-[0.2em] outline-none focus:border-[#D4AF37]" placeholder="ACT-XXXX-XXXX" />
                    {authMsg.text && <p className={`text-xs text-center font-medium ${authMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{authMsg.text}</p>}
                    <button type="submit" className="w-full bg-[#0F172A] text-[#D4AF37] py-4 rounded-xl font-bold tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg mt-4">VALIDAR CÓDIGO Y ACTIVAR</button>
                  </form>
                </div>
              )}

              {vista === "seguridad" && (
                <div className={`${bgCard} p-10 rounded-2xl border shadow-xl animate-in slide-in-from-right-4 fade-in max-w-lg mx-auto`}>
                  <h3 className={`text-xl font-serif ${textTitulo} mb-1`}>Seguridad de la Cuenta</h3>
                  <p className="text-xs text-gray-400 mb-6">Actualice las credenciales de acceso institucional.</p>
                  <form onSubmit={actualizarContrasena} className="space-y-4">
                    <div><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 block">Nueva Contraseña</label><input type="password" required value={nuevaContrasena} onChange={e => setNuevaContrasena(e.target.value)} className={`w-full p-3 rounded-lg border outline-none text-sm transition-colors ${inputClass}`} placeholder="••••••••" /></div>
                    <div><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 block">Confirmar Contraseña</label><input type="password" required value={confirmarNuevaContrasena} onChange={e => setConfirmarNuevaContrasena(e.target.value)} className={`w-full p-3 rounded-lg border outline-none text-sm transition-colors ${inputClass}`} placeholder="••••••••" /></div>
                    {pwdMsg.text && <p className={`text-xs p-2.5 rounded font-medium text-center ${pwdMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{pwdMsg.text}</p>}
                    <div className="flex justify-end pt-4"><button type="submit" className="w-full bg-[#0F172A] text-[#D4AF37] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors shadow-md">Guardar Cambios</button></div>
                  </form>
                </div>
              )}

            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default function Terminal() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>}>
      <TerminalContent />
    </Suspense>
  );
}