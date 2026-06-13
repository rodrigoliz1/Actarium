# Usamos una imagen ligera de Linux con Python 3.10
FROM python:3.10-slim

# Evitamos que el servidor nos pida presionar "Y/N" durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Instalamos LibreOffice (El motor que hará la magia de Word a PDF)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Establecemos nuestra carpeta de trabajo en el servidor
WORKDIR /app

# Copiamos las dependencias y las instalamos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo nuestro código (main.py y las plantillas .docx)
COPY . .

# Comando de arranque dinámico (Render usa la variable $PORT automáticamente)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}