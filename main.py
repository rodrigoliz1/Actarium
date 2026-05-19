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
from typing import List, Optional

from openai import OpenAI
from supabase import create_client, Client

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- LLAVES MAESTRAS (Con tipado estricto para evitar errores en VS Code) ---
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

ia_client = OpenAI(api_key=OPENAI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def limpiar_texto(texto: str) -> str:
    if not texto: 
        return "GENERICO"
    texto = unicodedata.normalize('NFKD', texto).encode('ASCII', 'ignore').decode('utf-8')
    return texto.upper().strip()

def obtener_plantilla_y_municipio(municipio_extraido: str):
    mun = limpiar_texto(municipio_extraido)
    if "GUADALAJARA" in mun: return "Plantilla_GDL.docx", "GUADALAJARA"
    elif "ZAPOPAN" in mun: return "Plantilla_Zapopan.docx", "ZAPOPAN"
    elif "TLAQUEPAQUE" in mun: return "Plantilla_Tlaquepaque.docx", "TLAQUEPAQUE"
    elif "TLAJOMULCO" in mun: return "Plantilla_Tlajomulco.docx", "TLAJOMULCO"
    elif "TONAL" in mun: return "Plantilla_Tonala.docx", "TONALA"
    else: return "Plantilla_Generica.docx", mun if mun and mun != "GENERICO" else "GENERICO"

@app.post("/extraer-datos")
async def extraer_datos(file: UploadFile = File(...)):
    ruta_temporal = f"temp_{file.filename}"
    with open(ruta_temporal, "wb") as buffer: 
        buffer.write(await file.read())
    escritura = Document(ruta_temporal)
    texto_completo = " ".join([p.text for p in escritura.paragraphs])
    os.remove(ruta_temporal)
    
    respuesta = ia_client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={ "type": "json_object" },
        messages=[
            {
                "role": "system", 
                "content": """Eres el Abogado Proyectista Jefe. Extrae los datos en JSON con la siguiente estructura estricta:
                {
                  "avisos": [
                    {
                      "escritura_numero": "", "cuenta_predial": "", "clave_catastral": "", "lugar_fecha_firma": "",
                      "naturaleza_acto": "", "nombre_vendedor": "", "domicilio_vendedor": "", "generales_vendedor": "",
                      "curp_vendedor": "", "nombre_comprador": "", "domicilio_comprador": "", "generales_comprador": "",
                      "curp_comprador": "", "ubicacion_inmueble": "", "antecedentes_registro": "", "valor_operacion": "",
                      "impuesto_monto": "", "total_liquidacion": "", "nombre_notario": "", "notaria_numero": "",
                      "correo_notario": "", "certificado_notario": "", "clasificacion_inmueble": "", "lo_transmitido": "",
                      "municipio_inmueble": ""
                    }
                  ]
                }
                REGLAS DE ORO (PROHIBIDO RESUMIR):
                1. 'ubicacion_inmueble': COPIA TEXTUALMENTE toda la descripción, medidas y linderos del inmueble.
                2. 'antecedentes_registro': COPIA TEXTUALMENTE el antecedente de propiedad.
                3. 'certificado_notario': COPIA TEXTUALMENTE la adscripción del notario (ej. Notario Público Titular número...).
                4. 'generales_vendedor' y 'generales_comprador': Incluye edad, nacionalidad, estado civil, ocupación y origen.
                5. 'domicilio_vendedor' y 'domicilio_comprador': Extrae la dirección completa de las partes.
                6. 'clasificacion_inmueble': 'Urbano', 'Rústico', 'Baldío' o 'Construido'. 'lo_transmitido': 'Fracción', 'Resto' o 'Totalidad'.
                7. ATENCIÓN SUBDIVISIONES: Si la escritura ampara la transmisión de MÚLTIPLES inmuebles, DEBES generar UN objeto completo en el arreglo 'avisos' POR CADA INMUEBLE INDIVIDUAL."""
            },
            {"role": "user", "content": texto_completo}
        ]
    )
    
    datos_ia = json.loads(respuesta.choices[0].message.content)
    return datos_ia

@app.post("/generar-final")
async def generar_final(payload: dict):
    avisos = payload.get("avisos", [])
    user_id = payload.get("user_id", "")
    
    archivos_generados = []
    timestamp = datetime.now().strftime("%H%M%S")
    
    for idx, aviso in enumerate(avisos):
        clasif = aviso.get("clasificacion_inmueble", "")
        trans = aviso.get("lo_transmitido", "")
        municipio_extraido = aviso.get("municipio_inmueble", "")
        
        aviso["x_urbano"] = "X" if clasif == "Urbano" else " "
        aviso["x_rustico"] = "X" if clasif == "Rústico" else " "
        aviso["x_baldio"] = "X" if clasif == "Baldío" else " "
        aviso["x_construido"] = "X" if clasif == "Construido" else " "
        aviso["x_fraccion"] = "X" if trans == "Fracción" else " "
        aviso["x_resto"] = "X" if trans == "Resto" else " "
        aviso["x_totalidad"] = "X" if trans == "Totalidad" else " "

        plantilla_doc, mun_limpio = obtener_plantilla_y_municipio(municipio_extraido)
        if not os.path.exists(plantilla_doc):
            plantilla_doc = "Plantilla_Generica.docx"

        doc = DocxTemplate(plantilla_doc)
        doc.render(aviso)
        
        num_escritura = aviso.get('escritura_numero', 'SN')
        nombre_oficial = f"ATP_{num_escritura}_{mun_limpio}_{idx+1}.docx"
        nombre_unico = f"ATP_{num_escritura}_{mun_limpio}_{timestamp}_{idx+1}.docx" 
        ruta_local = f"temp_{nombre_unico}"
        
        doc.save(ruta_local)
        archivos_generados.append({"ruta_local": ruta_local, "nombre_unico": nombre_unico, "nombre_oficial": nombre_oficial, "aviso_data": aviso})

    if len(archivos_generados) == 1:
        archivo_data = archivos_generados[0]
        with open(archivo_data["ruta_local"], "rb") as f:
            supabase.storage.from_("avisos_generados").upload(archivo_data["nombre_unico"], f)
        
        if user_id:
            supabase.table("historial").insert({
                "user_id": user_id, "escritura": str(archivo_data["aviso_data"].get('escritura_numero', 'SN')),
                "acto": archivo_data["aviso_data"].get("naturaleza_acto", "-"), "vendedor": archivo_data["aviso_data"].get("nombre_vendedor", "-"),
                "comprador": archivo_data["aviso_data"].get("nombre_comprador", "-"), "archivo": archivo_data["nombre_unico"]
            }).execute()
            
        os.remove(archivo_data["ruta_local"])
        return {"success": True, "archivo": archivo_data["nombre_unico"], "nombre_descarga": archivo_data["nombre_oficial"]}
    
    else:
        nombre_zip_descarga = f"Avisos_Subdivision_{num_escritura}.zip"
        nombre_zip_nube = f"Avisos_Subdivision_{num_escritura}_{timestamp}.zip"
        
        with zipfile.ZipFile(nombre_zip_nube, 'w') as zipf:
            for arch in archivos_generados:
                zipf.write(arch["ruta_local"], arcname=arch["nombre_oficial"])
                with open(arch["ruta_local"], "rb") as f:
                    supabase.storage.from_("avisos_generados").upload(arch["nombre_unico"], f)
                if user_id:
                    supabase.table("historial").insert({
                        "user_id": user_id, "escritura": str(arch["aviso_data"].get('escritura_numero', 'SN')),
                        "acto": arch["aviso_data"].get("naturaleza_acto", "-"), "vendedor": arch["aviso_data"].get("nombre_vendedor", "-"),
                        "comprador": arch["aviso_data"].get("nombre_comprador", "-"), "archivo": arch["nombre_unico"]
                    }).execute()
                os.remove(arch["ruta_local"])
        
        with open(nombre_zip_nube, "rb") as f:
            supabase.storage.from_("avisos_generados").upload(nombre_zip_nube, f)
        os.remove(nombre_zip_nube)
        
        return {"success": True, "archivo": nombre_zip_nube, "nombre_descarga": nombre_zip_descarga}

@app.post("/procesar-masivo")
async def procesar_masivo(archivos: List[UploadFile] = File(...), user_id: Optional[str] = Form(None)):
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
                        "content": "Eres el Abogado Proyectista Jefe. Extrae los datos en JSON estructurado bajo la clave 'avisos' (arreglo de objetos). REGLAS: 1. 'ubicacion_inmueble', 'antecedentes_registro' y 'certificado_notario' deben ser LITERALES. 2. 'clasificacion_inmueble' ('Urbano', 'Rústico', 'Baldío', 'Construido'). 3. 'lo_transmitido' ('Fracción', 'Resto', 'Totalidad'). 4. 'municipio_inmueble' (Identifica municipio). 5. SUBDIVISIONES: Si se transmiten múltiples inmuebles, genera un objeto por cada uno."
                    },
                    {"role": "user", "content": texto_completo}
                ]
            )
            
            datos_ia = json.loads(respuesta.choices[0].message.content)
            
            for idx, aviso_ia in enumerate(datos_ia.get("avisos", [])):
                clasif = aviso_ia.get("clasificacion_inmueble", "")
                trans = aviso_ia.get("lo_transmitido", "")
                municipio_extraido = aviso_ia.get("municipio_inmueble", "")
                
                aviso_ia["x_urbano"] = "X" if clasif == "Urbano" else " "
                aviso_ia["x_rustico"] = "X" if clasif == "Rústico" else " "
                aviso_ia["x_baldio"] = "X" if clasif == "Baldío" else " "
                aviso_ia["x_construido"] = "X" if clasif == "Construido" else " "
                aviso_ia["x_fraccion"] = "X" if trans == "Fracción" else " "
                aviso_ia["x_resto"] = "X" if trans == "Resto" else " "
                aviso_ia["x_totalidad"] = "X" if trans == "Totalidad" else " "
                
                plantilla_doc, mun_limpio = obtener_plantilla_y_municipio(municipio_extraido)
                if not os.path.exists(plantilla_doc):
                    plantilla_doc = "Plantilla_Generica.docx"

                doc = DocxTemplate(plantilla_doc)
                doc.render(aviso_ia)
                
                num_escritura = aviso_ia.get('escritura_numero', 'SN')
                nombre_limpio = archivo.filename.replace(".docx", "")
                
                nombre_archivo_final = f"ATP_{num_escritura}_{mun_limpio}_{idx+1}.docx" if len(datos_ia.get("avisos", [])) > 1 else f"ATP_{num_escritura}_{mun_limpio}.docx"
                ruta_en_zip = f"{mun_limpio}/{nombre_limpio}/{nombre_archivo_final}"
                
                timestamp_individual = datetime.now().strftime("%H%M%S")
                nombre_unico_nube = f"ATP_{num_escritura}_{mun_limpio}_{timestamp_individual}_{idx+1}.docx"
                ruta_local = f"temp_{nombre_unico_nube}"
                
                doc.save(ruta_local)
                
                with open(ruta_local, "rb") as f:
                    supabase.storage.from_("avisos_generados").upload(nombre_unico_nube, f)
                
                if user_id:
                    supabase.table("historial").insert({
                        "user_id": user_id, "escritura": str(num_escritura),
                        "acto": aviso_ia.get("naturaleza_acto", "-"), "vendedor": aviso_ia.get("nombre_vendedor", "-"),
                        "comprador": aviso_ia.get("nombre_comprador", "-"), "archivo": nombre_unico_nube
                    }).execute()
                    
                zipf.write(ruta_local, arcname=ruta_en_zip)
                os.remove(ruta_local)
            
    return FileResponse(nombre_zip, filename=nombre_zip, media_type="application/zip")