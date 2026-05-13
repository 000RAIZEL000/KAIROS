from django.contrib import admin
from .models import EventoPartido


@admin.register(EventoPartido)
class EventoPartidoAdmin(admin.ModelAdmin):
    list_display = ['id', 'partido', 'tipo_evento', 'jugador', 'equipo', 'minuto']
    list_filter = ['tipo_evento']
    search_fields = ['jugador__nombre', 'jugador__apellido']
