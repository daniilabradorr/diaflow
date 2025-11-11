#!/usr/bin/env sh

set -e
cd /app/backend
python manage.py migrate --noinput
python manage.py collectstatic --noinput || true
exec gunicorn --bind 0.0.0.0:8000 diaflow.wsgi:application
