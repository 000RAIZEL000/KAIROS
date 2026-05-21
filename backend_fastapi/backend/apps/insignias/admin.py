from django.contrib import admin
from .models import Insignia


@admin.register(Insignia)
class InsigniaAdmin(admin.ModelAdmin):
    list_display = ['id', 'jugador', 'tipo', 'torneo', 'partido', 'fecha']
    list_filter = ['tipo', 'torneo']
    search_fields = ['jugador__nombre', 'jugador__apellido', 'torneo__nombre']
