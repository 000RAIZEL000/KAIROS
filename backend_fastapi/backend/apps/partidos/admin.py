from django.contrib import admin
from .models import Partido


@admin.register(Partido)
class PartidoAdmin(admin.ModelAdmin):
    list_display = ['id', 'torneo', 'equipo_local', 'equipo_visitante', 'fecha', 'estado', 'goles_local', 'goles_visitante']
    list_filter = ['estado', 'torneo']
    search_fields = ['equipo_local__nombre', 'equipo_visitante__nombre']
