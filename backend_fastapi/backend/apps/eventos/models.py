from django.db import models


TIPOS_EVENTO = ['gol', 'amarilla', 'roja', 'asistencia']


class EventoPartido(models.Model):
    partido = models.ForeignKey(
        'partidos.Partido',
        on_delete=models.CASCADE,
        related_name='eventos',
    )
    jugador = models.ForeignKey(
        'jugadores.Jugador',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='eventos',
    )
    equipo = models.ForeignKey(
        'equipos.Equipo',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='eventos',
    )
    tipo_evento = models.CharField(max_length=30)
    minuto = models.IntegerField(blank=True, null=True)
    valor = models.IntegerField(blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'eventos_partido'
        ordering = ['id']

    def __str__(self):
        return f'{self.tipo_evento} - Partido {self.partido_id}'
