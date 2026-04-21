from django.urls import path
from . import views, api

urlpatterns = [
    # ── Páginas ──────────────────────────────
    path('',                   views.index,            name='index'),
    path('acerca-de/',         views.acerca_de,        name='acerca_de'),
    path('categorias/',        views.categorias,       name='categorias'),
    path('rol-juegos/',        views.rol_juegos,       name='rol_juegos'),
    path('comunicaciones/',    views.comunicaciones,   name='comunicaciones'),
    path('deporturismo/',      views.deporturismo,     name='deporturismo'),
    path('mantenimiento/',     views.mantenimiento,    name='mantenimiento'),
    path('seccion-magnoliga/', views.seccion_magnoliga,name='seccion_magnoliga'),
    path('api/rol/categorias/<slug:slug>/', api.rol_categoria_detalle, name='api_rol_categoria_detalle'),

    # ── API Categorías ───────────────────────
    path('api/categorias/',                      api.categorias_list,    name='api_categorias'),
    path('api/categorias/<int:cat_id>/',         api.categoria_detalle,  name='api_categoria_detalle'),
    path('api/categorias/<int:cat_id>/foto/',    api.categoria_foto,     name='api_categoria_foto'),

    # ── API Jornadas ─────────────────────────
    path('api/categorias/<int:cat_id>/jornadas/',        api.jornadas_list,   name='api_jornadas'),
    path('api/jornadas/<int:jornada_id>/',               api.jornada_detalle, name='api_jornada_detalle'),

    # ── API Partidos ─────────────────────────
    path('api/jornadas/<int:jornada_id>/partidos/',      api.partidos_list,   name='api_partidos'),
    path('api/partidos/<int:partido_id>/',               api.partido_detalle, name='api_partido_detalle'),

    # ── API Equipos ──────────────────────────
    path('api/categorias/<int:cat_id>/equipos/',         api.equipos_list,    name='api_equipos'),
    path('api/equipos/<int:equipo_id>/',                 api.equipo_detalle,  name='api_equipo_detalle'),

    # ── API Jugadores ────────────────────────
    path('api/equipos/<int:equipo_id>/jugadores/',       api.jugadores_list,  name='api_jugadores'),
    path('api/jugadores/<int:jugador_id>/',              api.jugador_detalle, name='api_jugador_detalle'),

    # ── API Asistencias ──────────────────────
    path('api/asistencias/',                             api.asistencias_list, name='api_asistencias'),

    # ── API Standings ────────────────────────
    path('api/categorias/<int:cat_id>/standings/',       api.standings_list,  name='api_standings'),
    path('api/standings/<int:standing_id>/',             api.standing_detalle,name='api_standing_detalle'),

    # ── API Galería ──────────────────────────
    path('api/categorias/<int:cat_id>/galeria/',         api.galeria_list,    name='api_galeria'),
    path('api/galeria/<int:item_id>/',                   api.galeria_detalle, name='api_galeria_detalle'),

    # ── API Rol de Juegos ────────────────────────────────────────────
    path('api/rol/categorias/',                      api.rol_categorias_list,   name='api_rol_categorias'),
    path('api/rol/categorias/<slug:slug>/foto/',     api.rol_categoria_foto,    name='api_rol_categoria_foto'),
    path('api/rol/categorias/<slug:slug>/partidos/', api.rol_partidos_list,     name='api_rol_partidos'),
    path('api/rol/partidos/<int:partido_id>/',       api.rol_partido_detalle,   name='api_rol_partido_detalle'),

    # ── API Comunicaciones ───────────────────────────────────────────
    path('api/comunicaciones/',                api.comunicaciones_list,    name='api_comunicaciones'),
    path('api/comunicaciones/<int:item_id>/',  api.comunicaciones_detalle, name='api_comunicaciones_detalle'),

    # ── API Depoturismo ──────────────────────────────────────────────
    path('api/depoturismo/',                   api.depoturismo_list,       name='api_depoturismo'),
    path('api/depoturismo/<int:item_id>/',     api.depoturismo_detalle,    name='api_depoturismo_detalle'),

    # ── API Arquitectura Deportiva ───────────────────────────────────
    path('api/arquitectura/',                  api.arquitectura_list,      name='api_arquitectura'),
    path('api/arquitectura/<int:item_id>/',    api.arquitectura_detalle,   name='api_arquitectura_detalle'),

    # ── API Seccion magnoliga ─────────────
    path('api/patrocinadores/',                  api.patrocinadores_list,    name='api_patrocinadores'),
    path('api/patrocinadores/<int:pat_id>/',     api.patrocinador_detalle,   name='api_patrocinador_detalle'),
    path('api/patrocinadores/<int:pat_id>/imagen/', api.patrocinador_imagen, name='api_patrocinador_imagen'),
]
