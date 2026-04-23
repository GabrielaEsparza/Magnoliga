#!/bin/bash
python -c "
import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'magnoliga.settings'
django.setup()
from django.contrib.staticfiles.management.commands.collectstatic import Command
Command().run_from_argv(['manage.py', 'collectstatic', '--noinput', '--clear'])
"
gunicorn magnoliga.wsgi:application