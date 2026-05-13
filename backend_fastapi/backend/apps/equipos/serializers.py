from rest_framework import serializers
from .models import Equipo


class EquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipo
        fields = [
            'id', 'torneo', 'nombre', 'grupo',
            'color_principal', 'color_secundario',
            'escudo_url', 'activo', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
