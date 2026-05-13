from django.contrib import admin
from .models import Torneo


@admin.register(Torneo)
class TorneoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'deporte', 'estado', 'activo', 'user']
    list_filter = ['estado', 'activo', 'deporte']
    search_fields = ['nombre']
