from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from docx import Document
from docxtpl import DocxTemplate
import os
import json
import zipfile
import unicodedata
from datetime import datetime
from typing import List

from openai import OpenAI
from supabase import create_client, Client

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- LLAVES MAESTRAS ---
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

ia_client = OpenAI(api_key=OPENAI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- MOTOR DE RUTEO INTELIGENTE ---
def limpiar_texto(texto):
    """Quita acentos y pasa a mayúsculas para normalizar municipios."""
    if not texto: return "GENERICO"
    texto = unicodedata.normalize('NFKD', texto).encode('ASCII', 'ignore').decode('utf-8')
    return texto.upper().strip()

def obtener_plantilla_y_municipio(municipio_extraido):
    mun = limpiar_texto(municipio_extraido)
    if "GUADALAJARA" in mun:
        return "Plantilla_GDL.docx", "GUADALAJARA"
    elif "ZAPOPAN" in mun:
        return "Plantilla_Zapopan.docx", "ZAPOPAN"
    elif "TLAQUEPAQUE" in mun:
        return "Plantilla_Tlaquepaque.docx", "TLAQUEPAQUE"
    elif "TLAJOMULCO" in mun:
        return "Plantilla_Tlajomulco.docx", "TLAJOMULCO"
    elif "TONAL" in mun:
        return "Plantilla_Tonala.docx", "TONALA"
    else:
        # Si es otro municipio (ej. Puerto Vallarta), usa el Genérico pero crea la carpeta con el nombre correcto.
        return "Plantilla_Generica.docx", mun if mun and mun != "GENERICO" else "GENERICO"

@app.post("/extraer-datos")
async def extraer_datos(file: UploadFile = File(...)):
    ruta_temporal = f"temp_{file.filename}"
    with open(ruta_temporal, "wb") as buffer: buffer.write(await file.read())
    escritura = Document(ruta_temporal)
    texto_completo = " ".join([p.text for p in escritura.paragraphs])
    os.remove(ruta_temporal)
    
    respuesta = ia_client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={ "type": "json_object" },
        messages=[
            {
                "role": "system", 
                "content": "Eres el Abogado Proyectista Jefe. Extrae los datos en JSON con estas claves: escritura_numero, cuenta_predial, lugar_fecha_firma, naturaleza_acto, nombre_vendedor, estado_civil_vendedor, curp_vendedor, nombre_comprador, estado_civil_comprador, curp_comprador, ubicacion_inmueble, valor_operacion, impuesto_monto, total_liquidacion, nombre_notario, notaria_numero, correo_notario, clasificacion_inmueble, lo_transmitido, municipio_inmueble.\n\nREGLAS ESTRICTAS:\n1. 'ubicacion_inmueble': Extrae de forma LITERAL, ÍNTEGRA Y COMPLETA toda la descripción, medidas y linderos.\n2. 'clasificacion_inmueble': Responde estrictamente 'Urbano', 'Rústico', 'Baldío' o 'Construido'.\n3. 'lo_transmitido': Responde estrictamente 'Fracción', 'Resto' o 'Totalidad'.\n4. 'municipio_inmueble': Identifica el municipio exacto donde se ubica el inmueble (ej. Guadalajara, Zapopan, Tlajomulco, etc.).\n5. Si un dato no existe, usa cadena vacía."
            },
            {"role": "user", "content": texto_completo}
        ]
    )
    
    datos_ia = json.loads(respuesta.choices[0].message.content)
    
    datos_completos = {
        "recaudadora": "", "clave_catastral": "", "folio_real": "",
        "nombre_notario": datos_ia.get("nombre_notario", ""), 
        "notaria_numero": datos_ia.get("notaria_numero", ""),
        "correo_notario": datos_ia.get("correo_notario", ""), 
        "antecedentes_registro": "",
        "valor_catastral": "", "valor_avaluo": datos_ia.get("valor_operacion", ""),
        **datos_ia
    }
    return datos_completos

@app.post("/generar-final")
async def generar_final(datos: dict):
    clasif = datos.get("clasificacion_inmueble", "")
    trans = datos.get("lo_transmitido", "")
    municipio_extraido = datos.get("municipio_inmueble", "")
    
    datos["x_urbano"] = "X" if clasif == "Urbano" else " "
    datos["x_rustico"] = "X" if clasif == "Rústico" else " "
    datos["x_baldio"] = "X" if clasif == "Baldío" else " "
    datos["x_construido"] = "X" if clasif == "Construido" else " "
    
    datos["x_fraccion"] = "X" if trans == "Fracción" else " "
    datos["x_resto"] = "X" if trans == "Resto" else " "
    datos["x_totalidad"] = "X" if trans == "Totalidad" else " "

    plantilla_doc, mun_limpio = obtener_plantilla_y_municipio(municipio_extraido)
    
    if not os.path.exists(plantilla_doc):
        plantilla_doc = "Plantilla_Generica.docx"

    doc = DocxTemplate(plantilla_doc)
    doc.render(datos)
    
    timestamp = datetime.now().strftime("%H%M%S")
    num_escritura = datos.get('escritura_numero', 'SN')
    nombre_oficial = f"ATP_{num_escritura}_{mun_limpio}.docx"
    nombre_unico = f"ATP_{num_escritura}_{mun_limpio}_{timestamp}.docx" 
    ruta_local = f"temp_{nombre_unico}"
    
    doc.save(ruta_local)

    with open(ruta_local, "rb") as f:
        supabase.storage.from_("avisos_generados").upload(nombre_unico, f)
    
    user_id = datos.get("user_id")
    if user_id:
        supabase.table("historial").insert({
            "user_id": user_id, "escritura": str(num_escritura),
            "acto": datos.get("naturaleza_acto", "-"), "vendedor": datos.get("nombre_vendedor", "-"),
            "comprador": datos.get("nombre_comprador", "-"), "archivo": nombre_unico
        }).execute()

    os.remove(ruta_local) 
    
    # Devolvemos el nombre exacto que pediste para la descarga: ATP_1234_ZAPOPAN.docx
    return {"success": True, "archivo": nombre_unico, "nombre_descarga": nombre_oficial}

@app.post("/procesar-masivo")
async def procesar_masivo(archivos: List[UploadFile] = File(...), user_id: str = Form(None)):
    timestamp_lote = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_zip = f"Paquete_Avisos_Actarium_{timestamp_lote}.zip"
    
    with zipfile.ZipFile(nombre_zip, 'w') as zipf:
        for archivo in archivos:
            ruta_temporal = f"temp_{archivo.filename}"
            with open(ruta_temporal, "wb") as buffer: 
                buffer.write(await archivo.read())
            
            escritura = Document(ruta_temporal)
            texto_completo = " ".join([p.text for p in escritura.paragraphs])
            os.remove(ruta_temporal)
            
            respuesta = ia_client.chat.completions.create(
                model="gpt-4o-mini",
                response_format={ "type": "json_object" },
                messages=[
                    {
                        "role": "system", 
                        "content": "Eres el Abogado Proyectista Jefe. Extrae los datos en JSON con estas claves: escritura_numero, cuenta_predial, lugar_fecha_firma, naturaleza_acto, nombre_vendedor, estado_civil_vendedor, curp_vendedor, nombre_comprador, estado_civil_comprador, curp_comprador, ubicacion_inmueble, valor_operacion, impuesto_monto, total_liquidacion, nombre_notario, notaria_numero, correo_notario, clasificacion_inmueble, lo_transmitido, municipio_inmueble.\n\nREGLAS ESTRICTAS:\n1. 'ubicacion_inmueble': Extrae de forma LITERAL, ÍNTEGRA Y COMPLETA toda la descripción, medidas y linderos.\n2. 'clasificacion_inmueble': 'Urbano', 'Rústico', 'Baldío' o 'Construido'.\n3. 'lo_transmitido': 'Fracción', 'Resto' o 'Totalidad'.\n4. 'municipio_inmueble': Identifica el municipio donde se ubica el inmueble.\n5. Si un dato no existe, usa una cadena vacía."
                    },
                    {"role": "user", "content": texto_completo}
                ]
            )
            
            datos_ia = json.loads(respuesta.choices[0].message.content)
            clasif = datos_ia.get("clasificacion_inmueble", "")
            trans = datos_ia.get("lo_transmitido", "")
            municipio_extraido = datos_ia.get("municipio_inmueble", "")
            
            datos_completos = {
                "recaudadora": "", "clave_catastral": "", "folio_real": "",
                "nombre_notario": datos_ia.get("nombre_notario", ""), 
                "notaria_numero": datos_ia.get("notaria_numero", ""),
                "correo_notario": datos_ia.get("correo_notario", ""), 
                "antecedentes_registro": "",
                "valor_catastral": "", "valor_avaluo": datos_ia.get("valor_operacion", ""),
                "x_urbano": "X" if clasif == "Urbano" else " ",
                "x_rustico": "X" if clasif == "Rústico" else " ",
                "x_baldio": "X" if clasif == "Baldío" else " ",
                "x_construido": "X" if clasif == "Construido" else " ",
                "x_fraccion": "X" if trans == "Fracción" else " ",
                "x_resto": "X" if trans == "Resto" else " ",
                "x_totalidad": "X" if trans == "Totalidad" else " ",
                **datos_ia
            }
            
            plantilla_doc, mun_limpio = obtener_plantilla_y_municipio(municipio_extraido)
            if not os.path.exists(plantilla_doc):
                plantilla_doc = "Plantilla_Generica.docx"

            doc = DocxTemplate(plantilla_doc)
            doc.render(datos_completos)
            
            num_escritura = datos_completos.get('escritura_numero', 'SN')
            nombre_archivo_final = f"ATP_{num_escritura}_{mun_limpio}.docx"
            
            # EL TRUCO DE LA CARPETA ESTÁ AQUÍ (mun_limpio/archivo)
            ruta_en_zip = f"{mun_limpio}/{nombre_archivo_final}"
            
            timestamp_individual = datetime.now().strftime("%H%M%S")
            nombre_unico_nube = f"ATP_{num_escritura}_{mun_limpio}_{timestamp_individual}.docx"
            ruta_local = f"temp_{nombre_unico_nube}"
            
            doc.save(ruta_local)
            
            with open(ruta_local, "rb") as f:
                supabase.storage.from_("avisos_generados").upload(nombre_unico_nube, f)
            
            if user_id:
                supabase.table("historial").insert({
                    "user_id": user_id, "escritura": str(num_escritura),
                    "acto": datos_completos.get("naturaleza_acto", "-"), "vendedor": datos_completos.get("nombre_vendedor", "-"),
                    "comprador": datos_completos.get("nombre_comprador", "-"), "archivo": nombre_unico_nube
                }).execute()
                
            # Escribimos el archivo en el ZIP respetando su carpeta por municipio
            zipf.write(ruta_local, arcname=ruta_en_zip)
            os.remove(ruta_local)
            
    return FileResponse(nombre_zip, filename=nombre_zip, media_type="application/zip")