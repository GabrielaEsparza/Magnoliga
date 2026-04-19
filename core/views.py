from django.shortcuts import render

def es_admin(request):
    return request.user.is_authenticated and request.user.is_staff

def index(request):
    return render(request, 'index.html', {'es_admin': es_admin(request)})

def acerca_de(request):
    return render(request, 'AcercaDe.html')

def categorias(request):
    return render(request, 'categorias.html', {'es_admin': es_admin(request)})

def rol_juegos(request):
    return render(request, 'rol-juegos.html', {'es_admin': es_admin(request)})

def comunicaciones(request):
    return render(request, 'Comunicaciones.html', {'es_admin': es_admin(request)})

def deporturismo(request):
    return render(request, 'deporturismo.html', {'es_admin': es_admin(request)})

def mantenimiento(request):
    return render(request, 'mantenimiento.html', {'es_admin': es_admin(request)})

def seccion_magnoliga(request):
    return render(request, 'seccionMagnoliga.html', {'es_admin': es_admin(request)})