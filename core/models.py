from django.db import models

class Categoria(models.Model):
    nombre = models.CharField(max_length=100)
    imagen = models.ImageField(upload_to='categorias/', blank=True, null=True)
    orden  = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['orden']

    def __str__(self):
        return self.nombre


class Jornada(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='jornadas')
    label     = models.CharField(max_length=100)
    fecha     = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['fecha']

    def __str__(self):
        return f"{self.categoria.nombre} - {self.label}"


class Partido(models.Model):
    jornada  = models.ForeignKey(Jornada, on_delete=models.CASCADE, related_name='partidos')
    local    = models.CharField(max_length=100)
    visitante= models.CharField(max_length=100)
    fecha    = models.DateField(null=True, blank=True)
    hora     = models.TimeField(null=True, blank=True)
    pts_local= models.IntegerField(null=True, blank=True)
    pts_visit= models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.local} vs {self.visitante}"


class Equipo(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='equipos')
    nombre    = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.categoria.nombre} - {self.nombre}"


class Jugador(models.Model):
    equipo  = models.ForeignKey(Equipo, on_delete=models.CASCADE, related_name='jugadores')
    nombre  = models.CharField(max_length=100)
    numero  = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return f"#{self.numero} {self.nombre}"


class Asistencia(models.Model):
    jugador = models.ForeignKey(Jugador, on_delete=models.CASCADE, related_name='asistencias')
    jornada = models.ForeignKey(Jornada, on_delete=models.CASCADE, related_name='asistencias')
    presente= models.BooleanField(null=True, blank=True)

    class Meta:
        unique_together = ['jugador', 'jornada']


class Standing(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='standings')
    equipo    = models.CharField(max_length=100)
    orden     = models.PositiveIntegerField(default=0)
    jj        = models.IntegerField(default=0)
    jg        = models.IntegerField(default=0)
    jp        = models.IntegerField(default=0)
    pf        = models.IntegerField(default=0)
    pc        = models.IntegerField(default=0)
    pts       = models.IntegerField(default=0)

    class Meta:
        ordering = ['orden']

    def __str__(self):
        return f"{self.categoria.nombre} - {self.equipo}"


class GaleriaItem(models.Model):
    TIPO_CHOICES = [('foto', 'Foto'), ('video', 'Video')]
    categoria   = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='galeria')
    tipo        = models.CharField(max_length=10, choices=TIPO_CHOICES)
    imagen      = models.ImageField(upload_to='galeria/', blank=True, null=True)
    video_url   = models.URLField(blank=True, null=True)
    titulo      = models.CharField(max_length=200, blank=True)
    orden       = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['orden']


class RolCategoria(models.Model):
    slug    = models.CharField(max_length=50, unique=True)  # 'cat_1', 'cat_2', etc.
    nombre  = models.CharField(max_length=100)
    imagen  = models.ImageField(upload_to='rol/', blank=True, null=True)

    def __str__(self):
        return self.nombre


class RolPartido(models.Model):
    categoria = models.ForeignKey(RolCategoria, on_delete=models.CASCADE, related_name='partidos')
    t1        = models.CharField(max_length=100)
    t2        = models.CharField(max_length=100)
    fecha     = models.DateField(null=True, blank=True)
    hora      = models.TimeField(null=True, blank=True)
    cancha    = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['fecha', 'hora']

    def __str__(self):
        return f"{self.t1} vs {self.t2}"


class ComunicacionesItem(models.Model):
    TIPO_CHOICES = [('foto', 'Foto'), ('video', 'Video')]
    tipo      = models.CharField(max_length=10, choices=TIPO_CHOICES)
    titulo    = models.CharField(max_length=200, blank=True)
    descripcion = models.TextField(blank=True)
    imagen    = models.ImageField(upload_to='comunicaciones/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    orden     = models.PositiveIntegerField(default=0)
    creado    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-creado']

    def __str__(self):
        return f"{self.tipo} - {self.titulo}"
    

    def __str__(self):
        return f"{self.tipo} - {self.titulo}"


class DepoturismoItem(models.Model):
    tipo        = models.CharField(max_length=10)
    titulo      = models.CharField(max_length=200, blank=True)
    descripcion = models.TextField(blank=True)
    imagen      = models.ImageField(upload_to='depoturismo/', blank=True, null=True)
    video_url   = models.URLField(blank=True, null=True)
    orden       = models.PositiveIntegerField(default=0)
    creado      = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-creado']

    def __str__(self):
        return f"{self.tipo} - {self.titulo}"


class ArquitecturaDeportiva(models.Model):
    titulo      = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    imagen      = models.ImageField(upload_to='arquitectura/', blank=True, null=True)
    video_url   = models.URLField(blank=True, null=True)
    tipo        = models.CharField(max_length=10, default='foto')  # 'foto' | 'video'
    orden       = models.PositiveIntegerField(default=0)
    creado      = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-creado']

    def __str__(self):
        return self.titulo

class Patrocinador(models.Model):
    nombre    = models.CharField(max_length=200)
    categoria = models.CharField(max_length=100)
    desc      = models.TextField(blank=True)
    telefono  = models.CharField(max_length=50, blank=True)
    email     = models.EmailField(blank=True)
    instagram = models.CharField(max_length=100, blank=True)
    facebook  = models.CharField(max_length=200, blank=True)
    web       = models.URLField(blank=True)
    imagen    = models.ImageField(upload_to='patrocinadores/', blank=True, null=True)
    imagen_url = models.URLField(blank=True)
    orden     = models.PositiveIntegerField(default=0)
    creado    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['orden']

    def __str__(self):
        return self.nombre