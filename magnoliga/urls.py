from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('', include('core.urls')),
]

# FIX: Protección contra STATICFILES_DIRS vacío en algunos entornos.
# Se usa STATICFILES_DIRS[0] solo si existe; de lo contrario se omite
# (en producción los estáticos los sirve el servidor web, no Django).
if settings.DEBUG:
    if getattr(settings, 'STATICFILES_DIRS', []):
        urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
    elif getattr(settings, 'STATIC_ROOT', None):
        urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    if getattr(settings, 'MEDIA_URL', None) and getattr(settings, 'MEDIA_ROOT', None):
        urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)