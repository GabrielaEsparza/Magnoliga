import json
from django.http import JsonResponse
from .models import Categoria, Jornada, Partido, Equipo, Jugador, Asistencia, Standing, GaleriaItem, RolCategoria, RolPartido, ComunicacionesItem, DepoturismoItem, ArquitecturaDeportiva, Patrocinador
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import get_object_or_404
from .models import Categoria, Jornada, Partido, Equipo, Jugador, Asistencia, Standing, GaleriaItem


def json_response(data, status=200):
    return JsonResponse(data, safe=False, status=status)


# ── CATEGORÍAS ───────────────────────────────────────────────────────
def categorias_list(request):
    if request.method == 'GET':
        cats = Categoria.objects.all()
        data = [{
            'id':     c.id,
            'nombre': c.nombre,
            'imagen': c.imagen.url if c.imagen else None,
            'orden':  c.orden,
        } for c in cats]
        return json_response(data)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        cat  = Categoria.objects.create(
            nombre = body.get('nombre', 'Nueva categoría'),
            orden  = Categoria.objects.count()
        )
        return json_response({'id': cat.id, 'nombre': cat.nombre, 'imagen': None}, 201)


@csrf_exempt
def categoria_detalle(request, cat_id):
    cat = get_object_or_404(Categoria, id=cat_id)

    if request.method == 'PUT':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        cat.nombre = body.get('nombre', cat.nombre)
        cat.orden  = body.get('orden',  cat.orden)
        cat.save()
        return json_response({'ok': True})

    if request.method == 'DELETE':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        cat.delete()
        return json_response({'ok': True})


@csrf_exempt
def categoria_foto(request, cat_id):
    if not (request.user.is_authenticated and request.user.is_staff):
        return json_response({'error': 'No autorizado'}, 403)
    cat  = get_object_or_404(Categoria, id=cat_id)
    foto = request.FILES.get('imagen')
    if foto:
        try:
            foto.seek(0)  # ← agrega esta línea
            cat.imagen = foto
            cat.save()
            return json_response({'imagen': cat.imagen.url})
        except Exception as e:
            import traceback
            return json_response({'error': str(e), 'detail': traceback.format_exc()}, 500)
    return json_response({'error': 'No se recibió imagen'}, 400)


# ── JORNADAS ─────────────────────────────────────────────────────────
@csrf_exempt
def jornadas_list(request, cat_id):
    cat = get_object_or_404(Categoria, id=cat_id)

    if request.method == 'GET':
        data = [{
            'id':    j.id,
            'label': j.label,
            'fecha': str(j.fecha) if j.fecha else None,
            'partidos': [{
                'id':       p.id,
                'local':    p.local,
                'visitante':p.visitante,
                'fecha':    str(p.fecha) if p.fecha else None,
                'hora':     str(p.hora)  if p.hora  else None,
                'pts_local':p.pts_local,
                'pts_visit':p.pts_visit,
            } for p in j.partidos.all()]
        } for j in cat.jornadas.all().order_by('fecha', 'id')]
        return json_response(data)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        n    = cat.jornadas.count() + 1
        jornada = Jornada.objects.create(
            categoria = cat,
            label     = body.get('label', f'Jornada {n}'),
            fecha     = body.get('fecha') or None,
        )
        return json_response({'id': jornada.id, 'label': jornada.label}, 201)


@csrf_exempt
def jornada_detalle(request, jornada_id):
    jornada = get_object_or_404(Jornada, id=jornada_id)

    if request.method == 'DELETE':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        jornada.delete()
        return json_response({'ok': True})


# ── PARTIDOS ──────────────────────────────────────────────────────────
@csrf_exempt
def partidos_list(request, jornada_id):
    jornada = get_object_or_404(Jornada, id=jornada_id)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        p = Partido.objects.create(
            jornada   = jornada,
            local     = body.get('local', ''),
            visitante = body.get('visitante', ''),
            fecha     = body.get('fecha') or None,
            hora      = body.get('hora')  or None,
            pts_local = body.get('pts_local'),
            pts_visit = body.get('pts_visit'),
        )
        return json_response({'id': p.id}, 201)


@csrf_exempt
def partido_detalle(request, partido_id):
    p = get_object_or_404(Partido, id=partido_id)

    if request.method == 'PUT':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        p.local     = body.get('local',     p.local)
        p.visitante = body.get('visitante', p.visitante)
        p.fecha     = body.get('fecha')     or p.fecha
        p.hora      = body.get('hora')      or p.hora
        p.pts_local = body.get('pts_local', p.pts_local)
        p.pts_visit = body.get('pts_visit', p.pts_visit)
        p.save()
        return json_response({'ok': True})

    if request.method == 'DELETE':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        p.delete()
        return json_response({'ok': True})


# ── EQUIPOS ───────────────────────────────────────────────────────────
@csrf_exempt
def equipos_list(request, cat_id):
    cat = get_object_or_404(Categoria, id=cat_id)

    if request.method == 'GET':
        data = [{
            'id':     e.id,
            'nombre': e.nombre,
            'jugadores': [{
                'id':     j.id,
                'nombre': j.nombre,
                'numero': j.numero,
            } for j in e.jugadores.all()]
        } for e in cat.equipos.all()]
        return json_response(data)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        e = Equipo.objects.create(categoria=cat, nombre=body.get('nombre', ''))
        return json_response({'id': e.id, 'nombre': e.nombre}, 201)


@csrf_exempt
def equipo_detalle(request, equipo_id):
    e = get_object_or_404(Equipo, id=equipo_id)


    if request.method == 'PUT':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        e.nombre = body.get('nombre', e.nombre)
        e.save()
        return json_response({'ok': True})

    if request.method == 'DELETE':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        e.delete()
        return json_response({'ok': True})


# ── JUGADORES ─────────────────────────────────────────────────────────
@csrf_exempt
def jugadores_list(request, equipo_id):
    equipo = get_object_or_404(Equipo, id=equipo_id)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        j = Jugador.objects.create(
            equipo = equipo,
            nombre = body.get('nombre', ''),
            numero = body.get('numero', ''),
        )
        return json_response({'id': j.id, 'nombre': j.nombre, 'numero': j.numero}, 201)


@csrf_exempt
def jugador_detalle(request, jugador_id):
    j = get_object_or_404(Jugador, id=jugador_id)

    if request.method == 'PUT':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        j.nombre = body.get('nombre', j.nombre)
        j.numero = body.get('numero', j.numero)
        j.save()
        return json_response({'ok': True})

    if request.method == 'DELETE':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        j.delete()
        return json_response({'ok': True})


# ── ASISTENCIAS ───────────────────────────────────────────────────────
@csrf_exempt
def asistencias_list(request):
    if request.method == 'GET':
        cat_id = request.GET.get('cat')
        qs = Asistencia.objects.filter(jornada__categoria_id=cat_id) if cat_id else Asistencia.objects.all()
        data = [{'jugador_id': a.jugador_id, 'jornada_id': a.jornada_id, 'presente': a.presente} for a in qs]
        return json_response(data)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body    = json.loads(request.body)
        jugador = get_object_or_404(Jugador, id=body.get('jugador_id'))
        jornada = get_object_or_404(Jornada, id=body.get('jornada_id'))
        obj, _  = Asistencia.objects.update_or_create(
            jugador = jugador,
            jornada = jornada,
            defaults = {'presente': body.get('presente')}
        )
        return json_response({'ok': True})


# ── STANDINGS ─────────────────────────────────────────────────────────
@csrf_exempt
def standings_list(request, cat_id):
    cat = get_object_or_404(Categoria, id=cat_id)

    if request.method == 'GET':
        standings = list(cat.standings.all())
        # Orden automático: PTS desc, luego DIF desc
        standings.sort(key=lambda s: (-(s.pts), -(s.pf - s.pc)))
        data = [{
            'id':     s.id,
            'equipo': s.equipo,
            'orden':  s.orden,
            'jj': s.jj, 'jg': s.jg, 'jp': s.jp,
            'pf': s.pf, 'pc': s.pc, 'pts': s.pts,
        } for s in standings]
        return json_response(data)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        s = Standing.objects.create(
            categoria = cat,
            equipo    = body.get('equipo', ''),
            orden     = cat.standings.count(),
        )
        return json_response({'id': s.id}, 201)


@csrf_exempt
def standing_detalle(request, standing_id):
    s = get_object_or_404(Standing, id=standing_id)

    if request.method == 'PUT':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        for f in ['jj','jg','jp','pf','pc','pts','orden']:
            setattr(s, f, body.get(f, getattr(s, f)))
        s.save()
        return json_response({'ok': True})

    if request.method == 'DELETE':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        s.delete()
        return json_response({'ok': True})


# ── GALERÍA ───────────────────────────────────────────────────────────
@csrf_exempt
def galeria_list(request, cat_id):
    cat = get_object_or_404(Categoria, id=cat_id)

    if request.method == 'GET':
        data = [{
            'id':        g.id,
            'tipo':      g.tipo,
            'imagen':    g.imagen.url if g.imagen else None,
            'video_url': g.video_url,
            'titulo':    g.titulo,
        } for g in cat.galeria.all()]
        return json_response(data)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        tipo = request.POST.get('tipo', 'foto')
        g = GaleriaItem(
            categoria = cat,
            tipo      = tipo,
            titulo    = request.POST.get('titulo', ''),
            orden     = cat.galeria.count(),
        )
        if tipo == 'foto' and request.FILES.get('imagen'):
            g.imagen = request.FILES['imagen']
        if tipo == 'video':
            g.video_url = request.POST.get('video_url', '')
        g.save()
        return json_response({
            'id':     g.id,
            'tipo':   g.tipo,
            'imagen': g.imagen.url if g.imagen else None,
            'video_url': g.video_url,
        }, 201)


@csrf_exempt
def galeria_detalle(request, item_id):
    g = get_object_or_404(GaleriaItem, id=item_id)

    if request.method == 'DELETE':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        g.delete()
        return json_response({'ok': True})
    
    # ── ROL DE JUEGOS ─────────────────────────────────────────────────────
@csrf_exempt
def rol_categorias_list(request):
    if request.method == 'GET':
        cats = RolCategoria.objects.all()
        data = [{
            'id':     c.id,
            'slug':   c.slug,
            'nombre': c.nombre,
            'imagen': c.imagen.url if c.imagen else None,
             'orden':  c.orden, 
        } for c in cats]
        return json_response(data)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        nombre = body.get('nombre', '').strip()
        slug   = body.get('slug', '').strip()
        orden=RolCategoria.objects.count()
        if not nombre or not slug:
            return json_response({'error': 'nombre y slug requeridos'}, 400)
        if RolCategoria.objects.filter(slug=slug).exists():
            return json_response({'error': 'El slug ya existe'}, 400)
        cat = RolCategoria.objects.create(nombre=nombre, slug=slug, orden=orden)
        return json_response({'id': cat.id, 'slug': cat.slug, 'nombre': cat.nombre, 'imagen': None}, 201)


@csrf_exempt
def rol_categoria_foto(request, slug):
    if not (request.user.is_authenticated and request.user.is_staff):
        return json_response({'error': 'No autorizado'}, 403)
    cat  = get_object_or_404(RolCategoria, slug=slug)
    foto = request.FILES.get('imagen')
    if foto:
        cat.imagen = foto
        cat.save()
        return json_response({'imagen': cat.imagen.url})
    return json_response({'error': 'No se recibió imagen'}, 400)


@csrf_exempt
def rol_partidos_list(request, slug):
    cat = get_object_or_404(RolCategoria, slug=slug)

    if request.method == 'GET':
        data = [{
            'id':     p.id,
            't1':     p.t1,
            't2':     p.t2,
            'fecha':  str(p.fecha) if p.fecha else None,
            'hora':   str(p.hora)[:5] if p.hora else None,
            'cancha': p.cancha,
        } for p in cat.partidos.all()]
        return json_response(data)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        p = RolPartido.objects.create(
            categoria = cat,
            t1        = body.get('t1', ''),
            t2        = body.get('t2', ''),
            fecha     = body.get('fecha') or None,
            hora      = body.get('hora')  or None,
            cancha    = body.get('cancha', ''),
        )
        return json_response({'id': p.id}, 201)


@csrf_exempt
def rol_partido_detalle(request, partido_id):
    p = get_object_or_404(RolPartido, id=partido_id)

    if request.method == 'PUT':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body    = json.loads(request.body)
        p.t1    = body.get('t1',     p.t1)
        p.t2    = body.get('t2',     p.t2)
        p.fecha = body.get('fecha')  or p.fecha
        p.hora  = body.get('hora')   or p.hora
        p.cancha= body.get('cancha', p.cancha)
        p.save()
        return json_response({'ok': True})

    if request.method == 'DELETE':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        p.delete()
        return json_response({'ok': True})


    # ── COMUNICACIONES ────────────────────────────────────────────────────
@csrf_exempt
def comunicaciones_list(request):
    if request.method == 'GET':
        items = ComunicacionesItem.objects.all()
        data = [{
            'id':          i.id,
            'tipo':        i.tipo,
            'titulo':      i.titulo,
            'descripcion': i.descripcion,
            'imagen':      i.imagen.url if i.imagen else None,
            'video_url':   i.video_url,
        } for i in items]
        return json_response(data)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        tipo = request.POST.get('tipo', 'foto')
        item = ComunicacionesItem(
            tipo        = tipo,
            titulo      = request.POST.get('titulo', ''),
            descripcion = request.POST.get('descripcion', ''),
            orden       = ComunicacionesItem.objects.count(),
        )
        if tipo == 'foto' and request.FILES.get('imagen'):
            item.imagen = request.FILES['imagen']
        if tipo == 'video':
            item.video_url = request.POST.get('video_url', '')
        item.save()
        return json_response({
            'id':        item.id,
            'tipo':      item.tipo,
            'titulo':    item.titulo,
            'imagen':    item.imagen.url if item.imagen else None,
            'video_url': item.video_url,
        }, 201)


@csrf_exempt
def comunicaciones_detalle(request, item_id):
    item = get_object_or_404(ComunicacionesItem, id=item_id)

    if request.method == 'DELETE':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        item.delete()
        return json_response({'ok': True})


# ── DEPOTURISMO ───────────────────────────────────────────────────────
@csrf_exempt
def depoturismo_list(request):
    if request.method == 'GET':
        items = DepoturismoItem.objects.all()
        data = [{
            'id':          i.id,
            'tipo':        i.tipo,
            'titulo':      i.titulo,
            'descripcion': i.descripcion,
            'imagen':      i.imagen.url if i.imagen else None,
            'video_url':   i.video_url,
        } for i in items]
        return json_response(data)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        tipo = request.POST.get('tipo', 'foto')
        item = DepoturismoItem(
            tipo        = tipo,
            titulo      = request.POST.get('titulo', ''),
            descripcion = request.POST.get('descripcion', ''),
            orden       = DepoturismoItem.objects.count(),
        )
        if tipo == 'foto' and request.FILES.get('imagen'):
            item.imagen = request.FILES['imagen']
        if tipo == 'video':
            item.video_url = request.POST.get('video_url', '')
        item.save()
        return json_response({
            'id':        item.id,
            'tipo':      item.tipo,
            'titulo':    item.titulo,
            'imagen':    item.imagen.url if item.imagen else None,
            'video_url': item.video_url,
        }, 201)


@csrf_exempt
def depoturismo_detalle(request, item_id):
    item = get_object_or_404(DepoturismoItem, id=item_id)

    if request.method == 'DELETE':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        item.delete()
        return json_response({'ok': True})


# ── ARQUITECTURA DEPORTIVA ────────────────────────────────────────────
@csrf_exempt
def arquitectura_list(request):
    if request.method == 'GET':
        items = ArquitecturaDeportiva.objects.all()
        data = [{
            'id':          i.id,
            'tipo':        i.tipo,
            'titulo':      i.titulo,
            'descripcion': i.descripcion,
            'imagen':      i.imagen.url if i.imagen else None,
            'video_url':   i.video_url,
        } for i in items]
        return json_response(data)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        tipo = request.POST.get('tipo', 'foto')
        item = ArquitecturaDeportiva(
            tipo        = tipo,
            titulo      = request.POST.get('titulo', ''),
            descripcion = request.POST.get('descripcion', ''),
            orden       = ArquitecturaDeportiva.objects.count(),
        )
        if tipo == 'foto' and request.FILES.get('imagen'):
            item.imagen = request.FILES['imagen']
        if tipo == 'video':
            item.video_url = request.POST.get('video_url', '')
        item.save()
        return json_response({
            'id':        item.id,
            'tipo':      item.tipo,
            'titulo':    item.titulo,
            'imagen':    item.imagen.url if item.imagen else None,
            'video_url': item.video_url,
        }, 201)


@csrf_exempt
def arquitectura_detalle(request, item_id):
    item = get_object_or_404(ArquitecturaDeportiva, id=item_id)

    if request.method == 'DELETE':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        item.delete()
        return json_response({'ok': True})
    



# ── PATROCINADORES ────────────────────────────────────────────────────
@csrf_exempt
def patrocinadores_list(request):
    if request.method == 'GET':
        items = Patrocinador.objects.all()
        data = [{
            'id':        p.id,
            'nombre':    p.nombre,
            'categoria': p.categoria,
            'desc':      p.desc,
            'telefono':  p.telefono,
            'email':     p.email,
            'instagram': p.instagram,
            'facebook':  p.facebook,
            'web':       p.web,
            'img':       p.imagen.url if p.imagen else p.imagen_url,
        } for p in items]
        return json_response(data)

    if request.method == 'POST':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        p = Patrocinador(
            nombre    = request.POST.get('nombre', ''),
            categoria = request.POST.get('categoria', ''),
            desc      = request.POST.get('desc', ''),
            telefono  = request.POST.get('telefono', ''),
            email     = request.POST.get('email', ''),
            instagram = request.POST.get('instagram', ''),
            facebook  = request.POST.get('facebook', ''),
            web       = request.POST.get('web', ''),
            imagen_url = request.POST.get('imagen_url', ''),
            orden     = Patrocinador.objects.count(),
        )
        if request.FILES.get('imagen'):
            p.imagen = request.FILES['imagen']
        p.save()
        return json_response({
            'id':     p.id,
            'nombre': p.nombre,
            'img':    p.imagen.url if p.imagen else p.imagen_url,
        }, 201)


@csrf_exempt
def patrocinador_detalle(request, pat_id):
    p = get_object_or_404(Patrocinador, id=pat_id)

    if request.method == 'PUT':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        body = json.loads(request.body)
        for f in ['nombre','categoria','desc','telefono','email','instagram','facebook','web','imagen_url']:
            setattr(p, f, body.get(f, getattr(p, f)))
        p.save()
        return json_response({'ok': True})

    if request.method == 'DELETE':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        p.delete()
        return json_response({'ok': True})


@csrf_exempt
def patrocinador_imagen(request, pat_id):
    if not (request.user.is_authenticated and request.user.is_staff):
        return json_response({'error': 'No autorizado'}, 403)
    p    = get_object_or_404(Patrocinador, id=pat_id)
    foto = request.FILES.get('imagen')
    if foto:
        p.imagen = foto
        p.imagen_url = ''
        p.save()
        return json_response({'img': p.imagen.url})
    return json_response({'error': 'No se recibió imagen'}, 400)

@csrf_exempt
def rol_categoria_detalle(request, slug):
    cat = get_object_or_404(RolCategoria, slug=slug)

    if request.method == 'DELETE':
        if not (request.user.is_authenticated and request.user.is_staff):
            return json_response({'error': 'No autorizado'}, 403)
        cat.delete()
        return json_response({'ok': True})


@csrf_exempt
def rol_categorias_reorder(request):
    if not (request.user.is_authenticated and request.user.is_staff):
        return json_response({'error': 'No autorizado'}, 403)
    if request.method == 'POST':
        body = json.loads(request.body)
        for item in body:
            RolCategoria.objects.filter(id=item['id']).update(orden=item['orden'])
        return json_response({'ok': True})