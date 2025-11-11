# Imagen ligera de Python
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Dependencias del sistema para psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \    build-essential libpq-dev \    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala dependencias
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copia el proyecto
COPY backend /app/backend

WORKDIR /app/backend

# Recogida de estáticos (no falla si no hay)
RUN python manage.py collectstatic --noinput || true

# Gunicorn en el puerto 8000
EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "diaflow.wsgi:application"]
