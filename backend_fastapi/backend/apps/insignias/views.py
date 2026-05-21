from rest_framework import viewsets, permissions
from .models import Insignia
from .serializers import InsigniaSerializer


class InsigniaViewSet(viewsets.ModelViewSet):
    serializer_class = InsigniaSerializer

    def get_queryset(self):
        qs = Insignia.objects.select_related('jugador', 'torneo', 'partido').all()
        jugador_id = self.request.query_params.get('jugador_id')
        torneo_id = self.request.query_params.get('torneo_id')
        partido_id = self.request.query_params.get('partido_id')
        tipo = self.request.query_params.get('tipo')
        if jugador_id:
            qs = qs.filter(jugador_id=jugador_id)
        if torneo_id:
            qs = qs.filter(torneo_id=torneo_id)
        if partido_id:
            qs = qs.filter(partido_id=partido_id)
        if tipo:
            qs = qs.filter(tipo=tipo)
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
