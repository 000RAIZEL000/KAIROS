from django.db import models


TIPOS_EVENTO = ['gol', 'amarilla', 'roja', 'asistencia', 'sustitucion']


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

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_tipo_evento = None
        if not is_new:
            try:
                old_self = EventoPartido.objects.get(pk=self.pk)
                old_tipo_evento = old_self.tipo_evento
            except EventoPartido.DoesNotExist:
                pass

        super().save(*args, **kwargs)

        if self.tipo_evento == 'gol' or old_tipo_evento == 'gol':
            self.update_partido_goles()

    def delete(self, *args, **kwargs):
        partido = self.partido
        tipo = self.tipo_evento
        super().delete(*args, **kwargs)
        if tipo == 'gol' and partido:
            self.update_partido_goles_for_partido(partido)

    def update_partido_goles(self):
        if self.partido:
            self.update_partido_goles_for_partido(self.partido)

    @staticmethod
    def update_partido_goles_for_partido(partido):
        goles_local = EventoPartido.objects.filter(
            partido=partido,
            tipo_evento='gol',
            equipo=partido.equipo_local
        ).count()
        goles_visitante = EventoPartido.objects.filter(
            partido=partido,
            tipo_evento='gol',
            equipo=partido.equipo_visitante
        ).count()
        partido.goles_local = goles_local
        partido.goles_visitante = goles_visitante
        partido.save(update_fields=['goles_local', 'goles_visitante'])

