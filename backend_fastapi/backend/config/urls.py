from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection
from rest_framework.routers import DefaultRouter


def health_check(request):
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False
    return JsonResponse({'status': 'ok' if db_ok else 'degraded', 'db': db_ok})

from apps.torneos.views import (
    TorneoViewSet,
    tabla_torneo,
    goleadores_torneo,
    tarjetas_torneo,
    resumen_torneo,
)
from apps.equipos.views import EquipoViewSet
from apps.jugadores.views import JugadorViewSet
from apps.partidos.views import PartidoViewSet
from apps.eventos.views import EventoPartidoViewSet

router = DefaultRouter()
router.register(r'torneos', TorneoViewSet, basename='torneo')
router.register(r'equipos', EquipoViewSet, basename='equipo')
router.register(r'jugadores', JugadorViewSet, basename='jugador')
router.register(r'partidos', PartidoViewSet, basename='partido')
router.register(r'eventos', EventoPartidoViewSet, basename='evento')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('apps.users.urls')),
    path('api/health/', health_check, name='health'),

    # Stats
    path('api/stats/tabla/<int:torneo_id>/', tabla_torneo, name='stats-tabla'),
    path('api/stats/goleadores/<int:torneo_id>/', goleadores_torneo, name='stats-goleadores'),
    path('api/stats/tarjetas/<int:torneo_id>/', tarjetas_torneo, name='stats-tarjetas'),
    path('api/stats/resumen/<int:torneo_id>/', resumen_torneo, name='stats-resumen'),
]
