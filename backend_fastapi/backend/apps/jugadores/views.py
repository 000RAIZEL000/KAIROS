from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import Jugador
from .serializers import JugadorSerializer


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', None) == 'admin'
        )


class JugadorViewSet(viewsets.ModelViewSet):
    serializer_class = JugadorSerializer

    def get_queryset(self):
        qs = Jugador.objects.all().order_by('nombre', 'apellido')
        equipo_id = self.request.query_params.get('equipo_id')
        if equipo_id:
            qs = qs.filter(equipo_id=equipo_id)
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminRole()]
