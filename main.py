from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from docx import Document
from docxtpl import DocxTemplate
import os
import json
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

@app.post("/extraer-datos")
async def extraer_datos(file: UploadFile = File(...)):
    ruta_temporal = f"temp_{file.filename}"
    with open(ruta_temporal, "wb") as buffer: buffer.write(await file.read())
    escritura = Document(ruta_temporal)
    texto_completo = " ".join([p.text for p in escritura.paragraphs])
    os.remove(ruta_temporal)
    
    # EL CEREBRO COGNITIVO (Instrucciones Estrictas y Literales)
    respuesta = ia_client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={ "type": "json_object" },
        messages=[
            {
                "role": "system", 
                "content": "Eres el Abogado Proyectista Jefe. Extrae los datos en JSON con estas claves: escritura_numero, cuenta_predial, lugar_fecha_firma, naturaleza_acto, nombre_vendedor, estado_civil_vendedor, curp_vendedor, nombre_comprador, estado_civil_comprador, curp_comprador, ubicacion_inmueble, valor_operacion, impuesto_monto, total_liquidacion, nombre_notario, notaria_numero, correo_notario, clasificacion_inmueble, lo_transmitido.\n\nREGLAS ESTRICTAS:\n1. 'ubicacion_inmueble': Extrae de forma LITERAL, ÍNTEGRA Y COMPLETA toda la descripción, medidas y linderos (norte, sur, oriente, poniente). NO RESUMAS ABSOLUTAMENTE NADA. Copia el párrafo exacto.\n2. 'clasificacion_inmueble': Deduce del texto y responde estrictamente con una opción: 'Urbano', 'Rústico', 'Baldío' o 'Construido' (ej. Finca Urbana = Urbano).\n3. 'lo_transmitido': Responde estrictamente con 'Fracción', 'Resto' o 'Totalidad' (ej. totalidad de los derechos = Totalidad).\n4. Si un dato no existe, usa una cadena vacía."
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
    # Procesar las 'X' para los recuadros justo antes de renderizar
    clasif = datos.get("clasificacion_inmueble", "")
    trans = datos.get("lo_transmitido", "")
    
    datos["x_urbano"] = "X" if clasif == "Urbano" else ""
    datos["x_rustico"] = "X" if clasif == "Rústico" else ""
    datos["x_baldio"] = "X" if clasif == "Baldío" else ""
    datos["x_construido"] = "X" if clasif == "Construido" else ""
    
    datos["x_fraccion"] = "X" if trans == "Fracción" else ""
    datos["x_resto"] = "X" if trans == "Resto" else ""
    datos["x_totalidad"] = "X" if trans == "Totalidad" else ""

    doc = DocxTemplate("Plantilla_GDL.docx")
    doc.render(datos)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    num_escritura = datos.get('escritura_numero', 'SN')
    nombre_unico = f"Aviso_{num_escritura}_{timestamp}.docx"
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
    return {"success": True, "archivo": nombre_unico}