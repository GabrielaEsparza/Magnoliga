#!/bin/bash
python manage.py collectstatic --noinput --clear
python manage.py migrate
python create_superuser.py
gunicorn magnoliga.wsgi:application