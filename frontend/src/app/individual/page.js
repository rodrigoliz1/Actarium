"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProduccionIndividual() {
  const router = useRouter();
  const [verificandoAcceso, setVerificandoAcceso] = useState(true);

  const [paso, setPaso] = useState(1);
  const [avisos, setAvisos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensajeCarga, setMensajeCarga] = useState("Iniciando análisis cognitivo...");
  const [fechaGlobal, setFechaGlobal] = useState("");

  // LECTURA GLOBAL DEL MODO OSCURO
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

    const avisoGuardado = localStorage.getItem("aviso_editar");
    if (avisoGuardado) {
      try {
        const datosParseados = JSON.parse(avisoGuardado);
        setAvisos([datosParseados]);
        setPaso(2);
        localStorage.removeItem("aviso_editar");
      } catch (e) { console.error("Error al leer datos guardados"); }
    }
  }, [router]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("darkMode", !isDarkMode);
  };

  const manejarSubida = async (e) => {
    if (!e.target.files[0]) return;
    setCargando(true);

    const mensajes = ["Leyendo proemio y antecedentes...", "Identificando a los transmitentes y adquirentes...", "Extrayendo linderos y medidas catastrales...", "Calculando valores de liquidación...", "Estructurando documento oficial..."];
    let i = 0;
    const intervaloCarga = setInterval(() => { setMensajeCarga(mensajes[i]); i = (i + 1) % mensajes.length; }, 2000);

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch("https://actarium-yqof.onrender.com/extraer-datos", { method: "POST", body: formData });
      const data = await res.json();

      const avisosSanitizados = (data.avisos || []).map(aviso => ({
        ...aviso,
        clasificacion_inmueble: Array.isArray(aviso.clasificacion_inmueble) ? aviso.clasificacion_inmueble : []
      }));

      setAvisos(avisosSanitizados);
      setPaso(2);
    } catch (err) { alert("Error de conexión con el servidor."); }

    clearInterval(intervaloCarga);
    setCargando(false);
  };

  const handleChange = (index, campo, valor) => {
    const nuevosAvisos = [...avisos];
    nuevosAvisos[index][campo] = valor;

    // SINCRONIZADOR DE TOTAL
    if (campo === "impuesto_monto") {
      nuevosAvisos[index]["total_liquidacion"] = valor;
    }

    setAvisos(nuevosAvisos);
  };

  const handleCheckboxClasif = (index, opcion, isChecked) => {
    const nuevosAvisos = [...avisos];
    const actuales = nuevosAvisos[index].clasificacion_inmueble || [];
    if (isChecked) nuevosAvisos[index].clasificacion_inmueble = [...actuales, opcion];
    else nuevosAvisos[index].clasificacion_inmueble = actuales.filter(i => i !== opcion);
    setAvisos(nuevosAvisos);
  };

  const aplicarFechaGlobal = () => {
    if (!fechaGlobal) return;
    const nuevosAvisos = avisos.map(aviso => ({ ...aviso, fecha_cierre: fechaGlobal }));
    setAvisos(nuevosAvisos);
  };

  const descargar = async () => {
    setCargando(true);
    setMensajeCarga("Generando documento oficial en la nube...");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { avisos, user_id: user?.id };
      const res = await fetch("https://actarium-yqof.onrender.com/generar-final", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const respuestaBackend = await res.json();

      if (respuestaBackend.success) {
        const { data, error } = await supabase.storage.from('avisos_generados').download(respuestaBackend.archivo);
        if (!error) {
          const url = window.URL.createObjectURL(data);
          const a = document.createElement("a");
          a.href = url; a.download = respuestaBackend.nombre_descarga; a.click();
          setTimeout(() => { window.location.href = "/terminal"; }, 2000);
        } else alert("Error al descargar el archivo desde la bóveda.");
      } else alert(respuestaBackend.error || "Hubo un error al generar el archivo final.");
    } catch (err) { alert("Error al conectar con el servidor."); }
    setCargando(false);
  };

  // VARIABLES DE TEMA
  const bgApp = isDarkMode ? "bg-[#0A0F1D] text-gray-200" : "bg-[#FDFDFD] text-[#334155]";
  const bgPanel = isDarkMode ? "bg-[#121B30] border-gray-800" : "bg-white border-gray-200";
  const bgSection = isDarkMode ? "bg-[#18243E] border-gray-700" : "bg-gray-50 border-gray-100";
  const bgYellow = isDarkMode ? "bg-[#1C253B] border-[#D4AF37]/20" : "bg-[#FEFCE8]/50 border-[#D4AF37]/30";
  const textTitle = isDarkMode ? "text-white" : "text-[#0F172A]";
  const textLabel = isDarkMode ? "text-gray-400" : "text-gray-500";
  const textInput = isDarkMode ? "text-white bg-transparent border-gray-700" : "text-[#0F172A] bg-transparent border-gray-200";

  if (verificandoAcceso) return null;

  return (
    <div className={`min-h-screen ${bgApp} transition-colors duration-500 pb-20 relative`}>

      {cargando && (
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

      <main className="max-w-[1400px] mx-auto py-10 px-6">
        {paso === 1 ? (
          <div className="text-center mt-20 max-w-3xl mx-auto animate-in fade-in">
            <h2 className={`text-4xl font-serif ${textTitle} mb-4`}>Cargar Escritura</h2>
            <p className="text-gray-400 mb-10 text-lg">Inicie el proceso arrastrando el documento .docx</p>
            <div className={`${bgPanel} border-2 border-dashed p-24 rounded-2xl relative hover:border-[#D4AF37] transition-all`}>
              <input type="file" accept=".docx" onChange={manejarSubida} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <p className="text-gray-400 font-medium">Arrastre aquí el archivo o haga clic para seleccionar</p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <header className="flex justify-between items-end mb-8 border-b border-gray-700/30 pb-6">
              <div>
                <h2 className={`text-3xl font-serif ${textTitle} mb-2`}>Auditoría Integral ({avisos.length} Avisos)</h2>
                <p className={`text-sm ${textLabel}`}>Valide la información extraída. Si es una subdivisión, verá múltiples paneles abajo.</p>
              </div>
              <button onClick={descargar} className="bg-[#D4AF37] text-[#0F172A] px-8 py-3 rounded font-bold shadow-lg hover:bg-white transition-all">
                Generar Archivo Oficial
              </button>
            </header>

            <div className="mb-12 p-6 bg-[#0F172A] rounded-2xl flex flex-col md:flex-row items-end gap-4 shadow-lg border border-[#D4AF37]/30">
              <div className="flex-1 w-full">
                <label className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest mb-2 block">Fecha de Cierre Manual (Aplica a todos los avisos)</label>
                <input type="text" value={fechaGlobal} onChange={e => setFechaGlobal(e.target.value)} placeholder="Ej. Zapopan, Jalisco a 15 de Mayo de 2026" className="w-full p-3 rounded bg-white/10 text-white outline-none focus:border-[#D4AF37] border border-transparent text-sm placeholder-gray-500" />
              </div>
              <button onClick={aplicarFechaGlobal} className="w-full md:w-auto bg-[#D4AF37] text-[#0F172A] px-6 py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
                Aplicar a todos
              </button>
            </div>

            {avisos.map((aviso, index) => (
              <div key={index} className={`mb-16 p-8 ${bgPanel} rounded-3xl shadow-sm relative border border-gray-700/20`}>
                <div className="absolute -top-4 left-8 bg-[#0F172A] text-[#D4AF37] px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                  Aviso {index + 1} de {avisos.length}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
                  <div className="space-y-6">
                    <section className={`${bgSection} p-6 rounded-xl border border-gray-700/20`}>
                      <h3 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4">I. Administrativo</h3>
                      <div className="space-y-3">
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Escritura Número</label><input type="text" value={aviso.escritura_numero || ""} onChange={e => handleChange(index, "escritura_numero", e.target.value)} className={`w-full p-2 border-b outline-none focus:border-[#D4AF37] ${textInput}`} /></div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Lugar y Fecha de Firma</label><input type="text" value={aviso.lugar_fecha_firma || ""} onChange={e => handleChange(index, "lugar_fecha_firma", e.target.value)} className={`w-full p-2 border-b outline-none focus:border-[#D4AF37] ${textInput} font-medium`} /></div>
                        <div><label className="text-[10px] uppercase font-bold text-orange-600">Fecha de Cierre (Final del docto)</label><input type="text" value={aviso.fecha_cierre || ""} onChange={e => handleChange(index, "fecha_cierre", e.target.value)} className="w-full p-2 border-b border-orange-500 outline-none bg-orange-500/10 text-orange-500 font-medium" /></div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Naturaleza del Acto</label><input type="text" value={aviso.naturaleza_acto || ""} onChange={e => handleChange(index, "naturaleza_acto", e.target.value)} className={`w-full p-2 border-b outline-none focus:border-[#D4AF37] ${textInput}`} /></div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Fecha Resolución Adjudicatoria</label><input type="text" value={aviso.fecha_resolucion || ""} onChange={e => handleChange(index, "fecha_resolucion", e.target.value)} className={`w-full p-2 border-b outline-none focus:border-[#D4AF37] ${textInput}`} /></div>
                        <div className="grid grid-cols-2 gap-2">
                          <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Cuenta Predial</label><input type="text" value={aviso.cuenta_predial || ""} onChange={e => handleChange(index, "cuenta_predial", e.target.value)} className={`w-full p-2 border-b outline-none ${textInput}`} /></div>
                          <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Clave Catastral</label><input type="text" value={aviso.clave_catastral || ""} onChange={e => handleChange(index, "clave_catastral", e.target.value)} className={`w-full p-2 border-b outline-none ${textInput}`} /></div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-700/30">
                        <h4 className="text-[10px] uppercase font-bold text-[#D4AF37] mb-3">Datos del Fedatario</h4>
                        <div className="space-y-3">
                          <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Nombre del Notario</label><input type="text" value={aviso.nombre_notario || ""} onChange={e => handleChange(index, "nombre_notario", e.target.value)} className={`w-full p-2 border-b outline-none ${textInput}`} /></div>
                          <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Certificado (Adscripción)</label><textarea rows="3" value={aviso.certificado_notario || ""} onChange={e => handleChange(index, "certificado_notario", e.target.value)} className={`w-full mt-1 p-2 border rounded outline-none text-xs ${isDarkMode ? 'bg-[#0A0F1D] border-gray-700 text-white' : 'bg-white border-gray-200 text-[#334155]'}`}></textarea></div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-l-2 border-[#D4AF37] rounded-r">
                        <label className={`text-[10px] uppercase font-bold ${textTitle} block mb-1`}>Documento que se anexa</label>
                        <select value={aviso.se_anexa || "Avalúo Bancario"} onChange={e => handleChange(index, "se_anexa", e.target.value)} className={`w-full p-2 border border-[#D4AF37] rounded outline-none focus:ring-2 focus:ring-[#D4AF37] text-xs font-bold text-[#A16207] ${isDarkMode ? 'bg-[#121B30]' : 'bg-white'}`}>
                          <option value="Avalúo Bancario">Avalúo Bancario (Por Defecto)</option>
                          <option value="Deslinde">Deslinde</option>
                          <option value="Certificado de No Propiedad">Certificado de No Propiedad</option>
                          <option value="Certificado de no Adeudo">Certificado de no Adeudo</option>
                          <option value="Ninguno">Ninguno / No Aplica</option>
                        </select>
                      </div>
                    </section>

                    <section className={`${bgSection} p-6 rounded-xl border border-gray-700/20`}>
                      <h3 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4">IV. Liquidación</h3>
                      <div className="space-y-3">
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Valor de Operación</label><input type="text" value={aviso.valor_operacion || ""} onChange={e => handleChange(index, "valor_operacion", e.target.value)} className="w-full p-2 bg-[#0F172A] text-[#D4AF37] font-mono rounded border-none outline-none" /></div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Valor de Avalúo</label><input type="text" value={aviso.valor_avaluo || ""} onChange={e => handleChange(index, "valor_avaluo", e.target.value)} className={`w-full p-2 border font-mono rounded outline-none ${isDarkMode ? 'bg-[#0A0F1D] border-gray-700 text-white' : 'bg-white border-gray-200 text-[#334155]'}`} /></div>

                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <label className={`text-[10px] uppercase font-bold ${textLabel}`}>Valor Catastral</label>
                            <div className="flex items-center gap-1">
                              <input type="checkbox" checked={aviso.valor_catastral !== "" && aviso.valor_catastral === aviso.valor_avaluo} onChange={(e) => { if (e.target.checked) handleChange(index, "valor_catastral", aviso.valor_avaluo || ""); else handleChange(index, "valor_catastral", ""); }} id={`catastral-${index}`} className="cursor-pointer" />
                              <label htmlFor={`catastral-${index}`} className="text-[9px] uppercase text-[#D4AF37] cursor-pointer">¿Igual al avalúo?</label>
                            </div>
                          </div>
                          <input type="text" value={aviso.valor_catastral || ""} onChange={e => handleChange(index, "valor_catastral", e.target.value)} className={`w-full p-2 border font-mono rounded outline-none ${isDarkMode ? 'bg-[#0A0F1D] border-gray-700 text-white' : 'bg-white border-gray-200 text-[#334155]'}`} />
                        </div>

                        <div className="border-t border-gray-700/30 pt-3 mt-3">
                          <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Impuesto a Pagar</label><input type="text" value={aviso.impuesto_monto || ""} onChange={e => handleChange(index, "impuesto_monto", e.target.value)} className={`w-full p-2 border rounded font-mono outline-none focus:border-[#D4AF37] ${isDarkMode ? 'bg-[#0A0F1D] border-gray-700 text-white' : 'bg-white border-gray-200 text-[#334155]'}`} /></div>
                          <div className="mt-2"><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Total Liquidación</label><input type="text" value={aviso.total_liquidacion || ""} onChange={e => handleChange(index, "total_liquidacion", e.target.value)} className={`w-full p-2 border border-[#D4AF37] rounded font-mono font-bold outline-none ${isDarkMode ? 'bg-[#1C253B] text-white' : 'bg-[#FEFCE8] text-[#334155]'}`} /></div>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className={`${bgSection} p-6 rounded-xl border border-gray-700/20`}>
                      <h3 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4">II. Transmitente</h3>
                      <div className="space-y-3">
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Nombre(s) Completo(s)</label><textarea rows="2" value={aviso.nombre_vendedor || ""} onChange={e => handleChange(index, "nombre_vendedor", e.target.value)} className={`w-full p-2 border-b outline-none resize-none ${textInput}`}></textarea></div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Lugar y Fecha Nac.</label><input type="text" value={aviso.nacimiento_vendedor || ""} onChange={e => handleChange(index, "nacimiento_vendedor", e.target.value)} className={`w-full p-2 border-b outline-none text-xs ${textInput}`} /></div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Generales (Literal)</label><textarea rows="4" value={aviso.generales_vendedor || ""} onChange={e => handleChange(index, "generales_vendedor", e.target.value)} className={`w-full p-2 border-b outline-none resize-none text-[11px] leading-relaxed ${textInput}`}></textarea></div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Domicilio</label><textarea rows="2" value={aviso.domicilio_vendedor || ""} onChange={e => handleChange(index, "domicilio_vendedor", e.target.value)} className={`w-full p-2 border-b outline-none resize-none ${textInput}`}></textarea></div>
                        <div><label className={`text-[10px] uppercase font-bold text-red-400`}>RFC / CURP</label><textarea rows="1" value={aviso.curp_vendedor || ""} onChange={e => handleChange(index, "curp_vendedor", e.target.value)} className={`w-full p-2 border-b outline-none resize-none font-mono text-red-500 font-bold bg-red-500/10`}></textarea></div>
                      </div>
                    </section>

                    <section className={`${bgSection} p-6 rounded-xl border border-gray-700/20`}>
                      <h3 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4">II. Adquirente</h3>
                      <div className="space-y-3">
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Nombre(s) Completo(s)</label><textarea rows="2" value={aviso.nombre_comprador || ""} onChange={e => handleChange(index, "nombre_comprador", e.target.value)} className={`w-full p-2 border-b outline-none resize-none ${textInput}`}></textarea></div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Lugar y Fecha Nac.</label><input type="text" value={aviso.nacimiento_comprador || ""} onChange={e => handleChange(index, "nacimiento_comprador", e.target.value)} className={`w-full p-2 border-b outline-none text-xs ${textInput}`} /></div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Generales (Literal)</label><textarea rows="4" value={aviso.generales_comprador || ""} onChange={e => handleChange(index, "generales_comprador", e.target.value)} className={`w-full p-2 border-b outline-none resize-none text-[11px] leading-relaxed ${textInput}`}></textarea></div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Domicilio</label><textarea rows="2" value={aviso.domicilio_comprador || ""} onChange={e => handleChange(index, "domicilio_comprador", e.target.value)} className={`w-full p-2 border-b outline-none resize-none ${textInput}`}></textarea></div>
                        <div><label className={`text-[10px] uppercase font-bold text-red-400`}>RFC / CURP</label><textarea rows="1" value={aviso.curp_comprador || ""} onChange={e => handleChange(index, "curp_comprador", e.target.value)} className={`w-full p-2 border-b outline-none resize-none font-mono text-red-500 font-bold bg-red-500/10`}></textarea></div>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className={`${bgYellow} p-6 rounded-xl border h-full`}>
                      <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${textTitle}`}>III. Inmueble</h3>
                      <div className="space-y-4">
                        <div className={`mb-2 p-3 rounded border ${isDarkMode ? 'bg-[#0A0F1D] border-gray-700' : 'bg-white border-gray-200'}`}>
                          <label className={`text-[10px] uppercase font-bold ${textTitle} mb-2 block`}>Clasificación</label>
                          <div className="flex flex-wrap gap-2">
                            {['Urbano', 'Rústico', 'Baldío', 'Construido'].map(opcion => (
                              <label key={opcion} className={`flex items-center gap-1 text-xs border px-2 py-1 rounded cursor-pointer transition-colors ${(aviso.clasificacion_inmueble || []).includes(opcion) ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#A16207]' : `border-gray-500/30 ${textLabel} hover:border-[#D4AF37]`}`}>
                                <input type="checkbox" checked={(aviso.clasificacion_inmueble || []).includes(opcion)} onChange={(e) => handleCheckboxClasif(index, opcion, e.target.checked)} className="hidden" />
                                {opcion}
                              </label>
                            ))}
                          </div>
                          <div className="mt-4 border-t border-gray-500/20 pt-3">
                            <label className={`text-[10px] uppercase font-bold ${textTitle} block`}>Lo transmitido es</label>
                            <select value={aviso.lo_transmitido || ""} onChange={e => handleChange(index, "lo_transmitido", e.target.value)} className={`w-full mt-1 p-2 rounded outline-none focus:border-[#D4AF37] text-xs border ${isDarkMode ? 'bg-[#121B30] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-[#334155]'}`}>
                              <option value="">Seleccione...</option><option value="Fracción">Fracción</option><option value="Resto">Resto</option><option value="Totalidad">Totalidad</option>
                            </select>
                          </div>
                        </div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Uso del Inmueble</label><input type="text" value={aviso.uso_inmueble || ""} onChange={e => handleChange(index, "uso_inmueble", e.target.value)} className={`w-full mt-1 p-2 rounded outline-none font-bold text-sm border focus:border-[#D4AF37] ${isDarkMode ? 'bg-[#0A0F1D] border-[#D4AF37]/50 text-[#D4AF37]' : 'bg-white border-[#D4AF37]/50 text-[#0F172A]'}`} /></div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Municipio</label><input type="text" value={aviso.municipio_inmueble || ""} onChange={e => handleChange(index, "municipio_inmueble", e.target.value)} className={`w-full mt-1 p-2 rounded outline-none text-sm border focus:border-[#D4AF37] ${isDarkMode ? 'bg-[#0A0F1D] border-gray-700 text-white' : 'bg-white border-gray-200 text-[#334155]'}`} /></div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Linderos</label><textarea rows="12" value={aviso.ubicacion_inmueble || ""} onChange={e => handleChange(index, "ubicacion_inmueble", e.target.value)} className={`w-full mt-1 p-3 rounded outline-none focus:border-[#D4AF37] text-[11px] leading-relaxed border ${isDarkMode ? 'bg-[#0A0F1D] border-gray-700 text-white' : 'bg-white border-gray-200 text-[#334155]'}`}></textarea></div>
                        <div><label className={`text-[10px] uppercase font-bold ${textLabel}`}>Antecedentes (RPP)</label><textarea rows="5" value={aviso.antecedentes_registro || ""} onChange={e => handleChange(index, "antecedentes_registro", e.target.value)} className={`w-full mt-1 p-3 rounded outline-none focus:border-[#D4AF37] text-[11px] leading-relaxed border ${isDarkMode ? 'bg-[#0A0F1D] border-gray-700 text-white' : 'bg-white border-gray-200 text-[#334155]'}`}></textarea></div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}