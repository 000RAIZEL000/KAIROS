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

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'torneo_id' in data and 'torneo' not in data:
            data['torneo'] = data['torneo_id']
        if 'equipo_local_id' in data and 'equipo_local' not in data:
            data['equipo_local'] = data['equipo_local_id']
        if 'equipo_visitante_id' in data and 'equipo_visitante' not in data:
            data['equipo_visitante'] = data['equipo_visitante_id']
        return super().to_internal_value(data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['torneo_id'] = instance.torneo.id if instance.torneo else None
        representation['equipo_local_id'] = instance.equipo_local.id if instance.equipo_local else None
        representation['equipo_visitante_id'] = instance.equipo_visitante.id if instance.equipo_visitante else None

        from apps.equipos.serializers import EquipoSerializer
        if instance.equipo_local:
            representation['equipo_local'] = EquipoSerializer(instance.equipo_local).data
        if instance.equipo_visitante:
            representation['equipo_visitante'] = EquipoSerializer(instance.equipo_visitante).data
        return representation
