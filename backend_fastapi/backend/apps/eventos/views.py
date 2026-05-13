from rest_framework import permissions, viewsets

from .models import EventoPartido
from .serializers import EventoPartidoSerializer


class EventoPartidoViewSet(viewsets.ModelViewSet):
    serializer_class = EventoPartidoSerializer

    def get_queryset(self):
        qs = EventoPartido.objects.all().order_by('id')
        partido_id = self.request.query_params.get('partido_id')
        if partido_id:
            qs = qs.filter(partido_id=partido_id)
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
