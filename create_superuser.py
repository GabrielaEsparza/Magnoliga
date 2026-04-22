import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'magnoliga.settings')
django.setup()

from django.contrib.auth import get_user_model
U = get_user_model()

username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email    = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if password and not U.objects.filter(username=username).exists():
    U.objects.create_superuser(username, email, password)
    print(f'Superusuario {username} creado.')
else:
    print(f'Superusuario {username} ya existe.')