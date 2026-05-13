from django.db import models
from django.conf import settings


class Torneo(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    deporte = models.CharField(max_length=50, blank=True, null=True)
    modalidad = models.CharField(max_length=50, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    fecha_inicio = models.DateField(blank=True, null=True)
    fecha_fin = models.DateField(blank=True, null=True)
    estado = models.CharField(max_length=50, default='Pendiente')
    imagen_url = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='torneos',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'torneos'
        ordering = ['-id']

    def __str__(self):
        return self.nombre
