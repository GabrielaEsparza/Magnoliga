#!/bin/bash
python manage.py collectstatic --noinput --clear
python manage.py migrate
gunicorn magnoliga.wsgi:application