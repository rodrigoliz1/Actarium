from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from docx import Document
from docxtpl import DocxTemplate
import re
import os
import zipfile
from typing import List
import sqlite3
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Creamos la carpeta donde se guardarán los archivos permanentemente
if not os.path.exists("avisos_generados"):
    os.makedirs("avisos_generados")

# --- BASE DE DATOS ---
def iniciar_bd():
    conexion = sqlite3.connect('actarium_historial.db')
    cursor = conexion.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS historial (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT,
            escritura TEXT,
            acto TEXT,
            vendedor TEXT,
            comprador TEXT,
            archivo TEXT
        )
    ''')
    # Por si ya tenías la tabla vieja, le agregamos la columna 'archivo' sin borrar tus datos
    try:
        cursor.execute('ALTER TABLE historial ADD COLUMN archivo TEXT')
    except:
        pass 
    conexion.commit()
    conexion.close()

iniciar_bd()

def guardar_en_historial(datos, nombre_archivo):
    conexion = sqlite3.connect('actarium_historial.db')
    cursor = conexion.cursor()
    fecha_actual = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('''
        INSERT INTO historial (fecha, escritura, acto, vendedor, comprador, archivo) 
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (fecha_actual, datos.get("escritura_numero", "S/N"), datos.get("naturaleza_acto", "-"), datos.get("nombre_vendedor", "-"), datos.get("nombre_comprador", "-"), nombre_archivo))
    conexion.commit()
    conexion.close()

# --- SABUESOS DE EXTRACCIÓN ---
def limpiar_nombre(texto):
    match = re.search(r"([A-ZÁÉÍÓÚÑ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ]{2,})*(?:\s+[yYeE]\s+[A-ZÁÉÍÓÚÑ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ]{2,})*)*)", texto)
    if match: return match.group(1).strip()
    return texto.strip()

def extraer_datos_de_texto(texto_completo):
    escritura_num = re.search(r"(?:ESCRITURA|NÚMERO|NUMERO)[\s:]*([\d,]+)", texto_completo, re.IGNORECASE)
    cuenta_predial = re.search(r"Cuenta\s+Predial\s+número\s*([A-Za-z0-9\-]+)", texto_completo, re.IGNORECASE)
    fecha_firma = re.search(r"En\s+la\s+ciudad\s+de\s+[^,]+,\s+Jalisco,\s+a\s+(.*?20[0-9]{2})", texto_completo, re.IGNORECASE)
    donacion = re.search(r"contrato\s+de\s+(DONACIÓN|COMPRAVENTA)", texto_completo, re.IGNORECASE)

    bloque_vendedor = re.search(r"por\s+una\s+parte[^\w]*(.*?)(?=y\s+por\s+(?:la\s+)?otra\s+parte)", texto_completo, re.IGNORECASE)
    bloque_comprador = re.search(r"por\s+(?:la\s+)?otra\s+parte[^\w]*(.*?)(?=Manifiestan|DECLARACIONES|DECLARACIÓN)", texto_completo, re.IGNORECASE)

    texto_v = bloque_vendedor.group(1) if bloque_vendedor else ""
    texto_c = bloque_comprador.group(1) if bloque_comprador else ""

    nombre_v = limpiar_nombre(texto_v)
    nombre_c = limpiar_nombre(texto_c)

    estados_civiles = re.findall(r"(casad[oa]s?\s+bajo\s+el\s+r[ée]gimen\s+de\s+[a-zA-Z\s]+|solter[oa]s?)", texto_completo, re.IGNORECASE)
    estado_v = estados_civiles[0].capitalize() if len(estados_civiles) > 0 else ""
    estado_c = estados_civiles[-1].capitalize() if len(estados_civiles) > 1 else ""

    curps = re.findall(r"[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d", texto_completo)
    mitad = len(curps) // 2
    curps_v_texto = ", ".join(curps[:mitad+1]) if len(curps) > 1 else (curps[0] if curps else "")
    curps_c_texto = ", ".join(curps[mitad+1:]) if len(curps) > 1 else (curps[-1] if curps else "")

    montos = re.findall(r"\$[0-9,]+\.\d{2}", texto_completo)
    ubicacion = re.search(r"(?:CALLE|AVENIDA)\s+([^,]+(?:,\s+CONSTRUIDA\s+SOBRE\s+EL\s+LOTE.*?)?)(?=\s+DATOS|\s+ANTECEDENTES|$)", texto_completo, re.IGNORECASE)

    return {
        "recaudadora": "", "cuenta_predial": cuenta_predial.group(1) if cuenta_predial else "",
        "clave_catastral": "", "folio_real": "", "nombre_notario": "LIC. CESAR ALEJANDRO URIBE VÁZQUEZ",
        "notaria_numero": "1", "correo_notario": "contacto@notaria1.com",
        "escritura_numero": escritura_num.group(1) if escritura_num else "",
        "lugar_fecha_firma": fecha_firma.group(0) if fecha_firma else "",
        "naturaleza_acto": donacion.group(1).upper() if donacion else "",
        "nombre_vendedor": nombre_v, "domicilio_vendedor": "", "estado_civil_vendedor": estado_v, "curp_vendedor": curps_v_texto,
        "nombre_comprador": nombre_c, "nacimiento_comprador": "", "domicilio_comprador": "", "estado_civil_comprador": estado_c, "curp_comprador": curps_c_texto,
        "ubicacion_inmueble": ubicacion.group(0).strip() if ubicacion else "", "antecedentes_registro": "",
        "valor_catastral": "", "valor_operacion": montos[0] if len(montos) > 0 else "", "valor_avaluo": montos[0] if len(montos) > 0 else "",
        "impuesto_monto": montos[2] if len(montos) > 2 else "", "total_liquidacion": montos[2] if len(montos) > 2 else ""
    }

# --- RUTAS DE LA API ---
@app.get("/historial")
async def obtener_historial():
    conexion = sqlite3.connect('actarium_historial.db')
    cursor = conexion.cursor()
    cursor.execute("SELECT id, fecha, escritura, acto, vendedor, comprador, archivo FROM historial ORDER BY id DESC LIMIT 50")
    filas = cursor.fetchall()
    conexion.close()
    
    resultado = []
    for fila in filas:
        resultado.append({
            "id": fila[0], "fecha": fila[1], "escritura": fila[2],
            "acto": fila[3], "vendedor": fila[4], "comprador": fila[5], "archivo": fila[6]
        })
    return resultado

# NUEVA RUTA: Para descargar un archivo antiguo
@app.get("/descargar-historial/{registro_id}")
async def descargar_historial(registro_id: int):
    conexion = sqlite3.connect('actarium_historial.db')
    cursor = conexion.cursor()
    cursor.execute("SELECT archivo FROM historial WHERE id = ?", (registro_id,))
    resultado = cursor.fetchone()
    conexion.close()
    
    if resultado and resultado[0]:
        ruta_archivo = os.path.join("avisos_generados", resultado[0])
        if os.path.exists(ruta_archivo):
            return FileResponse(ruta_archivo, filename=resultado[0])
    return {"error": "Archivo no encontrado"}

@app.post("/extraer-datos")
async def extraer_datos(file: UploadFile = File(...)):
    ruta_temporal = f"temp_{file.filename}"
    with open(ruta_temporal, "wb") as buffer: buffer.write(await file.read())
    escritura = Document(ruta_temporal)
    texto_completo = " ".join([p.text for p in escritura.paragraphs])
    os.remove(ruta_temporal)
    return extraer_datos_de_texto(texto_completo)

@app.post("/generar-final")
async def generar_final(datos: dict):
    doc = DocxTemplate("Plantilla_GDL.docx")
    doc.render(datos)
    
    # Creamos un nombre único y lo guardamos en la carpeta permanente
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_unico = f"Aviso_{datos.get('escritura_numero', 'SN')}_{timestamp}.docx"
    ruta_guardado = os.path.join("avisos_generados", nombre_unico)
    
    doc.save(ruta_guardado)
    guardar_en_historial(datos, nombre_unico) # Guardamos el nombre en la BD
    
    return FileResponse(ruta_guardado, filename="Aviso_Actarium_Final.docx")

@app.post("/procesar-masivo")
async def procesar_masivo(archivos: List[UploadFile] = File(...)):
    nombre_zip = "Avisos_Actarium.zip"
    with zipfile.ZipFile(nombre_zip, 'w') as zipf:
        for archivo in archivos:
            ruta_temporal = f"temp_{archivo.filename}"
            with open(ruta_temporal, "wb") as buffer: buffer.write(await archivo.read())
            escritura = Document(ruta_temporal)
            texto_completo = " ".join([p.text for p in escritura.paragraphs])
            
            datos = extraer_datos_de_texto(texto_completo)
            
            doc = DocxTemplate("Plantilla_GDL.docx")
            doc.render(datos)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            num_escritura = datos.get("escritura_numero", "S_N")
            nombre_unico = f"Aviso_{num_escritura}_{timestamp}.docx"
            ruta_guardado = os.path.join("avisos_generados", nombre_unico)
            
            doc.save(ruta_guardado)
            zipf.write(ruta_guardado, arcname=nombre_unico) # Lo metemos al ZIP
            guardar_en_historial(datos, nombre_unico)
            
            os.remove(ruta_temporal)
    return FileResponse(nombre_zip, filename="Paquete_Avisos_Actarium.zip", media_type="application/zip")