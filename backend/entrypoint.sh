#!/bin/sh

# Exit on error
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting server..."
exec gunicorn --bind 0.0.0.0:8001 -k uvicorn.workers.UvicornWorker core.asgi:application
