from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from docx import Document
from docxtpl import DocxTemplate
import os
import json
import zipfile
import unicodedata
import re
from datetime import datetime
from typing import List, Optional

from openai import OpenAI
from supabase import create_client, Client

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=False, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

ia_client = OpenAI(api_key=OPENAI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def limpiar_texto(texto: str) -> str:
    if not texto: return "GENERICO"
    texto = unicodedata.normalize('NFKD', texto).encode('ASCII', 'ignore').decode('utf-8')
    return texto.upper().strip()

def limpiar_nombre_archivo(texto: str) -> str:
    if not texto: return "SN"
    return re.sub(r'[\\/*?:"<>|]', '-', str(texto)).strip()

def obtener_plantilla_y_municipio(municipio_extraido: str):
    mun = limpiar_texto(municipio_extraido)
    if "GUADALAJARA" in mun: return "Plantilla_GDL.docx", "GUADALAJARA"
    elif "ZAPOPAN" in mun: return "Plantilla_Zapopan.docx", "ZAPOPAN"
    elif "TLAQUEPAQUE" in mun: return "Plantilla_Tlaquepaque.docx", "TLAQUEPAQUE"
    elif "TLAJOMULCO" in mun: return "Plantilla_Tlajomulco.docx", "TLAJOMULCO"
    elif "TONAL" in mun: return "Plantilla_Tonala.docx", "TONALA"
    else: return "Plantilla_Generica.docx", mun if mun and mun != "GENERICO" else "GENERICO"

PROMPT_SISTEMA = """Eres el Abogado Proyectista Jefe. Extrae los datos en JSON con la siguiente estructura estricta:
{
  "avisos": [
    {
      "escritura_numero": "", "cuenta_predial": "", "clave_catastral": "", "lugar_fecha_firma": "", "fecha_cierre": "", "fecha_resolucion": "",
      "naturaleza_acto": "", 
      "nombre_vendedor": "", "nacimiento_vendedor": "", "domicilio_vendedor": "", "generales_vendedor": "", "curp_vendedor": "", 
      "nombre_comprador": "", "nacimiento_comprador": "", "domicilio_comprador": "", "generales_comprador": "", "curp_comprador": "", 
      "ubicacion_inmueble": "", "uso_inmueble": "", "antecedentes_registro": "", 
      "valor_operacion": "", "valor_avaluo": "", "valor_catastral": "",
      "impuesto_monto": "", "total_liquidacion": "", 
      "nombre_notario": "", "notaria_numero": "", "correo_notario": "", "certificado_notario": "", 
      "clasificacion_inmueble": [], "lo_transmitido": "", "municipio_inmueble": "", "se_anexa": ""
    }
  ]
}
REGLAS DE ORO INQUEBRANTABLES (PROHIBIDO RESUMIR O INVENTAR):
1. NOMBRES CON TÍTULOS: En 'nombre_vendedor' y 'nombre_comprador', COPIA TEXTUALMENTE incluyendo prefijos como "El señor", "Los señores esposos", "La sociedad mercantil", tal cual vienen en la escritura.
2. GENERALES EXACTAS: En 'generales_vendedor' y 'generales_comprador' NO RESUMAS. COPIA Y PEGA EL PÁRRAFO COMPLETO EXACTO donde se mencionan las generales (edad, estado civil, ocupación, nacionalidad).
3. VALORES MONETARIOS: Asegúrate de extraer correctamente el Valor de Operación, Avalúo y Catastral de forma literal. No omitas el 'total_liquidacion'.
4. ANTECEDENTES: Copia el antecedente de propiedad o Datos de Registro de forma LITERAL y COMPLETA.
5. UBICACIÓN Y USO: COPIA TEXTUALMENTE la descripción, medidas y linderos. Extrae el 'uso_inmueble'.
6. CLASIFICACIÓN (IMPORTANTE): 'clasificacion_inmueble' DEBE SER UN ARREGLO con una o más de estas opciones si aplican: ["Urbano", "Rústico", "Baldío", "Construido"].
7. SUBDIVISIONES: Si se transmiten MÚLTIPLES inmuebles, genera UN objeto en 'avisos' POR CADA INMUEBLE.
8. 'se_anexa': Responde 'Deslinde', 'Avalúo Bancario', 'Certificado de No Propiedad', 'Certificado de no Adeudo' o 'Ninguno'."""

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
            {"role": "system", "content": PROMPT_SISTEMA},
            {"role": "user", "content": texto_completo}
        ]
    )
    return json.loads(respuesta.choices[0].message.content)

@app.post("/generar-final")
async def generar_final(payload: dict):
    avisos = payload.get("avisos", [])
    user_id = payload.get("user_id", "")
    
    archivos_generados = []
    timestamp = datetime.now().strftime("%H%M%S")
    
    for idx, aviso in enumerate(avisos):
        clasif = aviso.get("clasificacion_inmueble", [])
        if isinstance(clasif, str): clasif = [clasif]
        
        trans = aviso.get("lo_transmitido", "")
        municipio_extraido = aviso.get("municipio_inmueble", "")
        anexo = aviso.get("se_anexa", "Avalúo Bancario")
        
        aviso["x_urbano"] = "X" if "Urbano" in clasif else " "
        aviso["x_rustico"] = "X" if "Rústico" in clasif else " "
        aviso["x_baldio"] = "X" if "Baldío" in clasif else " "
        aviso["x_construido"] = "X" if "Construido" in clasif else " "
        
        aviso["x_fraccion"] = "X" if trans == "Fracción" else " "
        aviso["x_resto"] = "X" if trans == "Resto" else " "
        aviso["x_totalidad"] = "X" if trans == "Totalidad" else " "
        
        aviso["x_deslinde"] = "X" if anexo == "Deslinde" else " "
        aviso["x_avaluo"] = "X" if anexo == "Avalúo Bancario" else " "
        aviso["x_certificado_no_prop"] = "X" if anexo == "Certificado de No Propiedad" else " "
        aviso["x_certificado_no_adeudo"] = "X" if anexo == "Certificado de no Adeudo" else " "

        plantilla_doc, mun_limpio = obtener_plantilla_y_municipio(municipio_extraido)
        if not os.path.exists(plantilla_doc):
            plantilla_doc = "Plantilla_Generica.docx"

        doc = DocxTemplate(plantilla_doc)
        doc.render(aviso)
        
        num_escritura_raw = aviso.get('escritura_numero', 'SN')
        num_escritura = limpiar_nombre_archivo(num_escritura_raw)

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
            # EL CAMBIO CRÍTICO: GUARDAR EL JSON
            supabase.table("historial").insert({
                "user_id": user_id, 
                "escritura": str(archivo_data["aviso_data"].get('escritura_numero', 'SN')),
                "acto": archivo_data["aviso_data"].get("naturaleza_acto", "-"), 
                "vendedor": archivo_data["aviso_data"].get("nombre_vendedor", "-"),
                "comprador": archivo_data["aviso_data"].get("nombre_comprador", "-"), 
                "archivo": archivo_data["nombre_unico"],
                "datos_json": json.dumps(archivo_data["aviso_data"])
            }).execute()
            
        os.remove(archivo_data["ruta_local"])
        return {"success": True, "archivo": archivo_data["nombre_unico"], "nombre_descarga": archivo_data["nombre_oficial"]}
    
    else:
        num_escritura_zip = limpiar_nombre_archivo(avisos[0].get('escritura_numero', 'SN'))
        nombre_zip_descarga = f"Avisos_Subdivision_{num_escritura_zip}.zip"
        nombre_zip_nube = f"Avisos_Subdivision_{num_escritura_zip}_{timestamp}.zip"
        
        with zipfile.ZipFile(nombre_zip_nube, 'w') as zipf:
            for arch in archivos_generados:
                zipf.write(arch["ruta_local"], arcname=arch["nombre_oficial"])
                with open(arch["ruta_local"], "rb") as f:
                    supabase.storage.from_("avisos_generados").upload(arch["nombre_unico"], f)
                if user_id:
                    # GUARDANDO EL JSON TAMBIÉN EN MASIVA
                    supabase.table("historial").insert({
                        "user_id": user_id, 
                        "escritura": str(arch["aviso_data"].get('escritura_numero', 'SN')),
                        "acto": arch["aviso_data"].get("naturaleza_acto", "-"), 
                        "vendedor": arch["aviso_data"].get("nombre_vendedor", "-"),
                        "comprador": arch["aviso_data"].get("nombre_comprador", "-"), 
                        "archivo": arch["nombre_unico"],
                        "datos_json": json.dumps(arch["aviso_data"])
                    }).execute()
                os.remove(arch["ruta_local"])
        
        with open(nombre_zip_nube, "rb") as f:
            supabase.storage.from_("avisos_generados").upload(nombre_zip_nube, f)
        os.remove(nombre_zip_nube)
        
        return {"success": True, "archivo": nombre_zip_nube, "nombre_descarga": nombre_zip_descarga}

@app.post("/procesar-masivo")
async def procesar_masivo(archivos: List[UploadFile] = File(...), user_id: Optional[str] = Form(None), fecha_cierre: Optional[str] = Form("")):
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
                    {"role": "system", "content": PROMPT_SISTEMA},
                    {"role": "user", "content": texto_completo}
                ]
            )
            
            datos_ia = json.loads(respuesta.choices[0].message.content)
            
            for idx, aviso_ia in enumerate(datos_ia.get("avisos", [])):
                if fecha_cierre:
                    aviso_ia["fecha_cierre"] = fecha_cierre

                clasif = aviso_ia.get("clasificacion_inmueble", [])
                if isinstance(clasif, str): clasif = [clasif]
                
                trans = aviso_ia.get("lo_transmitido", "")
                municipio_extraido = aviso_ia.get("municipio_inmueble", "")
                anexo = aviso_ia.get("se_anexa", "Avalúo Bancario")
                
                aviso_ia["x_urbano"] = "X" if "Urbano" in clasif else " "
                aviso_ia["x_rustico"] = "X" if "Rústico" in clasif else " "
                aviso_ia["x_baldio"] = "X" if "Baldío" in clasif else " "
                aviso_ia["x_construido"] = "X" if "Construido" in clasif else " "

                aviso_ia["x_fraccion"] = "X" if trans == "Fracción" else " "
                aviso_ia["x_resto"] = "X" if trans == "Resto" else " "
                aviso_ia["x_totalidad"] = "X" if trans == "Totalidad" else " "

                aviso_ia["x_deslinde"] = "X" if anexo == "Deslinde" else " "
                aviso_ia["x_avaluo"] = "X" if anexo == "Avalúo Bancario" else " "
                aviso_ia["x_certificado_no_prop"] = "X" if anexo == "Certificado de No Propiedad" else " "
                aviso_ia["x_certificado_no_adeudo"] = "X" if anexo == "Certificado de no Adeudo" else " "
                
                plantilla_doc, mun_limpio = obtener_plantilla_y_municipio(municipio_extraido)
                if not os.path.exists(plantilla_doc):
                    plantilla_doc = "Plantilla_Generica.docx"

                doc = DocxTemplate(plantilla_doc)
                doc.render(aviso_ia)
                
                num_escritura_raw = aviso_ia.get('escritura_numero', 'SN')
                num_escritura = limpiar_nombre_archivo(num_escritura_raw)
                nombre_limpio = limpiar_nombre_archivo(archivo.filename.replace(".docx", ""))
                
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
                        "comprador": aviso_ia.get("nombre_comprador", "-"), "archivo": nombre_unico_nube,
                        "datos_json": json.dumps(aviso_ia)
                    }).execute()
                    
                zipf.write(ruta_local, arcname=ruta_en_zip)
                os.remove(ruta_local)
            
    return FileResponse(nombre_zip, filename=nombre_zip, media_type="application/zip")