from collections import defaultdict

from django.db.models import Count, Q, Sum
from rest_framework import permissions, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Torneo
from .serializers import TorneoSerializer


class TorneoViewSet(viewsets.ModelViewSet):
    queryset = Torneo.objects.all().order_by('-id')
    serializer_class = TorneoSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ── Stats ──────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def tabla_torneo(request, torneo_id):
    from apps.equipos.models import Equipo
    from apps.partidos.models import Partido

    equipos = Equipo.objects.filter(torneo_id=torneo_id)
    partidos = Partido.objects.filter(torneo_id=torneo_id, estado='Finalizado').select_related(
        'equipo_local', 'equipo_visitante'
    )

    table = {}
    for equipo in equipos:
        table[equipo.id] = {
            'equipo_id': equipo.id,
            'equipo': equipo.nombre,
            'pj': 0, 'pg': 0, 'pe': 0, 'pp': 0,
            'gf': 0, 'gc': 0, 'dg': 0, 'pts': 0,
        }

    for partido in partidos:
        local = table.get(partido.equipo_local_id)
        visitante = table.get(partido.equipo_visitante_id)
        if not local or not visitante:
            continue

        local['pj'] += 1
        visitante['pj'] += 1
        local['gf'] += partido.goles_local
        local['gc'] += partido.goles_visitante
        visitante['gf'] += partido.goles_visitante
        visitante['gc'] += partido.goles_local

        if partido.goles_local > partido.goles_visitante:
            local['pg'] += 1
            local['pts'] += 3
            visitante['pp'] += 1
        elif partido.goles_local < partido.goles_visitante:
            visitante['pg'] += 1
            visitante['pts'] += 3
            local['pp'] += 1
        else:
            local['pe'] += 1
            visitante['pe'] += 1
            local['pts'] += 1
            visitante['pts'] += 1

    rows = list(table.values())
    for row in rows:
        row['dg'] = row['gf'] - row['gc']
    rows.sort(key=lambda x: (x['pts'], x['dg'], x['gf']), reverse=True)
    return Response(rows)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def goleadores_torneo(request, torneo_id):
    from apps.eventos.models import EventoPartido

    qs = (
        EventoPartido.objects
        .filter(tipo_evento='gol', partido__torneo_id=torneo_id)
        .values('jugador_id', 'jugador__nombre', 'jugador__apellido', 'jugador__equipo__nombre')
        .annotate(goles=Count('id'))
        .order_by('-goles')
    )

    data = [
        {
            'jugador_id': row['jugador_id'],
            'jugador': f"{row['jugador__nombre']} {row['jugador__apellido']}",
            'equipo': row['jugador__equipo__nombre'],
            'goles': row['goles'],
        }
        for row in qs
    ]
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def tarjetas_torneo(request, torneo_id):
    from apps.eventos.models import EventoPartido

    qs = (
        EventoPartido.objects
        .filter(tipo_evento__in=['amarilla', 'roja'], partido__torneo_id=torneo_id)
        .values('jugador_id', 'jugador__nombre', 'jugador__apellido', 'jugador__equipo__nombre')
        .annotate(
            amarillas=Count('id', filter=Q(tipo_evento='amarilla')),
            rojas=Count('id', filter=Q(tipo_evento='roja')),
        )
        .order_by('-rojas', '-amarillas')
    )

    data = [
        {
            'jugador_id': row['jugador_id'],
            'jugador': f"{row['jugador__nombre']} {row['jugador__apellido']}",
            'equipo': row['jugador__equipo__nombre'],
            'amarillas': row['amarillas'],
            'rojas': row['rojas'],
        }
        for row in qs
    ]
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def resumen_torneo(request, torneo_id):
    from apps.equipos.models import Equipo
    from apps.jugadores.models import Jugador
    from apps.partidos.models import Partido

    total_equipos = Equipo.objects.filter(torneo_id=torneo_id).count()
    total_jugadores = Jugador.objects.filter(equipo__torneo_id=torneo_id).count()
    total_partidos = Partido.objects.filter(torneo_id=torneo_id).count()
    partidos_finalizados = Partido.objects.filter(torneo_id=torneo_id, estado='Finalizado').count()

    agg = Partido.objects.filter(torneo_id=torneo_id).aggregate(
        total=Sum('goles_local') + Sum('goles_visitante')
    )
    total_goles = int(agg['total'] or 0)

    return Response({
        'torneo_id': torneo_id,
        'total_equipos': total_equipos,
        'total_jugadores': total_jugadores,
        'total_partidos': total_partidos,
        'partidos_finalizados': partidos_finalizados,
        'total_goles': total_goles,
    })
