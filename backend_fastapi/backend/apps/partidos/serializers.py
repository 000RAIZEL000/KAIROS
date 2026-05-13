from rest_framework import serializers
from .models import Partido, ESTADOS_PARTIDO


class PartidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partido
        fields = [
            'id', 'torneo', 'equipo_local', 'equipo_visitante',
            'fecha', 'estado', 'goles_local', 'goles_visitante',
            'cancha', 'jornada', 'fase', 'arbitro', 'observaciones',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_estado(self, value):
        if value not in ESTADOS_PARTIDO:
            raise serializers.ValidationError(
                f'Estado inválido. Usa uno de: {", ".join(sorted(ESTADOS_PARTIDO))}'
            )
        return value

    def validate_goles_local(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('Los goles no pueden ser negativos')
        return value

    def validate_goles_visitante(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('Los goles no pueden ser negativos')
        return value

    def validate(self, data):
        local = data.get('equipo_local') or getattr(self.instance, 'equipo_local', None)
        visitante = data.get('equipo_visitante') or getattr(self.instance, 'equipo_visitante', None)
        if local and visitante and local == visitante:
            raise serializers.ValidationError('Un equipo no puede jugar contra sí mismo')
        return data
