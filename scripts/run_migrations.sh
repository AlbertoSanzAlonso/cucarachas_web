#!/bin/bash
export $(grep -v '^#' backend/.env | xargs)
backend/venv/bin/python3 backend/manage.py makemigrations api
backend/venv/bin/python3 backend/manage.py migrate
