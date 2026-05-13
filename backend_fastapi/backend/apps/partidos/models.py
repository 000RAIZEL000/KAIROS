from django.db import models


ESTADOS_PARTIDO = ['Pendiente', 'En juego', 'Finalizado', 'Suspendido']


class Partido(models.Model):
    torneo = models.ForeignKey(
        'torneos.Torneo',
        on_delete=models.CASCADE,
        related_name='partidos',
    )
    equipo_local = models.ForeignKey(
        'equipos.Equipo',
        on_delete=models.CASCADE,
        related_name='partidos_local',
    )
    equipo_visitante = models.ForeignKey(
        'equipos.Equipo',
        on_delete=models.CASCADE,
        related_name='partidos_visitante',
    )
    fecha = models.DateTimeField(blank=True, null=True)
    estado = models.CharField(max_length=30, default='Pendiente')
    goles_local = models.IntegerField(default=0)
    goles_visitante = models.IntegerField(default=0)
    cancha = models.CharField(max_length=255, blank=True, null=True)
    jornada = models.IntegerField(blank=True, null=True)
    fase = models.CharField(max_length=100, blank=True, null=True)
    arbitro = models.CharField(max_length=255, blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'partidos'
        ordering = ['fecha']

    def __str__(self):
        return f'{self.equipo_local} vs {self.equipo_visitante}'
