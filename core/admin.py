from django.contrib import admin
from .models import Categoria, Jornada, Partido, Equipo, Jugador, Asistencia, Standing, GaleriaItem, RolCategoria, RolPartido, ComunicacionesItem, DepoturismoItem, ArquitecturaDeportiva, Patrocinador

admin.site.register(Categoria)
admin.site.register(Jornada)
admin.site.register(Partido)
admin.site.register(Equipo)
admin.site.register(Jugador)
admin.site.register(Asistencia)
admin.site.register(Standing)
admin.site.register(GaleriaItem)
admin.site.register(RolCategoria)
admin.site.register(RolPartido)
admin.site.register(ComunicacionesItem)
admin.site.register(DepoturismoItem)
admin.site.register(ArquitecturaDeportiva)
@admin.register(Patrocinador)
class PatrocinadorAdmin(admin.ModelAdmin):
    list_display  = ('nombre', 'categoria', 'telefono', 'email', 'orden')
    list_editable = ('orden',)
    search_fields = ('nombre', 'categoria')