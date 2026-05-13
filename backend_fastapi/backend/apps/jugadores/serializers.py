from rest_framework import serializers
from .models import Jugador


class JugadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jugador
        fields = [
            'id', 'equipo', 'nombre', 'apellido', 'dni',
            'fecha_nacimiento', 'posicion', 'numero_camiseta',
            'foto_url', 'activo', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
