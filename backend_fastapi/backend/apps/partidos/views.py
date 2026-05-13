from rest_framework import permissions, viewsets

from .models import Partido
from .serializers import PartidoSerializer


class PartidoViewSet(viewsets.ModelViewSet):
    serializer_class = PartidoSerializer

    def get_queryset(self):
        qs = Partido.objects.all().order_by('fecha')
        torneo_id = self.request.query_params.get('torneo_id')
        if torneo_id:
            qs = qs.filter(torneo_id=torneo_id)
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
