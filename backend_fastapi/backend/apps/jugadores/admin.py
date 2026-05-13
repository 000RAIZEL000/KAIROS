from django.contrib import admin
from .models import Jugador


@admin.register(Jugador)
class JugadorAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'apellido', 'equipo', 'posicion', 'numero_camiseta', 'activo']
    list_filter = ['activo', 'equipo']
    search_fields = ['nombre', 'apellido', 'dni']
