from django.db import models


class Equipo(models.Model):
    torneo = models.ForeignKey(
        'torneos.Torneo',
        on_delete=models.CASCADE,
        related_name='equipos',
    )
    nombre = models.CharField(max_length=255)
    grupo = models.CharField(max_length=50, blank=True, null=True)
    color_principal = models.CharField(max_length=50, blank=True, null=True)
    color_secundario = models.CharField(max_length=50, blank=True, null=True)
    escudo_url = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'equipos'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre
