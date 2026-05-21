from django.db import models


TIPOS_INSIGNIA = [
    ('goleador', 'Goleador'),
    ('mejor_jugador', 'Mejor Jugador'),
    ('fair_play', 'Fair Play'),
    ('portero_menos_goleado', 'Portero Menos Goleado'),
    ('capitan', 'Capitán'),
    ('mvp_partido', 'MVP del Partido'),
]


class Insignia(models.Model):
    jugador = models.ForeignKey(
        'jugadores.Jugador',
        on_delete=models.CASCADE,
        related_name='insignias',
    )
    tipo = models.CharField(max_length=30, choices=TIPOS_INSIGNIA)
    torneo = models.ForeignKey(
        'torneos.Torneo',
        on_delete=models.CASCADE,
        related_name='insignias',
    )
    partido = models.ForeignKey(
        'partidos.Partido',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='insignias',
    )
    descripcion = models.TextField(blank=True, null=True)
    fecha = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'insignias'
        ordering = ['-fecha', '-created_at']

    def __str__(self):
        return f"{self.jugador} - {self.get_tipo_display()} ({self.torneo})"
