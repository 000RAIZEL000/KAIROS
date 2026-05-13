from rest_framework import serializers
from .models import Torneo


class TorneoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Torneo
        fields = [
            'id', 'nombre', 'descripcion', 'deporte', 'modalidad',
            'direccion', 'fecha_inicio', 'fecha_fin', 'estado',
            'imagen_url', 'activo', 'user', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
