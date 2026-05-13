from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError

from .models import Equipo
from .serializers import EquipoSerializer


class EquipoViewSet(viewsets.ModelViewSet):
    serializer_class = EquipoSerializer

    def get_queryset(self):
        qs = Equipo.objects.all().order_by('nombre')
        torneo_id = self.request.query_params.get('torneo_id')
        if torneo_id:
            qs = qs.filter(torneo_id=torneo_id)
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        torneo_id = serializer.validated_data.get('torneo_id') or serializer.validated_data.get('torneo')
        serializer.save()
