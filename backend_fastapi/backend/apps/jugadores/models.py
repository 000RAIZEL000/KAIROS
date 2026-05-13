from django.db import models


class Jugador(models.Model):
    equipo = models.ForeignKey(
        'equipos.Equipo',
        on_delete=models.CASCADE,
        related_name='jugadores',
    )
    nombre = models.CharField(max_length=80)
    apellido = models.CharField(max_length=80)
    dni = models.CharField(max_length=20, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    posicion = models.CharField(max_length=50, blank=True, null=True)
    numero_camiseta = models.IntegerField(blank=True, null=True)
    foto_url = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'jugadores'
        ordering = ['nombre', 'apellido']

    def __str__(self):
        return f'{self.nombre} {self.apellido}'
