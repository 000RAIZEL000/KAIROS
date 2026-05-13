from django.contrib import admin
from .models import Equipo


@admin.register(Equipo)
class EquipoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'torneo', 'grupo', 'activo']
    list_filter = ['activo', 'torneo']
    search_fields = ['nombre']
