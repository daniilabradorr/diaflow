# DiaFlow — MVP (Starter)

Repositorio inicial para el MVP de **DiaFlow** (nombre provisional), listo para:
- **Django** + **PostgreSQL** (Render)
- **Docker** (producción) y `venv` (desarrollo local)
- **GitHub Actions** (lint, chequeos de Django y build de Docker)
- **Branch protection** del `main`
- **Blueprint de Render** (`render.yaml`) para crear el servicio web y la base de datos

## Requisitos
- Python 3.12+
- Docker (opcional local)
- Git y, si quieres, GitHub CLI (`gh`)

## Desarrollo local rápido
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Variables de entorno (copia el ejemplo y ajusta si quieres)
cp .env.example .env

# Migraciones + runserver (SQLite por defecto si no hay DATABASE_URL)
python backend/manage.py migrate
python backend/manage.py runserver
```

Visita `http://127.0.0.1:8000/health` para comprobar que todo responde `{"status":"ok"}`.

## Crear y subir el repositorio a GitHub
```bash
git init
git add .
git commit -m "chore: bootstrap Django + CI + Docker + Render blueprint"
git branch -M main
# Crea el repo remoto (reemplaza usuario/nombre)
gh repo create tu-usuario/diaflow --private --source=. --remote=origin --push
```

## Protección de la rama `main`
1. En GitHub → *Settings* → *Branches* → *Branch protection rules* → **Add rule**.
2. **Branch name pattern:** `main`
3. Marca (recomendado):
   - ✅ *Require a pull request before merging* (al menos 1 revisor)
   - ✅ *Require status checks to pass* y selecciona: `ci-django` y `docker-build`
   - ✅ *Require linear history*
   - ✅ *Do not allow bypassing the above settings*
4. Guarda.

## Conexión y despliegue en Render
1. En Render → **New +** → **Blueprint** → conecta tu repo y selecciona `render.yaml`.
2. Render creará:
   - Un servicio **Web** Dockerizado (Django + Gunicorn)
   - Una **base de datos Postgres**
3. Ajusta variables de entorno si lo necesitas (Render autogenera `SECRET_KEY` y conecta `DATABASE_URL`).
4. Deploy. La ruta de salud es `/health`.

> Por defecto, Render hace *auto-deploy* cuando hay commits en `main`. Así tendrás un flujo: *PR → merge a main → despliegue*.

## Estructura
```
.
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── backend/
│   ├── core/
│   └── diaflow/
├── .env.example
├── Dockerfile
├── render.yaml
├── requirements.txt
└── README.md
```

## Convenciones
- **Ramas:** `feature/*`, `fix/*`, `hotfix/*`. PRs contra `main`.
- **Conventional Commits:** `feat: ...`, `fix: ...`, `chore: ...`, etc.
- **Checks obligatorios:** `ci-django` + `docker-build`.

¡Listo! Ya puedes empezar a crear apps Django dentro de `backend/`.
